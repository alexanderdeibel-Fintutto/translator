package com.fintutto.translator;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattServer;
import android.bluetooth.BluetoothGattServerCallback;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothProfile;
import android.bluetooth.le.AdvertiseCallback;
import android.bluetooth.le.AdvertiseData;
import android.bluetooth.le.AdvertiseSettings;
import android.bluetooth.le.BluetoothLeAdvertiser;
import android.content.Context;
import android.os.Build;
import android.os.ParcelUuid;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import org.json.JSONArray;
import org.json.JSONObject;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * BLE GATT Transport — enables direct text transport over BLE for micro-groups (2-5 people).
 * Speaker runs as GATT Server (peripheral), Listeners connect as GATT Clients (central).
 *
 * Used as Tier 4 fallback when no WiFi/hotspot is available.
 */
@CapacitorPlugin(
    name = "BleTransport",
    permissions = {
        @Permission(
            alias = "bluetooth",
            strings = {
                Manifest.permission.BLUETOOTH_ADVERTISE,
                Manifest.permission.BLUETOOTH_CONNECT,
            }
        )
    }
)
public class BleTransportPlugin extends Plugin {

    private static final String TAG = "BleTransport";

    // Service and characteristic UUIDs
    static final UUID SERVICE_UUID           = UUID.fromString("d7e84cb2-ff5c-4f3d-a066-1f3f4d54e3a7");
    static final UUID TRANSLATION_CHAR_UUID  = UUID.fromString("d7e84cb3-ff5c-4f3d-a066-1f3f4d54e3a7");
    static final UUID SESSION_INFO_CHAR_UUID = UUID.fromString("d7e84cb4-ff5c-4f3d-a066-1f3f4d54e3a7");
    static final UUID PRESENCE_WRITE_UUID    = UUID.fromString("d7e84cb5-ff5c-4f3d-a066-1f3f4d54e3a7");
    static final UUID PRESENCE_SYNC_UUID     = UUID.fromString("d7e84cb6-ff5c-4f3d-a066-1f3f4d54e3a7");

    // Standard Client Characteristic Configuration Descriptor
    static final UUID CCCD_UUID = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");

    private BluetoothManager bluetoothManager;
    private BluetoothAdapter bluetoothAdapter;
    private BluetoothGattServer gattServer;
    private BluetoothLeAdvertiser advertiser;
    private boolean isRunning = false;

    // Connected devices subscribed to notifications
    private final Set<BluetoothDevice> subscribedTranslation = new HashSet<>();
    private final Set<BluetoothDevice> subscribedPresence = new HashSet<>();
    private final List<JSONObject> presenceList = new ArrayList<>();

    // Session info
    private String sessionCode = "";
    private String sourceLanguage = "";

    // Chunking: max payload per notification (MTU typically 185-512, safe default 180)
    private static final int CHUNK_SIZE = 180;

    /**
     * Start the GATT server and begin advertising.
     * Speaker side — creates the BLE peripheral.
     */
    @PluginMethod
    public void startServer(PluginCall call) {
        if (isRunning) {
            call.reject("BLE server is already running");
            return;
        }

        sessionCode = call.getString("sessionCode", "");
        sourceLanguage = call.getString("sourceLanguage", "de");
        String deviceName = call.getString("deviceName", "GT-" + sessionCode);

        // Check permissions
        if (Build.VERSION.SDK_INT >= 31) {
            if (!hasPermission(Manifest.permission.BLUETOOTH_ADVERTISE) ||
                !hasPermission(Manifest.permission.BLUETOOTH_CONNECT)) {
                requestAllPermissions(call, "blePermissionCallback");
                return;
            }
        }

        doStartServer(call, deviceName);
    }

    @PermissionCallback
    private void blePermissionCallback(PluginCall call) {
        if (Build.VERSION.SDK_INT >= 31) {
            if (!hasPermission(Manifest.permission.BLUETOOTH_ADVERTISE) ||
                !hasPermission(Manifest.permission.BLUETOOTH_CONNECT)) {
                call.reject("Bluetooth permissions are required");
                return;
            }
        }
        String deviceName = call.getString("deviceName", "GT-" + sessionCode);
        doStartServer(call, deviceName);
    }

    private boolean hasPermission(String perm) {
        return getPermissionState(perm) == com.getcapacitor.PermissionState.GRANTED;
    }

    private void doStartServer(PluginCall call, String deviceName) {
        bluetoothManager = (BluetoothManager) getContext().getSystemService(Context.BLUETOOTH_SERVICE);
        bluetoothAdapter = bluetoothManager.getAdapter();

        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled()) {
            call.reject("Bluetooth ist nicht aktiviert");
            return;
        }

        // Set device name for advertising
        try {
            bluetoothAdapter.setName(deviceName);
        } catch (SecurityException e) {
            Log.w(TAG, "Cannot set BT name", e);
        }

        // Create GATT service
        BluetoothGattService service = new BluetoothGattService(
            SERVICE_UUID, BluetoothGattService.SERVICE_TYPE_PRIMARY
        );

        // Translation characteristic (NOTIFY — server sends translations)
        BluetoothGattCharacteristic translationChar = new BluetoothGattCharacteristic(
            TRANSLATION_CHAR_UUID,
            BluetoothGattCharacteristic.PROPERTY_NOTIFY,
            0
        );
        translationChar.addDescriptor(createCccd());
        service.addCharacteristic(translationChar);

        // Session info characteristic (READ)
        BluetoothGattCharacteristic sessionInfoChar = new BluetoothGattCharacteristic(
            SESSION_INFO_CHAR_UUID,
            BluetoothGattCharacteristic.PROPERTY_READ,
            BluetoothGattCharacteristic.PERMISSION_READ
        );
        service.addCharacteristic(sessionInfoChar);

        // Presence write characteristic (WRITE — listeners send their info)
        BluetoothGattCharacteristic presenceWriteChar = new BluetoothGattCharacteristic(
            PRESENCE_WRITE_UUID,
            BluetoothGattCharacteristic.PROPERTY_WRITE | BluetoothGattCharacteristic.PROPERTY_WRITE_NO_RESPONSE,
            BluetoothGattCharacteristic.PERMISSION_WRITE
        );
        service.addCharacteristic(presenceWriteChar);

        // Presence sync characteristic (NOTIFY — server sends updated presence list)
        BluetoothGattCharacteristic presenceSyncChar = new BluetoothGattCharacteristic(
            PRESENCE_SYNC_UUID,
            BluetoothGattCharacteristic.PROPERTY_NOTIFY,
            0
        );
        presenceSyncChar.addDescriptor(createCccd());
        service.addCharacteristic(presenceSyncChar);

        // Open GATT server
        try {
            gattServer = bluetoothManager.openGattServer(getContext(), gattCallback);
            gattServer.addService(service);
        } catch (SecurityException e) {
            call.reject("BLE-Berechtigung fehlt: " + e.getMessage());
            return;
        }

        // Start advertising
        advertiser = bluetoothAdapter.getBluetoothLeAdvertiser();
        if (advertiser == null) {
            call.reject("BLE Advertising wird nicht unterstützt");
            return;
        }

        AdvertiseSettings settings = new AdvertiseSettings.Builder()
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
            .setConnectable(true)
            .setTimeout(0)
            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_MEDIUM)
            .build();

        AdvertiseData data = new AdvertiseData.Builder()
            .setIncludeDeviceName(true)
            .addServiceUuid(new ParcelUuid(SERVICE_UUID))
            .build();

        try {
            advertiser.startAdvertising(settings, data, advertiseCallback);
        } catch (SecurityException e) {
            call.reject("BLE-Advertising-Berechtigung fehlt");
            return;
        }

        isRunning = true;

        JSObject result = new JSObject();
        result.put("started", true);
        result.put("deviceName", deviceName);
        call.resolve(result);
    }

    /**
     * Send a translation broadcast to all subscribed listeners.
     * Handles chunking for payloads larger than MTU.
     */
    @PluginMethod
    public void broadcast(PluginCall call) {
        if (gattServer == null) {
            call.reject("Server is not running");
            return;
        }

        String json = call.getString("data", "");
        if (json.isEmpty()) {
            call.reject("No data provided");
            return;
        }

        BluetoothGattCharacteristic charr = gattServer
            .getService(SERVICE_UUID)
            .getCharacteristic(TRANSLATION_CHAR_UUID);

        notifySubscribers(charr, json.getBytes(StandardCharsets.UTF_8), subscribedTranslation);

        JSObject result = new JSObject();
        result.put("sent", true);
        result.put("subscribers", subscribedTranslation.size());
        call.resolve(result);
    }

    /**
     * Stop the GATT server and advertising.
     */
    @PluginMethod
    public void stopServer(PluginCall call) {
        stopAll();
        JSObject result = new JSObject();
        result.put("stopped", true);
        call.resolve(result);
    }

    /**
     * Get current status.
     */
    @PluginMethod
    public void getStatus(PluginCall call) {
        JSObject result = new JSObject();
        result.put("isRunning", isRunning);
        result.put("connectedListeners", subscribedTranslation.size());
        result.put("sessionCode", sessionCode);
        call.resolve(result);
    }

    // --- Chunking ---

    private void notifySubscribers(BluetoothGattCharacteristic charr, byte[] payload, Set<BluetoothDevice> subscribers) {
        List<byte[]> chunks = chunkPayload(payload);

        for (BluetoothDevice device : new HashSet<>(subscribers)) {
            for (byte[] chunk : chunks) {
                charr.setValue(chunk);
                try {
                    gattServer.notifyCharacteristicChanged(device, charr, false);
                } catch (SecurityException e) {
                    Log.w(TAG, "Cannot notify device", e);
                    subscribers.remove(device);
                }
            }
        }
    }

    /**
     * Split payload into chunks with header byte.
     * Format: [flags:1byte][payload:N bytes]
     * flags: bit 7 = has_more_chunks
     */
    private List<byte[]> chunkPayload(byte[] payload) {
        List<byte[]> chunks = new ArrayList<>();
        int offset = 0;

        while (offset < payload.length) {
            int remaining = payload.length - offset;
            int chunkLen = Math.min(remaining, CHUNK_SIZE);
            boolean hasMore = (offset + chunkLen) < payload.length;

            byte[] chunk = new byte[chunkLen + 1];
            chunk[0] = (byte) (hasMore ? 0x80 : 0x00);
            System.arraycopy(payload, offset, chunk, 1, chunkLen);
            chunks.add(chunk);
            offset += chunkLen;
        }

        return chunks;
    }

    // --- GATT Callbacks ---

    private final BluetoothGattServerCallback gattCallback = new BluetoothGattServerCallback() {

        @Override
        public void onConnectionStateChange(BluetoothDevice device, int status, int newState) {
            if (newState == BluetoothProfile.STATE_CONNECTED) {
                Log.i(TAG, "Device connected: " + device.getAddress());
            } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                Log.i(TAG, "Device disconnected: " + device.getAddress());
                subscribedTranslation.remove(device);
                subscribedPresence.remove(device);
                // Remove from presence list
                removePresence(device);
            }
        }

        @Override
        public void onCharacteristicReadRequest(BluetoothDevice device, int requestId,
                                                 int offset, BluetoothGattCharacteristic characteristic) {
            if (SESSION_INFO_CHAR_UUID.equals(characteristic.getUuid())) {
                // Return session info as JSON
                try {
                    JSONObject info = new JSONObject();
                    info.put("sessionCode", sessionCode);
                    info.put("sourceLanguage", sourceLanguage);
                    byte[] value = info.toString().getBytes(StandardCharsets.UTF_8);

                    gattServer.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS,
                        offset, Arrays.copyOfRange(value, offset, value.length));
                } catch (Exception e) {
                    gattServer.sendResponse(device, requestId, BluetoothGatt.GATT_FAILURE, 0, null);
                }
            } else {
                gattServer.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, offset, null);
            }
        }

        @Override
        public void onCharacteristicWriteRequest(BluetoothDevice device, int requestId,
                                                  BluetoothGattCharacteristic characteristic,
                                                  boolean preparedWrite, boolean responseNeeded,
                                                  int offset, byte[] value) {
            if (PRESENCE_WRITE_UUID.equals(characteristic.getUuid())) {
                handlePresenceWrite(device, value);
            }

            if (responseNeeded) {
                try {
                    gattServer.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, 0, null);
                } catch (SecurityException e) {
                    Log.w(TAG, "Cannot send response", e);
                }
            }
        }

        @Override
        public void onDescriptorWriteRequest(BluetoothDevice device, int requestId,
                                              BluetoothGattDescriptor descriptor,
                                              boolean preparedWrite, boolean responseNeeded,
                                              int offset, byte[] value) {
            UUID charUuid = descriptor.getCharacteristic().getUuid();

            if (CCCD_UUID.equals(descriptor.getUuid())) {
                boolean enabled = (value != null && value.length > 0 && value[0] != 0);

                if (TRANSLATION_CHAR_UUID.equals(charUuid)) {
                    if (enabled) subscribedTranslation.add(device);
                    else subscribedTranslation.remove(device);
                    Log.d(TAG, "Translation notify " + (enabled ? "enabled" : "disabled") +
                        " for " + device.getAddress());
                } else if (PRESENCE_SYNC_UUID.equals(charUuid)) {
                    if (enabled) subscribedPresence.add(device);
                    else subscribedPresence.remove(device);
                }
            }

            if (responseNeeded) {
                try {
                    gattServer.sendResponse(device, requestId, BluetoothGatt.GATT_SUCCESS, 0, null);
                } catch (SecurityException e) {
                    Log.w(TAG, "Cannot send descriptor response", e);
                }
            }
        }
    };

    private final AdvertiseCallback advertiseCallback = new AdvertiseCallback() {
        @Override
        public void onStartSuccess(AdvertiseSettings settingsInEffect) {
            Log.i(TAG, "BLE advertising started");
        }

        @Override
        public void onStartFailure(int errorCode) {
            Log.e(TAG, "BLE advertising failed: " + errorCode);
        }
    };

    // --- Presence management ---

    private void handlePresenceWrite(BluetoothDevice device, byte[] value) {
        try {
            String json = new String(value, StandardCharsets.UTF_8);
            JSONObject data = new JSONObject(json);
            data.put("_deviceAddress", device.getAddress());

            // Update or add
            boolean found = false;
            for (int i = 0; i < presenceList.size(); i++) {
                if (device.getAddress().equals(presenceList.get(i).optString("_deviceAddress"))) {
                    presenceList.set(i, data);
                    found = true;
                    break;
                }
            }
            if (!found) {
                presenceList.add(data);
            }

            broadcastPresenceSync();

            // Notify JS layer
            JSObject event = new JSObject();
            event.put("device", device.getAddress());
            event.put("data", data.toString());
            notifyListeners("presenceJoined", event);

        } catch (Exception e) {
            Log.w(TAG, "Invalid presence data", e);
        }
    }

    private void removePresence(BluetoothDevice device) {
        presenceList.removeIf(p -> device.getAddress().equals(p.optString("_deviceAddress")));
        broadcastPresenceSync();
    }

    private void broadcastPresenceSync() {
        if (gattServer == null) return;

        try {
            JSONArray array = new JSONArray();
            for (JSONObject p : presenceList) {
                // Clone without internal _deviceAddress
                JSONObject clean = new JSONObject(p.toString());
                clean.remove("_deviceAddress");
                array.put(clean);
            }

            JSONObject msg = new JSONObject();
            msg.put("type", "presence_sync");
            msg.put("listeners", array);

            BluetoothGattCharacteristic charr = gattServer
                .getService(SERVICE_UUID)
                .getCharacteristic(PRESENCE_SYNC_UUID);

            notifySubscribers(charr, msg.toString().getBytes(StandardCharsets.UTF_8), subscribedPresence);

            // Also notify JS layer
            JSObject event = new JSObject();
            event.put("listeners", array.toString());
            notifyListeners("presenceSync", event);

        } catch (Exception e) {
            Log.w(TAG, "Error broadcasting presence sync", e);
        }
    }

    // --- Helpers ---

    private BluetoothGattDescriptor createCccd() {
        BluetoothGattDescriptor descriptor = new BluetoothGattDescriptor(
            CCCD_UUID,
            BluetoothGattDescriptor.PERMISSION_READ | BluetoothGattDescriptor.PERMISSION_WRITE
        );
        descriptor.setValue(BluetoothGattDescriptor.DISABLE_NOTIFICATION_VALUE);
        return descriptor;
    }

    private void stopAll() {
        if (advertiser != null) {
            try {
                advertiser.stopAdvertising(advertiseCallback);
            } catch (SecurityException e) {
                Log.w(TAG, "Cannot stop advertising", e);
            }
            advertiser = null;
        }
        if (gattServer != null) {
            try {
                gattServer.close();
            } catch (Exception e) {
                Log.w(TAG, "Error closing GATT server", e);
            }
            gattServer = null;
        }
        subscribedTranslation.clear();
        subscribedPresence.clear();
        presenceList.clear();
        isRunning = false;
    }

    @Override
    protected void handleOnDestroy() {
        stopAll();
        super.handleOnDestroy();
    }
}

package com.fintutto.translator;

import android.Manifest;
import android.content.Context;
import android.net.wifi.WifiConfiguration;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.Collections;
import java.util.List;

/**
 * Capacitor plugin for offline tour guide mode:
 * - Creates a local-only WiFi hotspot (Android 8+)
 * - Runs an embedded WebSocket relay server on the device
 * - Returns SSID, password, and server URL for QR code generation
 */
@CapacitorPlugin(
    name = "HotspotRelay",
    permissions = {
        @Permission(
            alias = "wifi",
            strings = { Manifest.permission.CHANGE_WIFI_STATE, Manifest.permission.ACCESS_WIFI_STATE }
        ),
        @Permission(
            alias = "location",
            strings = { Manifest.permission.ACCESS_FINE_LOCATION }
        )
    }
)
public class HotspotRelayPlugin extends Plugin {

    private static final String TAG = "HotspotRelay";
    private static final int DEFAULT_RELAY_PORT = 8765;

    private WifiManager.LocalOnlyHotspotReservation hotspotReservation;
    private EmbeddedRelayServer relayServer;
    private boolean isRunning = false;

    /**
     * Start the hotspot and embedded relay server.
     * Returns: { ssid, password, serverUrl, gatewayIp, port }
     */
    @PluginMethod
    public void startHotspot(PluginCall call) {
        if (isRunning) {
            call.reject("Hotspot is already running");
            return;
        }

        int port = call.getInt("port", DEFAULT_RELAY_PORT);

        // Check permissions
        if (Build.VERSION.SDK_INT >= 33) {
            // Android 13+: NEARBY_WIFI_DEVICES
            if (!hasPermission(Manifest.permission.NEARBY_WIFI_DEVICES)) {
                requestAllPermissions(call, "hotspotPermissionCallback");
                return;
            }
        } else {
            // Android 12 and below: ACCESS_FINE_LOCATION
            if (!hasPermission(Manifest.permission.ACCESS_FINE_LOCATION)) {
                requestAllPermissions(call, "hotspotPermissionCallback");
                return;
            }
        }

        doStartHotspot(call, port);
    }

    @PermissionCallback
    private void hotspotPermissionCallback(PluginCall call) {
        boolean hasNeeded;
        if (Build.VERSION.SDK_INT >= 33) {
            hasNeeded = hasPermission(Manifest.permission.NEARBY_WIFI_DEVICES);
        } else {
            hasNeeded = hasPermission(Manifest.permission.ACCESS_FINE_LOCATION);
        }

        if (hasNeeded) {
            int port = call.getInt("port", DEFAULT_RELAY_PORT);
            doStartHotspot(call, port);
        } else {
            call.reject("WiFi permissions are required to create a hotspot");
        }
    }

    private boolean hasPermission(String permission) {
        return getPermissionState(permission) == com.getcapacitor.PermissionState.GRANTED;
    }

    private void doStartHotspot(PluginCall call, int port) {
        WifiManager wifiManager = (WifiManager) getContext()
                .getApplicationContext()
                .getSystemService(Context.WIFI_SERVICE);

        if (wifiManager == null) {
            call.reject("WiFi service not available");
            return;
        }

        // Start embedded relay server first
        try {
            relayServer = new EmbeddedRelayServer(port);
            relayServer.start();
            Log.i(TAG, "Relay server started on port " + port);
        } catch (Exception e) {
            Log.e(TAG, "Failed to start relay server", e);
            call.reject("Failed to start relay server: " + e.getMessage());
            return;
        }

        // Start local-only hotspot
        try {
            wifiManager.startLocalOnlyHotspot(new WifiManager.LocalOnlyHotspotCallback() {
                @Override
                public void onStarted(WifiManager.LocalOnlyHotspotReservation reservation) {
                    hotspotReservation = reservation;
                    isRunning = true;

                    // Extract WiFi config
                    String ssid = "";
                    String password = "";

                    if (Build.VERSION.SDK_INT >= 30) {
                        // Android 11+: use SoftApConfiguration
                        android.net.wifi.SoftApConfiguration softApConfig = reservation.getSoftApConfiguration();
                        ssid = softApConfig.getSsid();
                        password = softApConfig.getPassphrase();
                    } else {
                        // Android 8-10: use deprecated WifiConfiguration
                        @SuppressWarnings("deprecation")
                        WifiConfiguration config = reservation.getWifiConfiguration();
                        if (config != null) {
                            ssid = config.SSID;
                            password = config.preSharedKey;
                        }
                    }

                    // Find the gateway IP
                    String gatewayIp = getHotspotIp();
                    if (gatewayIp == null) {
                        gatewayIp = "192.168.43.1"; // fallback
                    }

                    String serverUrl = "ws://" + gatewayIp + ":" + port;

                    JSObject result = new JSObject();
                    result.put("ssid", ssid != null ? ssid : "");
                    result.put("password", password != null ? password : "");
                    result.put("serverUrl", serverUrl);
                    result.put("gatewayIp", gatewayIp);
                    result.put("port", port);

                    Log.i(TAG, "Hotspot started: SSID=" + ssid + " URL=" + serverUrl);
                    call.resolve(result);
                }

                @Override
                public void onStopped() {
                    Log.i(TAG, "Hotspot stopped");
                    isRunning = false;
                    hotspotReservation = null;
                    notifyListeners("hotspotStopped", new JSObject());
                }

                @Override
                public void onFailed(int reason) {
                    Log.e(TAG, "Hotspot failed with reason: " + reason);
                    isRunning = false;
                    stopRelayServer();
                    call.reject("Failed to start hotspot (reason: " + reason + ")");
                }
            }, new Handler(Looper.getMainLooper()));

        } catch (SecurityException e) {
            Log.e(TAG, "Security exception starting hotspot", e);
            stopRelayServer();
            call.reject("Permission denied: " + e.getMessage());
        } catch (Exception e) {
            Log.e(TAG, "Exception starting hotspot", e);
            stopRelayServer();
            call.reject("Failed to start hotspot: " + e.getMessage());
        }
    }

    /**
     * Start only the relay server (without hotspot).
     * Used when the user has already enabled a hotspot manually,
     * or when connected to an existing local network.
     */
    @PluginMethod
    public void startRelayOnly(PluginCall call) {
        if (relayServer != null) {
            call.reject("Relay server is already running");
            return;
        }

        int port = call.getInt("port", DEFAULT_RELAY_PORT);

        try {
            relayServer = new EmbeddedRelayServer(port);
            relayServer.start();

            String localIp = getLocalIpAddress();
            if (localIp == null) {
                localIp = "0.0.0.0";
            }

            String serverUrl = "ws://" + localIp + ":" + port;

            JSObject result = new JSObject();
            result.put("serverUrl", serverUrl);
            result.put("localIp", localIp);
            result.put("port", port);

            Log.i(TAG, "Relay-only server started: " + serverUrl);
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Failed to start relay server", e);
            call.reject("Failed to start relay server: " + e.getMessage());
        }
    }

    /**
     * Stop the hotspot and relay server.
     */
    @PluginMethod
    public void stopHotspot(PluginCall call) {
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
        result.put("hasRelay", relayServer != null);

        if (relayServer != null) {
            try {
                result.put("stats", relayServer.getStats());
            } catch (Exception e) {
                Log.w(TAG, "Error getting stats", e);
            }
        }

        call.resolve(result);
    }

    // --- Helpers ---

    private void stopRelayServer() {
        if (relayServer != null) {
            try {
                relayServer.stop(500);
                Log.i(TAG, "Relay server stopped");
            } catch (Exception e) {
                Log.w(TAG, "Error stopping relay server", e);
            }
            relayServer = null;
        }
    }

    private void stopAll() {
        // Stop hotspot
        if (hotspotReservation != null) {
            try {
                hotspotReservation.close();
                Log.i(TAG, "Hotspot reservation closed");
            } catch (Exception e) {
                Log.w(TAG, "Error closing hotspot reservation", e);
            }
            hotspotReservation = null;
        }

        // Stop relay
        stopRelayServer();
        isRunning = false;
    }

    /**
     * Find the device's IP address on the hotspot interface.
     * LocalOnlyHotspot typically uses a swlan/wlan interface.
     */
    private String getHotspotIp() {
        try {
            List<NetworkInterface> interfaces = Collections.list(NetworkInterface.getNetworkInterfaces());
            for (NetworkInterface iface : interfaces) {
                String name = iface.getName().toLowerCase();
                // Hotspot interfaces are typically named swlan0, ap0, wlan1, etc.
                if (name.contains("ap") || name.contains("swlan") || name.contains("wlan")) {
                    List<InetAddress> addrs = Collections.list(iface.getInetAddresses());
                    for (InetAddress addr : addrs) {
                        if (addr instanceof Inet4Address && !addr.isLoopbackAddress()) {
                            String ip = addr.getHostAddress();
                            // Hotspot IPs are typically in private ranges
                            if (ip != null && (ip.startsWith("192.168.") || ip.startsWith("172.") || ip.startsWith("10."))) {
                                return ip;
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Error getting hotspot IP", e);
        }
        return null;
    }

    /**
     * Get the device's local IP address (any non-loopback IPv4).
     */
    private String getLocalIpAddress() {
        try {
            List<NetworkInterface> interfaces = Collections.list(NetworkInterface.getNetworkInterfaces());
            for (NetworkInterface iface : interfaces) {
                if (iface.isLoopback() || !iface.isUp()) continue;
                List<InetAddress> addrs = Collections.list(iface.getInetAddresses());
                for (InetAddress addr : addrs) {
                    if (addr instanceof Inet4Address && !addr.isLoopbackAddress()) {
                        return addr.getHostAddress();
                    }
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Error getting local IP", e);
        }
        return null;
    }

    @Override
    protected void handleOnDestroy() {
        stopAll();
        super.handleOnDestroy();
    }
}

import Foundation
import Capacitor
import CoreBluetooth

/// BLE GATT Transport for iOS — enables direct text transport over BLE for micro-groups.
/// Speaker runs as GATT Server (CBPeripheralManager), Listeners connect as GATT Clients.
@objc(BleTransportPlugin)
public class BleTransportPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "BleTransportPlugin"
    public let jsName = "BleTransport"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "startServer", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "broadcast", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopServer", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getStatus", returnType: CAPPluginReturnPromise),
    ]

    // Service and characteristic UUIDs — must match Android side
    static let serviceUUID           = CBUUID(string: "d7e84cb2-ff5c-4f3d-a066-1f3f4d54e3a7")
    static let translationCharUUID   = CBUUID(string: "d7e84cb3-ff5c-4f3d-a066-1f3f4d54e3a7")
    static let sessionInfoCharUUID   = CBUUID(string: "d7e84cb4-ff5c-4f3d-a066-1f3f4d54e3a7")
    static let presenceWriteCharUUID = CBUUID(string: "d7e84cb5-ff5c-4f3d-a066-1f3f4d54e3a7")
    static let presenceSyncCharUUID  = CBUUID(string: "d7e84cb6-ff5c-4f3d-a066-1f3f4d54e3a7")

    private var gattServer: GattServer?

    @objc func startServer(_ call: CAPPluginCall) {
        let sessionCode = call.getString("sessionCode") ?? ""
        let sourceLanguage = call.getString("sourceLanguage") ?? "de"
        let deviceName = call.getString("deviceName") ?? "GT-\(sessionCode)"

        if gattServer?.isRunning == true {
            call.reject("BLE server is already running")
            return
        }

        gattServer = GattServer(plugin: self)
        gattServer?.start(sessionCode: sessionCode, sourceLanguage: sourceLanguage, deviceName: deviceName) { success, error in
            if success {
                call.resolve([
                    "started": true,
                    "deviceName": deviceName,
                ])
            } else {
                call.reject(error ?? "Failed to start BLE server")
            }
        }
    }

    @objc func broadcast(_ call: CAPPluginCall) {
        guard let server = gattServer, server.isRunning else {
            call.reject("Server is not running")
            return
        }

        guard let data = call.getString("data"), !data.isEmpty else {
            call.reject("No data provided")
            return
        }

        let count = server.broadcastTranslation(data)
        call.resolve([
            "sent": true,
            "subscribers": count,
        ])
    }

    @objc func stopServer(_ call: CAPPluginCall) {
        gattServer?.stop()
        gattServer = nil
        call.resolve(["stopped": true])
    }

    @objc func getStatus(_ call: CAPPluginCall) {
        call.resolve([
            "isRunning": gattServer?.isRunning ?? false,
            "connectedListeners": gattServer?.subscriberCount ?? 0,
            "sessionCode": gattServer?.sessionCode ?? "",
        ])
    }

    deinit {
        gattServer?.stop()
    }
}

// MARK: - GATT Server

private class GattServer: NSObject, CBPeripheralManagerDelegate {
    weak var plugin: BleTransportPlugin?

    private var peripheralManager: CBPeripheralManager?
    private var translationChar: CBMutableCharacteristic?
    private var sessionInfoChar: CBMutableCharacteristic?
    private var presenceWriteChar: CBMutableCharacteristic?
    private var presenceSyncChar: CBMutableCharacteristic?

    private(set) var isRunning = false
    private(set) var sessionCode = ""
    private var sourceLanguage = ""
    private var deviceName = ""

    // Subscribers tracking
    private var translationSubscribers = Set<CBCentral>()
    private var presenceSubscribers = Set<CBCentral>()

    // Presence list
    private var presenceList: [[String: Any]] = []

    // Chunking constant
    private static let chunkSize = 180

    // Callback for startup
    private var startCallback: ((Bool, String?) -> Void)?
    private var pendingService: CBMutableService?

    init(plugin: BleTransportPlugin) {
        self.plugin = plugin
        super.init()
    }

    var subscriberCount: Int {
        translationSubscribers.count
    }

    func start(sessionCode: String, sourceLanguage: String, deviceName: String, completion: @escaping (Bool, String?) -> Void) {
        self.sessionCode = sessionCode
        self.sourceLanguage = sourceLanguage
        self.deviceName = deviceName
        self.startCallback = completion

        peripheralManager = CBPeripheralManager(delegate: self, queue: DispatchQueue.main)
    }

    func stop() {
        if let pm = peripheralManager {
            if pm.isAdvertising {
                pm.stopAdvertising()
            }
            pm.removeAllServices()
        }
        peripheralManager = nil
        translationSubscribers.removeAll()
        presenceSubscribers.removeAll()
        presenceList.removeAll()
        isRunning = false
    }

    func broadcastTranslation(_ json: String) -> Int {
        guard let data = json.data(using: .utf8), let charr = translationChar else { return 0 }
        notifySubscribers(charr, data: data, subscribers: translationSubscribers)
        return translationSubscribers.count
    }

    // MARK: - CBPeripheralManagerDelegate

    func peripheralManagerDidUpdateState(_ peripheral: CBPeripheralManager) {
        guard peripheral.state == .poweredOn else {
            let errorMsg: String
            switch peripheral.state {
            case .unauthorized: errorMsg = "Bluetooth-Berechtigung fehlt"
            case .unsupported: errorMsg = "BLE wird nicht unterstützt"
            case .poweredOff: errorMsg = "Bluetooth ist nicht aktiviert"
            default: errorMsg = "Bluetooth nicht verfügbar (\(peripheral.state.rawValue))"
            }
            startCallback?(false, errorMsg)
            startCallback = nil
            return
        }

        // Build GATT service
        let service = CBMutableService(type: BleTransportPlugin.serviceUUID, primary: true)

        // Translation characteristic (NOTIFY)
        translationChar = CBMutableCharacteristic(
            type: BleTransportPlugin.translationCharUUID,
            properties: [.notify],
            value: nil,
            permissions: []
        )

        // Session info characteristic (READ)
        let infoData = buildSessionInfoData()
        sessionInfoChar = CBMutableCharacteristic(
            type: BleTransportPlugin.sessionInfoCharUUID,
            properties: [.read],
            value: infoData,
            permissions: [.readable]
        )

        // Presence write characteristic (WRITE)
        presenceWriteChar = CBMutableCharacteristic(
            type: BleTransportPlugin.presenceWriteCharUUID,
            properties: [.write, .writeWithoutResponse],
            value: nil,
            permissions: [.writeable]
        )

        // Presence sync characteristic (NOTIFY)
        presenceSyncChar = CBMutableCharacteristic(
            type: BleTransportPlugin.presenceSyncCharUUID,
            properties: [.notify],
            value: nil,
            permissions: []
        )

        service.characteristics = [translationChar!, sessionInfoChar!, presenceWriteChar!, presenceSyncChar!]

        pendingService = service
        peripheral.add(service)
    }

    func peripheralManager(_ peripheral: CBPeripheralManager, didAdd service: CBService, error: Error?) {
        if let error = error {
            NSLog("[BleTransport] Error adding service: \(error)")
            startCallback?(false, "GATT-Service konnte nicht erstellt werden: \(error.localizedDescription)")
            startCallback = nil
            return
        }

        // Start advertising
        peripheral.startAdvertising([
            CBAdvertisementDataServiceUUIDsKey: [BleTransportPlugin.serviceUUID],
            CBAdvertisementDataLocalNameKey: deviceName,
        ])
    }

    func peripheralManagerDidStartAdvertising(_ peripheral: CBPeripheralManager, error: Error?) {
        if let error = error {
            NSLog("[BleTransport] Advertising error: \(error)")
            startCallback?(false, "BLE-Advertising fehlgeschlagen: \(error.localizedDescription)")
            startCallback = nil
            return
        }

        NSLog("[BleTransport] Advertising started: \(deviceName)")
        isRunning = true
        startCallback?(true, nil)
        startCallback = nil
    }

    func peripheralManager(_ peripheral: CBPeripheralManager, central: CBCentral, didSubscribeTo characteristic: CBCharacteristic) {
        if characteristic.uuid == BleTransportPlugin.translationCharUUID {
            translationSubscribers.insert(central)
            NSLog("[BleTransport] Translation subscriber added: \(central.identifier)")
        } else if characteristic.uuid == BleTransportPlugin.presenceSyncCharUUID {
            presenceSubscribers.insert(central)
            NSLog("[BleTransport] Presence subscriber added: \(central.identifier)")
        }
    }

    func peripheralManager(_ peripheral: CBPeripheralManager, central: CBCentral, didUnsubscribeFrom characteristic: CBCharacteristic) {
        if characteristic.uuid == BleTransportPlugin.translationCharUUID {
            translationSubscribers.remove(central)
            NSLog("[BleTransport] Translation subscriber removed: \(central.identifier)")
        } else if characteristic.uuid == BleTransportPlugin.presenceSyncCharUUID {
            presenceSubscribers.remove(central)
            // Remove from presence list
            removePresence(centralId: central.identifier.uuidString)
        }
    }

    func peripheralManager(_ peripheral: CBPeripheralManager, didReceiveRead request: CBATTRequest) {
        if request.characteristic.uuid == BleTransportPlugin.sessionInfoCharUUID {
            let data = buildSessionInfoData()
            if request.offset > data.count {
                peripheral.respond(to: request, withResult: .invalidOffset)
                return
            }
            request.value = data.subdata(in: request.offset..<data.count)
            peripheral.respond(to: request, withResult: .success)
        } else {
            peripheral.respond(to: request, withResult: .attributeNotFound)
        }
    }

    func peripheralManager(_ peripheral: CBPeripheralManager, didReceiveWrite requests: [CBATTRequest]) {
        for request in requests {
            if request.characteristic.uuid == BleTransportPlugin.presenceWriteCharUUID,
               let data = request.value {
                handlePresenceWrite(centralId: request.central.identifier.uuidString, data: data)
            }
        }

        // Respond to first request (CoreBluetooth requirement)
        if let first = requests.first {
            peripheral.respond(to: first, withResult: .success)
        }
    }

    // MARK: - Presence

    private func handlePresenceWrite(centralId: String, data: Data) {
        guard let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            NSLog("[BleTransport] Invalid presence data")
            return
        }

        var entry = json
        entry["_centralId"] = centralId

        // Update or add
        if let index = presenceList.firstIndex(where: { $0["_centralId"] as? String == centralId }) {
            presenceList[index] = entry
        } else {
            presenceList.append(entry)
        }

        broadcastPresenceSync()

        // Notify JS layer
        plugin?.notifyListeners("presenceJoined", data: [
            "device": centralId,
            "data": json,
        ])
    }

    private func removePresence(centralId: String) {
        presenceList.removeAll { $0["_centralId"] as? String == centralId }
        broadcastPresenceSync()
    }

    private func broadcastPresenceSync() {
        // Clean presence list (remove internal _centralId)
        let cleaned = presenceList.map { entry -> [String: Any] in
            var clean = entry
            clean.removeValue(forKey: "_centralId")
            return clean
        }

        let msg: [String: Any] = [
            "type": "presence_sync",
            "listeners": cleaned,
        ]

        if let data = try? JSONSerialization.data(withJSONObject: msg),
           let charr = presenceSyncChar {
            notifySubscribers(charr, data: data, subscribers: presenceSubscribers)
        }

        // Notify JS layer
        if let jsonData = try? JSONSerialization.data(withJSONObject: cleaned),
           let jsonString = String(data: jsonData, encoding: .utf8) {
            plugin?.notifyListeners("presenceSync", data: [
                "listeners": jsonString,
            ])
        }
    }

    // MARK: - Chunking

    private func notifySubscribers(_ characteristic: CBMutableCharacteristic, data: Data, subscribers: Set<CBCentral>) {
        let chunks = chunkPayload(data)

        for chunk in chunks {
            characteristic.value = chunk
            let didSend = peripheralManager?.updateValue(chunk, for: characteristic, onSubscribedCentrals: nil) ?? false
            if !didSend {
                NSLog("[BleTransport] updateValue returned false — transmit queue full")
            }
        }
    }

    /// Split payload into chunks with header byte.
    /// Format: [flags:1byte][payload:N bytes]
    /// flags: bit 7 = has_more_chunks
    private func chunkPayload(_ data: Data) -> [Data] {
        var chunks: [Data] = []
        var offset = 0

        while offset < data.count {
            let remaining = data.count - offset
            let chunkLen = min(remaining, GattServer.chunkSize)
            let hasMore = (offset + chunkLen) < data.count

            var chunk = Data(count: chunkLen + 1)
            chunk[0] = hasMore ? 0x80 : 0x00
            chunk.replaceSubrange(1..<(chunkLen + 1), with: data[offset..<(offset + chunkLen)])
            chunks.append(chunk)
            offset += chunkLen
        }

        return chunks
    }

    // MARK: - Helpers

    private func buildSessionInfoData() -> Data {
        let info: [String: Any] = [
            "sessionCode": sessionCode,
            "sourceLanguage": sourceLanguage,
        ]
        return (try? JSONSerialization.data(withJSONObject: info)) ?? Data()
    }
}

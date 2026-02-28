import Foundation
import Capacitor
import Network

/// Embedded WebSocket relay server for iOS.
/// iOS cannot programmatically create a Personal Hotspot, so the user must enable it manually.
/// This plugin only manages the embedded WebSocket relay server.
@objc(HotspotRelayPlugin)
public class HotspotRelayPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "HotspotRelayPlugin"
    public let jsName = "HotspotRelay"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "startHotspot", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startRelayOnly", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopHotspot", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getStatus", returnType: CAPPluginReturnPromise),
    ]

    private var relayServer: EmbeddedRelayServer?
    private var isRunning = false

    /// On iOS, we can't create a hotspot programmatically.
    /// This starts the relay server and returns connection info.
    /// The user must enable Personal Hotspot manually.
    @objc func startHotspot(_ call: CAPPluginCall) {
        let port = call.getInt("port") ?? 8765

        if isRunning {
            call.reject("Relay is already running")
            return
        }

        startRelay(port: port) { [weak self] result in
            switch result {
            case .success(let info):
                self?.isRunning = true

                // iOS Personal Hotspot always uses 172.20.10.1
                let gatewayIp = info.localIp ?? "172.20.10.1"
                let serverUrl = "ws://\(gatewayIp):\(port)"

                call.resolve([
                    "ssid": "",  // iOS can't read the hotspot SSID
                    "password": "",  // iOS can't read the hotspot password
                    "serverUrl": serverUrl,
                    "gatewayIp": gatewayIp,
                    "port": port,
                    "manualHotspotRequired": true,  // Signal to UI that user must enable hotspot
                ])

            case .failure(let error):
                call.reject("Failed to start relay: \(error.localizedDescription)")
            }
        }
    }

    @objc func startRelayOnly(_ call: CAPPluginCall) {
        let port = call.getInt("port") ?? 8765

        if relayServer != nil {
            call.reject("Relay server is already running")
            return
        }

        startRelay(port: port) { result in
            switch result {
            case .success(let info):
                let localIp = info.localIp ?? "0.0.0.0"
                let serverUrl = "ws://\(localIp):\(port)"

                call.resolve([
                    "serverUrl": serverUrl,
                    "localIp": localIp,
                    "port": port,
                ])

            case .failure(let error):
                call.reject("Failed to start relay: \(error.localizedDescription)")
            }
        }
    }

    @objc func stopHotspot(_ call: CAPPluginCall) {
        stopAll()
        call.resolve(["stopped": true])
    }

    @objc func getStatus(_ call: CAPPluginCall) {
        call.resolve([
            "isRunning": isRunning,
            "hasRelay": relayServer != nil,
        ])
    }

    // MARK: - Relay Server

    private struct RelayInfo {
        let localIp: String?
    }

    private func startRelay(port: Int, completion: @escaping (Result<RelayInfo, Error>) -> Void) {
        let server = EmbeddedRelayServer(port: UInt16(port))
        self.relayServer = server

        server.start { error in
            if let error = error {
                self.relayServer = nil
                completion(.failure(error))
            } else {
                let ip = self.getLocalIPAddress()
                completion(.success(RelayInfo(localIp: ip)))
            }
        }
    }

    private func stopAll() {
        relayServer?.stop()
        relayServer = nil
        isRunning = false
    }

    private func getLocalIPAddress() -> String? {
        var address: String?
        var ifaddr: UnsafeMutablePointer<ifaddrs>?

        guard getifaddrs(&ifaddr) == 0, let firstAddr = ifaddr else {
            return nil
        }

        for ifptr in sequence(first: firstAddr, next: { $0.pointee.ifa_next }) {
            let interface = ifptr.pointee
            let addrFamily = interface.ifa_addr.pointee.sa_family

            if addrFamily == UInt8(AF_INET) {
                let name = String(cString: interface.ifa_name)
                // Prefer bridge/hotspot interface, then any non-loopback
                if name == "bridge100" || name == "en0" || name.hasPrefix("en") {
                    var hostname = [CChar](repeating: 0, count: Int(NI_MAXHOST))
                    getnameinfo(
                        interface.ifa_addr,
                        socklen_t(interface.ifa_addr.pointee.sa_len),
                        &hostname,
                        socklen_t(hostname.count),
                        nil, 0, NI_NUMERICHOST
                    )
                    let ip = String(cString: hostname)
                    if !ip.isEmpty && ip != "127.0.0.1" {
                        // Prefer hotspot IP (172.20.10.x)
                        if ip.hasPrefix("172.20.10.") {
                            return ip
                        }
                        if address == nil {
                            address = ip
                        }
                    }
                }
            }
        }

        freeifaddrs(ifaddr)
        return address
    }

    deinit {
        stopAll()
    }
}


// MARK: - Embedded WebSocket Relay Server (Network.framework)

/// Lightweight WebSocket relay using Apple's Network framework.
/// Implements the same protocol as relay-server/server.js.
class EmbeddedRelayServer {
    private let port: UInt16
    private var listener: NWListener?
    private var healthListener: NWListener?
    private var connections: [Int: ClientConnection] = [:]
    private var nextConnectionId = 0
    private let queue = DispatchQueue(label: "com.fintutto.translator.relay", qos: .userInitiated)
    private let startTime = Date()

    // Session state
    private var sessions: [String: RelaySession] = [:]

    init(port: UInt16) {
        self.port = port
    }

    func start(completion: @escaping (Error?) -> Void) {
        let parameters = NWParameters.tcp
        let wsOptions = NWProtocolWebSocket.Options()
        wsOptions.autoReplyPing = true
        parameters.defaultProtocolStack.applicationProtocols.insert(wsOptions, at: 0)

        do {
            listener = try NWListener(using: parameters, on: NWEndpoint.Port(integerLiteral: port))
        } catch {
            completion(error)
            return
        }

        listener?.stateUpdateHandler = { state in
            switch state {
            case .ready:
                NSLog("[EmbeddedRelay] Server ready on port \(self.port)")
                self.startHealthEndpoint()
                completion(nil)
            case .failed(let error):
                NSLog("[EmbeddedRelay] Server failed: \(error)")
                completion(error)
            default:
                break
            }
        }

        listener?.newConnectionHandler = { [weak self] connection in
            self?.handleNewConnection(connection)
        }

        listener?.start(queue: queue)
    }

    func stop() {
        listener?.cancel()
        listener = nil
        healthListener?.cancel()
        healthListener = nil
        for (_, conn) in connections {
            conn.connection.cancel()
        }
        connections.removeAll()
        sessions.removeAll()
        NSLog("[EmbeddedRelay] Server stopped")
    }

    // MARK: - HTTP Health Endpoint (port + 1)

    private func startHealthEndpoint() {
        let healthPort = port + 1
        do {
            healthListener = try NWListener(using: .tcp, on: NWEndpoint.Port(integerLiteral: healthPort))
        } catch {
            NSLog("[EmbeddedRelay] Health endpoint failed to bind on port \(healthPort): \(error)")
            return
        }

        healthListener?.stateUpdateHandler = { state in
            if case .ready = state {
                NSLog("[EmbeddedRelay] Health endpoint ready on port \(healthPort)")
            }
        }

        healthListener?.newConnectionHandler = { [weak self] connection in
            self?.handleHealthRequest(connection)
        }

        healthListener?.start(queue: queue)
    }

    private func handleHealthRequest(_ connection: NWConnection) {
        connection.start(queue: queue)
        connection.receive(minimumIncompleteLength: 1, maximumLength: 1024) { [weak self] data, _, _, _ in
            guard let self = self else { connection.cancel(); return }

            let uptime = Int(Date().timeIntervalSince(self.startTime))
            let totalClients = self.connections.count
            let sessionCount = self.sessions.count

            let json = """
            {"status":"ok","server":"embedded-ios","version":"1.0.0","uptime":\(uptime),"sessions":\(sessionCount),"clients":\(totalClients)}
            """
            let body = json.data(using: .utf8)!
            let response = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: \(body.count)\r\nConnection: close\r\nAccess-Control-Allow-Origin: *\r\n\r\n\(json)"

            connection.send(content: response.data(using: .utf8), completion: .contentProcessed({ _ in
                connection.cancel()
            }))
        }
    }

    // MARK: - Connection handling

    private func handleNewConnection(_ nwConnection: NWConnection) {
        let connId = nextConnectionId
        nextConnectionId += 1

        let client = ClientConnection(id: connId, connection: nwConnection)
        connections[connId] = client

        nwConnection.stateUpdateHandler = { [weak self] state in
            switch state {
            case .ready:
                NSLog("[EmbeddedRelay] Client \(connId) connected")
                self?.sendWelcome(to: client)
                self?.receiveMessage(from: client)
            case .failed, .cancelled:
                NSLog("[EmbeddedRelay] Client \(connId) disconnected")
                self?.removeClient(connId)
            default:
                break
            }
        }

        nwConnection.start(queue: queue)
    }

    private func receiveMessage(from client: ClientConnection) {
        client.connection.receiveMessage { [weak self] content, context, isComplete, error in
            guard let self = self else { return }

            if let error = error {
                NSLog("[EmbeddedRelay] Receive error: \(error)")
                self.removeClient(client.id)
                return
            }

            if let data = content, let text = String(data: data, encoding: .utf8) {
                self.handleMessage(text, from: client)
            }

            // Continue receiving
            if client.connection.state == .ready {
                self.receiveMessage(from: client)
            }
        }
    }

    private func handleMessage(_ text: String, from client: ClientConnection) {
        // Handle ping
        if text == "ping" {
            sendText("pong", to: client)
            return
        }

        guard let data = text.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let type = json["type"] as? String else {
            return
        }

        switch type {
        case "join_session":
            guard let code = json["code"] as? String else { return }
            removeClientFromCurrentSession(client)
            let session = getOrCreateSession(code)
            session.clients.insert(client.id)
            client.sessionCode = code

            let response: [String: Any] = [
                "type": "session_joined",
                "code": code,
                "success": true,
            ]
            sendJSON(response, to: client)

        case "broadcast":
            guard let sessionCode = client.sessionCode,
                  let session = sessions[sessionCode],
                  let event = json["event"] as? String,
                  let payload = json["payload"] as? [String: Any] else { return }

            let relay: [String: Any] = [
                "type": "broadcast",
                "event": event,
                "payload": payload,
            ]
            broadcastToSession(session, message: relay, exclude: client.id)

        case "presence_join":
            guard let sessionCode = client.sessionCode,
                  let session = sessions[sessionCode],
                  let presenceData = json["data"] as? [String: Any] else { return }
            session.presence[client.id] = presenceData
            broadcastPresenceSync(session)

        case "presence_update":
            guard let sessionCode = client.sessionCode,
                  let session = sessions[sessionCode],
                  let updateData = json["data"] as? [String: Any] else { return }
            if var existing = session.presence[client.id] {
                for (key, value) in updateData {
                    existing[key] = value
                }
                session.presence[client.id] = existing
                broadcastPresenceSync(session)
            }

        case "presence_leave":
            guard let sessionCode = client.sessionCode,
                  let session = sessions[sessionCode] else { return }
            session.presence.removeValue(forKey: client.id)
            broadcastPresenceSync(session)

        default:
            break
        }
    }

    // MARK: - Session management

    private class RelaySession {
        let code: String
        var clients = Set<Int>()
        var presence: [Int: [String: Any]] = [:]

        init(code: String) {
            self.code = code
        }
    }

    private class ClientConnection {
        let id: Int
        let connection: NWConnection
        var sessionCode: String?

        init(id: Int, connection: NWConnection) {
            self.id = id
            self.connection = connection
        }
    }

    private func getOrCreateSession(_ code: String) -> RelaySession {
        if let session = sessions[code] {
            return session
        }
        let session = RelaySession(code: code)
        sessions[code] = session
        return session
    }

    private func removeClientFromCurrentSession(_ client: ClientConnection) {
        guard let code = client.sessionCode else { return }
        if let session = sessions[code] {
            session.clients.remove(client.id)
            session.presence.removeValue(forKey: client.id)
            broadcastPresenceSync(session)

            if session.clients.isEmpty {
                DispatchQueue.main.asyncAfter(deadline: .now() + 60) { [weak self] in
                    if let session = self?.sessions[code], session.clients.isEmpty {
                        self?.sessions.removeValue(forKey: code)
                    }
                }
            }
        }
        client.sessionCode = nil
    }

    private func removeClient(_ connId: Int) {
        if let client = connections[connId] {
            removeClientFromCurrentSession(client)
            client.connection.cancel()
        }
        connections.removeValue(forKey: connId)
    }

    private func broadcastPresenceSync(_ session: RelaySession) {
        var listeners: [[String: Any]] = []
        for (_, presence) in session.presence {
            listeners.append(presence)
        }

        let msg: [String: Any] = [
            "type": "presence_sync",
            "listeners": listeners,
        ]
        broadcastToSession(session, message: msg, exclude: nil)
    }

    private func broadcastToSession(_ session: RelaySession, message: [String: Any], exclude: Int?) {
        guard let data = try? JSONSerialization.data(withJSONObject: message),
              let text = String(data: data, encoding: .utf8) else { return }

        for clientId in session.clients {
            if clientId != exclude, let client = connections[clientId] {
                sendText(text, to: client)
            }
        }
    }

    private func sendJSON(_ json: [String: Any], to client: ClientConnection) {
        guard let data = try? JSONSerialization.data(withJSONObject: json),
              let text = String(data: data, encoding: .utf8) else { return }
        sendText(text, to: client)
    }

    private func sendText(_ text: String, to client: ClientConnection) {
        let metadata = NWProtocolWebSocket.Metadata(opcode: .text)
        let context = NWConnection.ContentContext(
            identifier: "websocket",
            metadata: [metadata]
        )

        client.connection.send(
            content: text.data(using: .utf8),
            contentContext: context,
            isComplete: true,
            completion: .contentProcessed({ error in
                if let error = error {
                    NSLog("[EmbeddedRelay] Send error to \(client.id): \(error)")
                }
            })
        )
    }

    private func sendWelcome(to client: ClientConnection) {
        let welcome: [String: Any] = [
            "type": "welcome",
            "serverVersion": "1.0.0-embedded-ios",
            "sessionCount": sessions.count,
        ]
        sendJSON(welcome, to: client)
    }
}

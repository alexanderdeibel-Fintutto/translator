package com.fintutto.translator;

import android.util.Log;

import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.InetSocketAddress;
import java.net.URI;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.Timer;
import java.util.TimerTask;

/**
 * Embedded WebSocket relay server that implements the same protocol as relay-server/server.js.
 * Runs on the device when it acts as a hotspot host (speaker).
 */
public class EmbeddedRelayServer extends WebSocketServer {

    private static final String TAG = "EmbeddedRelay";

    // Session state — mirrors relay-server/server.js
    private final Map<String, Session> sessions = new HashMap<>();
    private final Map<WebSocket, String> clientSessions = new HashMap<>(); // ws → sessionCode
    private final Map<WebSocket, JSONObject> clientPresence = new HashMap<>(); // ws → presenceData

    public EmbeddedRelayServer(int port) {
        super(new InetSocketAddress("0.0.0.0", port));
        setReuseAddr(true);
        setConnectionLostTimeout(30);
    }

    // --- Session management ---

    private static class Session {
        String code;
        Set<WebSocket> clients = new HashSet<>();
        Map<WebSocket, JSONObject> presence = new HashMap<>();
        long createdAt;

        Session(String code) {
            this.code = code;
            this.createdAt = System.currentTimeMillis();
        }
    }

    private Session getOrCreateSession(String code) {
        Session session = sessions.get(code);
        if (session == null) {
            session = new Session(code);
            sessions.put(code, session);
            Log.d(TAG, "Session created: " + code);
        }
        return session;
    }

    private void removeClientFromSession(WebSocket ws) {
        String code = clientSessions.remove(ws);
        if (code != null) {
            Session session = sessions.get(code);
            if (session != null) {
                session.clients.remove(ws);
                session.presence.remove(ws);
                broadcastPresenceSync(session);
                Log.d(TAG, "Client left " + code + " (" + session.clients.size() + " remaining)");

                // Clean up empty sessions after 60s
                if (session.clients.isEmpty()) {
                    new Timer().schedule(new TimerTask() {
                        @Override
                        public void run() {
                            Session s = sessions.get(code);
                            if (s != null && s.clients.isEmpty()) {
                                sessions.remove(code);
                                Log.d(TAG, "Session " + code + " cleaned up (empty)");
                            }
                        }
                    }, 60_000);
                }
            }
        }
        clientPresence.remove(ws);
    }

    private void broadcastPresenceSync(Session session) {
        try {
            JSONArray listeners = new JSONArray();
            for (JSONObject presence : session.presence.values()) {
                listeners.put(presence);
            }

            JSONObject msg = new JSONObject();
            msg.put("type", "presence_sync");
            msg.put("listeners", listeners);

            String data = msg.toString();
            for (WebSocket client : session.clients) {
                if (client.isOpen()) {
                    client.send(data);
                }
            }
        } catch (JSONException e) {
            Log.e(TAG, "Error broadcasting presence", e);
        }
    }

    private void broadcastToSession(Session session, JSONObject msg, WebSocket exclude) {
        String data = msg.toString();
        for (WebSocket client : session.clients) {
            if (client != exclude && client.isOpen()) {
                client.send(data);
            }
        }
    }

    // --- WebSocket callbacks ---

    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
        String resource = handshake.getResourceDescriptor();
        Log.d(TAG, "New connection: " + conn.getRemoteSocketAddress() + " resource=" + resource);

        // Extract session code from query parameter
        String sessionCode = null;
        try {
            URI uri = new URI("http://localhost" + resource);
            String query = uri.getQuery();
            if (query != null) {
                for (String param : query.split("&")) {
                    String[] parts = param.split("=", 2);
                    if (parts.length == 2 && "session".equals(parts[0])) {
                        sessionCode = java.net.URLDecoder.decode(parts[1], "UTF-8");
                    }
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Could not parse resource descriptor", e);
        }

        // Auto-join session if provided
        if (sessionCode != null && !sessionCode.isEmpty()) {
            Session session = getOrCreateSession(sessionCode);
            session.clients.add(conn);
            clientSessions.put(conn, sessionCode);

            try {
                JSONObject joined = new JSONObject();
                joined.put("type", "session_joined");
                joined.put("code", sessionCode);
                joined.put("success", true);
                conn.send(joined.toString());
            } catch (JSONException e) {
                Log.e(TAG, "Error sending session_joined", e);
            }
        }

        // Send welcome
        try {
            JSONObject welcome = new JSONObject();
            welcome.put("type", "welcome");
            welcome.put("serverVersion", "1.0.0-embedded");
            welcome.put("sessionCount", sessions.size());
            conn.send(welcome.toString());
        } catch (JSONException e) {
            Log.e(TAG, "Error sending welcome", e);
        }
    }

    @Override
    public void onMessage(WebSocket conn, String message) {
        // Handle ping
        if ("ping".equals(message)) {
            conn.send("pong");
            return;
        }

        try {
            JSONObject msg = new JSONObject(message);
            String type = msg.optString("type", "");

            switch (type) {
                case "join_session": {
                    removeClientFromSession(conn);
                    String code = msg.getString("code");
                    Session session = getOrCreateSession(code);
                    session.clients.add(conn);
                    clientSessions.put(conn, code);

                    JSONObject joined = new JSONObject();
                    joined.put("type", "session_joined");
                    joined.put("code", code);
                    joined.put("success", true);
                    conn.send(joined.toString());

                    Log.d(TAG, "Client joined " + code + " (" + session.clients.size() + " total)");
                    break;
                }

                case "broadcast": {
                    String code = clientSessions.get(conn);
                    if (code == null) {
                        JSONObject err = new JSONObject();
                        err.put("type", "error");
                        err.put("message", "Not in a session");
                        conn.send(err.toString());
                        return;
                    }
                    Session session = sessions.get(code);
                    if (session != null) {
                        JSONObject relay = new JSONObject();
                        relay.put("type", "broadcast");
                        relay.put("event", msg.getString("event"));
                        relay.put("payload", msg.getJSONObject("payload"));
                        broadcastToSession(session, relay, conn);
                    }
                    break;
                }

                case "presence_join": {
                    String code = clientSessions.get(conn);
                    if (code == null) return;
                    Session session = sessions.get(code);
                    if (session != null) {
                        JSONObject data = msg.getJSONObject("data");
                        session.presence.put(conn, data);
                        clientPresence.put(conn, data);
                        broadcastPresenceSync(session);
                        Log.d(TAG, "Presence join in " + code + ": " +
                                data.optString("deviceName") + " (" + msg.optString("role") + ")");
                    }
                    break;
                }

                case "presence_update": {
                    String code = clientSessions.get(conn);
                    if (code == null) return;
                    Session session = sessions.get(code);
                    if (session != null) {
                        JSONObject existing = session.presence.get(conn);
                        if (existing != null) {
                            JSONObject updateData = msg.getJSONObject("data");
                            // Merge update into existing
                            java.util.Iterator<String> keys = updateData.keys();
                            while (keys.hasNext()) {
                                String key = keys.next();
                                existing.put(key, updateData.get(key));
                            }
                            broadcastPresenceSync(session);
                        }
                    }
                    break;
                }

                case "presence_leave": {
                    String code = clientSessions.get(conn);
                    if (code == null) return;
                    Session session = sessions.get(code);
                    if (session != null) {
                        session.presence.remove(conn);
                        clientPresence.remove(conn);
                        broadcastPresenceSync(session);
                    }
                    break;
                }

                default:
                    Log.d(TAG, "Unknown message type: " + type);
            }

        } catch (JSONException e) {
            Log.w(TAG, "Invalid JSON: " + message.substring(0, Math.min(100, message.length())), e);
        }
    }

    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        removeClientFromSession(conn);
        Log.d(TAG, "Client disconnected: " + reason);
    }

    @Override
    public void onError(WebSocket conn, Exception ex) {
        Log.e(TAG, "WebSocket error", ex);
    }

    @Override
    public void onStart() {
        Log.i(TAG, "Embedded relay server started on port " + getPort());
    }

    /**
     * Get server stats for health check
     */
    public JSONObject getStats() throws JSONException {
        JSONObject stats = new JSONObject();
        stats.put("status", "ok");
        stats.put("server", "guidetranslator-relay");
        stats.put("version", "1.0.0-embedded");
        stats.put("sessions", sessions.size());

        int totalClients = 0;
        for (Session s : sessions.values()) {
            totalClients += s.clients.size();
        }
        stats.put("totalClients", totalClients);
        return stats;
    }
}

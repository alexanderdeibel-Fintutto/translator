#!/usr/bin/env node
// ============================================================================
// GuideTranslator Relay Server
// ============================================================================
// Lightweight WebSocket relay for offline tour guide translation.
// Runs on a portable WiFi router (GL.iNet/OpenWrt) or any local device.
//
// Usage:
//   node server.js [--port 8765] [--verbose]
//
// Deployment on GL.iNet router:
//   1. Install Node.js: opkg update && opkg install node
//   2. Copy this directory to /root/relay-server/
//   3. cd /root/relay-server && npm install
//   4. node server.js &
//   5. (Optional) Add to /etc/rc.local for auto-start
// ============================================================================

const http = require('http')
const { WebSocketServer, WebSocket } = require('ws')

// --- CLI args ---
const args = process.argv.slice(2)
const PORT = parseInt(args.find((_, i) => args[i - 1] === '--port') || '8765', 10)
const VERBOSE = args.includes('--verbose')

// --- Session state ---
// Each session is identified by a code (e.g., "TR-A3K9")
const sessions = new Map()  // code → SessionState

function getOrCreateSession(code) {
  if (!sessions.has(code)) {
    sessions.set(code, {
      code,
      clients: new Set(),
      presence: new Map(),  // ws → PresenceState
      createdAt: Date.now(),
    })
    log(`Session created: ${code}`)
  }
  return sessions.get(code)
}

function removeClientFromSession(ws) {
  for (const [code, session] of sessions) {
    if (session.clients.has(ws)) {
      session.clients.delete(ws)
      session.presence.delete(ws)
      broadcastPresenceSync(session)
      log(`Client left session ${code} (${session.clients.size} remaining)`)

      // Clean up empty sessions after a delay
      if (session.clients.size === 0) {
        setTimeout(() => {
          if (sessions.has(code) && sessions.get(code).clients.size === 0) {
            sessions.delete(code)
            log(`Session ${code} cleaned up (empty)`)
          }
        }, 60_000) // Keep empty sessions for 1 minute
      }
      return session
    }
  }
  return null
}

function broadcastPresenceSync(session) {
  const listeners = Array.from(session.presence.values())
  const msg = JSON.stringify({ type: 'presence_sync', listeners })
  for (const client of session.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg)
    }
  }
}

function broadcastToSession(session, msg, excludeWs) {
  const data = JSON.stringify(msg)
  for (const client of session.clients) {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  }
}

function log(...args) {
  if (VERBOSE) {
    console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...args)
  }
}

// --- HTTP server (for health check + CORS) ---
const httpServer = http.createServer((req, res) => {
  // CORS headers for browser probing
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      status: 'ok',
      server: 'guidetranslator-relay',
      version: '1.0.0',
      sessions: sessions.size,
      uptime: Math.floor(process.uptime()),
    }))
    return
  }

  if (req.url === '/sessions') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    const sessionList = Array.from(sessions.entries()).map(([code, s]) => ({
      code,
      clients: s.clients.size,
      listeners: s.presence.size,
      createdAt: s.createdAt,
    }))
    res.end(JSON.stringify({ sessions: sessionList }))
    return
  }

  // Default: info page
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(`
    <!DOCTYPE html>
    <html>
    <head><title>GuideTranslator Relay</title></head>
    <body style="font-family:system-ui;max-width:600px;margin:40px auto;padding:0 20px">
      <h1>GuideTranslator Relay Server</h1>
      <p>This relay server enables offline live translation for tour groups.</p>
      <p><strong>Status:</strong> Running</p>
      <p><strong>Active sessions:</strong> ${sessions.size}</p>
      <p><strong>WebSocket:</strong> ws://${req.headers.host}</p>
      <hr>
      <p><small>guidetranslator.com</small></p>
    </body>
    </html>
  `)
})

// --- WebSocket server ---
const wss = new WebSocketServer({ server: httpServer })

wss.on('connection', (ws, req) => {
  // Extract session code from query string
  const url = new URL(req.url, `http://${req.headers.host}`)
  const sessionCode = url.searchParams.get('session')

  log(`New connection from ${req.socket.remoteAddress}${sessionCode ? ` (session: ${sessionCode})` : ''}`)

  // Auto-join session if provided in URL
  let currentSession = null
  if (sessionCode) {
    currentSession = getOrCreateSession(sessionCode)
    currentSession.clients.add(ws)
    ws.send(JSON.stringify({
      type: 'session_joined',
      code: sessionCode,
      success: true,
    }))
  }

  // Send welcome
  ws.send(JSON.stringify({
    type: 'welcome',
    serverVersion: '1.0.0',
    sessionCount: sessions.size,
  }))

  ws.on('message', (data) => {
    // Handle ping
    if (data.toString() === 'ping') {
      ws.send('pong')
      return
    }

    let msg
    try {
      msg = JSON.parse(data.toString())
    } catch {
      log('Invalid JSON:', data.toString().slice(0, 100))
      return
    }

    switch (msg.type) {
      case 'join_session': {
        // Remove from previous session
        removeClientFromSession(ws)
        // Join new session
        currentSession = getOrCreateSession(msg.code)
        currentSession.clients.add(ws)
        ws.send(JSON.stringify({
          type: 'session_joined',
          code: msg.code,
          success: true,
        }))
        log(`Client joined session ${msg.code} (${currentSession.clients.size} total)`)
        break
      }

      case 'broadcast': {
        if (!currentSession) {
          ws.send(JSON.stringify({ type: 'error', message: 'Not in a session' }))
          return
        }
        // Relay broadcast to all other clients in the session
        broadcastToSession(currentSession, {
          type: 'broadcast',
          event: msg.event,
          payload: msg.payload,
        }, ws)
        log(`Broadcast [${msg.event}] in ${currentSession.code} → ${currentSession.clients.size - 1} clients`)
        break
      }

      case 'presence_join': {
        if (!currentSession) return
        currentSession.presence.set(ws, msg.data)
        broadcastPresenceSync(currentSession)
        log(`Presence join in ${currentSession.code}: ${msg.data.deviceName} (${msg.role})`)
        break
      }

      case 'presence_update': {
        if (!currentSession) return
        const existing = currentSession.presence.get(ws)
        if (existing) {
          currentSession.presence.set(ws, { ...existing, ...msg.data })
          broadcastPresenceSync(currentSession)
        }
        break
      }

      case 'presence_leave': {
        if (!currentSession) return
        currentSession.presence.delete(ws)
        broadcastPresenceSync(currentSession)
        break
      }

      default:
        log('Unknown message type:', msg.type)
    }
  })

  ws.on('close', () => {
    const session = removeClientFromSession(ws)
    log(`Client disconnected${session ? ` from ${session.code}` : ''}`)
  })

  ws.on('error', (err) => {
    log('WebSocket error:', err.message)
  })
})

// --- Start ---
httpServer.listen(PORT, '0.0.0.0', () => {
  const ifaces = require('os').networkInterfaces()
  const ips = []
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address)
      }
    }
  }

  console.log('============================================')
  console.log('  GuideTranslator Relay Server')
  console.log('============================================')
  console.log(`  Port: ${PORT}`)
  console.log(`  Local addresses:`)
  for (const ip of ips) {
    console.log(`    ws://${ip}:${PORT}`)
  }
  console.log(`  Health: http://0.0.0.0:${PORT}/health`)
  console.log('============================================')
  console.log('  Ready for offline tour translations!')
  console.log('============================================')
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down relay server...')
  wss.close()
  httpServer.close()
  process.exit(0)
})

process.on('SIGTERM', () => {
  wss.close()
  httpServer.close()
  process.exit(0)
})

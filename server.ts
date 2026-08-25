import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(express.json());

// In-Memory Realtime Stats with Global sync
interface LiveStats {
  totalVisits: number;
  todayVisits: number;
  lastDateStr: string;
}

const stats: LiveStats = {
  totalVisits: 1,
  todayVisits: 1,
  lastDateStr: new Date().toISOString().slice(0, 10),
};

// Track active connected clients (SSE & WebSocket)
const sseClients = new Set<{ id: string; res: Response }>();
const wsClients = new Set<WebSocket>();

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function checkDayRollover() {
  const today = getTodayString();
  if (stats.lastDateStr !== today) {
    stats.todayVisits = 0;
    stats.lastDateStr = today;
  }
}

function getLiveOnlineCount(): number {
  // Total unique live connections (at least 1 if server is answering this client)
  const count = sseClients.size + wsClients.size;
  return Math.max(1, count);
}

function broadcastLiveStats() {
  checkDayRollover();
  const payload = JSON.stringify({
    type: 'STATS_UPDATE',
    onlineCount: getLiveOnlineCount(),
    totalVisits: stats.totalVisits,
    todayVisits: stats.todayVisits,
    timestamp: Date.now(),
    serverTime: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
  });

  // 1. Broadcast to SSE clients
  for (const client of sseClients) {
    try {
      client.res.write(`data: ${payload}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }

  // 2. Broadcast to WebSocket clients
  for (const ws of wsClients) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(payload);
      } catch {
        wsClients.delete(ws);
      }
    }
  }
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    onlineCount: getLiveOnlineCount(),
    uptime: process.uptime(),
  });
});

// Get current live statistics
app.get('/api/stats', (req, res) => {
  checkDayRollover();
  res.json({
    onlineCount: getLiveOnlineCount(),
    totalVisits: stats.totalVisits,
    todayVisits: stats.todayVisits,
    serverTime: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
    source: 'live_realtime_server',
  });
});

// Increment visit hit on genuine new session
app.post('/api/hit', (req, res) => {
  checkDayRollover();
  stats.totalVisits += 1;
  stats.todayVisits += 1;
  broadcastLiveStats();
  res.json({
    success: true,
    totalVisits: stats.totalVisits,
    todayVisits: stats.todayVisits,
    onlineCount: getLiveOnlineCount(),
  });
});

// Server-Sent Events (SSE) stream for instant real-time live visitor updates
app.get('/api/live-visitors/stream', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  const clientId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const client = { id: clientId, res };
  sseClients.add(client);

  // Send initial state immediately
  const initialPayload = JSON.stringify({
    type: 'CONNECTED',
    clientId,
    onlineCount: getLiveOnlineCount(),
    totalVisits: stats.totalVisits,
    todayVisits: stats.todayVisits,
    timestamp: Date.now(),
    serverTime: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
  });
  res.write(`data: ${initialPayload}\n\n`);

  // Notify everyone of new online visitor
  broadcastLiveStats();

  // Heartbeat ping every 15 seconds to keep connection alive
  const heartbeat = setInterval(() => {
    try {
      res.write(`: ping\n\n`);
    } catch {
      clearInterval(heartbeat);
      sseClients.delete(client);
      broadcastLiveStats();
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(client);
    broadcastLiveStats();
  });
});

// WebSocket Server attached to same HTTP port
const wss = new WebSocketServer({ server, path: '/ws/live-visitors' });

wss.on('connection', (ws) => {
  wsClients.add(ws);
  broadcastLiveStats();

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
      }
    } catch {}
  });

  ws.on('close', () => {
    wsClients.delete(ws);
    broadcastLiveStats();
  });

  ws.on('error', () => {
    wsClients.delete(ws);
    broadcastLiveStats();
  });
});

// ----------------------------------------------------
// VITE MIDDLEWARE / STATIC ASSETS
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Live Server with Real-time Visitor Stream running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

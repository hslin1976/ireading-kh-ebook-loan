import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import {
  initDatabase,
  getBookRating,
  getBatchBookRatings,
  addBookReview,
  likeBookReview,
  resetBookRating,
  resetAllRatings,
  getVisitorStats,
  incrementVisitorHit,
  BookRatingRecord,
} from './server/db.js';

const app = express();
const server = http.createServer(app);
const PORT = 3000;

// Initialize embedded persistent database (Option C)
initDatabase();

app.use(express.json());

// Track active connected clients (SSE & WebSocket)
const sseClients = new Set<{ id: string; res: Response }>();
const wsClients = new Set<WebSocket>();

function getLiveOnlineCount(): number {
  const count = sseClients.size + wsClients.size;
  return Math.max(1, count);
}

function broadcastEvent(type: string, data: any) {
  const payload = JSON.stringify({
    type,
    ...data,
    onlineCount: getLiveOnlineCount(),
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

function broadcastLiveStats() {
  const visitorStats = getVisitorStats();
  broadcastEvent('STATS_UPDATE', {
    totalVisits: visitorStats.totalVisits,
    todayVisits: visitorStats.todayVisits,
  });
}

// ----------------------------------------------------
// API ROUTES (High-performance < 1ms Embedded DB)
// ----------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: 'embedded_memory_cache_sqlite_pattern',
    onlineCount: getLiveOnlineCount(),
    uptime: process.uptime(),
  });
});

// Visitor statistics
app.get('/api/stats', (req, res) => {
  const visitorStats = getVisitorStats();
  res.json({
    onlineCount: getLiveOnlineCount(),
    totalVisits: visitorStats.totalVisits,
    todayVisits: visitorStats.todayVisits,
    serverTime: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
    source: 'embedded_realtime_db',
  });
});

app.post('/api/hit', (req, res) => {
  const updated = incrementVisitorHit();
  broadcastLiveStats();
  res.json({
    success: true,
    totalVisits: updated.totalVisits,
    todayVisits: updated.todayVisits,
    onlineCount: getLiveOnlineCount(),
  });
});

// Single book rating & Google Maps style breakdown stats
app.get('/api/ratings/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const title = (req.query.title as string) || '';
  const level = req.query.level ? parseInt(req.query.level as string, 10) : undefined;
  const ratingData = getBookRating(isbn, title, level);
  res.json(ratingData);
});

// Batch book ratings lookup (Single roundtrip for entire catalog)
app.post('/api/ratings/batch', (req, res) => {
  const isbns = Array.isArray(req.body?.isbns) ? req.body.isbns : [];
  const ratings = getBatchBookRatings(isbns);
  res.json(ratings);
});

// Submit a new reader review & star rating
app.post('/api/ratings/:isbn/review', (req, res) => {
  const isbn = req.params.isbn;
  const { author, rating, content, role, title } = req.body || {};

  if (!rating || !content) {
    res.status(400).json({ error: 'Rating and review content are required' });
    return;
  }

  const updatedRecord = addBookReview(isbn, {
    author: author || '愛讀小讀者',
    rating: Number(rating),
    content: String(content),
    role,
    title,
  });

  // Broadcast rating update to all connected readers in real time!
  broadcastEvent('RATING_UPDATE', {
    isbn,
    score: updatedRecord.score,
    reviewCount: updatedRecord.reviewCount,
    distribution: updatedRecord.distribution,
  });

  res.json({
    success: true,
    record: updatedRecord,
  });
});

// Reset a single book rating & custom reviews back to clean baseline
app.post('/api/ratings/:isbn/reset', (req, res) => {
  const isbn = req.params.isbn;
  const title = (req.body?.title as string) || '';
  const level = req.body?.level ? Number(req.body.level) : undefined;
  const resetRecord = resetBookRating(isbn, title, level);

  broadcastEvent('RATING_UPDATE', {
    isbn,
    score: resetRecord.score,
    reviewCount: resetRecord.reviewCount,
    distribution: resetRecord.distribution,
  });

  res.json({ success: true, record: resetRecord });
});

// Reset all book ratings
app.post('/api/ratings/reset-all', (req, res) => {
  const result = resetAllRatings();
  broadcastEvent('RATINGS_RESET_ALL', {});
  res.json(result);
});

// Like a review
app.post('/api/ratings/:isbn/like', (req, res) => {
  const isbn = req.params.isbn;
  const { reviewId } = req.body || {};
  if (!reviewId) {
    res.status(400).json({ error: 'Review ID required' });
    return;
  }
  const result = likeBookReview(isbn, reviewId);
  res.json(result);
});

// Server-Sent Events (SSE) stream for instant real-time live visitor & rating updates
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

  const visitorStats = getVisitorStats();
  const initialPayload = JSON.stringify({
    type: 'CONNECTED',
    clientId,
    onlineCount: getLiveOnlineCount(),
    totalVisits: visitorStats.totalVisits,
    todayVisits: visitorStats.todayVisits,
    timestamp: Date.now(),
    serverTime: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
  });
  res.write(`data: ${initialPayload}\n\n`);

  broadcastLiveStats();

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
    console.log(`🚀 Option C Embedded DB & Live Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

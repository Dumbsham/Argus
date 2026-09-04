import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Redis } from 'ioredis';
import cors from 'cors';

if (process.env.NODE_ENV === 'production') {
    const requiredEnvVars = ['DATABASE_URL', 'REDIS_URL', 'ML_API_URL'];
    const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    if (missingVars.length > 0) {
        console.error(`ERROR: Missing required production environment variables: ${missingVars.join(', ')}`);
        process.exit(1);
    }
}

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || '*';
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: FRONTEND_URL }
});

const redisSubscriber = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : new Redis();
const redisClient = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : new Redis(); // For general queries if needed

// --- WebSocket Realtime Feeds (Phase 11) ---

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    
    socket.on('subscribe', (channel) => {
        socket.join(channel);
        console.log(`Socket ${socket.id} joined channel ${channel}`);
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

// Listen to Redis events from Consumer/Engines and pipe to WebSockets
redisSubscriber.subscribe('ring_alerts', 'spike_alerts', 'live_transactions', 'live_metrics');

redisSubscriber.on('message', (channel, message) => {
    const data = JSON.parse(message);
    
    // Broadcast to all connected clients
    if (channel === 'ring_alerts') {
        io.emit('ring_detected', data);
    } else if (channel === 'spike_alerts') {
        io.emit('spike_detected', data);
    } else if (channel === 'live_transactions') {
        io.emit('new_transaction', data);
    } else if (channel === 'live_metrics') {
        io.emit('metrics_update', data);
    }
});


// --- REST APIs (Phase 11) ---

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', service: 'Node.js Backend' });
});

// Dashboard APIs
app.get('/api/dashboard/metrics', async (req, res) => {
    // In production, fetch aggregated metrics from Prisma / PostgreSQL
    res.json({
        live_tps: 42,
        active_spikes: 2,
        active_rings: 1,
        money_at_risk: 28400.50,
        detection_latency_ms: 45
    });
});

// Ring APIs
app.get('/api/rings', async (req, res) => {
    // In production: const rings = await prisma.abuseRing.findMany();
    res.json({ status: 'success', data: [] }); // Placeholder for DB call
});

app.get('/api/rings/:id', async (req, res) => {
    // In production: fetch detailed ring with members and graph edges
    res.json({ status: 'success', data: { id: req.params.id } });
});

// Spike APIs
app.get('/api/spikes', async (req, res) => {
    res.json({ status: 'success', data: [] });
});

// Transaction/Investigation APIs
app.get('/api/transactions/:id', async (req, res) => {
    res.json({ status: 'success', data: { id: req.params.id } });
});

app.post('/api/investigations', async (req, res) => {
    const { title, analyst } = req.body;
    // In production: await prisma.investigation.create({...})
    res.json({ status: 'created', id: 'INV-1001' });
});

// Boot Server
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
    console.log(`🚀 Node.js Backend Server running on port ${PORT}`);
    console.log(`📡 WebSocket endpoint available`);
});

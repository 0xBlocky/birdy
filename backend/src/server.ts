import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { RedisStreamService } from './services/RedisStreamService';
import { BinaryRPCService } from './services/BinaryRPCService';
import { OpportunityStreamManager } from './services/OpportunityStreamManager';
import { PriceUpdateService } from './services/PriceUpdateService';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(cors());
app.use(express.json());

// Services
const redisStreamService = new RedisStreamService();
const binaryRPCService = new BinaryRPCService();
const streamManager = new OpportunityStreamManager();
let priceUpdateService: PriceUpdateService;

// Initialize services
async function initializeServices() {
  try {
    await redisStreamService.connect();
    console.log('✅ Redis connected');

    // Initialize PriceUpdateService
    priceUpdateService = new PriceUpdateService(redisStreamService.getClient());

    // Start listening for opportunities from Redis (legacy)
    redisStreamService.on('opportunity', (opportunity) => {
      streamManager.broadcastOpportunity(opportunity);
    });

    // Start listening for price updates
    priceUpdateService.on('priceUpdate', (tokens) => {
      streamManager.broadcastPriceUpdates(tokens);
    });

    priceUpdateService.on('error', (error) => {
      console.error('❌ Price update service error:', error);
    });

    // Start price polling (every 30 seconds)
    await priceUpdateService.start();

    console.log('✅ Services initialized');
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    process.exit(1);
  }
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('🔌 New WebSocket connection');
  
  ws.binaryType = 'arraybuffer';
  
  ws.on('message', async (data: ArrayBuffer) => {
    try {
      const message = await binaryRPCService.decodeMessage(new Uint8Array(data));
      await binaryRPCService.handleMessage(ws, message, streamManager);
    } catch (error) {
      console.error('❌ Error handling message:', error);
      binaryRPCService.sendError(ws, 500, 'Internal server error');
    }
  });
  
  ws.on('close', () => {
    console.log('🔌 WebSocket connection closed');
    streamManager.removeClient(ws);
  });
  
  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
    streamManager.removeClient(ws);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  const priceServiceStatus = priceUpdateService ? priceUpdateService.getStatus() : null;

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    connections: wss.clients.size,
    priceService: priceServiceStatus
  });
});

// Price service status endpoint
app.get('/api/prices', async (req, res) => {
  try {
    if (!priceUpdateService) {
      return res.status(503).json({ error: 'Price service not initialized' });
    }

    const tokens = await priceUpdateService.getAllCachedTokens();
    res.json({ tokens, count: tokens.length });
  } catch (error) {
    console.error('❌ Error fetching prices:', error);
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

// Force fetch prices endpoint (for testing)
app.post('/api/prices/refresh', async (req, res) => {
  try {
    if (!priceUpdateService) {
      return res.status(503).json({ error: 'Price service not initialized' });
    }

    const tokens = await priceUpdateService.forceFetch();
    res.json({ success: true, tokens, count: tokens.length });
  } catch (error) {
    console.error('❌ Error force fetching prices:', error);
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

// Start server
const PORT = process.env.PORT || 3001;

server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await initializeServices();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down gracefully...');

  // Stop price update service
  if (priceUpdateService) {
    priceUpdateService.stop();
  }

  await redisStreamService.disconnect();

  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

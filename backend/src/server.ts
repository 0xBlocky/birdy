import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { RedisStreamService } from './services/RedisStreamService';
import { BinaryRPCService } from './services/BinaryRPCService';
import { OpportunityStreamManager } from './services/OpportunityStreamManager';

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

// Initialize services
async function initializeServices() {
  try {
    await redisStreamService.connect();
    console.log('✅ Redis connected');
    
    // Start listening for opportunities from Redis
    redisStreamService.on('opportunity', (opportunity) => {
      streamManager.broadcastOpportunity(opportunity);
    });
    
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
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    connections: wss.clients.size
  });
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
  await redisStreamService.disconnect();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

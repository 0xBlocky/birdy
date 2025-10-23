"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const RedisStreamService_1 = require("./services/RedisStreamService");
const BinaryRPCService_1 = require("./services/BinaryRPCService");
const OpportunityStreamManager_1 = require("./services/OpportunityStreamManager");
const PriceUpdateService_1 = require("./services/PriceUpdateService");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const wss = new ws_1.WebSocketServer({ server });
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Services
const redisStreamService = new RedisStreamService_1.RedisStreamService();
const binaryRPCService = new BinaryRPCService_1.BinaryRPCService();
const streamManager = new OpportunityStreamManager_1.OpportunityStreamManager();
let priceUpdateService;
// Initialize services
async function initializeServices() {
    try {
        await redisStreamService.connect();
        console.log('✅ Redis connected');
        // Initialize PriceUpdateService
        priceUpdateService = new PriceUpdateService_1.PriceUpdateService(redisStreamService.getClient());
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
    }
    catch (error) {
        console.error('❌ Failed to initialize services:', error);
        process.exit(1);
    }
}
// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('🔌 New WebSocket connection');
    ws.binaryType = 'arraybuffer';
    ws.on('message', async (data) => {
        try {
            const message = await binaryRPCService.decodeMessage(new Uint8Array(data));
            await binaryRPCService.handleMessage(ws, message, streamManager);
        }
        catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
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
//# sourceMappingURL=server.js.map
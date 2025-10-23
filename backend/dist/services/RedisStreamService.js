"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisStreamService = void 0;
const redis_1 = require("redis");
const events_1 = require("events");
class RedisStreamService extends events_1.EventEmitter {
    constructor() {
        super();
        this.isConnected = false;
        this.client = (0, redis_1.createClient)({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });
        this.subscriber = (0, redis_1.createClient)({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });
    }
    async connect() {
        try {
            await this.client.connect();
            await this.subscriber.connect();
            this.isConnected = true;
            console.log('✅ Redis connected');
            // Subscribe to trading opportunities channel
            const channel = process.env.REDIS_CHANNEL || 'trading_opportunities';
            await this.subscriber.subscribe(channel, (message) => {
                this.handleOpportunityMessage(message);
            });
            console.log(`📡 Subscribed to channel: ${channel}`);
        }
        catch (error) {
            console.error('❌ Redis connection failed:', error);
            throw error;
        }
    }
    async handleOpportunityMessage(message) {
        try {
            // Parse the message (assuming it's JSON for now)
            const opportunityData = JSON.parse(message);
            // Convert to TradingOpportunity format
            const opportunity = {
                id: opportunityData.id,
                timestamp: opportunityData.timestamp || Date.now(),
                tokenIn: opportunityData.tokenIn || opportunityData.token_in,
                tokenOut: opportunityData.tokenOut || opportunityData.token_out,
                currentPrice: opportunityData.currentPrice || opportunityData.current_price,
                targetPrice: opportunityData.targetPrice || opportunityData.target_price,
                profitPotential: opportunityData.profitPotential || opportunityData.profit_potential,
                confidence: opportunityData.confidence || 50,
                metadata: opportunityData.metadata || '',
                slippageTolerance: opportunityData.slippageTolerance || opportunityData.slippage_tolerance || 2.0,
                dexName: opportunityData.dexName || opportunityData.dex_name || 'Unknown'
            };
            this.emit('opportunity', opportunity);
        }
        catch (error) {
            console.error('❌ Error parsing opportunity message:', error);
        }
    }
    async publishOpportunity(opportunity) {
        if (!this.isConnected) {
            throw new Error('Redis not connected');
        }
        const channel = process.env.REDIS_CHANNEL || 'trading_opportunities';
        const message = JSON.stringify(opportunity);
        await this.client.publish(channel, message);
    }
    async disconnect() {
        if (this.isConnected) {
            await this.client.disconnect();
            await this.subscriber.disconnect();
            this.isConnected = false;
            console.log('✅ Redis disconnected');
        }
    }
    get connected() {
        return this.isConnected;
    }
    getClient() {
        return this.client;
    }
}
exports.RedisStreamService = RedisStreamService;
//# sourceMappingURL=RedisStreamService.js.map
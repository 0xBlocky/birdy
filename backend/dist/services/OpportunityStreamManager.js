"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpportunityStreamManager = void 0;
const shared_1 = require("shared");
const BinaryRPCService_1 = require("./BinaryRPCService");
class OpportunityStreamManager {
    constructor() {
        this.clients = new Map();
        this.streamIdCounter = 0;
        this.binaryRPCService = new BinaryRPCService_1.BinaryRPCService();
    }
    addClient(ws, subscription) {
        const streamId = `stream_${++this.streamIdCounter}_${Date.now()}`;
        const clientSubscription = {
            ws,
            streamId,
            streamType: subscription.streamType || shared_1.StreamType.TRADING_OPPORTUNITIES,
            filters: subscription.filters,
            createdAt: new Date()
        };
        this.clients.set(ws, clientSubscription);
        console.log(`📡 Added client ${streamId}, total clients: ${this.clients.size}`);
        return streamId;
    }
    removeClient(ws) {
        const subscription = this.clients.get(ws);
        if (subscription) {
            this.clients.delete(ws);
            console.log(`📡 Removed client ${subscription.streamId}, total clients: ${this.clients.size}`);
        }
    }
    broadcastOpportunity(opportunity) {
        const clientsToNotify = [];
        // Filter clients based on their subscription filters
        for (const [ws, subscription] of this.clients) {
            if (subscription.streamType === shared_1.StreamType.TRADING_OPPORTUNITIES &&
                this.matchesFilters(opportunity, subscription.filters)) {
                clientsToNotify.push(ws);
            }
        }
        if (clientsToNotify.length > 0) {
            console.log(`📡 Broadcasting opportunity ${opportunity.id} to ${clientsToNotify.length} clients`);
            // Send to each matching client
            clientsToNotify.forEach(async (ws) => {
                try {
                    const subscription = this.clients.get(ws);
                    if (subscription) {
                        await this.binaryRPCService.sendStreamData(ws, subscription.streamId, [opportunity]);
                    }
                }
                catch (error) {
                    console.error('❌ Error broadcasting to client:', error);
                    this.removeClient(ws);
                }
            });
        }
    }
    broadcastPriceUpdates(tokens) {
        const clientsToNotify = [];
        // Find all clients subscribed to PRICE_UPDATES
        for (const [ws, subscription] of this.clients) {
            if (subscription.streamType === shared_1.StreamType.PRICE_UPDATES) {
                clientsToNotify.push(ws);
            }
        }
        if (clientsToNotify.length > 0) {
            console.log(`📡 Broadcasting price updates for ${tokens.length} tokens to ${clientsToNotify.length} clients`);
            // Send to each subscribed client
            clientsToNotify.forEach(async (ws) => {
                try {
                    const subscription = this.clients.get(ws);
                    if (subscription) {
                        // Filter tokens if client has token filters
                        let filteredTokens = tokens;
                        if (subscription.filters?.tokens && subscription.filters.tokens.length > 0) {
                            filteredTokens = tokens.filter(token => subscription.filters.tokens.includes(token.symbol));
                        }
                        await this.binaryRPCService.sendPriceUpdates(ws, subscription.streamId, filteredTokens);
                    }
                }
                catch (error) {
                    console.error('❌ Error broadcasting price updates to client:', error);
                    this.removeClient(ws);
                }
            });
        }
    }
    matchesFilters(opportunity, filters) {
        if (!filters) {
            return true; // No filters means accept all
        }
        // Check profit potential filter
        if (filters.minProfitPotential !== undefined &&
            opportunity.profitPotential < filters.minProfitPotential) {
            return false;
        }
        // Check slippage filter
        if (filters.maxSlippage !== undefined &&
            opportunity.slippageTolerance > filters.maxSlippage) {
            return false;
        }
        // Check token filters
        if (filters.tokens && filters.tokens.length > 0) {
            const tokenMatches = filters.tokens.some(token => opportunity.tokenIn.toLowerCase() === token.toLowerCase() ||
                opportunity.tokenOut.toLowerCase() === token.toLowerCase());
            if (!tokenMatches) {
                return false;
            }
        }
        // Check DEX filters
        if (filters.dexNames && filters.dexNames.length > 0) {
            const dexMatches = filters.dexNames.some(dex => opportunity.dexName.toLowerCase() === dex.toLowerCase());
            if (!dexMatches) {
                return false;
            }
        }
        return true;
    }
    getClientCount() {
        return this.clients.size;
    }
    getClientStats() {
        return Array.from(this.clients.values()).map(subscription => ({
            streamId: subscription.streamId,
            streamType: subscription.streamType,
            filters: subscription.filters,
            connectedAt: subscription.createdAt
        }));
    }
}
exports.OpportunityStreamManager = OpportunityStreamManager;
//# sourceMappingURL=OpportunityStreamManager.js.map
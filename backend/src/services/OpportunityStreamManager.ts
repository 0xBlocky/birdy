import { WebSocket } from 'ws';
import { TradingOpportunity, StreamFilters, StreamType, Token } from 'shared';
import { BinaryRPCService } from './BinaryRPCService';

interface ClientSubscription {
  ws: WebSocket;
  streamId: string;
  streamType: StreamType;
  filters?: StreamFilters;
  createdAt: Date;
}

export class OpportunityStreamManager {
  private clients: Map<WebSocket, ClientSubscription> = new Map();
  private streamIdCounter = 0;
  private binaryRPCService = new BinaryRPCService();

  addClient(ws: WebSocket, subscription: any): string {
    const streamId = `stream_${++this.streamIdCounter}_${Date.now()}`;
    
    const clientSubscription: ClientSubscription = {
      ws,
      streamId,
      streamType: subscription.streamType || StreamType.TRADING_OPPORTUNITIES,
      filters: subscription.filters,
      createdAt: new Date()
    };
    
    this.clients.set(ws, clientSubscription);
    
    console.log(`📡 Added client ${streamId}, total clients: ${this.clients.size}`);
    return streamId;
  }

  removeClient(ws: WebSocket): void {
    const subscription = this.clients.get(ws);
    if (subscription) {
      this.clients.delete(ws);
      console.log(`📡 Removed client ${subscription.streamId}, total clients: ${this.clients.size}`);
    }
  }

  broadcastOpportunity(opportunity: TradingOpportunity): void {
    const clientsToNotify: WebSocket[] = [];

    // Filter clients based on their subscription filters
    for (const [ws, subscription] of this.clients) {
      if (subscription.streamType === StreamType.TRADING_OPPORTUNITIES &&
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
            await this.binaryRPCService.sendStreamData(
              ws,
              subscription.streamId,
              [opportunity]
            );
          }
        } catch (error) {
          console.error('❌ Error broadcasting to client:', error);
          this.removeClient(ws);
        }
      });
    }
  }

  broadcastPriceUpdates(tokens: Token[]): void {
    const clientsToNotify: WebSocket[] = [];

    // Find all clients subscribed to PRICE_UPDATES
    for (const [ws, subscription] of this.clients) {
      if (subscription.streamType === StreamType.PRICE_UPDATES) {
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
              filteredTokens = tokens.filter(token =>
                subscription.filters!.tokens!.includes(token.symbol)
              );
            }

            await this.binaryRPCService.sendPriceUpdates(
              ws,
              subscription.streamId,
              filteredTokens
            );
          }
        } catch (error) {
          console.error('❌ Error broadcasting price updates to client:', error);
          this.removeClient(ws);
        }
      });
    }
  }

  private matchesFilters(opportunity: TradingOpportunity, filters?: StreamFilters): boolean {
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
      const tokenMatches = filters.tokens.some(token => 
        opportunity.tokenIn.toLowerCase() === token.toLowerCase() ||
        opportunity.tokenOut.toLowerCase() === token.toLowerCase()
      );
      if (!tokenMatches) {
        return false;
      }
    }
    
    // Check DEX filters
    if (filters.dexNames && filters.dexNames.length > 0) {
      const dexMatches = filters.dexNames.some(dex => 
        opportunity.dexName.toLowerCase() === dex.toLowerCase()
      );
      if (!dexMatches) {
        return false;
      }
    }
    
    return true;
  }

  getClientCount(): number {
    return this.clients.size;
  }

  getClientStats(): Array<{
    streamId: string;
    streamType: StreamType;
    filters?: StreamFilters;
    connectedAt: Date;
  }> {
    return Array.from(this.clients.values()).map(subscription => ({
      streamId: subscription.streamId,
      streamType: subscription.streamType,
      filters: subscription.filters,
      connectedAt: subscription.createdAt
    }));
  }
}

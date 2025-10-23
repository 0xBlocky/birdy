import { EventEmitter } from 'events';
import { RedisClientType } from 'redis';
import { Token, TRADING_CONFIG, DEFAULT_TOKEN_LIST, TRADEABLE_TOKENS } from 'shared';
import { DEXScreenerClient } from './DEXScreenerClient';

/**
 * Service for fetching and broadcasting real-time token prices
 * Polls DEXScreener API and caches results in Redis
 */
export class PriceUpdateService extends EventEmitter {
  private dexScreenerClient: DEXScreenerClient;
  private redisClient: RedisClientType;
  private pollingInterval: NodeJS.Timeout | null = null;
  private isPolling = false;

  // Rate limiting
  private lastFetchTime = 0;
  private minFetchInterval = 10000; // 10 seconds minimum between fetches

  constructor(redisClient: RedisClientType) {
    super();
    this.redisClient = redisClient;
    this.dexScreenerClient = new DEXScreenerClient();
  }

  /**
   * Start polling for price updates
   */
  async start(intervalMs: number = TRADING_CONFIG.PRICE_UPDATE_INTERVAL_MS): Promise<void> {
    if (this.isPolling) {
      console.log('⚠️ Price update service already running');
      return;
    }

    console.log(`🚀 Starting price update service (interval: ${intervalMs}ms)`);

    // Verify DEXScreener API is accessible
    const isHealthy = await this.dexScreenerClient.healthCheck();
    if (!isHealthy) {
      console.error('❌ DEXScreener API health check failed, not starting service');
      return;
    }

    this.isPolling = true;

    // Fetch immediately on start
    await this.fetchAndBroadcastPrices();

    // Then poll at interval
    this.pollingInterval = setInterval(async () => {
      await this.fetchAndBroadcastPrices();
    }, intervalMs);

    console.log('✅ Price update service started');
  }

  /**
   * Stop polling for price updates
   */
  stop(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isPolling = false;
    console.log('🛑 Price update service stopped');
  }

  /**
   * Fetch prices from DEXScreener and broadcast to clients
   */
  private async fetchAndBroadcastPrices(): Promise<void> {
    try {
      // Rate limiting - don't fetch too frequently
      const now = Date.now();
      if (now - this.lastFetchTime < this.minFetchInterval) {
        console.log('⏭️ Skipping price fetch due to rate limit');
        return;
      }

      console.log('📊 Fetching token prices...');
      this.lastFetchTime = now;

      // Fetch prices for all tradeable tokens
      const tokens = await this.dexScreenerClient.fetchAllTradeableTokens();

      if (tokens.length === 0) {
        console.warn('⚠️ No tokens fetched from DEXScreener');
        return;
      }

      console.log(`✅ Fetched prices for ${tokens.length} tokens`);

      // Cache tokens in Redis
      await this.cacheTokens(tokens);

      // Emit price update event (will be caught by OpportunityStreamManager)
      this.emit('priceUpdate', tokens);

      // Log sample prices
      for (const token of tokens.slice(0, 3)) {
        console.log(
          `  ${token.symbol}: $${token.currentPriceUSD.toFixed(6)} (${token.priceChange24h >= 0 ? '+' : ''}${token.priceChange24h.toFixed(2)}%)`
        );
      }
    } catch (error) {
      console.error('❌ Error fetching prices:', error);
      this.emit('error', error);
    }
  }

  /**
   * Cache tokens in Redis for quick retrieval
   */
  private async cacheTokens(tokens: Token[]): Promise<void> {
    try {
      const pipeline = this.redisClient.multi();

      for (const token of tokens) {
        const key = `token:price:${token.id}`;
        pipeline.set(key, JSON.stringify(token));
        pipeline.expire(key, 300); // Expire after 5 minutes
      }

      // Also store a list of all token IDs
      const tokenIds = tokens.map((t) => t.id);
      pipeline.set('token:ids', JSON.stringify(tokenIds));
      pipeline.expire('token:ids', 300);

      await pipeline.exec();

      console.log(`💾 Cached ${tokens.length} tokens in Redis`);
    } catch (error) {
      console.error('❌ Error caching tokens in Redis:', error);
    }
  }

  /**
   * Get cached token from Redis
   */
  async getCachedToken(tokenId: string): Promise<Token | null> {
    try {
      const key = `token:price:${tokenId}`;
      const data = await this.redisClient.get(key);

      if (!data) {
        return null;
      }

      return JSON.parse(data) as Token;
    } catch (error) {
      console.error(`❌ Error getting cached token ${tokenId}:`, error);
      return null;
    }
  }

  /**
   * Get all cached tokens from Redis
   */
  async getAllCachedTokens(): Promise<Token[]> {
    try {
      const tokenIdsData = await this.redisClient.get('token:ids');
      if (!tokenIdsData) {
        return [];
      }

      const tokenIds = JSON.parse(tokenIdsData) as string[];
      const tokens: Token[] = [];

      for (const tokenId of tokenIds) {
        const token = await this.getCachedToken(tokenId);
        if (token) {
          tokens.push(token);
        }
      }

      return tokens;
    } catch (error) {
      console.error('❌ Error getting all cached tokens:', error);
      return [];
    }
  }

  /**
   * Force fetch prices immediately (bypasses rate limiting)
   */
  async forceFetch(): Promise<Token[]> {
    console.log('🔄 Force fetching prices...');
    const tokens = await this.dexScreenerClient.fetchAllTradeableTokens();
    await this.cacheTokens(tokens);
    this.emit('priceUpdate', tokens);
    return tokens;
  }

  /**
   * Get service status
   */
  getStatus(): {
    isPolling: boolean;
    lastFetchTime: number;
    timeSinceLastFetch: number;
  } {
    return {
      isPolling: this.isPolling,
      lastFetchTime: this.lastFetchTime,
      timeSinceLastFetch: Date.now() - this.lastFetchTime,
    };
  }
}

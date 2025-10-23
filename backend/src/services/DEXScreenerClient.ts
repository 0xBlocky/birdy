import axios, { AxiosInstance } from 'axios';
import { Token, TRADEABLE_TOKENS } from 'shared';

interface DEXScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  marketCap: number;
}

interface DEXScreenerResponse {
  schemaVersion: string;
  pairs: DEXScreenerPair[] | null;
}

/**
 * Client for interacting with DEXScreener API
 * Docs: https://docs.dexscreener.com/api/reference
 */
export class DEXScreenerClient {
  private client: AxiosInstance;
  private baseURL = 'https://api.dexscreener.com/latest';

  constructor() {
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
      },
    });
  }

  /**
   * Fetch token prices by contract addresses
   * Rate limit: 300 requests/minute
   */
  async fetchTokensByAddresses(addresses: string[]): Promise<Token[]> {
    try {
      // DEXScreener allows multiple addresses comma-separated
      const addressesParam = addresses.join(',');

      const response = await this.client.get<DEXScreenerResponse>(
        `/dex/tokens/${addressesParam}`
      );

      if (!response.data.pairs || response.data.pairs.length === 0) {
        console.warn('⚠️ No pairs found for addresses:', addresses);
        return [];
      }

      return this.mapPairsToTokens(response.data.pairs);
    } catch (error) {
      console.error('❌ Error fetching tokens from DEXScreener:', error);
      throw error;
    }
  }

  /**
   * Fetch a single token by contract address
   */
  async fetchTokenByAddress(address: string): Promise<Token | null> {
    const tokens = await this.fetchTokensByAddresses([address]);
    return tokens.length > 0 ? tokens[0] : null;
  }

  /**
   * Fetch all tradeable tokens from constants
   */
  async fetchAllTradeableTokens(): Promise<Token[]> {
    const addresses = Object.values(TRADEABLE_TOKENS).map(
      (token) => token.contractAddress
    );

    return await this.fetchTokensByAddresses(addresses);
  }

  /**
   * Map DEXScreener pairs to our Token interface
   * Uses the best (highest liquidity) pair for each token
   */
  private mapPairsToTokens(pairs: DEXScreenerPair[]): Token[] {
    // Group pairs by base token address
    const tokenMap = new Map<string, DEXScreenerPair[]>();

    for (const pair of pairs) {
      const address = pair.baseToken.address;
      if (!tokenMap.has(address)) {
        tokenMap.set(address, []);
      }
      tokenMap.get(address)!.push(pair);
    }

    // For each token, select the pair with highest liquidity
    const tokens: Token[] = [];

    for (const [address, tokenPairs] of tokenMap) {
      // Sort by liquidity (highest first)
      const sortedPairs = tokenPairs.sort(
        (a, b) => b.liquidity.usd - a.liquidity.usd
      );

      const bestPair = sortedPairs[0];

      // Find metadata from our constants
      const metadata = Object.values(TRADEABLE_TOKENS).find(
        (t) => t.contractAddress.toLowerCase() === address.toLowerCase()
      );

      const token: Token = {
        id: metadata?.symbol || bestPair.baseToken.symbol,
        symbol: bestPair.baseToken.symbol,
        name: bestPair.baseToken.name,
        contractAddress: address,
        decimals: metadata?.decimals || 9, // Default to 9 for TON tokens

        // Pricing
        currentPriceUSD: parseFloat(bestPair.priceUsd),
        currentPriceTON: parseFloat(bestPair.priceNative),
        priceChange24h: bestPair.priceChange.h24,

        // Market data
        volume24h: bestPair.volume.h24,
        marketCap: bestPair.marketCap || bestPair.fdv || 0,
        liquidity: bestPair.liquidity.usd,

        // DEX info
        dexName: this.getDEXName(bestPair.dexId),
        pairAddress: bestPair.pairAddress,

        // Metadata
        logoUrl: metadata?.logoUrl,
        lastUpdated: Date.now(),
      };

      tokens.push(token);
    }

    return tokens;
  }

  /**
   * Map DEXScreener dexId to friendly name
   */
  private getDEXName(dexId: string): string {
    const dexNameMap: Record<string, string> = {
      'stonfi': 'STON.fi',
      'dedust': 'DeDust',
      'megaton': 'Megaton',
    };

    return dexNameMap[dexId.toLowerCase()] || dexId;
  }

  /**
   * Health check - verify API is accessible
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Fetch a known token (STON) to verify API is working
      const stonAddress = TRADEABLE_TOKENS.STON.contractAddress;
      await this.client.get(`/dex/tokens/${stonAddress}`);
      return true;
    } catch (error) {
      console.error('❌ DEXScreener API health check failed:', error);
      return false;
    }
  }
}

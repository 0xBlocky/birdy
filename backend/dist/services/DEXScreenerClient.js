"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEXScreenerClient = void 0;
const axios_1 = __importDefault(require("axios"));
const shared_1 = require("shared");
/**
 * Client for interacting with DEXScreener API
 * Docs: https://docs.dexscreener.com/api/reference
 */
class DEXScreenerClient {
    constructor() {
        this.baseURL = 'https://api.dexscreener.com/latest';
        this.client = axios_1.default.create({
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
    async fetchTokensByAddresses(addresses) {
        try {
            // DEXScreener allows multiple addresses comma-separated
            const addressesParam = addresses.join(',');
            const response = await this.client.get(`/dex/tokens/${addressesParam}`);
            if (!response.data.pairs || response.data.pairs.length === 0) {
                console.warn('⚠️ No pairs found for addresses:', addresses);
                return [];
            }
            return this.mapPairsToTokens(response.data.pairs);
        }
        catch (error) {
            console.error('❌ Error fetching tokens from DEXScreener:', error);
            throw error;
        }
    }
    /**
     * Fetch a single token by contract address
     */
    async fetchTokenByAddress(address) {
        const tokens = await this.fetchTokensByAddresses([address]);
        return tokens.length > 0 ? tokens[0] : null;
    }
    /**
     * Fetch all tradeable tokens from constants
     */
    async fetchAllTradeableTokens() {
        const addresses = Object.values(shared_1.TRADEABLE_TOKENS).map((token) => token.contractAddress);
        return await this.fetchTokensByAddresses(addresses);
    }
    /**
     * Map DEXScreener pairs to our Token interface
     * Uses the best (highest liquidity) pair for each token
     */
    mapPairsToTokens(pairs) {
        // Group pairs by base token address
        const tokenMap = new Map();
        for (const pair of pairs) {
            const address = pair.baseToken.address;
            if (!tokenMap.has(address)) {
                tokenMap.set(address, []);
            }
            tokenMap.get(address).push(pair);
        }
        // For each token, select the pair with highest liquidity
        const tokens = [];
        for (const [address, tokenPairs] of tokenMap) {
            // Sort by liquidity (highest first)
            const sortedPairs = tokenPairs.sort((a, b) => b.liquidity.usd - a.liquidity.usd);
            const bestPair = sortedPairs[0];
            // Find metadata from our constants
            const metadata = Object.values(shared_1.TRADEABLE_TOKENS).find((t) => t.contractAddress.toLowerCase() === address.toLowerCase());
            const token = {
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
    getDEXName(dexId) {
        const dexNameMap = {
            'stonfi': 'STON.fi',
            'dedust': 'DeDust',
            'megaton': 'Megaton',
        };
        return dexNameMap[dexId.toLowerCase()] || dexId;
    }
    /**
     * Health check - verify API is accessible
     */
    async healthCheck() {
        try {
            // Fetch a known token (STON) to verify API is working
            const stonAddress = shared_1.TRADEABLE_TOKENS.STON.contractAddress;
            await this.client.get(`/dex/tokens/${stonAddress}`);
            return true;
        }
        catch (error) {
            console.error('❌ DEXScreener API health check failed:', error);
            return false;
        }
    }
}
exports.DEXScreenerClient = DEXScreenerClient;
//# sourceMappingURL=DEXScreenerClient.js.map
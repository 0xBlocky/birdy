export interface TokenMetadata {
    symbol: string;
    name: string;
    contractAddress: string;
    decimals: number;
    logoUrl?: string;
    dexName: string;
    pairAddress: string;
}
export declare const TRADEABLE_TOKENS: Record<string, TokenMetadata>;
export declare const DEFAULT_TOKEN_LIST: string[];
export declare const TRADING_CONFIG: {
    DEFAULT_TRADE_AMOUNT_TON: number;
    MIN_TRADE_AMOUNT_TON: number;
    MAX_TRADE_AMOUNT_TON: number;
    DEFAULT_SLIPPAGE_PERCENT: number;
    MAX_SLIPPAGE_PERCENT: number;
    PRICE_UPDATE_INTERVAL_MS: number;
    TRANSACTION_TIMEOUT_MS: number;
    TRANSACTION_POLL_INTERVAL_MS: number;
};
export declare const TON_NATIVE: TokenMetadata;
//# sourceMappingURL=tokens.d.ts.map
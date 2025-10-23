export interface TradingOpportunity {
    id: string;
    timestamp: number;
    tokenIn: string;
    tokenOut: string;
    currentPrice: number;
    targetPrice: number;
    profitPotential: number;
    confidence: number;
    metadata: string;
    slippageTolerance: number;
    dexName: string;
}
export interface Token {
    id: string;
    symbol: string;
    name: string;
    contractAddress: string;
    decimals: number;
    currentPriceUSD: number;
    currentPriceTON: number;
    priceChange24h: number;
    volume24h: number;
    marketCap: number;
    liquidity: number;
    dexName: string;
    pairAddress: string;
    logoUrl?: string;
    lastUpdated: number;
}
export interface UserPosition {
    id: string;
    userId: string;
    tokenId: string;
    amountHeld: number;
    averageEntryPriceTON: number;
    averageEntryPriceUSD: number;
    totalInvestedTON: number;
    totalInvestedUSD: number;
    currentValueTON: number;
    currentValueUSD: number;
    unrealizedPnLTON: number;
    unrealizedPnLUSD: number;
    unrealizedPnLPercent: number;
    firstPurchaseAt: number;
    lastTransactionAt: number;
    transactionCount: number;
}
export declare enum TradeType {
    BUY = "BUY",
    SELL = "SELL"
}
export declare enum TransactionStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    FAILED = "FAILED"
}
export interface TradeTransaction {
    id: string;
    userId: string;
    tokenId: string;
    type: TradeType;
    amountToken: number;
    amountTON: number;
    pricePerTokenTON: number;
    pricePerTokenUSD: number;
    slippage: number;
    feeTON: number;
    txHash: string;
    status: TransactionStatus;
    blockNumber?: number;
    dexName: string;
    createdAt: number;
    confirmedAt?: number;
}
export interface OpportunityRow {
    token: Token;
    position?: UserPosition;
    isConnected: boolean;
    isTrading: boolean;
    lastTransaction?: TradeTransaction;
    errorMessage?: string;
}
export interface StreamFilters {
    minProfitPotential?: number;
    maxSlippage?: number;
    tokens?: string[];
    dexNames?: string[];
}
export interface StreamSubscription {
    streamType: StreamType;
    filters?: StreamFilters;
}
export declare enum MessageType {
    REQUEST = 0,
    RESPONSE = 1,
    STREAM = 2
}
export declare enum StreamType {
    TRADING_OPPORTUNITIES = 1,
    PRICE_UPDATES = 2,
    ORDER_STATUS = 3,
    BALANCE_UPDATES = 4
}
export interface BinaryRPCMessage {
    version: number;
    messageType: MessageType;
    requestId: number;
    payload: Uint8Array;
}
export interface StreamData {
    streamId: string;
    streamType: StreamType;
    opportunities?: TradingOpportunity[];
    tokens?: Token[];
    positions?: UserPosition[];
    transactions?: TradeTransaction[];
}
export interface ErrorResponse {
    code: number;
    message: string;
}
//# sourceMappingURL=trading.d.ts.map
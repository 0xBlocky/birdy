// TypeScript interfaces matching protobuf schemas
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

export enum MessageType {
  REQUEST = 0,
  RESPONSE = 1,
  STREAM = 2
}

export enum StreamType {
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
  opportunities: TradingOpportunity[];
}

export interface ErrorResponse {
  code: number;
  message: string;
}

// Protobuf utilities for encoding/decoding
import * as protobuf from 'protobufjs';
import { TradingOpportunity } from './types/trading';

let root: protobuf.Root | null = null;

export async function loadProtobufRoot(): Promise<protobuf.Root> {
  if (!root) {
    root = await protobuf.load([
      'proto/TradingOpportunity.proto',
      'proto/BinaryRPC.proto'
    ]);
  }
  return root;
}

export async function encodeTradingOpportunity(opportunity: TradingOpportunity): Promise<Uint8Array> {
  const root = await loadProtobufRoot();
  const TradingOpportunityMessage = root.lookupType('birdy.trading.TradingOpportunity');
  
  const message = TradingOpportunityMessage.create({
    id: opportunity.id,
    timestamp: opportunity.timestamp,
    token_in: opportunity.tokenIn,
    token_out: opportunity.tokenOut,
    current_price: opportunity.currentPrice,
    target_price: opportunity.targetPrice,
    profit_potential: opportunity.profitPotential,
    confidence: opportunity.confidence,
    metadata: opportunity.metadata,
    slippage_tolerance: opportunity.slippageTolerance,
    dex_name: opportunity.dexName
  });
  
  return TradingOpportunityMessage.encode(message).finish();
}

export async function decodeTradingOpportunity(data: Uint8Array): Promise<TradingOpportunity> {
  const root = await loadProtobufRoot();
  const TradingOpportunityMessage = root.lookupType('birdy.trading.TradingOpportunity');
  
  const message = TradingOpportunityMessage.decode(data);
  
  return {
    id: message.id,
    timestamp: Number(message.timestamp),
    tokenIn: message.token_in,
    tokenOut: message.token_out,
    currentPrice: message.current_price,
    targetPrice: message.target_price,
    profitPotential: message.profit_potential,
    confidence: message.confidence,
    metadata: message.metadata,
    slippageTolerance: message.slippage_tolerance,
    dexName: message.dex_name
  };
}

export async function encodeBinaryRPCMessage(
  messageType: number,
  requestId: number,
  payload: Uint8Array
): Promise<Uint8Array> {
  const root = await loadProtobufRoot();
  const BinaryRPCMessage = root.lookupType('birdy.rpc.BinaryRPCMessage');
  
  const message = BinaryRPCMessage.create({
    version: 1,
    message_type: messageType,
    request_id: requestId,
    payload: payload
  });
  
  return BinaryRPCMessage.encode(message).finish();
}

export async function decodeBinaryRPCMessage(data: Uint8Array): Promise<{
  version: number;
  messageType: number;
  requestId: number;
  payload: Uint8Array;
}> {
  const root = await loadProtobufRoot();
  const BinaryRPCMessage = root.lookupType('birdy.rpc.BinaryRPCMessage');
  
  const message = BinaryRPCMessage.decode(data);
  
  return {
    version: message.version,
    messageType: message.message_type,
    requestId: message.request_id,
    payload: message.payload
  };
}

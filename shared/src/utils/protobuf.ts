// Protobuf utilities for encoding/decoding
import * as protobuf from 'protobufjs';

let root: protobuf.Root | null = null;

export async function loadProtobufRoot(): Promise<protobuf.Root> {
  if (!root) {
    // Create the protobuf definitions directly instead of loading from files
    root = new protobuf.Root();
    
    // Define TradingOpportunity message
    const TradingOpportunity = new protobuf.Type("TradingOpportunity");
    TradingOpportunity.add(new protobuf.Field("id", 1, "string"));
    TradingOpportunity.add(new protobuf.Field("timestamp", 2, "int64"));
    TradingOpportunity.add(new protobuf.Field("token_in", 3, "string"));
    TradingOpportunity.add(new protobuf.Field("token_out", 4, "string"));
    TradingOpportunity.add(new protobuf.Field("current_price", 5, "double"));
    TradingOpportunity.add(new protobuf.Field("target_price", 6, "double"));
    TradingOpportunity.add(new protobuf.Field("profit_potential", 7, "double"));
    TradingOpportunity.add(new protobuf.Field("confidence", 8, "int32"));
    TradingOpportunity.add(new protobuf.Field("metadata", 9, "string"));
    TradingOpportunity.add(new protobuf.Field("slippage_tolerance", 10, "double"));
    TradingOpportunity.add(new protobuf.Field("dex_name", 11, "string"));
    
    // Define BinaryRPCMessage
    const BinaryRPCMessage = new protobuf.Type("BinaryRPCMessage");
    BinaryRPCMessage.add(new protobuf.Field("version", 1, "int32"));
    BinaryRPCMessage.add(new protobuf.Field("message_type", 2, "int32"));
    BinaryRPCMessage.add(new protobuf.Field("request_id", 3, "int32"));
    BinaryRPCMessage.add(new protobuf.Field("payload", 4, "bytes"));
    
    // Add to root
    root.add(TradingOpportunity);
    root.add(BinaryRPCMessage);
  }
  return root;
}

export async function encodeTradingOpportunity(opportunity: any): Promise<Uint8Array> {
  const root = await loadProtobufRoot();
  const TradingOpportunityMessage = root.lookupType('TradingOpportunity');
  
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

export async function decodeTradingOpportunity(data: Uint8Array): Promise<any> {
  const root = await loadProtobufRoot();
  const TradingOpportunityMessage = root.lookupType('TradingOpportunity');
  
  const message = TradingOpportunityMessage.decode(data) as any;
  
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
  const BinaryRPCMessage = root.lookupType('BinaryRPCMessage');
  
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
  const BinaryRPCMessage = root.lookupType('BinaryRPCMessage');
  
  const message = BinaryRPCMessage.decode(data) as any;
  
  return {
    version: message.version,
    messageType: message.message_type,
    requestId: message.request_id,
    payload: message.payload
  };
}

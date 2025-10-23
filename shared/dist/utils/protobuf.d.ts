import * as protobuf from 'protobufjs';
export declare function loadProtobufRoot(): Promise<protobuf.Root>;
export declare function encodeTradingOpportunity(opportunity: any): Promise<Uint8Array>;
export declare function decodeTradingOpportunity(data: Uint8Array): Promise<any>;
export declare function encodeBinaryRPCMessage(messageType: number, requestId: number, payload: Uint8Array): Promise<Uint8Array>;
export declare function decodeBinaryRPCMessage(data: Uint8Array): Promise<{
    version: number;
    messageType: number;
    requestId: number;
    payload: Uint8Array;
}>;
//# sourceMappingURL=protobuf.d.ts.map
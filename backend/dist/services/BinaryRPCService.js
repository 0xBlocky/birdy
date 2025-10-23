"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryRPCService = void 0;
const ws_1 = require("ws");
const shared_1 = require("shared");
class BinaryRPCService {
    constructor() {
        this.requestId = 0;
    }
    async decodeMessage(data) {
        return await (0, shared_1.decodeBinaryRPCMessage)(data);
    }
    async handleMessage(ws, message, streamManager) {
        switch (message.messageType) {
            case shared_1.MessageType.REQUEST:
                await this.handleRequest(ws, message, streamManager);
                break;
            case shared_1.MessageType.STREAM:
                await this.handleStreamSubscription(ws, message, streamManager);
                break;
            default:
                this.sendError(ws, 400, 'Unknown message type');
        }
    }
    async handleRequest(ws, message, streamManager) {
        try {
            // Parse the request payload to determine the type
            const requestData = JSON.parse(new TextDecoder().decode(message.payload));
            if (requestData.streamType) {
                // This is a stream subscription request
                await this.handleStreamSubscription(ws, message, streamManager);
            }
            else {
                // Regular request - echo back
                const response = await (0, shared_1.encodeBinaryRPCMessage)(shared_1.MessageType.RESPONSE, message.requestId, message.payload);
                ws.send(response);
            }
        }
        catch (error) {
            console.error('❌ Error handling request:', error);
            // Send error response
            const errorResponse = {
                code: 400,
                message: 'Invalid request format'
            };
            const payload = new TextEncoder().encode(JSON.stringify(errorResponse));
            const response = await (0, shared_1.encodeBinaryRPCMessage)(shared_1.MessageType.RESPONSE, message.requestId, payload);
            ws.send(response);
        }
    }
    async handleStreamSubscription(ws, message, streamManager) {
        try {
            // Parse stream subscription from payload
            const subscriptionData = JSON.parse(new TextDecoder().decode(message.payload));
            const subscription = {
                streamType: subscriptionData.streamType || shared_1.StreamType.TRADING_OPPORTUNITIES,
                filters: subscriptionData.filters
            };
            // Register client with stream manager
            const streamId = streamManager.addClient(ws, subscription);
            // Send subscription confirmation
            const response = {
                streamId,
                status: 'subscribed',
                streamType: subscription.streamType
            };
            const responsePayload = new TextEncoder().encode(JSON.stringify(response));
            const responseMessage = await (0, shared_1.encodeBinaryRPCMessage)(shared_1.MessageType.RESPONSE, message.requestId, responsePayload);
            ws.send(responseMessage);
            console.log(`📡 Client subscribed to stream ${streamId}`);
        }
        catch (error) {
            console.error('❌ Error handling stream subscription:', error);
            this.sendError(ws, 400, 'Invalid stream subscription');
        }
    }
    async sendStreamData(ws, streamId, opportunities) {
        try {
            const streamData = {
                streamId,
                streamType: shared_1.StreamType.TRADING_OPPORTUNITIES,
                opportunities
            };
            const payload = new TextEncoder().encode(JSON.stringify(streamData));
            const message = await (0, shared_1.encodeBinaryRPCMessage)(shared_1.MessageType.STREAM, this.getNextRequestId(), payload);
            if (ws.readyState === ws_1.WebSocket.OPEN) {
                ws.send(message);
            }
        }
        catch (error) {
            console.error('❌ Error sending stream data:', error);
        }
    }
    async sendPriceUpdates(ws, streamId, tokens) {
        try {
            const streamData = {
                streamId,
                streamType: shared_1.StreamType.PRICE_UPDATES,
                tokens
            };
            const payload = new TextEncoder().encode(JSON.stringify(streamData));
            const message = await (0, shared_1.encodeBinaryRPCMessage)(shared_1.MessageType.STREAM, this.getNextRequestId(), payload);
            if (ws.readyState === ws_1.WebSocket.OPEN) {
                ws.send(message);
            }
        }
        catch (error) {
            console.error('❌ Error sending price updates:', error);
        }
    }
    async sendPositionUpdates(ws, streamId, positions) {
        try {
            const streamData = {
                streamId,
                streamType: shared_1.StreamType.BALANCE_UPDATES,
                positions
            };
            const payload = new TextEncoder().encode(JSON.stringify(streamData));
            const message = await (0, shared_1.encodeBinaryRPCMessage)(shared_1.MessageType.STREAM, this.getNextRequestId(), payload);
            if (ws.readyState === ws_1.WebSocket.OPEN) {
                ws.send(message);
            }
        }
        catch (error) {
            console.error('❌ Error sending position updates:', error);
        }
    }
    async sendTransactionUpdates(ws, streamId, transactions) {
        try {
            const streamData = {
                streamId,
                streamType: shared_1.StreamType.ORDER_STATUS,
                transactions
            };
            const payload = new TextEncoder().encode(JSON.stringify(streamData));
            const message = await (0, shared_1.encodeBinaryRPCMessage)(shared_1.MessageType.STREAM, this.getNextRequestId(), payload);
            if (ws.readyState === ws_1.WebSocket.OPEN) {
                ws.send(message);
            }
        }
        catch (error) {
            console.error('❌ Error sending transaction updates:', error);
        }
    }
    async sendError(ws, code, message) {
        try {
            const errorResponse = {
                code,
                message
            };
            const payload = new TextEncoder().encode(JSON.stringify(errorResponse));
            const responseMessage = await (0, shared_1.encodeBinaryRPCMessage)(shared_1.MessageType.RESPONSE, this.getNextRequestId(), payload);
            if (ws.readyState === ws_1.WebSocket.OPEN) {
                ws.send(responseMessage);
            }
        }
        catch (error) {
            console.error('❌ Error sending error response:', error);
        }
    }
    getNextRequestId() {
        return ++this.requestId;
    }
}
exports.BinaryRPCService = BinaryRPCService;
//# sourceMappingURL=BinaryRPCService.js.map
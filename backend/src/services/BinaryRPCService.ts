import { WebSocket } from 'ws';
import {
  BinaryRPCMessage,
  MessageType,
  StreamType,
  StreamSubscription,
  StreamFilters,
  TradingOpportunity,
  Token,
  UserPosition,
  TradeTransaction,
  encodeBinaryRPCMessage,
  decodeBinaryRPCMessage
} from 'shared';

export class BinaryRPCService {
  private requestId = 0;

  async decodeMessage(data: Uint8Array): Promise<BinaryRPCMessage> {
    return await decodeBinaryRPCMessage(data);
  }

  async handleMessage(
    ws: WebSocket, 
    message: BinaryRPCMessage, 
    streamManager: any
  ): Promise<void> {
    switch (message.messageType) {
      case MessageType.REQUEST:
        await this.handleRequest(ws, message, streamManager);
        break;
      case MessageType.STREAM:
        await this.handleStreamSubscription(ws, message, streamManager);
        break;
      default:
        this.sendError(ws, 400, 'Unknown message type');
    }
  }

  private async handleRequest(
    ws: WebSocket, 
    message: BinaryRPCMessage, 
    streamManager: any
  ): Promise<void> {
    try {
      // Parse the request payload to determine the type
      const requestData = JSON.parse(new TextDecoder().decode(message.payload));
      
      if (requestData.streamType) {
        // This is a stream subscription request
        await this.handleStreamSubscription(ws, message, streamManager);
      } else {
        // Regular request - echo back
        const response = await encodeBinaryRPCMessage(
          MessageType.RESPONSE,
          message.requestId,
          message.payload
        );
        ws.send(response);
      }
    } catch (error) {
      console.error('❌ Error handling request:', error);
      // Send error response
      const errorResponse = {
        code: 400,
        message: 'Invalid request format'
      };
      const payload = new TextEncoder().encode(JSON.stringify(errorResponse));
      const response = await encodeBinaryRPCMessage(
        MessageType.RESPONSE,
        message.requestId,
        payload
      );
      ws.send(response);
    }
  }

  private async handleStreamSubscription(
    ws: WebSocket, 
    message: BinaryRPCMessage, 
    streamManager: any
  ): Promise<void> {
    try {
      // Parse stream subscription from payload
      const subscriptionData = JSON.parse(new TextDecoder().decode(message.payload));
      const subscription: StreamSubscription = {
        streamType: subscriptionData.streamType || StreamType.TRADING_OPPORTUNITIES,
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
      const responseMessage = await encodeBinaryRPCMessage(
        MessageType.RESPONSE,
        message.requestId,
        responsePayload
      );
      
      ws.send(responseMessage);
      
      console.log(`📡 Client subscribed to stream ${streamId}`);
    } catch (error) {
      console.error('❌ Error handling stream subscription:', error);
      this.sendError(ws, 400, 'Invalid stream subscription');
    }
  }

  async sendStreamData(
    ws: WebSocket,
    streamId: string,
    opportunities: TradingOpportunity[]
  ): Promise<void> {
    try {
      const streamData = {
        streamId,
        streamType: StreamType.TRADING_OPPORTUNITIES,
        opportunities
      };

      const payload = new TextEncoder().encode(JSON.stringify(streamData));
      const message = await encodeBinaryRPCMessage(
        MessageType.STREAM,
        this.getNextRequestId(),
        payload
      );

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    } catch (error) {
      console.error('❌ Error sending stream data:', error);
    }
  }

  async sendPriceUpdates(
    ws: WebSocket,
    streamId: string,
    tokens: Token[]
  ): Promise<void> {
    try {
      const streamData = {
        streamId,
        streamType: StreamType.PRICE_UPDATES,
        tokens
      };

      const payload = new TextEncoder().encode(JSON.stringify(streamData));
      const message = await encodeBinaryRPCMessage(
        MessageType.STREAM,
        this.getNextRequestId(),
        payload
      );

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    } catch (error) {
      console.error('❌ Error sending price updates:', error);
    }
  }

  async sendPositionUpdates(
    ws: WebSocket,
    streamId: string,
    positions: UserPosition[]
  ): Promise<void> {
    try {
      const streamData = {
        streamId,
        streamType: StreamType.BALANCE_UPDATES,
        positions
      };

      const payload = new TextEncoder().encode(JSON.stringify(streamData));
      const message = await encodeBinaryRPCMessage(
        MessageType.STREAM,
        this.getNextRequestId(),
        payload
      );

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    } catch (error) {
      console.error('❌ Error sending position updates:', error);
    }
  }

  async sendTransactionUpdates(
    ws: WebSocket,
    streamId: string,
    transactions: TradeTransaction[]
  ): Promise<void> {
    try {
      const streamData = {
        streamId,
        streamType: StreamType.ORDER_STATUS,
        transactions
      };

      const payload = new TextEncoder().encode(JSON.stringify(streamData));
      const message = await encodeBinaryRPCMessage(
        MessageType.STREAM,
        this.getNextRequestId(),
        payload
      );

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    } catch (error) {
      console.error('❌ Error sending transaction updates:', error);
    }
  }

  async sendError(ws: WebSocket, code: number, message: string): Promise<void> {
    try {
      const errorResponse = {
        code,
        message
      };
      
      const payload = new TextEncoder().encode(JSON.stringify(errorResponse));
      const responseMessage = await encodeBinaryRPCMessage(
        MessageType.RESPONSE,
        this.getNextRequestId(),
        payload
      );
      
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(responseMessage);
      }
    } catch (error) {
      console.error('❌ Error sending error response:', error);
    }
  }

  private getNextRequestId(): number {
    return ++this.requestId;
  }
}

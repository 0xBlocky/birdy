import { 
  BinaryRPCMessage, 
  MessageType, 
  StreamType, 
  StreamSubscription, 
  StreamFilters,
  TradingOpportunity,
  encodeBinaryRPCMessage,
  decodeBinaryRPCMessage
} from 'shared';

export class BinaryRPCClient {
  private ws: WebSocket | null = null;
  private requestId = 0;
  private pendingRequests: Map<number, { resolve: Function; reject: Function }> = new Map();
  private streamHandlers: Map<string, (data: any) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(private url: string) {}

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        this.ws.binaryType = 'arraybuffer';

        this.ws.onopen = () => {
          console.log('🔌 WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = async (event) => {
          try {
            const message = await decodeBinaryRPCMessage(new Uint8Array(event.data));
            await this.handleMessage(message);
          } catch (error) {
            console.error('❌ Error handling message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('🔌 WebSocket disconnected');
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private async handleMessage(message: BinaryRPCMessage): Promise<void> {
    switch (message.messageType) {
      case MessageType.RESPONSE:
        this.handleResponse(message);
        break;
      case MessageType.STREAM:
        this.handleStreamData(message);
        break;
    }
  }

  private handleResponse(message: BinaryRPCMessage): void {
    const pendingRequest = this.pendingRequests.get(message.requestId);
    if (pendingRequest) {
      this.pendingRequests.delete(message.requestId);
      
      try {
        const data = JSON.parse(new TextDecoder().decode(message.payload));
        pendingRequest.resolve(data);
      } catch (error) {
        pendingRequest.reject(error);
      }
    }
  }

  private handleStreamData(message: BinaryRPCMessage): void {
    try {
      const streamData = JSON.parse(new TextDecoder().decode(message.payload));
      const handler = this.streamHandlers.get(streamData.streamId);
      if (handler) {
        handler(streamData);
      }
    } catch (error) {
      console.error('❌ Error handling stream data:', error);
    }
  }

  async subscribeToTradingOpportunities(filters?: StreamFilters): Promise<string> {
    const requestId = this.getNextRequestId();
    
    const subscription: StreamSubscription = {
      streamType: StreamType.TRADING_OPPORTUNITIES,
      filters
    };
    
    const payload = new TextEncoder().encode(JSON.stringify(subscription));
    const message = await encodeBinaryRPCMessage(
      MessageType.REQUEST,
      requestId,
      payload
    );
    
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }
    
    this.ws.send(message);
    
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(requestId, { resolve, reject });
    });
  }

  onStreamData(streamId: string, handler: (data: any) => void): void {
    this.streamHandlers.set(streamId, handler);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.pendingRequests.clear();
    this.streamHandlers.clear();
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect().catch(error => {
          console.error('❌ Reconnection failed:', error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  private getNextRequestId(): number {
    return ++this.requestId;
  }

  get connected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

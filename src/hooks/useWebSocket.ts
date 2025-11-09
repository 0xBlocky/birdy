import { useEffect } from 'react';
import { websocketService } from '../services/websocket';
import { WSMessage, WSPriceUpdate } from '../types';
import { useTokensStore } from '../stores/tokensStore';

export function useWebSocket() {
  const updateTokenPrice = useTokensStore(state => state.updateTokenPrice);

  useEffect(() => {
    // Connect to WebSocket
    // Note: This will fail in development without a real WebSocket server
    // websocketService.connect();

    // Set up message handler
    const unsubscribe = websocketService.onMessage((message: WSMessage) => {
      if (message.type === 'price_update') {
        const update = message.data as WSPriceUpdate;
        updateTokenPrice(update.tokenId, update.price, update.change1h, update.change24h);
      }
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
      // Don't disconnect as we want to keep the connection alive
      // websocketService.disconnect();
    };
  }, [updateTokenPrice]);

  return {
    isConnected: websocketService.isConnected(),
    send: websocketService.send.bind(websocketService)
  };
}

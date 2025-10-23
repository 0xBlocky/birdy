import { useEffect, useState } from 'react';
import { BinaryRPCClient } from '../services/BinaryRPCClient';
import { useTradingStore } from '../stores/tradingStore';
import { StreamFilters } from 'shared';

export function useTradingStream(filters?: StreamFilters) {
  const [client] = useState(() => new BinaryRPCClient('ws://localhost:3001'));
  const {
    opportunities,
    connectionStatus,
    streamId,
    error,
    addOpportunity,
    setConnectionStatus,
    setStreamId,
    setError,
    clearOpportunities
  } = useTradingStore();

  useEffect(() => {
    let mounted = true;

    const connectAndSubscribe = async () => {
      try {
        setConnectionStatus('connecting');
        setError(null);

        await client.connect();
        
        if (!mounted) return;

        setConnectionStatus('connected');

        // Subscribe to trading opportunities stream
        const response = await client.subscribeToTradingOpportunities(filters);
        const newStreamId = response.streamId;
        
        if (!mounted) return;

        setStreamId(newStreamId);

        // Set up stream data handler
        client.onStreamData(newStreamId, (data) => {
          if (!mounted) return;
          
          if (data.opportunities && Array.isArray(data.opportunities)) {
            data.opportunities.forEach((opportunity: any) => {
              addOpportunity(opportunity);
            });
          }
        });

        console.log(`📡 Subscribed to stream: ${newStreamId}`);
      } catch (err) {
        if (!mounted) return;
        
        console.error('❌ Connection failed:', err);
        setConnectionStatus('error');
        setError(err instanceof Error ? err.message : 'Connection failed');
      }
    };

    connectAndSubscribe();

    return () => {
      mounted = false;
      client.disconnect();
      setConnectionStatus('disconnected');
      setStreamId(null);
    };
  }, [client, filters, addOpportunity, setConnectionStatus, setStreamId, setError]);

  const reconnect = async () => {
    clearOpportunities();
    setError(null);
    await client.connect();
  };

  return {
    opportunities,
    connectionStatus,
    streamId,
    error,
    reconnect,
    connected: client.connected
  };
}

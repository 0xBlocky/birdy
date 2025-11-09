import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useTokensStore } from '../../stores/tokensStore';
import { useUIStore } from '../../stores/uiStore';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { TokenCard } from '../TokenCard';
import { EmptyState } from '../EmptyState';

export function OpportunitiesTab() {
  const tokens = useTokensStore(state => state.tokens);
  const isLoading = useTokensStore(state => state.isLoading);
  const loadMockTokens = useTokensStore(state => state.loadMockTokens);
  const isRefreshing = useUIStore(state => state.isRefreshing);
  const setRefreshing = useUIStore(state => state.setRefreshing);
  const { impact, notification } = useHapticFeedback();

  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);

  useEffect(() => {
    // Load mock tokens on mount
    if (tokens.length === 0) {
      loadMockTokens();
    }
  }, [tokens.length, loadMockTokens]);

  const handleRefresh = async () => {
    setRefreshing(true);
    impact('light');

    // Simulate refresh
    setTimeout(() => {
      loadMockTokens();
      setRefreshing(false);
      notification('success');
    }, 1000);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (scrollTop === 0 && startY > 0) {
      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, Math.min(currentY - startY, 100));
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 80) {
      handleRefresh();
    }
    setPullDistance(0);
    setStartY(0);
  };

  // Sort tokens by 24h volume (most liquid first)
  const sortedTokens = [...tokens].sort((a, b) => b.volume24h - a.volume24h);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 animate-spin text-tg-button" />
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <EmptyState
        icon="🔍"
        title="No Tokens Available"
        description="We couldn't find any tokens to display right now."
        action={{
          label: 'Retry',
          onClick: handleRefresh
        }}
      />
    );
  }

  return (
    <div
      className="overflow-y-auto pb-24 px-4"
      style={{ height: 'calc(100vh - 130px)' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {pullDistance > 0 && (
        <div
          className="flex items-center justify-center py-2 transition-opacity"
          style={{ opacity: pullDistance / 80 }}
        >
          <RefreshCw
            className={`w-5 h-5 text-tg-button ${pullDistance > 80 ? 'animate-spin' : ''}`}
            style={{ transform: `rotate(${pullDistance * 3.6}deg)` }}
          />
        </div>
      )}

      {/* Refresh indicator when actively refreshing */}
      {isRefreshing && (
        <div className="flex items-center justify-center py-3 gap-2 text-tg-button">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Refreshing...</span>
        </div>
      )}

      {/* Token list */}
      <div className="space-y-3 mt-4">
        {sortedTokens.map(token => (
          <TokenCard key={token.id} token={token} />
        ))}
      </div>
    </div>
  );
}

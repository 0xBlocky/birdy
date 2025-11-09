import { useEffect } from 'react';
import { History, Wallet } from 'lucide-react';
import { usePortfolioStore } from '../../stores/portfolioStore';
import { useUserStore } from '../../stores/userStore';
import { useUIStore } from '../../stores/uiStore';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { PositionCard } from '../PositionCard';
import { EmptyState } from '../EmptyState';
import { formatTON, formatUSD, formatPercentage } from '../../utils/formatters';

export function PortfolioTab() {
  const positions = usePortfolioStore(state => state.positions);
  const summary = usePortfolioStore(state => state.summary);
  const loadMockPositions = usePortfolioStore(state => state.loadMockPositions);
  const isWalletConnected = useUserStore(state => state.isWalletConnected);
  const openModal = useUIStore(state => state.openModal);
  const { impact } = useHapticFeedback();

  useEffect(() => {
    // Load mock positions on mount if wallet is connected
    if (isWalletConnected && positions.length === 0) {
      loadMockPositions();
    }
  }, [isWalletConnected, positions.length, loadMockPositions]);

  const handleTradeHistoryClick = () => {
    impact('medium');
    openModal('tradeHistory');
  };

  if (!isWalletConnected) {
    return (
      <EmptyState
        icon={<Wallet className="w-16 h-16" />}
        title="Connect Your Wallet"
        description="Connect your TON wallet to view your portfolio and start trading."
      />
    );
  }

  if (positions.length === 0) {
    return (
      <EmptyState
        icon="💼"
        title="No Positions Yet"
        description="You don't have any active positions. Start trading to build your portfolio!"
      />
    );
  }

  return (
    <div className="overflow-y-auto pb-24 px-4" style={{ height: 'calc(100vh - 130px)' }}>
      {/* Portfolio Summary Card */}
      <div className="bg-gradient-to-br from-tg-button to-blue-600 rounded-2xl p-6 shadow-lg mb-4 mt-4 text-white">
        <div className="text-sm opacity-90 mb-1">Total Portfolio Value</div>
        <div className="text-3xl font-bold mb-4">
          {formatTON(summary.totalValue)}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs opacity-90 mb-1">Total PnL</div>
            <div className={`text-xl font-semibold flex items-center gap-2 ${
              summary.totalPnL > 0 ? 'text-green-200' : 'text-red-200'
            }`}>
              <span>{formatUSD(summary.totalPnL)}</span>
              <span className="text-sm">
                ({formatPercentage(summary.totalPnLPercentage)})
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs opacity-90 mb-1">Positions</div>
            <div className="text-2xl font-bold">
              {summary.positionsCount}
            </div>
          </div>
        </div>
      </div>

      {/* Positions List */}
      <div className="space-y-3 mb-4">
        {positions.map(position => (
          <PositionCard key={position.tokenId} position={position} />
        ))}
      </div>

      {/* Trade History Button */}
      <button
        onClick={handleTradeHistoryClick}
        className="w-full bg-tg-secondary-bg rounded-2xl p-4 flex items-center justify-between btn-press mb-4"
      >
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-tg-text" />
          <span className="font-medium text-tg-text">Trade History</span>
        </div>
        <span className="text-tg-hint text-sm">View all trades</span>
      </button>
    </div>
  );
}

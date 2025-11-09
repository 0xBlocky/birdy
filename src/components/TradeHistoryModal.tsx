import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import { useTradeHistoryStore } from '../stores/tradeHistoryStore';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { formatTON, formatUSD, formatDate, formatTokenQuantity } from '../utils/formatters';
import { getTokenColor } from '../utils/constants';
import { EmptyState } from './EmptyState';

type FilterType = 'all' | 'buy' | 'sell';

export function TradeHistoryModal() {
  const isOpen = useUIStore(state => state.modals.tradeHistory);
  const closeModal = useUIStore(state => state.closeModal);
  const trades = useTradeHistoryStore(state => state.trades);
  const getFilteredTrades = useTradeHistoryStore(state => state.getFilteredTrades);
  const loadMockTrades = useTradeHistoryStore(state => state.loadMockTrades);
  const { impact } = useHapticFeedback();

  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    if (isOpen && trades.length === 0) {
      loadMockTrades();
    }
  }, [isOpen, trades.length, loadMockTrades]);

  const handleClose = () => {
    impact('light');
    closeModal('tradeHistory');
  };

  const handleFilterChange = (newFilter: FilterType) => {
    if (newFilter !== filter) {
      impact('light');
      setFilter(newFilter);
    }
  };

  const filteredTrades = getFilteredTrades(filter);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-tg-bg rounded-t-3xl z-50 max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="sticky top-0 bg-tg-bg border-b border-gray-200 dark:border-gray-800 px-4 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-tg-text">Trade History</h2>
              <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-6 h-6 text-tg-text" />
              </button>
            </div>

            {/* Filter Buttons */}
            <div className="px-4 py-3 bg-tg-bg border-b border-gray-200 dark:border-gray-800">
              <div className="flex gap-2">
                <FilterButton
                  label="All"
                  isActive={filter === 'all'}
                  onClick={() => handleFilterChange('all')}
                />
                <FilterButton
                  label="Buys"
                  isActive={filter === 'buy'}
                  onClick={() => handleFilterChange('buy')}
                />
                <FilterButton
                  label="Sells"
                  isActive={filter === 'sell'}
                  onClick={() => handleFilterChange('sell')}
                />
              </div>
            </div>

            {/* Trade List */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {filteredTrades.length === 0 ? (
                <EmptyState
                  icon="📜"
                  title="No Trades Yet"
                  description="Your trade history will appear here once you start trading."
                />
              ) : (
                <div className="space-y-3 pb-4">
                  {filteredTrades.map(trade => (
                    <TradeItem key={trade.id} trade={trade} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface FilterButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function FilterButton({ label, isActive, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
        isActive
          ? 'bg-tg-button text-tg-button-text'
          : 'bg-tg-secondary-bg text-tg-text'
      }`}
    >
      {label}
    </button>
  );
}

interface TradeItemProps {
  trade: any;
}

function TradeItem({ trade }: TradeItemProps) {
  const colorClass = getTokenColor(trade.token.ticker);
  const isBuy = trade.type === 'buy';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {/* Token Logo */}
        <div className={`w-12 h-12 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}>
          {trade.token.logo ? (
            <img src={trade.token.logo} alt={trade.token.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-white font-bold text-lg">{trade.token.ticker.slice(0, 1)}</span>
          )}
        </div>

        {/* Trade Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-tg-text">{trade.token.name}</h3>
                {isBuy ? (
                  <span className="flex items-center gap-1 text-success text-xs font-medium bg-success/10 px-2 py-0.5 rounded-full">
                    <ArrowDownLeft className="w-3 h-3" />
                    Buy
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-danger text-xs font-medium bg-danger/10 px-2 py-0.5 rounded-full">
                    <ArrowUpRight className="w-3 h-3" />
                    Sell
                  </span>
                )}
              </div>
              <p className="text-xs text-tg-hint">{formatDate(trade.timestamp)}</p>
            </div>
          </div>

          {/* Amount and Price */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg font-bold text-tg-text">
              {formatTokenQuantity(trade.amount)}
            </span>
            <span className="text-sm text-tg-hint">
              @ {formatTON(trade.price, 6)}
            </span>
          </div>

          {/* Total Value */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-tg-hint">
              Total: {formatTON(trade.totalValue)}
            </div>
            {trade.realizedPnL !== undefined && (
              <div className={`text-sm font-semibold ${trade.realizedPnL > 0 ? 'text-success' : 'text-danger'}`}>
                {trade.realizedPnL > 0 ? '+' : ''}{formatUSD(trade.realizedPnL)}
              </div>
            )}
          </div>

          {/* Transaction Hash */}
          {trade.txHash && (
            <div className="text-xs text-tg-hint mt-2 truncate">
              Tx: {trade.txHash}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

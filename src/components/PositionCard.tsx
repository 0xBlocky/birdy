import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Position } from '../types';
import { formatTON, formatUSD, formatPercentage, getPercentageColor, formatTokenQuantity } from '../utils/formatters';
import { getTokenColor } from '../utils/constants';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { useUIStore } from '../stores/uiStore';

interface PositionCardProps {
  position: Position;
  onSell?: () => void;
}

export function PositionCard({ position }: PositionCardProps) {
  const { impact } = useHapticFeedback();
  const { setSelectedToken, openModal } = useUIStore();
  const [isDragging, setIsDragging] = useState(false);

  const colorClass = getTokenColor(position.token.ticker);

  const handleClick = () => {
    if (!isDragging) {
      impact('light');
      setSelectedToken(position.tokenId);
      openModal('tokenDetail');
    }
  };

  const handleSellClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    impact('medium');
    setSelectedToken(position.tokenId);
    openModal('tokenDetail');
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -100, right: 0 }}
      dragElastic={0.1}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(_, info) => {
        setTimeout(() => setIsDragging(false), 100);
        if (info.offset.x < -80) {
          impact('light');
        }
      }}
      className="relative"
    >
      {/* Sell button (revealed when swiped left) */}
      <div className="absolute inset-y-0 right-0 w-24 bg-danger rounded-2xl flex items-center justify-center">
        <button
          onClick={handleSellClick}
          className="text-white font-medium text-sm"
        >
          Sell
        </button>
      </div>

      {/* Main card */}
      <div
        onClick={handleClick}
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm cursor-pointer relative"
      >
        <div className="flex items-start gap-3">
          {/* Token Logo */}
          <div className={`w-12 h-12 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}>
            {position.token.logo ? (
              <img src={position.token.logo} alt={position.token.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-white font-bold text-lg">{position.token.ticker.slice(0, 1)}</span>
            )}
          </div>

          {/* Position Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h3 className="font-semibold text-tg-text truncate">{position.token.name}</h3>
                <p className="text-sm text-tg-hint">{position.token.ticker}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-tg-hint flex-shrink-0" />
            </div>

            {/* Quantity and Value */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-lg font-bold text-tg-text">
                {formatTokenQuantity(position.quantity)}
              </span>
              <span className="text-sm text-tg-hint">
                = {formatTON(position.currentValue)}
              </span>
            </div>

            {/* Price comparison */}
            <div className="flex items-center gap-2 text-xs text-tg-hint mb-2">
              <span>Entry: {formatTON(position.entryPrice, 6)}</span>
              <span>→</span>
              <span>Now: {formatTON(position.token.currentPrice, 6)}</span>
            </div>

            {/* PnL */}
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-1 ${getPercentageColor(position.unrealizedPnLPercentage)}`}>
                {position.unrealizedPnL > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="font-semibold">
                  {formatUSD(position.unrealizedPnL)}
                </span>
                <span className="font-semibold">
                  ({formatPercentage(position.unrealizedPnLPercentage)})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

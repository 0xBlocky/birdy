import { Token } from '../types';
import { formatTON, formatPercentage, getPercentageColor, formatLargeNumber } from '../utils/formatters';
import { getTokenBadge, getTokenColor } from '../utils/constants';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { useUIStore } from '../stores/uiStore';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TokenCardProps {
  token: Token;
}

export function TokenCard({ token }: TokenCardProps) {
  const { impact } = useHapticFeedback();
  const { setSelectedToken, openModal } = useUIStore();

  const badge = getTokenBadge(token.change24h);
  const colorClass = getTokenColor(token.ticker);

  const handleClick = () => {
    impact('light');
    setSelectedToken(token.id);
    openModal('tokenDetail');
  };

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    impact('medium');
    setSelectedToken(token.id);
    openModal('tokenDetail');
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm card-lift cursor-pointer relative overflow-hidden"
    >
      {/* Badge overlay */}
      {badge && (
        <div className={`absolute top-2 right-2 ${badge.color} text-white text-xs px-2 py-1 rounded-full flex items-center gap-1`}>
          <span>{badge.emoji}</span>
          <span className="font-medium">{badge.text}</span>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Token Logo */}
        <div className={`w-12 h-12 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}>
          {token.logo ? (
            <img src={token.logo} alt={token.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-white font-bold text-lg">{token.ticker.slice(0, 1)}</span>
          )}
        </div>

        {/* Token Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="font-semibold text-tg-text truncate">{token.name}</h3>
              <p className="text-sm text-tg-hint">{token.ticker}</p>
            </div>
          </div>

          {/* Price */}
          <div className="text-xl font-bold text-tg-text mb-2">
            {formatTON(token.currentPrice, 6)}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm mb-3">
            <div className="flex items-center gap-1">
              {token.change1h > 0 ? (
                <TrendingUp className={`w-3 h-3 ${getPercentageColor(token.change1h)}`} />
              ) : (
                <TrendingDown className={`w-3 h-3 ${getPercentageColor(token.change1h)}`} />
              )}
              <span className={getPercentageColor(token.change1h)}>
                {formatPercentage(token.change1h)} 1h
              </span>
            </div>
            <div className="flex items-center gap-1">
              {token.change24h > 0 ? (
                <TrendingUp className={`w-3 h-3 ${getPercentageColor(token.change24h)}`} />
              ) : (
                <TrendingDown className={`w-3 h-3 ${getPercentageColor(token.change24h)}`} />
              )}
              <span className={getPercentageColor(token.change24h)}>
                {formatPercentage(token.change24h)} 24h
              </span>
            </div>
          </div>

          {/* Volume */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-tg-hint">
              Vol: {formatLargeNumber(token.volume24h)} TON
            </span>
            <button
              onClick={handleBuyClick}
              className="px-4 py-2 bg-success text-white rounded-xl text-sm font-medium btn-press"
            >
              Buy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

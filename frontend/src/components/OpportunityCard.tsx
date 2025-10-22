import React from 'react';
import { TradingOpportunity } from 'shared';

interface OpportunityCardProps {
  opportunity: TradingOpportunity;
  onClick?: () => void;
}

export function OpportunityCard({ opportunity, onClick }: OpportunityCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(price);
  };

  const formatProfit = (profit: number) => {
    const sign = profit >= 0 ? '+' : '';
    return `${sign}${profit.toFixed(2)}%`;
  };

  const getProfitColor = (profit: number) => {
    if (profit > 0) return 'text-green-500';
    if (profit < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div 
      className="bg-telegram-bg border border-telegram-secondary-bg rounded-lg p-4 mb-3 cursor-pointer hover:bg-telegram-secondary-bg transition-colors"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-telegram-text">
            {opportunity.tokenIn}/{opportunity.tokenOut}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(opportunity.confidence)}`}>
            {opportunity.confidence}%
          </span>
        </div>
        <span className="text-xs text-telegram-hint">
          {new Date(opportunity.timestamp).toLocaleTimeString()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <div className="text-sm text-telegram-hint">Current Price</div>
          <div className="font-medium text-telegram-text">
            {formatPrice(opportunity.currentPrice)}
          </div>
        </div>
        <div>
          <div className="text-sm text-telegram-hint">Target Price</div>
          <div className="font-medium text-telegram-text">
            {formatPrice(opportunity.targetPrice)}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <div className="text-sm text-telegram-hint">Profit Potential</div>
          <div className={`font-bold text-lg ${getProfitColor(opportunity.profitPotential)}`}>
            {formatProfit(opportunity.profitPotential)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-telegram-hint">DEX</div>
          <div className="font-medium text-telegram-text">
            {opportunity.dexName}
          </div>
        </div>
      </div>

      {opportunity.metadata && (
        <div className="mt-3 pt-3 border-t border-telegram-secondary-bg">
          <div className="text-sm text-telegram-hint">
            {opportunity.metadata}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { OpportunityCard } from './OpportunityCard';
import { TradingOpportunity } from 'shared';

interface OpportunityListProps {
  opportunities: TradingOpportunity[];
  onOpportunityClick?: (opportunity: TradingOpportunity) => void;
  height?: number;
}

interface ListItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    opportunities: TradingOpportunity[];
    onOpportunityClick?: (opportunity: TradingOpportunity) => void;
  };
}

function ListItem({ index, style, data }: ListItemProps) {
  const { opportunities, onOpportunityClick } = data;
  const opportunity = opportunities[index];

  return (
    <div style={style}>
      <div className="px-4">
        <OpportunityCard
          opportunity={opportunity}
          onClick={() => onOpportunityClick?.(opportunity)}
        />
      </div>
    </div>
  );
}

export function OpportunityList({ 
  opportunities, 
  onOpportunityClick,
  height = 600 
}: OpportunityListProps) {
  const itemData = useMemo(() => ({
    opportunities,
    onOpportunityClick
  }), [opportunities, onOpportunityClick]);

  if (opportunities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-telegram-hint">
        <div className="text-6xl mb-4">📈</div>
        <div className="text-lg font-medium">No opportunities yet</div>
        <div className="text-sm">Waiting for trading opportunities...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="px-4 py-2 bg-telegram-secondary-bg border-b border-telegram-secondary-bg">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-telegram-text">
            Trading Opportunities
          </h2>
          <span className="text-sm text-telegram-hint">
            {opportunities.length} opportunities
          </span>
        </div>
      </div>
      
      <List
        height={height}
        itemCount={opportunities.length}
        itemSize={180} // Approximate height of each card
        itemData={itemData}
        className="scrollbar-thin scrollbar-thumb-telegram-hint scrollbar-track-transparent"
      >
        {ListItem}
      </List>
    </div>
  );
}

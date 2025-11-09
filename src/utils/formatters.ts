/**
 * Format a number as currency (TON)
 */
export function formatTON(value: number, decimals: number = 2): string {
  if (value === 0) return '0 TON';
  if (Math.abs(value) < 0.01) return `${value.toFixed(6)} TON`;
  return `${value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} TON`;
}

/**
 * Format a number as USD
 */
export function formatUSD(value: number, decimals: number = 2): string {
  if (value === 0) return '$0';
  if (Math.abs(value) < 0.01) return `$${value.toFixed(6)}`;
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

/**
 * Format a percentage with color coding
 */
export function formatPercentage(value: number, includeSign: boolean = true): string {
  const sign = value > 0 && includeSign ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Get color class for percentage value
 */
export function getPercentageColor(value: number): string {
  if (value > 0) return 'text-success';
  if (value < 0) return 'text-danger';
  return 'text-tg-text';
}

/**
 * Format large numbers with abbreviations (K, M, B)
 */
export function formatLargeNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  return value.toFixed(2);
}

/**
 * Format timestamp to human-readable date
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format timestamp to full date time
 */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Truncate wallet address
 */
export function truncateAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Format token quantity
 */
export function formatTokenQuantity(quantity: number): string {
  if (quantity >= 1_000_000) {
    return `${(quantity / 1_000_000).toFixed(2)}M`;
  }
  if (quantity >= 1_000) {
    return `${(quantity / 1_000).toFixed(2)}K`;
  }
  if (quantity >= 1) {
    return quantity.toFixed(2);
  }
  return quantity.toFixed(6);
}

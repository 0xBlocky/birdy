import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import toast from 'react-hot-toast';
import { useUIStore } from '../stores/uiStore';
import { useTokensStore } from '../stores/tokensStore';
import { usePortfolioStore } from '../stores/portfolioStore';
import { useUserStore } from '../stores/userStore';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { formatTON, formatPercentage, getPercentageColor, formatLargeNumber } from '../utils/formatters';
import { getTokenColor, PRESET_BUY_AMOUNTS, PRESET_SELL_PERCENTAGES, SLIPPAGE_OPTIONS, DEFAULT_SLIPPAGE, TON_USD_RATE } from '../utils/constants';

export function TokenDetailModal() {
  const isOpen = useUIStore(state => state.modals.tokenDetail);
  const selectedTokenId = useUIStore(state => state.selectedTokenId);
  const closeModal = useUIStore(state => state.closeModal);
  const getTokenById = useTokensStore(state => state.getTokenById);
  const positions = usePortfolioStore(state => state.positions);
  const isWalletConnected = useUserStore(state => state.isWalletConnected);
  const { impact, notification } = useHapticFeedback();

  const [activeSection, setActiveSection] = useState<'buy' | 'sell'>('buy');
  const [customAmount, setCustomAmount] = useState('');
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);

  const token = selectedTokenId ? getTokenById(selectedTokenId) : null;
  const position = positions.find(p => p.tokenId === selectedTokenId);
  const colorClass = token ? getTokenColor(token.ticker) : '';

  // Initialize chart
  useEffect(() => {
    if (!isOpen || !token || !chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 200,
      layout: {
        background: { color: 'transparent' },
        textColor: '#999',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: 'rgba(0,0,0,0.05)' },
      },
      rightPriceScale: {
        visible: true,
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
      },
      crosshair: {
        horzLine: { visible: false },
        vertLine: { labelVisible: false },
      },
    });

    const series = chart.addAreaSeries({
      lineColor: '#3390ec',
      topColor: 'rgba(51, 144, 236, 0.4)',
      bottomColor: 'rgba(51, 144, 236, 0)',
      lineWidth: 2,
    });

    const data = token.priceHistory.map(point => ({
      time: Math.floor(point.timestamp / 1000) as any,
      value: point.price,
    }));

    series.setData(data);
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
    };
  }, [isOpen, token]);

  const handleClose = () => {
    impact('light');
    closeModal('tokenDetail');
    setCustomAmount('');
    setSelectedPreset(null);
  };

  const handlePresetClick = (amount: number) => {
    impact('light');
    setSelectedPreset(amount);
    setCustomAmount('');
  };

  const handleSellPercentageClick = (percentage: number) => {
    impact('light');
    if (position) {
      const amount = (position.quantity * percentage) / 100;
      setCustomAmount(amount.toString());
    }
  };

  const handleBuy = async () => {
    if (!isWalletConnected) {
      toast.error('Please connect your wallet first');
      notification('error');
      return;
    }

    const amount = selectedPreset || parseFloat(customAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      notification('error');
      return;
    }

    impact('heavy');
    notification('success');
    toast.success(`Buying ${token?.ticker} for ${amount} TON`);

    // TODO: Execute actual trade via backend
    handleClose();
  };

  const handleSell = async () => {
    const amount = parseFloat(customAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      notification('error');
      return;
    }

    if (position && amount > position.quantity) {
      toast.error('Insufficient balance');
      notification('error');
      return;
    }

    impact('heavy');
    notification('success');
    toast.success(`Selling ${amount} ${token?.ticker}`);

    // TODO: Execute actual trade via backend
    handleClose();
  };

  if (!token) return null;

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
            className="fixed bottom-0 left-0 right-0 bg-tg-bg rounded-t-3xl z-50 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-tg-bg border-b border-gray-200 dark:border-gray-800 px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center`}>
                  {token.logo ? (
                    <img src={token.logo} alt={token.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-white font-bold">{token.ticker.slice(0, 1)}</span>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-tg-text">{token.name}</h2>
                  <p className="text-sm text-tg-hint">{token.ticker}</p>
                </div>
              </div>
              <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-6 h-6 text-tg-text" />
              </button>
            </div>

            <div className="px-4 pb-6">
              {/* Current Price */}
              <div className="py-4">
                <div className="text-3xl font-bold text-tg-text mb-2">
                  {formatTON(token.currentPrice, 6)}
                </div>
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-1 ${getPercentageColor(token.change24h)}`}>
                    {token.change24h > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="font-medium">{formatPercentage(token.change24h)} 24h</span>
                  </div>
                  <span className="text-sm text-tg-hint">Vol: {formatLargeNumber(token.volume24h)} TON</span>
                </div>
              </div>

              {/* Chart */}
              <div ref={chartContainerRef} className="mb-4 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900" />

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-tg-secondary-bg rounded-xl p-3">
                  <div className="text-xs text-tg-hint mb-1">24h High</div>
                  <div className="text-sm font-semibold text-success">{formatTON(token.high24h, 6)}</div>
                </div>
                <div className="bg-tg-secondary-bg rounded-xl p-3">
                  <div className="text-xs text-tg-hint mb-1">24h Low</div>
                  <div className="text-sm font-semibold text-danger">{formatTON(token.low24h, 6)}</div>
                </div>
                {token.marketCap && (
                  <>
                    <div className="bg-tg-secondary-bg rounded-xl p-3">
                      <div className="text-xs text-tg-hint mb-1">Market Cap</div>
                      <div className="text-sm font-semibold text-tg-text">{formatLargeNumber(token.marketCap)} TON</div>
                    </div>
                    <div className="bg-tg-secondary-bg rounded-xl p-3">
                      <div className="text-xs text-tg-hint mb-1">24h Volume</div>
                      <div className="text-sm font-semibold text-tg-text">{formatLargeNumber(token.volume24h)} TON</div>
                    </div>
                  </>
                )}
              </div>

              {/* Buy/Sell Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => {
                    setActiveSection('buy');
                    setCustomAmount('');
                    setSelectedPreset(null);
                    impact('light');
                  }}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                    activeSection === 'buy'
                      ? 'bg-success text-white'
                      : 'bg-tg-secondary-bg text-tg-text'
                  }`}
                >
                  Buy
                </button>
                {position && (
                  <button
                    onClick={() => {
                      setActiveSection('sell');
                      setCustomAmount('');
                      setSelectedPreset(null);
                      impact('light');
                    }}
                    className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                      activeSection === 'sell'
                        ? 'bg-danger text-white'
                        : 'bg-tg-secondary-bg text-tg-text'
                    }`}
                  >
                    Sell
                  </button>
                )}
              </div>

              {/* Buy Section */}
              {activeSection === 'buy' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-tg-hint mb-2 block">Preset Amounts</label>
                    <div className="grid grid-cols-3 gap-2">
                      {PRESET_BUY_AMOUNTS.map(amount => (
                        <button
                          key={amount}
                          onClick={() => handlePresetClick(amount)}
                          className={`py-3 rounded-xl font-medium transition-colors ${
                            selectedPreset === amount
                              ? 'bg-tg-button text-tg-button-text'
                              : 'bg-tg-secondary-bg text-tg-text'
                          }`}
                        >
                          {amount} TON
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-tg-hint mb-2 block">Custom Amount (TON)</label>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedPreset(null);
                      }}
                      placeholder="Enter amount"
                      className="w-full px-4 py-3 rounded-xl bg-tg-secondary-bg text-tg-text focus:outline-none focus:ring-2 focus:ring-tg-button"
                    />
                    {customAmount && (
                      <p className="text-xs text-tg-hint mt-1">
                        ≈ ${(parseFloat(customAmount) * TON_USD_RATE).toFixed(2)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-tg-hint mb-2 block">Slippage Tolerance</label>
                    <div className="grid grid-cols-3 gap-2">
                      {SLIPPAGE_OPTIONS.map(option => (
                        <button
                          key={option}
                          onClick={() => {
                            setSlippage(option);
                            impact('light');
                          }}
                          className={`py-2 rounded-xl text-sm font-medium transition-colors ${
                            slippage === option
                              ? 'bg-tg-button text-tg-button-text'
                              : 'bg-tg-secondary-bg text-tg-text'
                          }`}
                        >
                          {option}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleBuy}
                    className="w-full py-4 bg-success text-white rounded-xl font-semibold text-lg btn-press"
                  >
                    Buy {token.ticker}
                  </button>
                </div>
              )}

              {/* Sell Section */}
              {activeSection === 'sell' && position && (
                <div className="space-y-4">
                  <div className="bg-tg-secondary-bg rounded-xl p-4">
                    <div className="text-xs text-tg-hint mb-1">Your Position</div>
                    <div className="text-lg font-bold text-tg-text">
                      {position.quantity.toLocaleString()} {token.ticker}
                    </div>
                    <div className="text-sm text-tg-hint">
                      = {formatTON(position.currentValue)}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-tg-hint mb-2 block">Quick Sell</label>
                    <div className="grid grid-cols-4 gap-2">
                      {PRESET_SELL_PERCENTAGES.map(percentage => (
                        <button
                          key={percentage}
                          onClick={() => handleSellPercentageClick(percentage)}
                          className="py-3 rounded-xl font-medium bg-tg-secondary-bg text-tg-text"
                        >
                          {percentage}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-tg-hint mb-2 block">Amount to Sell</label>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Enter amount"
                      max={position.quantity}
                      className="w-full px-4 py-3 rounded-xl bg-tg-secondary-bg text-tg-text focus:outline-none focus:ring-2 focus:ring-tg-button"
                    />
                  </div>

                  <button
                    onClick={handleSell}
                    className="w-full py-4 bg-danger text-white rounded-xl font-semibold text-lg btn-press"
                  >
                    Sell {token.ticker}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

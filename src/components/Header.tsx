import { User } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { usePortfolioStore } from '../stores/portfolioStore';
import { formatTON } from '../utils/formatters';

export function Header() {
  const user = useUserStore(state => state.user);
  const isWalletConnected = useUserStore(state => state.isWalletConnected);
  const summary = usePortfolioStore(state => state.summary);

  return (
    <header className="sticky top-0 z-40 bg-tg-bg border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: User Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-tg-button flex items-center justify-center">
            {user?.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.firstName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-tg-button-text" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-tg-text">
              {user?.firstName || 'User'} {user?.lastName || ''}
            </span>
            {user?.username && (
              <span className="text-xs text-tg-hint">
                @{user.username}
              </span>
            )}
          </div>
        </div>

        {/* Right: Portfolio Value or Connect Wallet */}
        {isWalletConnected ? (
          <div className="flex flex-col items-end">
            <span className="text-xs text-tg-hint">Portfolio</span>
            <span className="text-sm font-semibold text-tg-text">
              {formatTON(summary.totalValue)}
            </span>
          </div>
        ) : (
          <div className="text-xs text-tg-hint">
            No wallet
          </div>
        )}
      </div>
    </header>
  );
}

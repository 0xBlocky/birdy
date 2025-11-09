import { TrendingUp, Briefcase } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { TabType } from '../types';

export function TabBar() {
  const activeTab = useUIStore(state => state.activeTab);
  const setActiveTab = useUIStore(state => state.setActiveTab);
  const { selection } = useHapticFeedback();

  const handleTabChange = (tab: TabType) => {
    if (tab !== activeTab) {
      selection();
      setActiveTab(tab);
    }
  };

  return (
    <div className="sticky top-[65px] z-30 bg-tg-bg border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center">
        <TabButton
          icon={<TrendingUp className="w-5 h-5" />}
          label="Opportunities"
          emoji="💎"
          isActive={activeTab === 'opportunities'}
          onClick={() => handleTabChange('opportunities')}
        />
        <TabButton
          icon={<Briefcase className="w-5 h-5" />}
          label="Portfolio"
          emoji="💼"
          isActive={activeTab === 'portfolio'}
          onClick={() => handleTabChange('portfolio')}
        />
      </div>
      {/* Active tab indicator */}
      <div className="relative h-0.5 bg-transparent">
        <div
          className="absolute h-full bg-tg-button transition-all duration-300 ease-out"
          style={{
            width: '50%',
            left: activeTab === 'opportunities' ? '0%' : '50%'
          }}
        />
      </div>
    </div>
  );
}

interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  emoji: string;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ label, emoji, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 transition-colors-smooth ${
        isActive
          ? 'text-tg-button'
          : 'text-tg-hint'
      }`}
    >
      <span className="text-lg">{emoji}</span>
      <span className="font-medium text-sm hidden sm:inline">{label}</span>
    </button>
  );
}

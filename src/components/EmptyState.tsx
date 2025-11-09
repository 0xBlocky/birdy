import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-4 text-6xl opacity-50">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-tg-text">
        {title}
      </h3>
      <p className="text-tg-hint mb-6 max-w-sm">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-tg-button text-tg-button-text rounded-xl font-medium btn-press"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

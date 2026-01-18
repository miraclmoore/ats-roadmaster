import { ReactNode } from 'react';

export interface EmptyStateProps {
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
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-6 mb-4">
        <div className="text-slate-400 dark:text-slate-500 w-16 h-16 flex items-center justify-center">
          {icon}
        </div>
      </div>

      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>

      <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-6">
        {description}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className="
            px-6 py-3 rounded-lg
            bg-blue-600 hover:bg-blue-700
            text-white font-medium
            transition-colors duration-200
            shadow-lg shadow-blue-500/30
          "
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

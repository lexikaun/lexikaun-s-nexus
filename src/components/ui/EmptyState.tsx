import React from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="mb-4 text-text-secondary">{icon}</div>}
      <h3 className="text-sm font-medium text-text-main mb-1">{title}</h3>
      {description && <p className="text-sm text-text-secondary mb-4 max-w-sm">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};

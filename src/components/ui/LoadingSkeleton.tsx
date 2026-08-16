import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="w-full animate-pulse space-y-4">
      <div className="h-10 bg-surface hairline-border rounded-md w-full"></div>
      <div className="space-y-3">
        <div className="h-16 bg-surface hairline-border rounded-md w-full"></div>
        <div className="h-16 bg-surface hairline-border rounded-md w-full"></div>
        <div className="h-16 bg-surface hairline-border rounded-md w-full"></div>
      </div>
    </div>
  );
};

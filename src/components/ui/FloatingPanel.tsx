import React, { HTMLAttributes } from 'react';

export interface FloatingPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const FloatingPanel: React.FC<FloatingPanelProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-surface border border-hairline rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.45)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

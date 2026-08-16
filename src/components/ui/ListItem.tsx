import React, { HTMLAttributes } from 'react';

interface ListItemProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hasDivider?: boolean;
  leftAccessory?: React.ReactNode;
  rightAccessory?: React.ReactNode;
}

export const ListItem: React.FC<ListItemProps> = ({ 
  children, 
  hasDivider = true,
  leftAccessory,
  rightAccessory,
  className = '', 
  ...props 
}) => {
  return (
    <div
      className={`flex items-center justify-between py-3 ${hasDivider ? 'border-b border-border-main' : ''} ${className}`}
      {...props}
    >
      <div className="flex items-center gap-3">
        {leftAccessory && <div>{leftAccessory}</div>}
        <div className="flex-1 text-sm text-text-main">{children}</div>
      </div>
      {rightAccessory && <div className="text-sm text-text-secondary">{rightAccessory}</div>}
    </div>
  );
};

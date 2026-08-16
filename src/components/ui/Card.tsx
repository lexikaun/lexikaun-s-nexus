import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-surface hairline-border rounded-lg p-4 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

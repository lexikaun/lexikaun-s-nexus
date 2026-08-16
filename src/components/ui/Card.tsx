import React, { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  elevation?: 'flat' | 'floating';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  interactive = false,
  elevation = 'floating',
  ...props
}) => {
  return (
    <div
      className={`bg-surface border border-hairline rounded-2xl p-5 ${
        elevation === 'floating' ? 'shadow-[0_12px_32px_rgba(0,0,0,0.35)]' : ''
      } ${
        interactive
          ? 'transition-all duration-150 ease-out hover:-translate-y-[1px] hover:bg-surface-hover hover:border-[rgba(237,232,224,0.16)] cursor-pointer'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

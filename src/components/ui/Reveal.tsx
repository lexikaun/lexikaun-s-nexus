import React from 'react';

export interface RevealProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Reveal: React.FC<RevealProps> = ({
  isOpen,
  children,
  className = '',
}) => {
  return (
    <div
      className={`grid transition-all duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
      } ${className}`}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
};

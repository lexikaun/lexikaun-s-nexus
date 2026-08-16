import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium text-text-secondary">
            {label}
          </label>
        )}
        <input
          className={`flex h-10 w-full rounded-md bg-bg-main hairline-border px-3 py-2 text-sm text-text-main placeholder:text-text-secondary focus:outline-none focus:border-text-secondary transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          ref={ref}
          {...props}
        />
        {error && <span className="text-xs text-red-main">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

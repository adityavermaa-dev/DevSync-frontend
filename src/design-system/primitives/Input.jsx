import React from 'react';
import { cn } from '@/design-system/utils';

export const Input = React.forwardRef(({ 
  className, 
  error,
  leftIcon,
  rightIcon,
  fullWidth = true,
  ...props 
}, ref) => {
  return (
    <div className={cn("relative", fullWidth && "w-full")}>
      {leftIcon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
          {leftIcon}
        </div>
      )}
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50",
          leftIcon && "pl-10",
          rightIcon && "pr-10",
          error && "border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]",
          className
        )}
        {...props}
      />
      {rightIcon && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[var(--text-muted)]">
          {rightIcon}
        </div>
      )}
    </div>
  );
});
Input.displayName = "Input";

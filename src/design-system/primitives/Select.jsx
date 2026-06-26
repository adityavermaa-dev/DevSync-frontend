import React from 'react';
import { cn } from '@/design-system/utils';

export const Select = React.forwardRef(({ 
  className, 
  error,
  fullWidth = true,
  children,
  ...props 
}, ref) => {
  return (
    <div className={cn("relative", fullWidth && "w-full")}>
      <select
        ref={ref}
        className={cn(
          "flex h-10 w-full appearance-none rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 pr-8 text-sm text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[var(--text-muted)]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>
    </div>
  );
});
Select.displayName = "Select";

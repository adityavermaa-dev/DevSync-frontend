import React from 'react';
import { cn } from '@/design-system/utils';

export const Textarea = React.forwardRef(({ 
  className, 
  error,
  fullWidth = true,
  ...props 
}, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50 resize-y",
        fullWidth && "w-full",
        error && "border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

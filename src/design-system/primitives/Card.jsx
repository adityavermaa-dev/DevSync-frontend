import React from 'react';
import { cn } from '@/design-system/utils';

export const Card = React.forwardRef(({ 
  className, 
  children, 
  elevation = '1', // 1, 2, 3
  interactive = false,
  as = 'div',
  ...props 
}, ref) => {
  const Tag = as;
  
  const elevationStyles = {
    '1': 'bg-[var(--surface-primary)] border border-[var(--border-subtle)]',
    '2': 'bg-[var(--surface-elevated)] border border-[var(--border-subtle)]',
    '3': 'bg-[var(--surface-elevated)] border border-[var(--border-strong)]',
  };

  return (
    <Tag
      ref={ref}
      className={cn(
        'rounded-[var(--radius-card)] overflow-hidden',
        elevationStyles[elevation],
        interactive && 'transition-colors duration-150 ease-out hover:border-[var(--border-hover)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
});

Card.displayName = "Card";

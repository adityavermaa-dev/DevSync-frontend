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
    '1': 'bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm',
    '2': 'bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-md',
    '3': 'bg-[var(--bg-tertiary)] border border-[var(--border-hover)] shadow-lg',
  };

  return (
    <Tag
      ref={ref}
      className={cn(
        'rounded-2xl overflow-hidden',
        elevationStyles[elevation],
        interactive && 'transition-all duration-200 ease-out hover:border-[var(--color-primary-muted)] hover:-translate-y-0.5 cursor-pointer hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
});

Card.displayName = "Card";

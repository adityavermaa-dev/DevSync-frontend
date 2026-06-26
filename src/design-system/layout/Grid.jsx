import React from 'react';
import { cn } from '@/design-system/utils';

export const Grid = ({ 
  children, 
  className, 
  cols = 1, // 1, 2, 3, 4, 5, 6, 12
  gap = 'md', // none, sm, md, lg, xl
  as = 'div',
  ...props 
}) => {
  const Tag = as;
  
  const colsStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
    12: 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-12'
  };

  const gapStyles = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
    '2xl': 'gap-12'
  };

  return (
    <Tag 
      className={cn(
        'grid',
        colsStyles[cols],
        gapStyles[gap],
        className
      )} 
      {...props}
    >
      {children}
    </Tag>
  );
};

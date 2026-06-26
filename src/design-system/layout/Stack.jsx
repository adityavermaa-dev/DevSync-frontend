import React from 'react';
import { cn } from '@/design-system/utils';

export const Stack = ({ 
  children, 
  className, 
  direction = 'col', // row, col
  align = 'start', // start, center, end, stretch, baseline
  justify = 'start', // start, center, end, between, around
  spacing = 'md', // none, xs, sm, md, lg, xl
  wrap = false,
  as = 'div',
  ...props 
}) => {
  const Tag = as;
  
  const directionStyles = {
    row: 'flex-row',
    col: 'flex-col'
  };

  const alignStyles = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline'
  };

  const justifyStyles = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around'
  };

  const spacingStyles = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
    '2xl': 'gap-12'
  };

  return (
    <Tag 
      className={cn(
        'flex',
        directionStyles[direction],
        alignStyles[align],
        justifyStyles[justify],
        spacingStyles[spacing],
        wrap && 'flex-wrap',
        className
      )} 
      {...props}
    >
      {children}
    </Tag>
  );
};

import React from 'react';
import { cn } from '@/design-system/utils';

export const Skeleton = ({ 
  className, 
  variant = 'rectangular', // rectangular, circular, text
  ...props 
}) => {
  const variantStyles = {
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded-md h-4 w-full',
  };

  return (
    <div 
      className={cn(
        "animate-pulse bg-[var(--bg-tertiary)]", 
        variantStyles[variant],
        className
      )} 
      {...props}
    />
  );
};

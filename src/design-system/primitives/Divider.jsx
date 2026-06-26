import React from 'react';
import { cn } from '@/design-system/utils';

export const Divider = ({ 
  className, 
  orientation = 'horizontal', // horizontal, vertical
  ...props 
}) => {
  const orientationStyles = {
    horizontal: 'w-full h-px',
    vertical: 'h-full w-px min-h-[1rem]',
  };

  return (
    <div 
      className={cn(
        "bg-[var(--border-color)]", 
        orientationStyles[orientation],
        className
      )} 
      role="separator"
      {...props}
    />
  );
};

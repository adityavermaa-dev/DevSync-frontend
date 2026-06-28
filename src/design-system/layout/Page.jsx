import React from 'react';
import { cn } from '@/design-system/utils';

export const Page = ({ 
  children, 
  className, 
  ...props 
}) => {
  return (
    <div 
      className={cn(
        'w-full flex flex-col min-h-full pb-4',
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

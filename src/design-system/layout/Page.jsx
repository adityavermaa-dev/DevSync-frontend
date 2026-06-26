import React from 'react';
import { cn } from '@/design-system/utils';

export const Page = ({ 
  children, 
  className, 
  ...props 
}) => {
  return (
    <main 
      className={cn(
        'min-h-screen bg-[var(--bg-primary)] pt-16 pb-24 lg:pb-8 flex flex-col',
        className
      )} 
      {...props}
    >
      {children}
    </main>
  );
};

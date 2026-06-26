import React from 'react';
import { cn } from '@/design-system/utils';

export const Container = ({ 
  children, 
  className, 
  size = 'lg', // sm, md, lg, xl, full
  as = 'div',
  ...props 
}) => {
  const Tag = as;
  
  const sizeStyles = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    xl: 'max-w-[1440px]',
    full: 'max-w-full'
  };

  return (
    <Tag 
      className={cn(
        'w-full mx-auto px-4 sm:px-6 lg:px-8', 
        sizeStyles[size], 
        className
      )} 
      {...props}
    >
      {children}
    </Tag>
  );
};

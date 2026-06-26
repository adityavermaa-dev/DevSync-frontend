import React from 'react';
import { cn } from '@/design-system/utils';

export const Heading = ({ 
  level = 1, 
  children, 
  className, 
  align = 'left',
  weight = 'bold',
  ...props 
}) => {
  // Ensure level is between 1 and 6
  const safeLevel = Math.max(1, Math.min(6, level));
  const Tag = `h${safeLevel}`;
  
  const baseStyles = 'text-[var(--text-primary)] font-sans tracking-tight';
  
  const sizeStyles = {
    1: 'text-4xl md:text-5xl lg:text-6xl',
    2: 'text-3xl md:text-4xl',
    3: 'text-2xl md:text-3xl',
    4: 'text-xl md:text-2xl',
    5: 'text-lg md:text-xl',
    6: 'text-base md:text-lg'
  };

  const weightStyles = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <Tag 
      className={cn(
        baseStyles, 
        sizeStyles[safeLevel], 
        weightStyles[weight], 
        alignStyles[align],
        className
      )} 
      {...props}
    >
      {children}
    </Tag>
  );
};

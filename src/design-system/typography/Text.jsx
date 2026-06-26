import React from 'react';
import { cn } from '@/design-system/utils';

export const Text = ({ 
  variant = 'body', // body, muted, small, large, accent
  children, 
  className, 
  align = 'left',
  weight = 'normal',
  as = 'p',
  ...props 
}) => {
  const Tag = as;
  
  const baseStyles = 'font-sans';
  
  const variantStyles = {
    body: 'text-[var(--text-primary)] text-base',
    muted: 'text-[var(--text-secondary)] text-sm',
    small: 'text-[var(--text-secondary)] text-xs',
    large: 'text-[var(--text-primary)] text-lg',
    accent: 'text-[var(--color-primary)] text-base font-medium'
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
        variantStyles[variant] || variantStyles.body, 
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

import React from 'react';
import { cn } from '@/design-system/utils';

export const AppIcon = ({ icon: Icon, size = 'md', className, ...props }) => {
  if (!Icon) return null;
  
  const sizeStyles = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32
  };

  return (
    <Icon 
      size={sizeStyles[size]} 
      className={cn('shrink-0', className)} 
      {...props} 
    />
  );
};

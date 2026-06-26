import React from 'react';
import { cn } from '@/design-system/utils';

export const Badge = ({ 
  children, 
  variant = 'default', // default, accent, success, warning, error, outline
  size = 'md', // sm, md
  className, 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-colors';
  
  const variantStyles = {
    default: 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)]',
    accent: 'bg-[var(--color-primary-muted)] text-[var(--color-primary)] border border-[var(--color-primary-light)]',
    success: 'bg-green-500/10 text-green-500 border border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
    error: 'bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/20',
    outline: 'bg-transparent text-[var(--text-secondary)] border border-[var(--border-color)]',
    skill: 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-subtle)]',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 leading-tight',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span 
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {children}
    </span>
  );
};

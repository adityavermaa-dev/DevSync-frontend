import React from 'react';
import { cn } from '@/design-system/utils';

export const Button = React.forwardRef(({ 
  children, 
  className, 
  variant = 'primary', // primary, secondary, danger, ghost
  size = 'md', // sm, md, lg
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  as = 'button',
  type = 'button',
  ...props 
}, ref) => {
  const Tag = as;
  
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 ease-out rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none';
  
  const variantStyles = {
    primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] focus-visible:ring-[var(--color-primary)] shadow-sm hover:shadow-md hover:-translate-y-0.5',
    secondary: 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--color-primary-muted)] hover:bg-[var(--bg-tertiary)] focus-visible:ring-[var(--color-primary)]',
    danger: 'bg-[var(--color-danger)] text-white hover:opacity-90 focus-visible:ring-[var(--color-danger)] shadow-sm hover:shadow-md hover:-translate-y-0.5',
    ghost: 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] focus-visible:ring-[var(--color-primary)]',
  };

  const sizeStyles = {
    sm: 'text-sm px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-3 gap-2',
  };

  return (
    <Tag
      ref={ref}
      type={as === 'button' ? type : undefined}
      disabled={disabled || loading}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin shrink-0 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : leftIcon && (
        <span className="shrink-0">{leftIcon}</span>
      )}
      
      {children}
      
      {rightIcon && !loading && (
        <span className="shrink-0">{rightIcon}</span>
      )}
    </Tag>
  );
});

Button.displayName = "Button";

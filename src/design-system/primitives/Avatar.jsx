import React from 'react';
import { cn } from '@/design-system/utils';

export const Avatar = ({ 
  src, 
  alt = 'Avatar', 
  fallback, 
  size = 'md', // sm, md, lg, xl, 2xl
  status, // online, offline, busy
  className, 
  ...props 
}) => {
  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-24 h-24',
  };
  
  const statusColors = {
    online: 'bg-green-500',
    busy: 'bg-[var(--color-danger)]',
    offline: 'bg-[var(--text-muted)]',
  };

  return (
    <div className={cn('relative inline-block', sizeStyles[size], className)} {...props}>
      <div className="w-full h-full rounded-full overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center">
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <span className="text-[var(--text-secondary)] font-medium uppercase text-xs md:text-sm">
            {fallback || alt.charAt(0)}
          </span>
        )}
      </div>
      {status && (
        <span 
          className={cn(
            'absolute bottom-0 right-0 block rounded-full border-2 border-[var(--bg-primary)]',
            statusColors[status],
            size === 'sm' ? 'w-2.5 h-2.5' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'
          )}
        />
      )}
    </div>
  );
};

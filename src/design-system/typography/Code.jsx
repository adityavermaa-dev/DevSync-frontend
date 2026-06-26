import React from 'react';
import { cn } from '@/design-system/utils';

export const Code = ({ 
  children, 
  className, 
  block = false,
  ...props 
}) => {
  const Tag = block ? 'pre' : 'code';
  
  const baseStyles = 'font-mono text-sm';
  
  const blockStyles = block 
    ? 'block p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] overflow-x-auto text-[var(--text-secondary)]'
    : 'inline-block px-1.5 py-0.5 rounded-md bg-[var(--bg-secondary)] text-[var(--color-primary)] border border-[var(--border-color)]';

  return (
    <Tag 
      className={cn(baseStyles, blockStyles, className)} 
      {...props}
    >
      {block ? <code>{children}</code> : children}
    </Tag>
  );
};

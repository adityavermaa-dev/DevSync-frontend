import React from 'react';
import { cn } from '@/design-system/utils';
import { Heading, Text } from '@/design-system/typography';
import { Stack } from '@/design-system/layout';

export const EmptyState = ({ 
  icon, 
  title, 
  description, 
  action, 
  className,
  ...props 
}) => {
  return (
    <Stack 
      align="center" 
      justify="center" 
      spacing="lg" 
      className={cn("w-full py-12 px-4 text-center rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-primary)]", className)}
      {...props}
    >
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] text-[var(--color-primary)] flex items-center justify-center border border-[var(--border-color)] shadow-sm">
          {icon}
        </div>
      )}
      <Stack spacing="sm" align="center">
        {title && <Heading level={4}>{title}</Heading>}
        {description && <Text variant="muted" className="max-w-sm">{description}</Text>}
      </Stack>
      {action && <div className="mt-2">{action}</div>}
    </Stack>
  );
};

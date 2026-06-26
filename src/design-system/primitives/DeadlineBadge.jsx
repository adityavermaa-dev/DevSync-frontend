import React from 'react';
import { Stack, cn } from '@/design-system';
import { Clock } from 'lucide-react';

export const DeadlineBadge = ({ daysLeft, dateStr, className }) => {
  const isUrgent = daysLeft !== undefined && daysLeft <= 3 && daysLeft >= 0;
  const isPast = daysLeft !== undefined && daysLeft < 0;

  return (
    <Stack 
      direction="row" 
      align="center" 
      spacing="xs" 
      className={cn(
        "px-2.5 py-1 rounded-md border text-xs font-medium whitespace-nowrap",
        isPast 
          ? "bg-[var(--surface-primary)] border-[var(--border-subtle)] text-[var(--text-muted)]"
          : isUrgent
            ? "bg-red-500/10 border-red-500/20 text-red-500"
            : "bg-[var(--surface-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)]",
        className
      )}
    >
      <Clock className="w-3.5 h-3.5" />
      <span>
        {isPast ? "Ended" : daysLeft !== undefined ? `${daysLeft} Days Left` : dateStr}
      </span>
    </Stack>
  );
};

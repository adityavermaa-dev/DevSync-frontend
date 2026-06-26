import React from 'react';
import { Text, cn } from '@/design-system';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

export const MilestoneTimeline = ({ milestones = [], currentMilestoneId, className }) => {
  return (
    <div className={cn("w-full relative py-2", className)}>
      <div className="absolute top-[20px] left-8 right-8 h-0.5 bg-[var(--border-subtle)] z-0" />
      
      <div className="relative z-10 flex justify-between w-full">
        {milestones.map((milestone) => {
          const isCompleted = milestone.status === 'completed';
          const isActive = milestone.id === currentMilestoneId;

          return (
            <div key={milestone.id} className="flex flex-col items-center gap-2 flex-1 relative">
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center bg-[var(--bg-primary)] border-2 transition-colors z-10",
                  isCompleted ? "border-[var(--color-primary)] text-[var(--color-primary)]" :
                  isActive ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]" :
                  "border-[var(--border-subtle)] bg-[var(--surface-primary)] text-[var(--text-muted)]"
                )}
              >
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : 
                 isActive ? <Circle className="w-3 h-3 fill-current" /> : 
                 <Clock className="w-4 h-4" />}
              </div>
              <div className="text-center w-full px-1">
                <Text variant="small" weight="bold" className={cn("text-[11px] uppercase tracking-wider", isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}>
                  {milestone.label}
                </Text>
                {milestone.date && (
                  <Text variant="small" className="text-[10px] text-[var(--text-muted)] mt-0.5 block">
                    {milestone.date}
                  </Text>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

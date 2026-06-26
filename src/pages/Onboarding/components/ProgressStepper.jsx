import React from 'react';

export const ProgressStepper = ({ currentStep, totalSteps }) => {
  const progress = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-[var(--text-secondary)]">Profile Setup</span>
        <span className="text-sm font-bold text-[var(--color-primary)]">{progress}%</span>
      </div>
      <div className="h-2 w-full bg-[var(--surface-elevated)] rounded-full overflow-hidden">
        <div 
          className="h-full bg-[var(--color-primary)] transition-all duration-500 ease-in-out rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

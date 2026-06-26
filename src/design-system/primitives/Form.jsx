import React from 'react';
import { cn } from '@/design-system/utils';

export const Form = ({ className, ...props }) => (
  <form className={cn("space-y-6", className)} {...props} />
);

export const FormField = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-2", className)} {...props} />
);

export const Label = React.forwardRef(({ className, required, children, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none text-[var(--text-primary)]",
      className
    )}
    {...props}
  >
    {children}
    {required && <span className="text-[var(--color-danger)] ml-1">*</span>}
  </label>
));
Label.displayName = "Label";

export const HelperText = ({ className, ...props }) => (
  <p className={cn("text-[0.8rem] text-[var(--text-muted)]", className)} {...props} />
);

export const ErrorMessage = ({ className, children, ...props }) => {
  if (!children) return null;
  return (
    <p className={cn("text-[0.8rem] font-medium text-[var(--color-danger)]", className)} {...props}>
      {children}
    </p>
  );
};

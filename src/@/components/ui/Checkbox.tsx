import * as React from 'react';
import { cn } from '../../lib/utils.ts';

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  toggle?: boolean; // Optional: render as a toggle switch
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, toggle = false, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          toggle
            ? // Toggle switch styles
              'relative peer inline-block w-11 h-6 rounded-full bg-neutral-300 dark:bg-neutral-700 transition-colors duration-200 ease-in-out focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 after:content-[""] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:bg-white dark:after:bg-neutral-200 after:rounded-full after:transition-transform after:duration-200 peer-checked:bg-primary peer-checked:after:translate-x-5'
            : // Standard checkbox styles
              'h-4 w-4 rounded border border-input bg-neutral-100 dark:bg-neutral-900 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };

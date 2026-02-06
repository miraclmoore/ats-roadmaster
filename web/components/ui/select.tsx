'use client';

import { forwardRef, SelectHTMLAttributes } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  selectSize?: 'sm' | 'md' | 'lg';
  options: Array<{ value: string; label: string }>;
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-3 text-lg',
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, selectSize = 'md', options, className = '', disabled, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            disabled={disabled}
            className={`
              w-full rounded-lg border transition-colors font-mono appearance-none
              ${sizeClasses[selectSize]}
              ${
                hasError
                  ? 'border-destructive focus:ring-destructive focus:border-destructive'
                  : 'border-border focus:ring-primary focus:border-primary'
              }
              ${
                disabled
                  ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
                  : 'bg-input text-foreground'
              }
              focus:outline-none focus:ring-2 focus:ring-opacity-50
              ${className}
            `}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
            }
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom dropdown arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {error && (
          <p id={`${props.id}-error`} className="mt-1.5 text-sm text-destructive">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={`${props.id}-helper`} className="mt-1.5 text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

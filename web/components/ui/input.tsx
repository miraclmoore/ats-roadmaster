'use client';

import { forwardRef, InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  inputSize?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-3 text-lg',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, inputSize = 'md', className = '', disabled, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}

        <input
          ref={ref}
          disabled={disabled}
          className={`
            w-full rounded-lg border transition-colors font-mono
            ${sizeClasses[inputSize]}
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
            placeholder:text-muted-foreground
            ${className}
          `}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
          }
          {...props}
        />

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

Input.displayName = 'Input';

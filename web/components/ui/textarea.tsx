'use client';

import { forwardRef, TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  textareaSize?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-3 text-lg',
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, textareaSize = 'md', className = '', disabled, rows = 4, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          disabled={disabled}
          rows={rows}
          className={`
            w-full rounded-lg border transition-colors font-mono resize-y
            ${sizeClasses[textareaSize]}
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

Textarea.displayName = 'Textarea';

'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export interface DialogHeaderProps {
  children: ReactNode;
  className?: string;
}

export interface DialogContentProps {
  children: ReactNode;
  className?: string;
}

export interface DialogFooterProps {
  children: ReactNode;
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Dialog({ open, onClose, children, size = 'md', className = '' }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  // Focus management (accessibility)
  useEffect(() => {
    if (open && dialogRef.current) {
      // Save current focus
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus first focusable element in dialog
      const firstFocusable = dialogRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    } else if (!open && previousFocusRef.current) {
      // Restore previous focus
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [open]);

  // Focus trap
  useEffect(() => {
    if (!open || !dialogRef.current) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !dialogRef.current) return;

      const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        className={`
          relative w-full ${sizeClasses[size]} bg-card border border-border
          rounded-lg shadow-lg transform transition-all
          ${className}
        `}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export function DialogHeader({ children, className = '' }: DialogHeaderProps) {
  return (
    <div className={`px-6 py-4 border-b border-border ${className}`}>
      <h2 className="text-xl font-bold text-foreground">{children}</h2>
    </div>
  );
}

export function DialogContent({ children, className = '' }: DialogContentProps) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}

export function DialogFooter({ children, className = '' }: DialogFooterProps) {
  return (
    <div className={`px-6 py-4 border-t border-border flex items-center justify-end gap-3 ${className}`}>
      {children}
    </div>
  );
}

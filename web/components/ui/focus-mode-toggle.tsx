'use client';

import { useFocusMode } from '@/lib/contexts/focus-mode';
import { cn } from '@/lib/utils';

export function FocusModeToggle() {
  const { mode, setMode, isFocusMode } = useFocusMode();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      {/* Mode selector dropdown */}
      <div className={cn(
        "flex items-center bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg transition-all duration-300",
        isFocusMode ? "opacity-30 hover:opacity-100" : "opacity-100"
      )}>
        <button
          onClick={() => setMode('full')}
          className={cn(
            "px-3 py-2 text-xs font-medium transition-colors rounded-l-lg",
            mode === 'full'
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
          title="Full Mode - Complete dashboard with sidebar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <button
          onClick={() => setMode('focus')}
          className={cn(
            "px-3 py-2 text-xs font-medium transition-colors",
            mode === 'focus'
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
          title="Focus Mode - Telemetry only, no chrome"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>

        <button
          onClick={() => setMode('glance')}
          className={cn(
            "px-3 py-2 text-xs font-medium transition-colors rounded-r-lg",
            mode === 'glance'
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
          title="Glance Mode - Minimal info for quick checks"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

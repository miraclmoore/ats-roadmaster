'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { FocusModeProvider, useFocusMode } from '@/lib/contexts/focus-mode';
import { FocusModeToggle } from '@/components/ui/focus-mode-toggle';
import { cn } from '@/lib/utils';

interface DashboardLayoutClientProps {
  userEmail: string;
  onSignOut: () => void;
  children: React.ReactNode;
}

function DashboardLayoutInner({ userEmail, onSignOut, children }: DashboardLayoutClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isFocusMode, isGlanceMode } = useFocusMode();

  const hideChrome = isFocusMode || isGlanceMode;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar - hidden in focus/glance mode */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        hidden={hideChrome}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Compact Top Bar - hidden in focus/glance mode */}
        <header className={cn(
          "bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 transition-all duration-300",
          hideChrome ? "h-0 opacity-0 overflow-hidden" : "h-12"
        )}>
          <div className="h-full px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Right Side - Compact User Menu */}
            <div className="ml-auto flex items-center gap-2 relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-slate-600 dark:bg-slate-400 flex items-center justify-center text-xs font-bold text-white">
                  {userEmail.charAt(0).toUpperCase()}
                </div>
                <svg className="w-4 h-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20">
                    <div className="p-2 border-b border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{userEmail}</p>
                    </div>
                    <button
                      onClick={onSignOut}
                      className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={cn(
          "flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 transition-all duration-300",
          hideChrome && "bg-background"
        )}>
          <div className={cn(
            "mx-auto transition-all duration-300",
            hideChrome
              ? "max-w-none px-2 py-2"
              : "max-w-7xl px-3 sm:px-4 lg:px-6 py-3"
          )}>
            {children}
          </div>
        </main>
      </div>

      {/* Focus Mode Toggle - always visible */}
      <FocusModeToggle />
    </div>
  );
}

export function DashboardLayoutClient(props: DashboardLayoutClientProps) {
  return (
    <FocusModeProvider>
      <DashboardLayoutInner {...props} />
    </FocusModeProvider>
  );
}

'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';

interface DashboardLayoutClientProps {
  userEmail: string;
  onSignOut: () => void;
  children: React.ReactNode;
}

export function DashboardLayoutClient({ userEmail, onSignOut, children }: DashboardLayoutClientProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Compact Top Bar */}
        <header className="bg-card border-b border-border h-12 flex-shrink-0">
          <div className="h-full px-3 sm:px-4 lg:px-6 flex items-center justify-end gap-3">
            {/* Right Side - Compact User Menu */}
            <div className="ml-auto flex items-center gap-2 relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-black">
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
                  <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-20">
                    <div className="p-2 border-b border-border">
                      <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                    </div>
                    <button
                      onClick={onSignOut}
                      className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
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
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

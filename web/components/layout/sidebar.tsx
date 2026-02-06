'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useState, useEffect, useRef } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/live',
    label: 'Live Telemetry',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    href: '/jobs',
    label: 'Jobs',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: '/routes',
    label: 'Routes',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    href: '/analytics',
    label: 'Analytics',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: '/expenses',
    label: 'Expenses',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: '/achievements',
    label: 'Achievements',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
  {
    href: '/hos',
    label: 'HOS Tracker',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: '/companies',
    label: 'Companies',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    href: '/ai',
    label: 'AI Dispatcher',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  // Load collapsed state from localStorage (client-side only)
  useEffect(() => {
    setIsClient(true);
    
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      try {
        setIsCollapsed(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse sidebar state:', error);
      }
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    
    if (isClient) {
      try {
        localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
      } catch (error) {
        console.error('Failed to save sidebar state:', error);
      }
    }
  };

  // Toggle mobile drawer
  const toggleMobileDrawer = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Focus management for mobile drawer (accessibility)
  useEffect(() => {
    if (isMobileOpen && drawerRef.current) {
      // Focus first link when drawer opens
      const firstLink = drawerRef.current.querySelector('a');
      firstLink?.focus();
    } else if (!isMobileOpen && hamburgerRef.current) {
      // Return focus to hamburger when drawer closes
      hamburgerRef.current.focus();
    }
  }, [isMobileOpen]);

  // Keyboard navigation - ESC to close drawer
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    if (isMobileOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        ref={hamburgerRef}
        onClick={toggleMobileDrawer}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card text-foreground hover:bg-muted transition-colors"
        aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isMobileOpen}
        aria-controls="mobile-navigation"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={toggleMobileDrawer}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-shrink-0">
      <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="flex flex-col flex-grow bg-background pt-5 pb-4 overflow-y-auto border-r border-border">
          {/* Logo & Toggle */}
          <div className={`flex items-center flex-shrink-0 px-4 mb-8 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && (
              <div className="flex items-center">
                <span className="text-2xl mr-2">🚛</span>
                <span className="text-xl font-bold text-white">RoadMaster Pro</span>
              </div>
            )}
            {isCollapsed && (
              <span className="text-3xl">🚛</span>
            )}
            <button
              onClick={toggleCollapsed}
              className="ml-auto p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                )}
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-3 text-sm font-medium rounded-lg
                    transition-all duration-200
                    ${isCollapsed ? 'justify-center' : ''}
                    ${
                      isActive
                        ? 'bg-muted text-primary border-l-3 border-primary'
                        : 'text-muted-foreground hover:bg-card hover:text-foreground border-l-3 border-transparent'
                    }
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className={isActive ? '' : 'group-hover:scale-110 transition-transform'}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span className="ml-3">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          {!isCollapsed && (
            <div className="flex-shrink-0 px-4 mt-4 pt-4 border-t border-border">
              <div className="flex items-center text-xs text-muted-foreground">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>v1.0.0</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>

      {/* Mobile Drawer Sidebar */}
      <aside
        ref={drawerRef}
        id="mobile-navigation"
        role="navigation"
        aria-label="Main navigation"
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col bg-background overflow-y-auto border-r border-border">
          {/* Logo & Close */}
          <div className="flex items-center justify-between px-4 pt-5 pb-4 mb-4">
            <div className="flex items-center">
              <span className="text-2xl mr-2">🚛</span>
              <span className="text-xl font-bold text-white">RoadMaster Pro</span>
            </div>
            <button
              onClick={toggleMobileDrawer}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-3 text-sm font-medium rounded-lg
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-muted text-primary border-l-3 border-primary'
                        : 'text-muted-foreground hover:bg-card hover:text-foreground border-l-3 border-transparent'
                    }
                  `}
                >
                  <span className={isActive ? '' : 'group-hover:scale-110 transition-transform'}>
                    {item.icon}
                  </span>
                  <span className="ml-3">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="flex-shrink-0 px-4 mt-4 pt-4 pb-4 border-t border-border">
            <div className="flex items-center text-xs text-muted-foreground">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

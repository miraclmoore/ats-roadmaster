'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

export interface TabsProps {
  defaultValue: string;
  children: ReactNode;
  className?: string;
  onValueChange?: (value: string) => void;
}

export interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, children, className = '', onValueChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onValueChange?.(value);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = '' }: TabsListProps) {
  return (
    <div className={`flex border-b border-border ${className}`} role="tablist">
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className = '' }: TabsTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('TabsTrigger must be used within Tabs');
  }

  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveTab(value)}
      className={`
        px-4 py-3 text-sm font-medium transition-all duration-200
        border-b-2 -mb-px
        ${
          isActive
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = '' }: TabsContentProps) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('TabsContent must be used within Tabs');
  }

  const { activeTab } = context;
  if (activeTab !== value) return null;

  return (
    <div role="tabpanel" className={`pt-4 ${className}`}>
      {children}
    </div>
  );
}

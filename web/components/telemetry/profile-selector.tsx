'use client';

import { useState } from 'react';

export interface DashboardProfile {
  id: string;
  name: string;
  isCustom: boolean;
  visibleCards: string[];
  layout: 'compact' | 'grid';
  gaugeStyle: 'minimal' | 'detailed' | 'realistic';
}

export const PRESET_PROFILES: DashboardProfile[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    isCustom: false,
    visibleCards: ['instrument-cluster'],
    layout: 'compact',
    gaugeStyle: 'minimal',
  },
  {
    id: 'trucker',
    name: 'Trucker',
    isCustom: false,
    visibleCards: ['instrument-cluster', 'route-advisor', 'driver-assists', 'fuel-system'],
    layout: 'grid',
    gaugeStyle: 'detailed',
  },
  {
    id: 'engineer',
    name: 'Engineer',
    isCustom: false,
    visibleCards: ['instrument-cluster', 'route-advisor', 'driver-assists', 'vehicle-condition', 'fuel-system', 'trends'],
    layout: 'grid',
    gaugeStyle: 'realistic',
  },
  {
    id: 'streamer',
    name: 'Streamer',
    isCustom: false,
    visibleCards: ['instrument-cluster', 'route-advisor'],
    layout: 'compact',
    gaugeStyle: 'realistic',
  },
];

interface ProfileSelectorProps {
  currentProfile: DashboardProfile;
  customProfiles: DashboardProfile[];
  onProfileChange: (profile: DashboardProfile) => void;
  onCustomize: () => void;
}

export function ProfileSelector({ 
  currentProfile, 
  customProfiles,
  onProfileChange, 
  onCustomize 
}: ProfileSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const allProfiles = [...PRESET_PROFILES, ...customProfiles];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2 py-1.5 text-xs font-medium rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors flex items-center gap-1.5"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        <span className="hidden sm:inline">{currentProfile.name}</span>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20">
            <div className="p-2">
              {allProfiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => {
                    onProfileChange(profile);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded transition-colors flex items-center gap-2 ${
                    currentProfile.id === profile.id
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {profile.isCustom && (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {profile.name}
                </button>
              ))}
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 p-2">
              <button
                onClick={() => {
                  onCustomize();
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Customize
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

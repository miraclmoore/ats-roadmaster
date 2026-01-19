'use client';

import { useState } from 'react';
import { DashboardProfile } from './profile-selector';

interface ProfileCustomizerProps {
  isOpen: boolean;
  currentProfile: DashboardProfile;
  onClose: () => void;
  onSave: (profile: DashboardProfile) => void;
}

const AVAILABLE_CARDS = [
  { id: 'instrument-cluster', name: 'Instrument Cluster' },
  { id: 'route-advisor', name: 'Route Advisor' },
  { id: 'driver-assists', name: 'Driver Assists' },
  { id: 'vehicle-condition', name: 'Vehicle Condition' },
  { id: 'fuel-system', name: 'Fuel System' },
  { id: 'trends', name: 'Performance Trends' },
];

export function ProfileCustomizer({ isOpen, currentProfile, onClose, onSave }: ProfileCustomizerProps) {
  const [name, setName] = useState(`${currentProfile.name} (Custom)`);
  const [visibleCards, setVisibleCards] = useState<string[]>(currentProfile.visibleCards);
  const [layout, setLayout] = useState<'compact' | 'grid'>(currentProfile.layout);
  const [gaugeStyle, setGaugeStyle] = useState<'minimal' | 'detailed' | 'realistic'>(currentProfile.gaugeStyle);

  if (!isOpen) return null;

  const handleSave = () => {
    const customProfile: DashboardProfile = {
      id: `custom-${Date.now()}`,
      name,
      isCustom: true,
      visibleCards,
      layout,
      gaugeStyle,
    };
    onSave(customProfile);
    onClose();
  };

  const toggleCard = (cardId: string) => {
    setVisibleCards(prev =>
      prev.includes(cardId)
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Customize Dashboard
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Profile Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Profile Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Visible Cards */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Visible Cards
              </label>
              <div className="grid grid-cols-2 gap-3">
                {AVAILABLE_CARDS.map((card) => (
                  <label
                    key={card.id}
                    className="flex items-center gap-2 p-3 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={visibleCards.includes(card.id)}
                      onChange={() => toggleCard(card.id)}
                      className="w-4 h-4 text-blue-500 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{card.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Layout Style */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Layout Style
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setLayout('compact')}
                  className={`p-4 border rounded-lg transition-colors ${
                    layout === 'compact'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="text-sm font-medium text-slate-900 dark:text-white">Compact</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Minimal spacing</div>
                </button>
                <button
                  onClick={() => setLayout('grid')}
                  className={`p-4 border rounded-lg transition-colors ${
                    layout === 'grid'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="text-sm font-medium text-slate-900 dark:text-white">Grid</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Balanced layout</div>
                </button>
              </div>
            </div>

            {/* Gauge Style */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Gauge Style
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setGaugeStyle('minimal')}
                  className={`p-4 border rounded-lg transition-colors ${
                    gaugeStyle === 'minimal'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="text-sm font-medium text-slate-900 dark:text-white">Minimal</div>
                </button>
                <button
                  onClick={() => setGaugeStyle('detailed')}
                  className={`p-4 border rounded-lg transition-colors ${
                    gaugeStyle === 'detailed'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="text-sm font-medium text-slate-900 dark:text-white">Detailed</div>
                </button>
                <button
                  onClick={() => setGaugeStyle('realistic')}
                  className={`p-4 border rounded-lg transition-colors ${
                    gaugeStyle === 'realistic'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="text-sm font-medium text-slate-900 dark:text-white">Realistic</div>
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            >
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

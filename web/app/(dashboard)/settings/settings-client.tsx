'use client';

import { useState } from 'react';
import { Check, Copy, RefreshCw } from 'lucide-react';

interface SettingsClientProps {
  initialApiKey: string;
  initialPreferences: {
    units: string;
    currency: string;
    timezone: string;
  };
}

export function SettingsClient({
  initialApiKey,
  initialPreferences,
}: SettingsClientProps) {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    setRegenerating(true);

    try {
      const response = await fetch('/api/user/regenerate-key', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate API key');
      }

      const data = await response.json();
      setApiKey(data.api_key);
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Error regenerating API key:', error);
      alert('Failed to regenerate API key. Please try again.');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* API Configuration */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="mb-4">API Configuration</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              API Key
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiKey || 'No API key generated yet'}
                readOnly
                className="flex-1 bg-muted border border-border rounded px-3 py-2 font-mono text-sm text-foreground"
              />
              <button
                onClick={handleCopy}
                disabled={!apiKey}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Use this key in your ATS plugin config.json file
            </p>
          </div>

          <div>
            <button
              onClick={() => setShowConfirmDialog(true)}
              disabled={regenerating}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
              Regenerate API Key
            </button>
            <p className="text-xs text-muted-foreground mt-2">
              ⚠️ This will invalidate your current API key. Update your plugin
              config immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="mb-4">Preferences</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              Units
            </label>
            <select
              defaultValue={initialPreferences.units}
              className="w-full bg-muted border border-border rounded px-3 py-2 text-foreground"
            >
              <option value="imperial">Imperial (mph, gallons, miles)</option>
              <option value="metric">Metric (km/h, liters, kilometers)</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              Currency
            </label>
            <select
              defaultValue={initialPreferences.currency}
              className="w-full bg-muted border border-border rounded px-3 py-2 text-foreground"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              Timezone
            </label>
            <select
              defaultValue={initialPreferences.timezone}
              className="w-full bg-muted border border-border rounded px-3 py-2 text-foreground"
            >
              <option value="America/Los_Angeles">Pacific (PST/PDT)</option>
              <option value="America/Denver">Mountain (MST/MDT)</option>
              <option value="America/Chicago">Central (CST/CDT)</option>
              <option value="America/New_York">Eastern (EST/EDT)</option>
              <option value="Europe/London">London (GMT/BST)</option>
              <option value="Europe/Paris">Paris (CET/CEST)</option>
            </select>
          </div>

          <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90">
            Save Preferences
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Regenerate API Key?</h3>
            <p className="text-muted-foreground mb-4">
              This will invalidate your current API key. Your ATS plugin will
              stop working until you update the config.json file with the new
              key.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 bg-muted text-foreground rounded hover:opacity-90"
              >
                Cancel
              </button>
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:opacity-90 disabled:opacity-50"
              >
                {regenerating ? 'Regenerating...' : 'Regenerate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

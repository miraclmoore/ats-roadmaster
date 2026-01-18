import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SettingsClient } from './settings-client';

export const metadata = {
  title: 'Settings | RoadMaster Pro',
  description: 'Manage your RoadMaster Pro settings and preferences',
};

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user preferences including API key
  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1>Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <SettingsClient
        initialApiKey={preferences?.api_key || ''}
        initialPreferences={{
          units: preferences?.units || 'imperial',
          currency: preferences?.currency || 'USD',
          timezone: preferences?.timezone || 'America/Los_Angeles',
        }}
      />
    </div>
  );
}

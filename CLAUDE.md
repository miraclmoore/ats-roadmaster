# CLAUDE.md - RoadMaster Pro Build Instructions

**Project:** RoadMaster Pro - ATS Companion App
**For:** AI Coding Assistants (Claude Code, Cursor, etc.)
**Last Updated:** January 18, 2026

---

## 🎯 PROJECT OVERVIEW

You are building **RoadMaster Pro**, a cloud-based companion application for American Truck Simulator (ATS) that provides economic analysis, performance tracking, and AI-powered career insights.

### Core Concept

Players using realistic economy mods (especially "Busy & Broke") struggle to track profitability and optimize their virtual trucking business. RoadMaster Pro captures SDK telemetry data, stores it in the cloud, and provides analytics/AI insights to help players make better decisions.

### Target User

- **Profile:** Experienced ATS player (100+ hours) using Busy & Broke economy mod
- **Goals:** Maximize profit per job, improve driving efficiency, track career progression
- **Pain Points:** Can't see which routes are profitable, no expense tracking, no performance feedback
- **Technical Level:** Non-technical (must be easy to install/use)

---

## ⚠️ CRITICAL CONSTRAINTS

### What SDK Actually Provides

**✅ AVAILABLE DATA (use freely):**
```javascript
// Job Events
job_started: { origin, destination, cargo, income, distance, deadline }
job_delivered: { income, cargo_damage, late_delivery }
job_cancelled: { }

// Live Telemetry (1Hz sampling)
speed, rpm, gear, fuel_current, fuel_capacity
damage: { engine, transmission, chassis, wheels, cabin, cargo }
position: { x, y, z }, rotation
game_time, paused

// Truck Constants
make, model, engine_rpm_max, fuel_tank_capacity
gear_count_forward, gear_count_reverse

// Trailer Data
attached: boolean
damage: decimal
cargo_damage: decimal
```

**❌ NOT AVAILABLE (do not attempt to use):**
```javascript
// THESE DO NOT EXIST IN SDK:
weather  // SDK has ZERO weather fields
traffic  // No traffic data available
bank_balance  // No save file access
garage_count  // No save file access
company_reputation  // No save file access
freight_market  // Can't see jobs before accepting
hired_drivers  // No save file access
```

### What SDK Cannot Do

1. **No Weather Data**
   - SDK provides NO weather information
   - Wheel substance (road surface) ≠ weather detection
   - Do not build weather-based features

2. **No Real-World Integration**
   - Real-world weather ≠ game weather (game randomizes)
   - Real-world traffic ≠ game traffic (scripted)
   - Do not use external APIs for "realism"

3. **No Save File Access**
   - Cannot read bank balance, garages, reputation
   - Only what SDK explicitly provides

4. **No Freight Market Access**
   - Cannot see available jobs before player accepts
   - Only track jobs after acceptance

---

## 🏗️ ARCHITECTURE

### System Design
```
┌──────────────────────────────┐
│  AMERICAN TRUCK SIMULATOR    │
│  (Game + SCS SDK v1.13+)     │
└──────────┬───────────────────┘
           │ Memory Mapped File
           ↓
┌──────────────────────────────┐
│  TELEMETRY PLUGIN (C#)       │
│  - Reads SDK via MMF         │
│  - Samples at 1Hz            │
│  - HTTP POST to Supabase     │
└──────────┬───────────────────┘
           │ HTTPS REST
           ↓
┌──────────────────────────────┐
│  SUPABASE (Backend)          │
│  ├─ PostgreSQL               │
│  ├─ Auth (RLS)               │
│  ├─ Realtime (WebSockets)    │
│  └─ Storage (PDF exports)    │
└──────────┬───────────────────┘
           │ REST + WebSockets
           ↓
┌──────────────────────────────┐
│  NEXT.JS WEB DASHBOARD       │
│  - Job tracking              │
│  - Analytics charts          │
│  - Live telemetry            │
│  - AI chat (Claude API)      │
└──────────────────────────────┘
```

### Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- Tailwind CSS
- Recharts (charts)
- TanStack Table (tables)
- Supabase Client (real-time)

**Backend:**
- Supabase (PostgreSQL + Auth + Realtime)
- Next.js API Routes (for Claude integration)

**SDK Plugin:**
- C# (.NET 6.0)
- SCS Telemetry SDK v1.13+
- HttpClient for API calls

**AI:**
- Anthropic Claude API (Sonnet 3.5)
- Streaming responses

---

## 🗄️ DATABASE SCHEMA

```sql
-- Users managed by Supabase Auth

-- Jobs Table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,

  -- Job Details (from SDK)
  source_city TEXT NOT NULL,
  source_company TEXT,
  destination_city TEXT NOT NULL,
  destination_company TEXT,
  cargo_type TEXT NOT NULL,
  cargo_weight INTEGER,

  -- Financial (from SDK)
  income INTEGER NOT NULL,
  distance INTEGER NOT NULL,

  -- Timing (from SDK)
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  deadline TIMESTAMPTZ,
  delivered_late BOOLEAN DEFAULT FALSE,

  -- Performance (calculated from telemetry)
  fuel_consumed DECIMAL,
  damage_taken DECIMAL,
  avg_speed DECIMAL,
  avg_rpm DECIMAL,

  -- Calculated Fields
  fuel_cost DECIMAL,
  damage_cost DECIMAL,
  profit DECIMAL,
  profit_per_mile DECIMAL,
  fuel_economy DECIMAL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_completed_at ON jobs(completed_at);
CREATE INDEX idx_jobs_route ON jobs(source_city, destination_city);

-- Telemetry Snapshots
CREATE TABLE telemetry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  job_id UUID REFERENCES jobs,

  -- Truck State
  speed DECIMAL,
  rpm INTEGER,
  gear INTEGER,
  fuel_current DECIMAL,
  fuel_capacity DECIMAL,

  -- Damage
  engine_damage DECIMAL,
  transmission_damage DECIMAL,
  chassis_damage DECIMAL,
  wheels_damage DECIMAL,
  cabin_damage DECIMAL,
  cargo_damage DECIMAL,

  -- Position
  position_x DECIMAL,
  position_y DECIMAL,
  position_z DECIMAL,

  -- Time
  game_time TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_telemetry_user_job ON telemetry(user_id, job_id);
CREATE INDEX idx_telemetry_created_at ON telemetry(created_at);

-- Achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  icon_url TEXT,
  requirement_value DECIMAL,
  requirement_type TEXT
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  achievement_id UUID REFERENCES achievements NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  progress DECIMAL DEFAULT 0,

  UNIQUE(user_id, achievement_id)
);

-- Company Stats
CREATE TABLE company_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  company_name TEXT NOT NULL,

  jobs_completed INTEGER DEFAULT 0,
  jobs_on_time INTEGER DEFAULT 0,
  total_damage DECIMAL DEFAULT 0,
  avg_damage DECIMAL DEFAULT 0,
  rating DECIMAL DEFAULT 0,

  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, company_name)
);

-- User Preferences
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users,

  fuel_alert_threshold INTEGER DEFAULT 30,
  rest_alert_minutes INTEGER DEFAULT 60,
  maintenance_alert_threshold INTEGER DEFAULT 15,

  units TEXT DEFAULT 'imperial',
  currency TEXT DEFAULT 'USD',
  timezone TEXT DEFAULT 'America/Los_Angeles',

  api_key TEXT UNIQUE,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY jobs_user_policy ON jobs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY telemetry_user_policy ON telemetry
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY user_achievements_policy ON user_achievements
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY company_stats_policy ON company_stats
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY user_preferences_policy ON user_preferences
  FOR ALL USING (auth.uid() = user_id);
```

---

## 🔧 SDK PLUGIN IMPLEMENTATION

### C# Telemetry Plugin

**Architecture:**
```
Game SDK MMF → Plugin reads MMF → HTTP POST → Supabase
```

**Key Implementation:**

```csharp
// 1. Memory Mapped File Access
string mapName = "Local\\SCSTelemetry";
MemoryMappedFile mmf = MemoryMappedFile.OpenExisting(mapName);
MemoryMappedViewAccessor accessor = mmf.CreateViewAccessor();

SCSTelemetry telemetry = new SCSTelemetry();
accessor.Read(0, out telemetry);

// 2. Event Detection
if (currentJob == null && telemetry.JobIncome > 0) {
  SendJobStartedEvent(telemetry);
}

if (currentJob != null && telemetry.JobIncome == 0) {
  SendJobCompletedEvent(telemetry, currentJob);
  currentJob = null;
}

// 3. API Communication
var client = new HttpClient();
client.DefaultRequestHeaders.Add("apikey", userApiKey);
client.DefaultRequestHeaders.Add("Authorization", $"Bearer {userApiKey}");

var payload = new {
  user_id = userId,
  speed = telemetry.Speed,
  rpm = telemetry.EngineRPM,
  // ... more fields
};

var content = new StringContent(
  JsonSerializer.Serialize(payload),
  Encoding.UTF8,
  "application/json"
);

await client.PostAsync(
  "https://your-project.supabase.co/rest/v1/telemetry",
  content
);

// 4. Sample at 1Hz
while (true) {
  ReadAndSendTelemetry();
  Thread.Sleep(1000);
}
```

---

## 💻 FRONTEND IMPLEMENTATION

### Project Structure
```
/app
  /(auth)
    /login/page.tsx
    /signup/page.tsx
  /(dashboard)
    /layout.tsx
    /page.tsx
    /jobs/page.tsx
    /analytics/page.tsx
    /live/page.tsx
    /ai/page.tsx
    /settings/page.tsx
  /api
    /jobs/route.ts
    /telemetry/route.ts
    /ai/dispatch/route.ts
/components
  /jobs/JobCard.tsx
  /telemetry/LiveDashboard.tsx
  /analytics/RouteChart.tsx
  /ai/ChatInterface.tsx
/lib
  /supabase/client.ts
  /calculations/profit.ts
  /claude/prompts.ts
```

### Key Components

**Live Telemetry Dashboard:**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function LiveDashboard({ userId }: { userId: string }) {
  const [telemetry, setTelemetry] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('telemetry')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'telemetry',
          filter: `user_id=eq.${userId}`
        },
        (payload) => setTelemetry(payload.new)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId]);

  if (!telemetry) return <div>Waiting for game data...</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      <GaugeWidget label="Speed" value={telemetry.speed} unit="mph" max={80} />
      <GaugeWidget label="RPM" value={telemetry.rpm} max={2000} />
      <GaugeWidget label="Fuel" value={(telemetry.fuel_current / telemetry.fuel_capacity) * 100} unit="%" max={100} />
    </div>
  );
}
```

---

## 🤖 AI INTEGRATION

### Dispatcher Prompt
```typescript
export function generateDispatcherPrompt(
  userStats: UserStats,
  currentLocation: string,
  truckStatus: TruckStatus,
  routeProfitability: Route[]
) {
  return `You are Roadie, an AI dispatcher for a virtual trucking company.

PLAYER STATS:
- Current Location: ${currentLocation}
- Fuel: ${truckStatus.fuelPercent}%
- Truck Condition: ${truckStatus.overallDamage}% damage
- Game Time: ${truckStatus.gameTime}

HISTORICAL ROUTE PERFORMANCE:
${routeProfitability.map(r => `
  ${r.route}: ${r.jobsCompleted} jobs, $${r.avgProfit} avg profit, $${r.profitPerMile}/mi
  Best cargo: ${r.bestCargo} ($${r.bestCargoRate}/mi)
`).join('\n')}

TASK: Recommend the most profitable job to take next.

REQUIREMENTS:
1. Base recommendation on historical profitability data
2. Consider current truck status (fuel, damage)
3. Be specific with numbers from their actual history
4. Provide 1 primary recommendation + 2 alternatives
5. Keep response under 200 words`;
}
```

### API Route
```typescript
// app/api/ai/dispatch/route.ts
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: Request) {
  const { userId } = await req.json();

  const userStats = await getUserStats(userId);
  const currentStatus = await getCurrentTruckStatus(userId);
  const routeData = await getRouteProfitability(userId);

  const prompt = generateDispatcherPrompt(userStats, currentStatus.location, currentStatus, routeData);

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  const stream = await anthropic.messages.create({
    model: 'claude-sonnet-3-5-20241022',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
    stream: true
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === 'content_block_delta') {
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }
      controller.close();
    }
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}
```

---

## 📈 CALCULATIONS

### Profit Calculation
```typescript
export function calculateJobProfit(job: Job): number {
  const fuelCost = job.fuel_consumed * 4.05; // ESTIMATED_FUEL_PRICE_PER_GALLON
  const damageCost = (job.damage_taken / 100) * 10000; // Linear scaling
  const profit = job.income - fuelCost - damageCost;
  return profit;
}

export function calculateProfitPerMile(profit: number, distance: number): number {
  return profit / distance;
}
```

### Fuel Economy
```typescript
export function calculateMPG(distance: number, fuelConsumed: number): number {
  return distance / fuelConsumed;
}

export function calculateFuelRange(fuelCurrent: number, avgMPG: number): number {
  return fuelCurrent * avgMPG;
}
```

---

## 🔒 SECURITY

### Row Level Security
```sql
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY jobs_user_policy ON jobs
  FOR ALL USING (auth.uid() = user_id);
```

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-anthropic-key
```

---

## ✅ TESTING CHECKLIST

### SDK Plugin
- [ ] Plugin loads without crashing game
- [ ] Telemetry appears in Supabase within 5 seconds
- [ ] Job events fire correctly
- [ ] No memory leaks after 1 hour
- [ ] Handles network errors gracefully

### Dashboard
- [ ] User can sign up and log in
- [ ] Current job displays in real-time
- [ ] Job history loads and filters work
- [ ] Charts render correctly
- [ ] Mobile responsive

### AI Features
- [ ] AI Dispatcher returns relevant recommendations
- [ ] Recommendations based on actual user data
- [ ] Streaming responses work smoothly

---

## 🚫 ANTI-PATTERNS TO AVOID

**DO NOT:**
1. ❌ Try to access weather data (doesn't exist in SDK)
2. ❌ Integrate real-world APIs (they don't work)
3. ❌ Read save files (no access)
4. ❌ Modify game files (breaks on updates)
5. ❌ Ignore RLS (security risk)

**DO:**
1. ✅ Use ONLY SDK-provided data
2. ✅ Focus on economic analysis
3. ✅ Personalize insights to player data
4. ✅ Keep dashboard performant
5. ✅ Enable RLS on all tables
6. ✅ Implement proper error handling

---

## 📝 FINAL NOTES

This is a **real product** for **real users** who play ATS with realistic economy mods. They need:
- **Accurate profit tracking** (every dollar matters)
- **Performance insights** (help them improve)
- **Career progression tools** (achievements, company rep)
- **AI-powered recommendations** (based on THEIR data)

Build incrementally:
- Week 1: SDK → Cloud pipeline
- Week 2: Basic dashboard
- Week 3-4: Analytics
- Week 5: AI features

Focus on the economic simulation aspect. Answer these questions:
- "Am I making money on this route?"
- "Which cargo should I haul?"
- "How can I improve my fuel economy?"

**Good luck building!** 🚛💨

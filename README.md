# 🚛 RoadMaster Pro - ATS Companion App

Cloud-based economic analysis and performance tracking for American Truck Simulator players using realistic economy mods (Busy & Broke).

## Project Status

### ✅ Completed (MVP Foundation)

- **Next.js 14 Web Application**
  - TypeScript + Tailwind CSS
  - App Router architecture
  - Responsive design (mobile, tablet, desktop)

- **Authentication System**
  - Supabase Auth integration
  - Email/password signup and login
  - Protected dashboard routes
  - Session management with middleware

- **Database Schema**
  - Complete PostgreSQL schema (6 tables)
  - Row Level Security (RLS) policies
  - Indexes for performance
  - Migration ready for Supabase

- **Core Utilities**
  - Profit calculation (fuel cost, damage cost, net profit)
  - Fuel efficiency metrics (MPG, range, savings)
  - Performance scoring system
  - TypeScript types for type safety

- **Dashboard UI**
  - Main dashboard with statistics overview
  - Navigation sidebar
  - Dark mode support
  - Quick start guide for new users

### 🚧 In Progress

- Job tracking components (JobCard, JobTable)
- Live telemetry dashboard
- Analytics charts (Recharts integration)
- C# SDK telemetry plugin

### 📋 Upcoming

- AI Dispatcher (Claude API integration)
- Route profitability analysis
- Performance coach
- Export functionality (CSV, PDF)

## Project Structure

```
ats-roadmaster/
├── docs/
│   └── PRD.md                    # Product Requirements Document
├── web/                          # Next.js web application
│   ├── app/
│   │   ├── (auth)/               # Authentication pages
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/          # Protected dashboard
│   │   │   ├── layout.tsx        # Dashboard layout with nav
│   │   │   └── dashboard/        # Main dashboard page
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Landing page
│   │   └── globals.css           # Global styles
│   ├── lib/
│   │   ├── supabase/             # Supabase clients
│   │   │   ├── client.ts         # Browser client
│   │   │   ├── server.ts         # Server client
│   │   │   └── middleware.ts     # Auth middleware
│   │   ├── calculations/         # Business logic
│   │   │   ├── profit.ts         # Profit calculations
│   │   │   ├── efficiency.ts     # Fuel efficiency
│   │   │   └── performance.ts    # Performance scoring
│   │   └── types/
│   │       └── database.ts       # TypeScript types
│   ├── supabase/
│   │   ├── migrations/
│   │   │   └── 001_initial_schema.sql
│   │   └── README.md             # Setup instructions
│   ├── .env.example              # Environment template
│   └── package.json
├── CLAUDE.md                     # AI assistant instructions
└── README.md                     # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- (Later) .NET 6.0 SDK for C# plugin

### Setup Instructions

1. **Clone and install dependencies:**
   ```bash
   cd web
   npm install
   ```

2. **Set up Supabase:**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase URL and keys

3. **Run database migrations:**
   - Go to Supabase SQL Editor
   - Run `web/supabase/migrations/001_initial_schema.sql`
   - Verify tables and RLS policies are created

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

### First Login

1. Sign up for a new account
2. Check your dashboard (will show setup instructions)
3. Copy your API key (needed for telemetry plugin later)

## Technology Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts (to be integrated)
- **Tables:** TanStack Table (to be integrated)
- **Real-time:** Supabase Realtime

### Backend
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth
- **API:** Next.js API Routes
- **AI:** Anthropic Claude API (upcoming)

### SDK Plugin (Upcoming)
- **Language:** C#
- **Framework:** .NET 6.0
- **SDK:** SCS Telemetry SDK v1.13+

## Key Features (Planned)

### MVP (Week 1-2)
- ✅ User authentication
- ✅ Database schema with RLS
- 🚧 Job tracking dashboard
- 🚧 Live telemetry display
- 🚧 Basic analytics charts
- 🚧 C# SDK plugin

### Phase 2 (Week 3-4)
- Route profitability analysis
- Expense tracking & P&L reports
- Performance coach
- Fuel efficiency analytics
- Damage analysis

### Phase 3 (Week 5)
- AI Dispatcher (Claude-powered)
- AI Performance Analysis
- Personalized recommendations

### Phase 4 (Week 6)
- Achievement system
- Company reputation tracker
- Export to CSV/PDF
- UI/UX polish

## Development Workflow

### Building Speckit-based features using Speckit

This project uses **Speckit** for structured feature development:

```bash
# Available Speckit commands (via Claude Code):
/specify      # Create feature specification
/plan         # Generate implementation plan
/tasks        # Break down into tasks
/implement    # Execute the plan
/analyze      # Check consistency
```

### Manual Development

For smaller features, develop directly:

1. Create components in `web/components/`
2. Add pages in `web/app/(dashboard)/`
3. Add calculations in `web/lib/calculations/`
4. Test locally before pushing

## Database Schema

### Core Tables

- **jobs** - Job history (income, distance, profit, etc.)
- **telemetry** - Real-time truck data snapshots
- **achievements** - Achievement definitions
- **user_achievements** - User progress on achievements
- **company_stats** - Performance per company
- **user_preferences** - User settings and API key

### Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- API keys stored securely in `user_preferences`

## Environment Variables

Required in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Claude API (for AI features)
ANTHROPIC_API_KEY=your-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd web
vercel

# Production
vercel --prod
```

### Environment Variables

Set in Vercel dashboard:
- All variables from `.env.example`
- Make sure `ANTHROPIC_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are server-side only

## Contributing

This is a personal project, but suggestions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

Private project - All rights reserved

## Acknowledgments

- **SCS Software** - American Truck Simulator SDK
- **Supabase** - Backend infrastructure
- **Anthropic** - Claude API for AI features
- **Busy & Broke Mod** - Inspiration for economic focus

## Roadmap

### Short Term (Next 2 weeks)
- [ ] Complete job tracking UI
- [ ] Implement live telemetry dashboard
- [ ] Build C# SDK plugin
- [ ] Test end-to-end data flow

### Medium Term (Month 2-3)
- [ ] Add analytics features
- [ ] Integrate Claude AI
- [ ] Implement achievement system
- [ ] Add export functionality

### Long Term (Month 4+)
- [ ] Mobile app (React Native)
- [ ] Multiplayer features (leaderboards)
- [ ] Advanced AI coaching
- [ ] VR overlay support

---

**Built with ❤️ for the ATS community**

For questions or issues, check the documentation in `/docs/` or create an issue.

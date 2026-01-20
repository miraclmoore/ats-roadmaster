# Technology Stack

**Analysis Date:** 2026-01-19

## Languages

**Primary:**
- TypeScript 5.9.3 - Web dashboard frontend and API routes
- C# 10 (.NET 6.0) - SDK telemetry plugin

**Secondary:**
- JavaScript (ESNext) - Configuration files and build scripts

## Runtime

**Environment:**
- Node.js (unspecified version, requires >=10 based on dependencies)
- .NET 6.0 runtime (Windows x64 only)

**Package Manager:**
- npm (package-lock.json present)
- NuGet for C# dependencies

## Frameworks

**Core:**
- Next.js 16.1.3 - React framework with App Router
- React 19.2.3 - UI library
- React DOM 19.2.3 - React renderer

**Testing:**
- Not detected

**Build/Dev:**
- TypeScript 5.9.3 - Type checking
- PostCSS 8.5.6 - CSS processing
- Autoprefixer 10.4.23 - CSS vendor prefixes
- ESLint 9.39.2 - Code linting
- eslint-config-next 16.1.3 - Next.js ESLint rules

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.90.1 - Primary database client
- `@supabase/ssr` 0.8.0 - Server-side rendering support for Supabase
- `@anthropic-ai/sdk` 0.71.2 - Claude AI integration
- `next` 16.1.3 - Full-stack React framework

**Infrastructure:**
- `@tailwindcss/postcss` 4.1.18 - Utility-first CSS framework
- `tailwindcss` 4.1.18 - CSS framework core
- `tailwind-merge` 3.4.0 - Tailwind class merging utility
- `clsx` 2.1.1 - Conditional class name utility
- `class-variance-authority` 0.7.1 - Component variant management

**UI Components:**
- `@tanstack/react-table` 8.21.3 - Headless table library
- `recharts` 3.6.0 - Chart library
- `lucide-react` 0.562.0 - Icon library
- `framer-motion` 12.27.1 - Animation library
- `@react-spring/web` 10.0.3 - Spring-based animation

**Validation:**
- `zod` 4.3.5 - Schema validation

**C# Plugin:**
- `Newtonsoft.Json` 13.0.3 - JSON serialization
- SCSSdkClient (bundled) - RenCloud SDK for ATS telemetry

## Configuration

**Environment:**
- Environment variables managed via `.env.local`
- Required variables:
  - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
  - `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role (server-side)
  - `ANTHROPIC_API_KEY` - Claude API key
  - `NEXT_PUBLIC_APP_URL` - Application URL

**Build:**
- TypeScript config: `web/tsconfig.json`
  - Target: ES2020
  - Module: ESNext
  - JSX: react-jsx (React 19 automatic runtime)
  - Path alias: `@/*` → project root
- Next.js config: `web/next.config.ts` (minimal configuration)
- PostCSS config: `web/postcss.config.mjs` (Tailwind processing only)

**C# Plugin:**
- Config file: `plugin/RoadMasterPlugin/config.json`
  - `apiKey` - User's RoadMaster API key
  - `apiUrl` - Web dashboard URL

## Platform Requirements

**Development:**
- Node.js >=10 (recommended latest LTS)
- npm package manager
- TypeScript 5.9+

**Production:**
- Next.js deployment target (likely Vercel or similar)
- Supabase cloud backend
- Windows PC with ATS for plugin (.NET 6.0, x64)

**Plugin Requirements:**
- Windows x64
- .NET 6.0 Runtime
- American Truck Simulator with RenCloud SDK dll (`scs-telemetry.dll`)

---

*Stack analysis: 2026-01-19*

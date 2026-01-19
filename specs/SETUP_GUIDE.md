# RoadMaster Pro - Setup Guide for MVP Testing

**Quick Reference Guide for Environment Setup**

---

## Prerequisites Checklist

Before starting MVP testing, ensure you have:

- [ ] Windows 10/11 (64-bit)
- [ ] American Truck Simulator installed
- [ ] .NET 6.0 Runtime (x64) installed
- [ ] Node.js 18+ installed (✅ You have v24.13.0)
- [ ] Git installed
- [ ] Modern web browser

---

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to https://supabase.com
2. Sign in or create account
3. Click "New Project"
4. Fill in details:
   - Name: `roadmaster-pro`
   - Database Password: (save this!)
   - Region: Choose closest to you
5. Wait for project to be created (~2 minutes)

### 1.2 Get Supabase Credentials

Once project is ready:

1. Go to Project Settings → API
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`, keep this secret!)

### 1.3 Run Database Migration

1. In Supabase dashboard, click "SQL Editor" in left sidebar
2. Click "New query"
3. Open file: `E:\dev\ats-roadmaster\supabase\migrations\001_initial_schema.sql`
4. Copy entire contents
5. Paste into Supabase SQL Editor
6. Click "Run" button
7. Verify success message (should create 6 tables)

**Expected Tables Created:**
- `jobs`
- `telemetry`
- `achievements`
- `user_achievements`
- `company_stats`
- `user_preferences`

### 1.4 Enable Realtime

1. Go to Database → Replication in Supabase dashboard
2. Find `telemetry` table
3. Enable replication (toggle switch)
4. Find `jobs` table  
5. Enable replication (toggle switch)

This allows real-time updates in the dashboard.

---

## Step 2: Web Application Setup

### 2.1 Create Environment File

1. Navigate to web directory:
   ```powershell
   cd E:\dev\ats-roadmaster\web
   ```

2. Create `.env.local` file:
   ```powershell
   New-Item .env.local -ItemType File
   ```

3. Edit `.env.local` and add (replace with your actual values):
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx...
   SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx...
   
   # Anthropic API (for AI Dispatcher)
   ANTHROPIC_API_KEY=sk-ant-xxxxx...
   
   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

**Where to get ANTHROPIC_API_KEY:**
- Go to https://console.anthropic.com
- Sign in or create account
- Navigate to API Keys
- Create new key
- Copy and paste into .env.local

### 2.2 Install Dependencies

```powershell
cd E:\dev\ats-roadmaster\web
npm install
```

Expected: ~300 packages installed, no errors

### 2.3 Start Development Server

```powershell
npm run dev
```

Expected output:
```
   ▲ Next.js 14.x.x
   - Local:        http://localhost:3000
   - Ready in xxxx ms
```

**Keep this terminal open!** The server must run during testing.

### 2.4 Verify Web App

1. Open browser: http://localhost:3000
2. You should see RoadMaster Pro landing page
3. Click "Sign Up" and create test account
4. After signup, you should see dashboard
5. Navigate to Settings page
6. **Copy your API key** - you'll need this for the plugin!

---

## Step 3: Plugin Installation

### 3.1 Verify Plugin Build

Plugin should already be built from earlier work:

```powershell
cd E:\dev\ats-roadmaster\plugin
Test-Path ".\RoadMasterPlugin\bin\x64\Release\net6.0\RoadMasterPlugin.dll"
```

Expected: `True`

If False, rebuild:
```powershell
.\build.bat
```

### 3.2 Run Installation Script

```powershell
cd E:\dev\ats-roadmaster\plugin
.\install.bat
```

This copies the DLL to:
```
C:\Users\{YOUR_USERNAME}\Documents\American Truck Simulator\plugins\
```

### 3.3 Configure API Key

1. Navigate to the plugins folder:
   ```powershell
   cd "$env:USERPROFILE\Documents\American Truck Simulator\plugins\RoadMasterPlugin"
   ```

2. Edit `config.json`:
   ```json
   {
     "ApiKey": "rm_YOUR_KEY_FROM_DASHBOARD_SETTINGS",
     "ApiUrl": "http://localhost:3000"
   }
   ```

3. Replace `rm_YOUR_KEY_FROM_DASHBOARD_SETTINGS` with the actual API key from Step 2.4

4. Save the file

---

## Step 4: Pre-Test Verification

### 4.1 Environment Checklist

Before starting tests, verify:

- [ ] Supabase project created
- [ ] Database migration ran successfully (6 tables exist)
- [ ] Realtime enabled for `jobs` and `telemetry` tables
- [ ] `.env.local` file created with all credentials
- [ ] Web app running at http://localhost:3000
- [ ] Can log in to dashboard
- [ ] API key copied from Settings page
- [ ] Plugin DLL exists in Release folder
- [ ] Plugin installed to ATS plugins directory
- [ ] `config.json` has correct API key and URL

### 4.2 Quick System Test

**Test Database Connection:**
```powershell
# From web directory
cd E:\dev\ats-roadmaster\web
npm run build
```

Should complete without database connection errors.

**Test API Endpoints:**

Open http://localhost:3000/api/telemetry in browser.

Expected: `{"error":"user_id or api_key is required"}`  
(This is correct! It means the API is running)

---

## Step 5: Ready to Test!

You're now ready to execute the test plan:

1. Open test spec: `specs/001-mvp-e2e-testing.md`
2. Follow tests in order: T001 → T008
3. Document results in: `plugin/TEST_RESULTS.md`

### Testing Workflow:

1. **Start ATS** - Plugin console should auto-launch
2. **Watch plugin console** - Look for connection messages
3. **Open dashboard** - Position browser to see alongside ATS
4. **Accept job in ATS** - Start driving
5. **Monitor dashboard** - Watch for real-time updates
6. **Complete delivery** - Verify profit calculation
7. **Check analytics** - Validate charts and data
8. **Test AI** - Ask Roadie questions
9. **Measure performance** - Track CPU, memory, FPS

---

## Troubleshooting

### Web App Won't Start

**Error: "Module not found"**
```powershell
cd web
rm -r node_modules
rm package-lock.json
npm install
npm run dev
```

**Error: "Port 3000 already in use"**
```powershell
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_FROM_ABOVE> /F
npm run dev
```

### Supabase Connection Error

**Error: "Invalid Supabase credentials"**
- Verify URL format: `https://xxxxx.supabase.co` (no trailing slash)
- Verify keys start with `eyJ`
- Check for typos in `.env.local`
- Restart dev server after changing `.env.local`

### Plugin Won't Load

**No console window appears:**
- Install .NET 6.0 Desktop Runtime: https://dotnet.microsoft.com/download/dotnet/6.0
- Run ATS as Administrator
- Check plugins folder exists and has DLL

**"Cannot connect to ATS":**
- Make sure you're IN-GAME (not in main menu)
- Enable SCS SDK in ATS settings (if disabled)
- Try starting a quick job first

### API Key Issues

**"Invalid API key" error:**
- Copy API key again from dashboard Settings
- Check for extra spaces in config.json
- Verify key format: starts with `rm_`
- Make sure you didn't regenerate the key

---

## Quick Reference

### File Locations

- **Spec:** `E:\dev\ats-roadmaster\specs\001-mvp-e2e-testing.md`
- **Web App:** `E:\dev\ats-roadmaster\web\`
- **Plugin:** `E:\dev\ats-roadmaster\plugin\`
- **Plugin Install:** `C:\Users\{YOU}\Documents\American Truck Simulator\plugins\`
- **Config:** `{ATS_PLUGINS}\RoadMasterPlugin\config.json`
- **Test Results:** `E:\dev\ats-roadmaster\plugin\TEST_RESULTS.md`

### Commands

```powershell
# Start web app
cd E:\dev\ats-roadmaster\web
npm run dev

# Rebuild plugin
cd E:\dev\ats-roadmaster\plugin
.\build.bat

# Reinstall plugin
.\install.bat

# Check terminal output
cd E:\dev\ats-roadmaster
cat .cursor\projects\e-dev-ats-roadmaster\terminals\4.txt
```

### URLs

- **Dashboard:** http://localhost:3000
- **Supabase:** https://supabase.com/dashboard
- **Anthropic:** https://console.anthropic.com

---

**Ready? Start with Test 1 in `specs/001-mvp-e2e-testing.md`!** 🚛

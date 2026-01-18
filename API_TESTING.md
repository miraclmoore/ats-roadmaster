# RoadMaster Pro - API Testing Guide

Your backend APIs are ready! Here's how to test them.

## 🧪 Quick Test - AI Dispatcher

**Easiest way to verify everything works:**

1. Go to http://localhost:3002/ai
2. Log in with your test account
3. Try asking:
   - "What are my most profitable routes?"
   - "Show me my stats"
   - "What should I haul next?"

You should get CB radio-style responses from Roadie! 📻

---

## 🔑 Get Your API Key

Before testing telemetry/job APIs, you need your API key:

### Option 1: From the Dashboard
1. Go to http://localhost:3002/dashboard
2. If you don't have any jobs yet, you'll see setup instructions
3. Your API key is displayed there (starts with `rm_`)

### Option 2: From Supabase
1. Go to Supabase Dashboard → Table Editor
2. Click `user_preferences` table
3. Find your row → Copy the `api_key` value

---

## 🚛 Test Telemetry & Job APIs

### Using the Test Script

```bash
cd /Users/chanmoore/dev/ats-roadmaster

# Edit the script and replace YOUR_API_KEY_HERE with your actual key
nano scripts/test-apis.sh

# Run the tests
./scripts/test-apis.sh
```

### Manual Testing with cURL

Replace `YOUR_API_KEY` with your actual API key:

#### 1. Create a Job
```bash
curl -X POST http://localhost:3002/api/jobs/start \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "YOUR_API_KEY",
    "source_city": "Los Angeles",
    "destination_city": "San Francisco",
    "cargo_type": "Electronics",
    "income": 12500,
    "distance": 382
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "job_id": "uuid-here",
  "job": { ... }
}
```

**Copy the `job_id` for the next step!**

---

#### 2. Send Telemetry Data
```bash
curl -X POST http://localhost:3002/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "YOUR_API_KEY",
    "job_id": "PASTE_JOB_ID_HERE",
    "speed": 65.5,
    "rpm": 1800,
    "gear": 8,
    "fuel_current": 85.2,
    "fuel_capacity": 150.0,
    "engine_damage": 0.02,
    "cargo_damage": 0.0
  }'
```

**Expected Response:**
```json
{
  "success": true
}
```

---

#### 3. Complete the Job
```bash
curl -X POST http://localhost:3002/api/jobs/complete \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "YOUR_API_KEY",
    "job_id": "PASTE_JOB_ID_HERE",
    "delivered_late": false
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "job": { ... },
  "metrics": {
    "fuel_consumed": 10.5,
    "damage_taken": 2.0,
    "profit": 11950
  }
}
```

---

## ✅ Verify Data in Dashboard

After testing:

1. **Go to http://localhost:3002/dashboard**
   - You should see your stats updated
   - Recent deliveries should show your test job

2. **Go to http://localhost:3002/jobs**
   - Your test job should appear in the dispatch board
   - Profit should be calculated automatically

3. **Go to http://localhost:3002/analytics**
   - Charts should populate with your data

4. **Go to http://localhost:3002/ai**
   - Ask "What are my stats?"
   - Roadie should respond with your actual numbers!

---

## 🔍 Verify in Supabase

Check the database directly:

1. **Supabase Dashboard** → **Table Editor**
2. Click **jobs** table
   - You should see your test job
   - `profit`, `fuel_cost`, `damage_cost` should be calculated

3. Click **telemetry** table
   - You should see telemetry records linked to your job

---

## 🐛 Troubleshooting

**"Invalid API key"**
- Make sure you copied the full key (starts with `rm_`)
- Check `user_preferences` table in Supabase

**"Unauthorized"**
- For AI chat, you must be logged in via the browser
- For telemetry/jobs, use API key in the request body

**"Job not found" on complete**
- Make sure you're using the correct `job_id` from step 1
- The job must belong to the user associated with that API key

**No data showing in dashboard**
- Hard refresh the page (Cmd+Shift+R or Ctrl+Shift+R)
- Check browser console for errors
- Verify data exists in Supabase tables

---

## 📊 What Gets Calculated Automatically

When you complete a job, the database triggers automatically calculate:

- **Fuel Cost** = `fuel_consumed × $4.05/gallon`
- **Damage Cost** = `damage_taken × $100` (linear scale)
- **Profit** = `income - fuel_cost - damage_cost`
- **Profit Per Mile** = `profit / distance`
- **Fuel Economy** = `distance / fuel_consumed` (MPG)

These show up in the dashboard immediately!

---

## 🎯 Next Step: C# SDK Plugin

Once you verify the APIs work, the next step is building the C# plugin that:
1. Reads game memory via SCS SDK
2. Calls these APIs automatically
3. Sends telemetry every second
4. Detects job start/complete events

But for now, you can manually simulate this with the test script! 🚛💨

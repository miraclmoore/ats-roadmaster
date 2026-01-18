# 🧪 Quick Testing Guide

Let's test your APIs and see the app come alive with data!

## Step 1: Get Your User ID

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this query (replace with your email):

```sql
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
```

3. **Copy your user ID** (the UUID - looks like `123e4567-e89b-12d3-a456-426614174000`)

---

## Step 2: Add Sample Data

1. Open `/Users/chanmoore/dev/ats-roadmaster/supabase/seed-sample-data.sql`
2. **Replace ALL occurrences** of `YOUR_USER_ID` with your actual user ID
   - Use Find & Replace: `YOUR_USER_ID` → `your-uuid-here`
3. **Copy the entire file contents**
4. **Paste into Supabase SQL Editor**
5. Click **Run**

You should see a verification query showing 10 jobs with calculated profits! 🎉

---

## Step 3: Test the AI Dispatcher 🤖

This is the fun part!

1. Go to **http://localhost:3002/ai**
2. You should see Roadie's welcome message on Channel 19
3. Try these questions:

**Ask:** "What are my most profitable routes?"

**Expected Response:** Roadie should tell you about Los Angeles → Seattle (Electronics) being your best route with specific profit numbers!

**Ask:** "What cargo should I haul?"

**Expected Response:** Should recommend Electronics as your most profitable cargo type.

**Ask:** "How am I doing?"

**Expected Response:** Should show your stats - 10 jobs, total profit, etc.

**Ask:** "What should I focus on?"

**Expected Response:** Should give you personalized advice based on your data.

Try the quick channel buttons too! They're like CB radio presets.

---

## Step 4: Check the Dashboard 📊

1. Go to **http://localhost:3002/dashboard**
   - You should see all your stats populated
   - Performance gauges should show your metrics
   - Recent deliveries should list your jobs

2. Go to **http://localhost:3002/jobs**
   - Dispatch board should show all 10 jobs
   - Profit/loss should be color-coded (green/red)
   - Routes should display with arrows

3. Go to **http://localhost:3002/analytics**
   - Charts should be populated with your data
   - Top routes should show Los Angeles → Seattle
   - Top cargo should show Electronics

4. Go to **http://localhost:3002/live**
   - This will be empty (no real-time telemetry yet)
   - Will work once the C# plugin is built

---

## Step 5: Test Manual API Calls (Optional)

Want to test the APIs directly? Get your API key first:

1. Go to **http://localhost:3002/dashboard**
2. If you see setup instructions, copy your API key (starts with `rm_`)
3. Or get it from Supabase: `user_preferences` table → your row → `api_key` column

Then test creating a new job:

```bash
curl -X POST http://localhost:3002/api/jobs/start \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "YOUR_API_KEY_HERE",
    "source_city": "Portland",
    "destination_city": "Seattle",
    "cargo_type": "Lumber",
    "income": 8500,
    "distance": 173
  }'
```

You should get back a `job_id`!

---

## 🎯 What to Look For

**AI Dispatcher:**
- ✅ Uses your actual data in responses
- ✅ Cites specific numbers (profit amounts, job counts)
- ✅ Uses CB radio lingo (10-4, good buddy, keep the hammer down)
- ✅ Gives personalized recommendations
- ✅ Responds in under 5 seconds

**Dashboard:**
- ✅ Stats show 10 jobs completed
- ✅ Total income: ~$113,300
- ✅ Total profit: ~$95,000-100,000 (after fuel & damage)
- ✅ Performance gauges show metrics
- ✅ Recent deliveries list appears

**Analytics:**
- ✅ Income & Profit trend chart shows data
- ✅ Top routes: Los Angeles → Seattle should be #1
- ✅ Top cargo: Electronics should be #1
- ✅ Summary stats populated

---

## 🐛 Troubleshooting

**AI Dispatcher returns "no route data available":**
- Make sure you replaced `YOUR_USER_ID` in the sample data SQL
- Verify jobs were inserted in Supabase Table Editor → jobs table
- Hard refresh the AI page (Cmd+Shift+R)

**Dashboard shows 0 jobs:**
- Check Supabase Table Editor → jobs table for your data
- Make sure `user_id` matches your actual user ID
- Hard refresh (Cmd+Shift+R)

**"Unauthorized" error:**
- Make sure you're logged in
- For AI chat, use the browser (not API)
- For API testing, use your API key

**Calculations seem wrong:**
- The database automatically calculates:
  - Fuel cost = fuel_consumed × $4.05/gal
  - Damage cost = damage_taken × $100
  - Profit = income - fuel_cost - damage_cost
- These should populate within a second of inserting data

---

## ✅ Success Checklist

- [ ] Sample data inserted (10 jobs in database)
- [ ] Dashboard shows populated stats
- [ ] AI Dispatcher responds with your actual data
- [ ] Analytics charts show trends
- [ ] Jobs page displays all deliveries
- [ ] Profit calculations are automatic

Once all these work, you have a fully functional backend! 🎉

---

## 🚀 Next Steps

After testing:

**Option 1:** Build the C# SDK Plugin
- Reads game memory automatically
- Sends telemetry every second
- Detects job events
- Fully automated data flow

**Option 2:** Add More Features
- Achievements system
- Route recommendations
- Fuel efficiency tracking
- Company reputation

**Option 3:** Deploy to Production
- Vercel for frontend
- Keep Supabase for backend
- Public URL for sharing

What sounds interesting?

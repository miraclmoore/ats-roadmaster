# RoadMaster Pro - Windows Plugin Validation Checklist

**Version:** 1.0
**Date:** January 19, 2026
**Tester:** ___________________________
**Test Environment:**
- Windows Version: ___________________________
- ATS Version: ___________________________
- .NET Runtime: ___________________________
- Dashboard URL: ___________________________

---

## 1. Build Validation

- [ ] `build.bat` runs without errors
- [ ] DLL file exists at `RoadMasterPlugin/bin/Release/net6.0/RoadMasterPlugin.dll`
- [ ] All dependencies copied:
  - [ ] `Newtonsoft.Json.dll`
  - [ ] `RoadMasterPlugin.deps.json`
  - [ ] `RoadMasterPlugin.runtimeconfig.json`
- [ ] File sizes reasonable:
  - [ ] `RoadMasterPlugin.dll` (~50-200KB)
  - [ ] `Newtonsoft.Json.dll` (~500KB-1MB)

**Notes:**
```
_______________________________________________________________________
_______________________________________________________________________
```

---

## 2. Installation Validation

- [ ] `install.bat` runs without errors
- [ ] Files copied to correct location:
  `%USERPROFILE%\Documents\American Truck Simulator\bin\win_x64\plugins\`
- [ ] `config.json` exists in plugins folder
- [ ] `config.json` contains valid API key (not placeholder)
- [ ] `apiUrl` points to correct backend

**API Key Used:** `________________...`
**API URL:** `______________________________`

**Notes:**
```
_______________________________________________________________________
_______________________________________________________________________
```

---

## 3. Game Integration

- [ ] ATS launches without crashes or errors
- [ ] ATS console shows plugin startup message:
  - [ ] "🚛 RoadMaster Pro - ATS Telemetry Plugin"
  - [ ] "==========================================

"
  - [ ] "✅ API configured: [URL]"
- [ ] Console shows connection message:
  - [ ] "✅ Connected to American Truck Simulator"
- [ ] No error messages in ATS console
- [ ] Game performance normal (no FPS drop)

**Screenshot:** ___(attach console output)___

**Notes:**
```
_______________________________________________________________________
_______________________________________________________________________
```

---

## 4. Job Start Event

**Test Job Details:**
- Route: ______________________________________
- Cargo: ______________________________________
- Income: $____________________________________
- Distance: ____________________________________ mi

- [ ] Accept job from freight market
- [ ] Console shows job start message:
  - [ ] "🚛 Job started: [source] → [destination]"
  - [ ] "   Cargo: [cargo_type]"
  - [ ] "   Income: $[amount]"
  - [ ] "   Distance: [miles] km"
- [ ] Dashboard shows job in "Current Job" section
- [ ] Job details match in-game:
  - [ ] Source city matches
  - [ ] Destination city matches
  - [ ] Cargo type matches
  - [ ] Income amount matches
  - [ ] Distance matches

**Screenshot:** ___(attach dashboard current job)___

**Notes:**
```
_______________________________________________________________________
_______________________________________________________________________
```

---

## 5. Telemetry Streaming

- [ ] While driving, console shows telemetry updates every ~1 second
- [ ] Console displays current values:
  - [ ] Speed (mph)
  - [ ] RPM
  - [ ] Gear
  - [ ] Fuel level
- [ ] Live Telemetry page (`/live`) accessible
- [ ] Gauges on /live page update in real-time:
  - [ ] Speed gauge updates smoothly
  - [ ] RPM gauge updates smoothly
  - [ ] Fuel gauge updates smoothly
- [ ] Values match in-game dashboard:
  - [ ] Speed: In-game ___ → Dashboard ___ (within ±2 mph)
  - [ ] RPM: In-game ___ → Dashboard ___ (within ±100)
  - [ ] Fuel: In-game ___ % → Dashboard ___ % (within ±5%)
- [ ] Damage indicators show correctly
- [ ] No excessive console spam

**Screenshot:** ___(attach live telemetry page while driving)___

**Notes:**
```
_______________________________________________________________________
_______________________________________________________________________
```

---

## 6. Job Completion

- [ ] Complete job (deliver cargo)
- [ ] Console shows completion message:
  - [ ] "✅ Job completed: [source] → [destination]"
  - [ ] "   Status: ✓ On Time" (or "⚠ Late Delivery")
  - [ ] "   Profit calculated and saved to dashboard"
- [ ] Dashboard shows job in "Recent Deliveries" section
- [ ] Job marked as completed (green checkmark or similar)
- [ ] Profit calculated and displayed
- [ ] Performance metrics updated:
  - [ ] Fuel economy shown
  - [ ] Average speed shown
  - [ ] Damage percentage shown
- [ ] Analytics page updates with new job data

**Job Results:**
- Fuel Consumed: ____________________ gallons
- Damage Taken: ____________________ %
- Profit: $____________________
- Fuel Economy: ____________________ MPG

**Screenshot:** ___(attach recent deliveries section)___

**Notes:**
```
_______________________________________________________________________
_______________________________________________________________________
```

---

## 7. Error Scenarios

### 7a. Network Disconnect

- [ ] Disconnect network while driving
- [ ] Plugin logs error but doesn't crash game
- [ ] Console shows appropriate error message
- [ ] Reconnect network
- [ ] Plugin resumes sending telemetry on next update

**Error Message Seen:**
```
_______________________________________________________________________
```

### 7b. Dashboard Server Down

- [ ] Stop dashboard server (CTRL+C)
- [ ] Plugin continues running without crashing game
- [ ] Console shows HTTP error (timeout or connection refused)
- [ ] Restart dashboard server
- [ ] Plugin reconnects and resumes

**Error Message Seen:**
```
_______________________________________________________________________
```

### 7c. Invalid API Key

- [ ] Modify `config.json` with invalid API key
- [ ] Restart ATS
- [ ] Console shows 401 Unauthorized error
- [ ] Error message is clear and helpful
- [ ] Restore valid API key and confirm it works

**Error Message Seen:**
```
_______________________________________________________________________
```

### 7d. Job Cancellation

- [ ] Accept a job
- [ ] Cancel job before completion (open menu → cancel contract)
- [ ] Plugin handles gracefully (no crash)
- [ ] Console logs job cancellation
- [ ] Dashboard updates appropriately

**Notes:**
```
_______________________________________________________________________
```

---

## 8. Performance

- [ ] No noticeable FPS drop in ATS
- [ ] Memory usage stable over 30+ minute session
  - Initial memory: ____________________ MB
  - After 30 mins: ____________________ MB
- [ ] No console spam (< 5 lines per second)
- [ ] No game stuttering or lag
- [ ] CPU usage reasonable (< 5% additional)

**Performance Notes:**
```
_______________________________________________________________________
_______________________________________________________________________
```

---

## 9. Analytics Validation

**After completing 2-3 jobs:**

- [ ] Analytics page accessible (`/analytics`)
- [ ] "Income & Profit Trend" chart shows data
- [ ] "Top Cargo Types by Profit" chart populated
- [ ] "Most Profitable Routes" list shows routes
- [ ] All calculated fields appear correct:
  - [ ] Total Jobs Completed: ____
  - [ ] Total Distance: ____ mi
  - [ ] Avg Fuel Economy: ____ mpg
- [ ] Route profitability matches job data
- [ ] Cargo profitability makes sense

**Screenshot:** ___(attach analytics page)___

**Notes:**
```
_______________________________________________________________________
_______________________________________________________________________
```

---

## 10. AI Dispatcher Validation

- [ ] AI Dispatcher page accessible (`/ai`)
- [ ] Can send message to Roadie
- [ ] AI provides response based on actual data
- [ ] Recommendations include specific route/cargo from history
- [ ] Response mentions actual profit amounts
- [ ] AI stays in character (CB radio trucker persona)

**Test Prompt:** "What should I haul next?"

**AI Response Summary:**
```
_______________________________________________________________________
_______________________________________________________________________
```

**Notes:**
```
_______________________________________________________________________
_______________________________________________________________________
```

---

## Summary

**Total Items:** 80+
**Items Passed:** _____
**Items Failed:** _____
**Pass Rate:** _____%

### Critical Issues Found

```
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________
```

### Non-Critical Issues Found

```
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________
```

### Overall Assessment

- [ ] **PASS**: Plugin ready for production use
- [ ] **CONDITIONAL PASS**: Minor issues, usable with workarounds
- [ ] **FAIL**: Critical issues prevent normal use

**Tester Signature:** ___________________________ **Date:** __________

---

## Next Steps

If validation passes:
1. Document results in `TEST_RESULTS.md`
2. Update `README.md` with any new troubleshooting tips
3. Proceed to Phase 2: Achievement System specification

If validation fails:
1. Document failures in detail
2. Create GitHub issues for bugs found
3. Fix issues and re-run validation

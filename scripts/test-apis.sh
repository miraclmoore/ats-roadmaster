#!/bin/bash

# RoadMaster Pro - API Testing Script
# Tests all API endpoints to verify they're working

set -e

echo "🧪 RoadMaster Pro - API Testing"
echo "================================"
echo ""

# Configuration
BASE_URL="http://localhost:3002"
API_KEY="YOUR_API_KEY_HERE"  # Replace with actual API key from user_preferences table

echo "Testing against: $BASE_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Telemetry API
echo "1️⃣  Testing Telemetry API..."
TELEMETRY_RESPONSE=$(curl -s -X POST "$BASE_URL/api/telemetry" \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "'$API_KEY'",
    "speed": 65.5,
    "rpm": 1800,
    "gear": 8,
    "fuel_current": 85.2,
    "fuel_capacity": 150.0,
    "engine_damage": 0.02,
    "transmission_damage": 0.01,
    "chassis_damage": 0.0,
    "wheels_damage": 0.0,
    "cabin_damage": 0.0,
    "cargo_damage": 0.0,
    "position_x": 1234.5,
    "position_y": 567.8,
    "position_z": 90.1
  }')

if echo "$TELEMETRY_RESPONSE" | grep -q "success"; then
  echo -e "${GREEN}✅ Telemetry API: Working${NC}"
else
  echo -e "${RED}❌ Telemetry API: Failed${NC}"
  echo "Response: $TELEMETRY_RESPONSE"
fi
echo ""

# Test 2: Job Start API
echo "2️⃣  Testing Job Start API..."
JOB_START_RESPONSE=$(curl -s -X POST "$BASE_URL/api/jobs/start" \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "'$API_KEY'",
    "source_city": "Los Angeles",
    "source_company": "QuickFuel",
    "destination_city": "San Francisco",
    "destination_company": "Build-It Hardware",
    "cargo_type": "Electronics",
    "cargo_weight": 18500,
    "income": 12450,
    "distance": 382
  }')

if echo "$JOB_START_RESPONSE" | grep -q "job_id"; then
  JOB_ID=$(echo "$JOB_START_RESPONSE" | grep -o '"job_id":"[^"]*"' | cut -d'"' -f4)
  echo -e "${GREEN}✅ Job Start API: Working${NC}"
  echo "   Created job ID: $JOB_ID"
else
  echo -e "${RED}❌ Job Start API: Failed${NC}"
  echo "Response: $JOB_START_RESPONSE"
  JOB_ID=""
fi
echo ""

# Test 3: Job Complete API (if job was created)
if [ ! -z "$JOB_ID" ]; then
  echo "3️⃣  Testing Job Complete API..."
  JOB_COMPLETE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/jobs/complete" \
    -H "Content-Type: application/json" \
    -d '{
      "api_key": "'$API_KEY'",
      "job_id": "'$JOB_ID'",
      "delivered_late": false
    }')

  if echo "$JOB_COMPLETE_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ Job Complete API: Working${NC}"
    PROFIT=$(echo "$JOB_COMPLETE_RESPONSE" | grep -o '"profit":[^,}]*' | cut -d':' -f2)
    if [ ! -z "$PROFIT" ]; then
      echo "   Calculated profit: \$$PROFIT"
    fi
  else
    echo -e "${RED}❌ Job Complete API: Failed${NC}"
    echo "Response: $JOB_COMPLETE_RESPONSE"
  fi
  echo ""
fi

# Test 4: AI Dispatcher API (requires authentication, will test with logged-in user)
echo "4️⃣  Testing AI Dispatcher API..."
echo -e "${YELLOW}⚠️  AI Chat requires browser authentication${NC}"
echo "   To test:"
echo "   1. Go to http://localhost:3002/ai"
echo "   2. Log in if needed"
echo "   3. Try sending a message"
echo ""

# Summary
echo "================================"
echo "✅ API Testing Complete"
echo ""
echo "Next Steps:"
echo "1. Check Supabase Table Editor to see the data"
echo "2. View Dashboard at $BASE_URL/dashboard"
echo "3. Test AI Chat at $BASE_URL/ai"
echo ""
echo "📖 API Documentation:"
echo "  POST /api/telemetry       - Real-time truck data"
echo "  POST /api/jobs/start      - Start new job"
echo "  POST /api/jobs/complete   - Complete job"
echo "  POST /api/ai/chat         - AI recommendations"
echo ""

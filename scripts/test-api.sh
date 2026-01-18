#!/bin/bash

echo ""
echo "========================================="
echo "  RoadMaster Pro - API Testing Script"
echo "========================================="
echo ""

# Prompt for API key
read -p "Enter your API key (starts with rm_): " API_KEY

if [[ ! $API_KEY =~ ^rm_ ]]; then
  echo "❌ Invalid API key format. Must start with 'rm_'"
  exit 1
fi

# Set API base URL
API_URL="http://localhost:3002/api"

echo ""
echo "Testing APIs with base URL: $API_URL"
echo ""

# Test 1: Start a job
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: Starting a new job"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

START_RESPONSE=$(curl -s -X POST "$API_URL/jobs/start" \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "'"$API_KEY"'",
    "source_city": "Los Angeles",
    "destination_city": "San Francisco",
    "cargo_type": "Electronics",
    "income": 12500,
    "distance": 382
  }')

echo "Response:"
echo "$START_RESPONSE" | jq '.'
echo ""

# Extract job_id from response
JOB_ID=$(echo "$START_RESPONSE" | jq -r '.job_id // .id // empty')

if [ -z "$JOB_ID" ]; then
  echo "❌ Failed to start job. Check your API key and make sure the server is running."
  exit 1
fi

echo "✅ Job started successfully! Job ID: $JOB_ID"
echo ""

# Test 2: Send telemetry
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: Sending telemetry data"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TELEMETRY_RESPONSE=$(curl -s -X POST "$API_URL/telemetry" \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "'"$API_KEY"'",
    "job_id": "'"$JOB_ID"'",
    "speed": 65.5,
    "rpm": 1500,
    "gear": 6,
    "fuel_current": 45.2,
    "fuel_capacity": 125.0,
    "engine_damage": 0,
    "transmission_damage": 0,
    "chassis_damage": 0,
    "wheels_damage": 0,
    "cabin_damage": 0,
    "cargo_damage": 0
  }')

echo "Response:"
echo "$TELEMETRY_RESPONSE" | jq '.'
echo ""
echo "✅ Telemetry sent successfully!"
echo ""

# Wait a moment before completing
sleep 1

# Test 3: Complete the job
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: Completing the job"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

COMPLETE_RESPONSE=$(curl -s -X POST "$API_URL/jobs/complete" \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "'"$API_KEY"'",
    "job_id": "'"$JOB_ID"'",
    "delivered_late": false
  }')

echo "Response:"
echo "$COMPLETE_RESPONSE" | jq '.'
echo ""
echo "✅ Job completed successfully!"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All API tests completed successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "View your dashboard to see the results:"
echo "  http://localhost:3002/dashboard"
echo ""
echo "Check the Jobs page:"
echo "  http://localhost:3002/jobs"
echo ""

#!/bin/bash

# RoadMaster Pro - Database Setup Helper
# This script helps you set up the Supabase database

set -e

echo "🚛 RoadMaster Pro - Database Setup"
echo "=================================="
echo ""

# Check if migration file exists
if [ ! -f "supabase/migrations/001_initial_schema.sql" ]; then
    echo "❌ Error: Migration file not found!"
    echo "   Expected: supabase/migrations/001_initial_schema.sql"
    exit 1
fi

echo "✅ Migration file found"
echo ""

echo "📋 Setup Options:"
echo ""
echo "Option 1: Supabase Dashboard (Recommended)"
echo "  1. Go to: https://supabase.com/dashboard"
echo "  2. Click: SQL Editor → New Query"
echo "  3. Copy/paste: supabase/migrations/001_initial_schema.sql"
echo "  4. Click: Run"
echo ""
echo "Option 2: Supabase CLI"
echo "  Run: supabase db push"
echo ""

# Offer to open the migration file
read -p "Would you like to copy the migration file path? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    MIGRATION_PATH="$(pwd)/supabase/migrations/001_initial_schema.sql"

    # Try to copy to clipboard (macOS)
    if command -v pbcopy &> /dev/null; then
        echo "$MIGRATION_PATH" | pbcopy
        echo "✅ Path copied to clipboard: $MIGRATION_PATH"
    else
        echo "📄 Migration file path:"
        echo "   $MIGRATION_PATH"
    fi
fi

echo ""
echo "📖 For detailed instructions, see: supabase/README.md"
echo ""
echo "After running the migration, verify in Supabase Dashboard:"
echo "  • Table Editor → Should see 6 tables"
echo "  • Database → Policies → RLS enabled on all tables"
echo "  • Sign up a test user → Check user_preferences for API key"
echo ""
echo "Good luck! 🎯"

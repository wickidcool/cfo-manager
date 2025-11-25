#!/bin/bash

# Clear and Start Script for Mobile App
# This script clears all caches and starts the Expo dev server fresh

echo "🧹 Cleaning mobile app caches..."

# Remove .expo directory
if [ -d ".expo" ]; then
  echo "  ✓ Removing .expo directory"
  rm -rf .expo
fi

# Clear watchman if available
if command -v watchman &> /dev/null; then
  echo "  ✓ Clearing watchman cache"
  watchman watch-del-all 2>/dev/null || true
fi

# Clear Metro cache
echo "  ✓ Clearing Metro bundler cache"

echo ""
echo "🚀 Starting Expo with cleared cache..."
echo ""

# Start Expo with cleared cache
npx expo start -c


# React Error Fix - "Cannot read property 'ReactCurrentOwner'"

## The Errors You Were Seeing

```
TypeError: Cannot read property 'ReactCurrentOwner' of undefined
TypeError: Cannot read property 'render' of undefined
```

## Root Cause

This error occurs when React Native tries to use a React instance from the wrong location. In a monorepo setup:
- The workspace root has React 19 (for the web app)
- The mobile app needs React 18 (for React Native)

When Metro bundler resolves modules, it was finding React from the wrong location.

## Solution Applied ✅

### 1. **Added Local Dependencies** (`apps/mobile/package.json`)

Added explicit dependencies in the mobile app's package.json:
```json
{
  "dependencies": {
    "react": "18.3.1",
    "react-native": "0.76.5",
    "expo": "~52.0.0",
    "expo-status-bar": "~2.0.0",
    "axios": "^1.13.2",
    "zustand": "^5.0.8"
  }
}
```

This ensures the mobile app has its own React 18 instance.

### 2. **Updated Metro Config** (`metro.config.js`)

Added explicit module resolution for React:
```javascript
config.resolver.extraNodeModules = {
  '@aws-starter-kit/common-types': path.resolve(workspaceRoot, 'packages/common-types/src'),
  '@aws-starter-kit/api-client': path.resolve(workspaceRoot, 'packages/api-client/src'),
  // Force React Native to use its own React version
  'react': path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
};
```

This forces Metro to use the mobile app's local React installation.

### 3. **Enabled New Architecture** (`app.json`)

Added React Native's new architecture flag:
```json
{
  "expo": {
    "newArchEnabled": true
  }
}
```

This eliminates the warning about new architecture.

### 4. **Installed Local Dependencies**

Ran `npm install` in the `apps/mobile` directory to ensure all dependencies are locally available.

## How to Use

### Option 1: Use the Helper Script (Recommended)

```bash
cd apps/mobile
./clear-and-start.sh
```

This script:
- Removes `.expo` directory
- Clears watchman cache (if installed)
- Clears Metro cache
- Starts Expo with fresh cache

### Option 2: Manual Commands

```bash
cd apps/mobile
rm -rf .expo
npx expo start -c
```

## Verification

After starting with the fixes:

1. **Check the terminal output:**
   - Should say "Loading Metro config..."
   - No "Cannot read property" errors
   - No "newArchEnabled" warnings

2. **Open the app:**
   - Press `i` for iOS or `a` for Android
   - App should load successfully
   - UI should render correctly

3. **Test functionality:**
   - Fetch users button should work
   - Create user button should work
   - No crashes or errors

## Why This Happened

In a monorepo with multiple React versions:
1. Web app uses React 19 (latest)
2. Mobile app uses React 18 (React Native requirement)
3. Metro bundler was resolving React from the wrong location
4. React Native code tried to access React APIs that didn't exist or were in the wrong version
5. Result: "Cannot read property 'ReactCurrentOwner'" error

## Prevention

To prevent this in the future:

1. **Always install mobile dependencies locally:**
   ```bash
   cd apps/mobile
   npm install
   ```

2. **Clear cache when switching branches or after updates:**
   ```bash
   cd apps/mobile
   ./clear-and-start.sh
   ```

3. **Keep Metro config updated** if adding new shared packages

## Related Documentation

- `MODULE_RESOLUTION_FIX.md` - For "@aws-starter-kit/*" resolution issues
- `TROUBLESHOOTING.md` - For general troubleshooting
- `SETUP.md` - For initial setup instructions

## Summary

The error was caused by Metro resolving React from the workspace root (React 19) instead of the mobile app's local dependencies (React 18). We fixed this by:
1. Adding local dependencies to mobile app
2. Forcing Metro to use local React installation
3. Enabling new architecture flag
4. Installing dependencies locally

The app should now work correctly! 🎉


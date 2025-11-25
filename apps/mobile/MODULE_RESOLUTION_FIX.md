# Module Resolution Fix - Quick Reference

## Problem
```
Unable to resolve module @aws-starter-kit/api-client
Unable to resolve module @aws-starter-kit/common-types
```

## Solution Applied ✅

### 1. Created `metro.config.js`
Configures Metro bundler to understand monorepo structure and resolve workspace packages.

**Key features:**
- Watches entire workspace (monorepo root)
- Maps `@aws-starter-kit/*` packages to their source directories
- Resolves node_modules from both mobile app and workspace root

### 2. Updated `babel.config.js`
Added `babel-plugin-module-resolver` to resolve TypeScript path aliases.

**Key features:**
- Aliases `@aws-starter-kit/common-types` → `../../packages/common-types/src`
- Aliases `@aws-starter-kit/api-client` → `../../packages/api-client/src`

### 3. Installed Dependencies
- ✅ `babel-plugin-module-resolver` - Resolves module aliases at build time

## How to Start the App

### First Time (or after configuration changes):

```bash
cd apps/mobile
npx expo start -c
```

The `-c` flag clears the Metro cache, essential for picking up new configurations.

### Subsequent Starts:

```bash
# From workspace root
npm run mobile

# Or from mobile directory
cd apps/mobile
npx expo start
```

## Quick Fixes

### If module errors persist:

```bash
# 1. Clear Metro cache
cd apps/mobile
npx expo start -c

# 2. If that doesn't work, clear everything
rm -rf .expo
npx expo start -c

# 3. Nuclear option (start fresh)
cd ../..  # back to workspace root
rm -rf node_modules
npm install --legacy-peer-deps
cd apps/mobile
npx expo start -c
```

### Verify Configuration Files Exist:

```bash
cd apps/mobile
ls metro.config.js    # Should exist
ls babel.config.js    # Should exist and include module-resolver
```

### Check Module Resolution:

```bash
# These files should exist
ls ../../packages/common-types/src/index.ts
ls ../../packages/api-client/src/index.ts
```

## What Each File Does

### `metro.config.js`
- **Purpose**: Configures Metro bundler (React Native's bundler)
- **What it does**: 
  - Tells Metro to watch the entire monorepo
  - Maps `@aws-starter-kit/*` to actual file paths
  - Resolves node_modules from multiple locations

### `babel.config.js`
- **Purpose**: Configures Babel transformations
- **What it does**:
  - Transforms imports at build time
  - Resolves `@aws-starter-kit/*` aliases to relative paths
  - Works in conjunction with Metro

### `.npmrc`
- **Purpose**: NPM configuration
- **What it does**:
  - Sets `legacy-peer-deps=true`
  - Allows React 19 (web) and React 18 (mobile) to coexist

## Common Scenarios

### Scenario 1: Just cloned the repo
```bash
npm install --legacy-peer-deps
cd apps/mobile
npx expo start -c
```

### Scenario 2: Added new package to workspace
```bash
npm install --legacy-peer-deps
cd apps/mobile
npx expo start -c
```

### Scenario 3: Modified a shared package
```bash
cd apps/mobile
npx expo start -c
# Or just press 'r' in Expo to reload
```

### Scenario 4: Changed configuration files
```bash
cd apps/mobile
rm -rf .expo
npx expo start -c
```

## Validation

To verify everything is working:

1. **Start the app:**
   ```bash
   cd apps/mobile
   npx expo start -c
   ```

2. **Check logs:**
   - Should say "Loading Metro config..."
   - Should show workspace root in watch folders
   - No "Unable to resolve" errors

3. **App should:**
   - Load successfully
   - Show the UI
   - Not crash on import statements

## Files Created/Modified

✅ Created:
- `apps/mobile/metro.config.js` - Metro bundler configuration
- `apps/mobile/TROUBLESHOOTING.md` - Comprehensive troubleshooting guide
- `apps/mobile/MODULE_RESOLUTION_FIX.md` - This file

✅ Modified:
- `apps/mobile/babel.config.js` - Added module-resolver plugin
- `apps/mobile/SETUP.md` - Updated with Metro configuration notes
- `package.json` - Added `babel-plugin-module-resolver`

## References

- [Metro Configuration Docs](https://metrobundler.dev/docs/configuration)
- [Expo Monorepo Guide](https://docs.expo.dev/guides/monorepos/)
- [Babel Module Resolver](https://github.com/tleunen/babel-plugin-module-resolver)

## Summary

The issue was that Metro (React Native's bundler) doesn't automatically understand TypeScript path mappings from `tsconfig.json`. We've configured Metro and Babel to explicitly resolve the `@aws-starter-kit/*` packages to their source directories in the monorepo.

**Always remember:** After configuration changes, restart with cache clear: `npx expo start -c`


# Mobile App Troubleshooting Guide

## Module Resolution Issues

### Problem: "Unable to resolve module @aws-starter-kit/..."

This error occurs because Metro (React Native's bundler) doesn't automatically understand TypeScript path mappings from the monorepo.

### Solution Applied

We've configured Metro and Babel to properly resolve workspace packages:

#### 1. Metro Configuration (`metro.config.js`)

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
const workspaceRoot = path.resolve(__dirname, '../..');
const projectRoot = __dirname;

// Watch all files in the monorepo
config.watchFolders = [workspaceRoot];

// Configure module resolution
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Map workspace packages
config.resolver.extraNodeModules = {
  '@aws-starter-kit/common-types': path.resolve(workspaceRoot, 'packages/common-types/src'),
  '@aws-starter-kit/api-client': path.resolve(workspaceRoot, 'packages/api-client/src'),
};
```

#### 2. Babel Configuration (`babel.config.js`)

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@aws-starter-kit/common-types': '../../packages/common-types/src',
            '@aws-starter-kit/api-client': '../../packages/api-client/src',
          },
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        },
      ],
    ],
  };
};
```

### Steps to Fix

1. **Clear Metro Cache:**
   ```bash
   cd apps/mobile
   npx expo start -c
   ```

2. **Clear Watchman Cache (if using Watchman):**
   ```bash
   watchman watch-del-all
   ```

3. **Clear Node Modules (if needed):**
   ```bash
   rm -rf node_modules
   npm install --legacy-peer-deps
   ```

4. **Restart Expo:**
   ```bash
   npx expo start -c
   ```

## Common Issues

### Issue: Module not found after adding new package

**Solution:**
1. Stop the Metro bundler (Ctrl+C)
2. Clear the cache: `npx expo start -c`
3. Restart

### Issue: TypeScript errors in shared packages

**Solution:**
- Ensure `tsconfig.json` in mobile app extends the workspace base config
- Check that the shared packages compile without errors:
  ```bash
  nx build common-types
  nx build api-client
  ```

### Issue: "Cannot find module 'axios'" or similar

**Solution:**
- Make sure dependencies are installed at the workspace root:
  ```bash
  npm install --legacy-peer-deps
  ```

### Issue: React version conflicts

**Solution:**
- The workspace uses `.npmrc` with `legacy-peer-deps=true`
- This allows React 19 (web) and React 18 (mobile) to coexist
- Always use `npm install --legacy-peer-deps`

## Development Tips

### Fast Refresh Issues

If Fast Refresh stops working:
1. Press `R` in the terminal to reload
2. Or shake device and tap "Reload"

### Metro Bundler Hanging

If Metro seems stuck:
1. Kill the process: `pkill -f metro`
2. Clear cache: `npx expo start -c`
3. Restart

### iOS Simulator Issues

**Reset simulator:**
```bash
xcrun simctl erase all
```

**Reinstall app:**
```bash
# Remove app from simulator
# Then restart with: npx expo start --ios
```

### Android Emulator Issues

**Clear app data:**
```bash
adb shell pm clear host.exp.exponent
```

**Restart ADB:**
```bash
adb kill-server
adb start-server
```

## Verification

To verify everything is working:

1. **Check imports resolve:**
   ```typescript
   import type { User } from '@aws-starter-kit/common-types';
   import { apiClient } from '@aws-starter-kit/api-client';
   ```

2. **Check Metro config is loaded:**
   - Look for "Loading Metro config..." in terminal
   - Should show workspace root in watch folders

3. **Test in app:**
   - App should load without errors
   - API calls should work (if API is running)
   - Type checking should work in IDE

## Debug Mode

Run with verbose logging:
```bash
EXPO_DEBUG=true npx expo start -c
```

## Still Having Issues?

1. **Check file paths are correct:**
   ```bash
   ls ../../packages/common-types/src/index.ts
   ls ../../packages/api-client/src/index.ts
   ```

2. **Verify Metro config syntax:**
   ```bash
   node -c metro.config.js
   ```

3. **Check Babel config:**
   ```bash
   node -c babel.config.js
   ```

4. **Review Metro logs:**
   Look for "Unable to resolve" errors in the terminal output

5. **Try a clean slate:**
   ```bash
   # From workspace root
   rm -rf node_modules apps/mobile/node_modules
   npm install --legacy-peer-deps
   cd apps/mobile
   rm -rf .expo
   npx expo start -c
   ```

## Additional Resources

- [Metro Configuration](https://metrobundler.dev/docs/configuration)
- [Expo Monorepo Guide](https://docs.expo.dev/guides/monorepos/)
- [Babel Module Resolver](https://github.com/tleunen/babel-plugin-module-resolver)
- [Nx React Native](https://nx.dev/recipes/react/react-native)


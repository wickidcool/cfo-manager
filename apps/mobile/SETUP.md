# React Native Mobile App Setup

This document explains the React Native mobile app setup and how to get started.

## Overview

The mobile app is built with:
- **React Native**: Cross-platform mobile framework
- **Expo**: Development toolchain and SDK
- **TypeScript**: Full type safety
- **Zustand**: State management (same as web app)
- **Shared Packages**: Uses `@aws-starter-kit/common-types` and `@aws-starter-kit/api-client`

## Prerequisites

1. **Node.js 18+** and npm
2. **Expo CLI** (optional, will be installed automatically)
3. For iOS development:
   - macOS with Xcode installed
   - iOS Simulator
4. For Android development:
   - Android Studio with Android SDK
   - Android Emulator

## Quick Start

### 1. Install Dependencies

Dependencies are already installed during the initial setup. If you need to reinstall:

```bash
npm install --legacy-peer-deps
```

**Note**: The `--legacy-peer-deps` flag is required because the web app uses React 19 while React Native currently requires React 18. This is handled automatically via the `.npmrc` file.

### Important: Metro Bundler Configuration

The mobile app includes special Metro and Babel configuration to resolve workspace packages (`@aws-starter-kit/common-types` and `@aws-starter-kit/api-client`). These configurations are in:
- `metro.config.js` - Metro bundler configuration
- `babel.config.js` - Babel module resolver configuration

**If you encounter module resolution errors**, see `TROUBLESHOOTING.md` for solutions.

### 2. Start Development Server

**Important**: Always start with a clean cache the first time:

```bash
cd apps/mobile
npx expo start -c
```

The `-c` flag clears the Metro cache, which is important for resolving workspace packages.

From the workspace root (subsequent starts):

```bash
npm run mobile
```

Or using Nx directly:

```bash
nx start mobile
```

This will start the Expo development server. You can then:
- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan the QR code with Expo Go app on your physical device
- Press `r` to reload the app
- Press `c` to clear Metro cache

### 3. Run on Specific Platform

**iOS:**
```bash
npm run mobile:ios
# or
nx start:ios mobile
```

**Android:**
```bash
npm run mobile:android
# or
nx start:android mobile
```

### 4. Run Tests

```bash
npm run test:mobile
# or
nx test mobile
```

## Configuration

### API Endpoint

Update the API URL in `src/config/api.ts`:

```typescript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-api-gateway-url.amazonaws.com';
```

You can also create a `.env` file in the mobile app directory:

```bash
# apps/mobile/.env
EXPO_PUBLIC_API_URL=https://your-api-gateway-url.amazonaws.com
```

### App Assets

The app requires the following image assets in `assets/`:
- `icon.png` (1024x1024px) - App icon
- `splash.png` (1284x2778px) - Splash screen
- `adaptive-icon.png` (1024x1024px) - Android adaptive icon
- `favicon.png` (48x48px) - Web favicon

See `assets/README.md` for more details on creating these assets.

### App Configuration

Update `app.json` to customize:
- App name and slug
- Bundle identifiers for iOS and Android
- Splash screen and icon settings
- Platform-specific configurations

## Project Structure

```
apps/mobile/
├── src/
│   ├── config/
│   │   └── api.ts          # API client configuration
│   ├── store/
│   │   └── user-store.ts   # Zustand state management
│   ├── App.tsx             # Main app component
│   └── test-setup.ts       # Test configuration
├── assets/                 # Image assets
├── app.json                # Expo configuration
├── babel.config.js         # Babel configuration
├── index.js                # Entry point
├── jest.config.ts          # Jest configuration
├── package.json            # Dependencies
├── project.json            # Nx configuration
└── tsconfig.json           # TypeScript configuration
```

## Shared Code

The mobile app shares the following packages with the web app:

### @aws-starter-kit/common-types
- User types
- API response types
- Common utilities and constants

### @aws-starter-kit/api-client
- Type-safe API client
- Error handling
- Request/response interceptors

Any changes to these shared packages will automatically be reflected in both web and mobile apps.

## Development Tips

### Hot Reloading
Expo provides fast refresh out of the box. Changes to your code will be reflected immediately in the app.

### Debugging
- Shake your device or press `Cmd+D` (iOS) / `Cmd+M` (Android) to open the debug menu
- Enable remote debugging to use Chrome DevTools
- Use React DevTools for component inspection

### Testing on Physical Device
1. Install Expo Go from App Store (iOS) or Play Store (Android)
2. Scan the QR code from the Expo development server
3. The app will load on your device

## Building for Production

### EAS Build (Recommended)

Install EAS CLI:
```bash
npm install -g eas-cli
```

Login to Expo:
```bash
eas login
```

Configure and build:
```bash
cd apps/mobile
eas build:configure
eas build --platform ios
eas build --platform android
```

### Classic Expo Build

**iOS:**
```bash
nx build:ios mobile
```

**Android:**
```bash
nx build:android mobile
```

## Troubleshooting

### Module Resolution Errors

If you see errors like "Unable to resolve module @aws-starter-kit/...":

1. **Clear Metro cache:**
   ```bash
   cd apps/mobile
   npx expo start -c
   ```

2. **Verify configurations exist:**
   - `metro.config.js` - Metro bundler configuration
   - `babel.config.js` - Should include module-resolver plugin

3. **See detailed troubleshooting:** Check `TROUBLESHOOTING.md` for comprehensive solutions

### Port Already in Use
If port 8081 is already in use, kill the process:
```bash
lsof -ti:8081 | xargs kill
```

### Cache Issues
Clear Expo and Nx cache:
```bash
nx reset
cd apps/mobile && npx expo start -c
```

### Dependency Conflicts
If you encounter peer dependency issues:
```bash
npm install --legacy-peer-deps
```

### TypeScript Errors
Ensure TypeScript paths are correctly configured in `tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@aws-starter-kit/common-types": ["packages/common-types/src/index.ts"],
      "@aws-starter-kit/api-client": ["packages/api-client/src/index.ts"]
    }
  }
}
```

### Still Having Issues?

See `TROUBLESHOOTING.md` for detailed solutions to common problems.

## Next Steps

1. **Add Assets**: Create proper app icons and splash screens (see `assets/README.md`)
2. **Configure API**: Update the API endpoint in `src/config/api.ts`
3. **Customize UI**: Modify `src/App.tsx` to match your app's design
4. **Add Features**: Create new screens and components
5. **Set Up Navigation**: Consider adding React Navigation for multi-screen apps
6. **Configure App Store**: Update bundle identifiers and app metadata in `app.json`

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Nx Documentation](https://nx.dev/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/)

## Support

For issues specific to:
- Expo: https://github.com/expo/expo/issues
- Nx: https://github.com/nrwl/nx/issues
- React Native: https://github.com/facebook/react-native/issues


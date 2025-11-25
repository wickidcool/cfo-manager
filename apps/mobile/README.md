# Mobile App

React Native mobile application built with Expo, using shared packages from the monorepo.

## Features

- **React Native with Expo**: Cross-platform mobile development
- **TypeScript**: Full type safety
- **Shared Packages**: Uses `@aws-starter-kit/common-types` and `@aws-starter-kit/api-client`
- **Zustand**: Lightweight state management
- **Axios**: Type-safe API client

## Development

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator

### Start Development Server

**First time or after configuration changes:**

```bash
cd apps/mobile
./clear-and-start.sh
```

**Or manually:**

```bash
cd apps/mobile
rm -rf .expo
npx expo start -c
```

**Subsequent starts (from workspace root):**

```bash
nx start mobile
```

**Or directly:**

```bash
cd apps/mobile
npm start
```

### Run on iOS

```bash
nx start:ios mobile
```

### Run on Android

```bash
nx start:android mobile
```

### Run Tests

```bash
nx test mobile
```

## Configuration

Update the API URL in `src/config/api.ts` to point to your deployed API Gateway endpoint.

For environment-specific configuration, you can use:
- `.env.development`
- `.env.production`

## Building for Production

### iOS

```bash
nx build:ios mobile
```

### Android

```bash
nx build:android mobile
```

## Project Structure

```
apps/mobile/
├── src/
│   ├── config/         # API configuration
│   ├── store/          # Zustand stores
│   ├── App.tsx         # Main app component
│   └── test-setup.ts   # Test configuration
├── app.json            # Expo configuration
├── babel.config.js     # Babel configuration
├── jest.config.ts      # Jest configuration
├── package.json        # Dependencies
├── project.json        # Nx configuration
└── tsconfig.json       # TypeScript configuration
```

## Shared Packages

This app uses the following shared packages:

- `@aws-starter-kit/common-types`: Shared TypeScript types
- `@aws-starter-kit/api-client`: Type-safe API client

Any changes to these packages will automatically be reflected in the mobile app.


# Mobile App Environment Setup

## Creating Your Environment File

Create a `.env` file in the `apps/mobile` directory:

```bash
cd apps/mobile
cp ENV_SETUP.md .env  # Then edit .env
```

## Environment Variables

Copy and paste these into your `.env` file:

```bash
# Mobile App Environment Variables
#
# Expo will automatically load .env during development.
# All environment variables must be prefixed with EXPO_PUBLIC_
# to be accessible in the app.

# API Configuration
# ==================

# API Base URL (required for mobile)
# For local development on simulator: http://localhost:3000
# For local development on physical device: http://YOUR_COMPUTER_IP:3000
# For production: https://your-api-gateway-url.amazonaws.com
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000

# Request timeout in milliseconds (default: 30000)
# EXPO_PUBLIC_API_TIMEOUT=30000

# API Key for authentication (if required)
# EXPO_PUBLIC_API_KEY=your-api-key-here

# Send credentials (cookies) with requests (default: false)
# EXPO_PUBLIC_API_WITH_CREDENTIALS=false

# Enable debug logging (default: false)
# EXPO_PUBLIC_API_DEBUG=true
```

## Physical Device Setup

When testing on a physical device, `localhost` won't work. You need to use your computer's local IP address.

### Find Your Computer's IP Address

**macOS:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Linux:**
```bash
hostname -I
```

**Windows:**
```bash
ipconfig
```

### Update Environment Variable

```bash
# Replace 192.168.1.100 with your actual IP
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:3000
```

**Important**: Your phone and computer must be on the same Wi-Fi network.

## Using Environment Variables

The API client is already configured to use these variables in `src/config/api.ts`:

```typescript
import { createApiClient, createConfigFromEnv } from '@aws-starter-kit/api-client';

export const apiClient = createApiClient(createConfigFromEnv());
```

## Environment-Specific Configurations

### Development (Simulator)

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_API_DEBUG=true
```

### Development (Physical Device)

```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:3000
EXPO_PUBLIC_API_DEBUG=true
```

### Production

```bash
EXPO_PUBLIC_API_BASE_URL=https://your-api-gateway-url.amazonaws.com
EXPO_PUBLIC_API_DEBUG=false
```

## Important Notes

1. **Restart Required**: After changing environment variables, restart Expo:
   ```bash
   ./clear-and-start.sh
   ```

2. **Prefix Required**: All variables must start with `EXPO_PUBLIC_`

3. **No Secrets**: These variables are bundled with your app - don't put sensitive secrets here

4. **Git Ignored**: `.env` is automatically ignored by git

5. **Physical Device**: Remember to use your computer's IP, not `localhost`

## Expo Environment Files

Expo supports these environment files (in order of precedence):

1. `.env.local` - Local overrides (highest priority)
2. `.env.development` - Development mode
3. `.env.production` - Production mode  
4. `.env` - Base environment file

For most use cases, `.env` is sufficient.

## Debug Mode

Enable debug mode to see configuration logs:

```bash
EXPO_PUBLIC_API_DEBUG=true
```

When you start the app, check the Metro console for:
```
[API Client] Configuration: {
  baseURL: 'http://localhost:3000',
  timeout: 30000,
  withCredentials: false,
  hasApiKey: false
}
```

## Troubleshooting

### Variables Not Loading

1. Ensure they start with `EXPO_PUBLIC_`
2. Restart Expo with cache clear: `./clear-and-start.sh`
3. Check for typos in variable names
4. Verify file is named `.env` (not `.env.txt`)

### Cannot Connect to API on Physical Device

1. Verify your computer's IP address is correct
2. Make sure phone and computer are on the same Wi-Fi network
3. Check that the API server is running on your computer
4. Try the IP in your phone's browser: `http://192.168.1.100:3000/api/users`
5. Check your computer's firewall isn't blocking port 3000

### API Requests Timing Out

Increase the timeout:
```bash
EXPO_PUBLIC_API_TIMEOUT=60000
```

### Debug Not Working

Make sure you're checking the Metro bundler console output, not the device console.

## Alternative: Config File

If you prefer, you can also create environment-specific config files:

```typescript
// src/config/environments.ts
const environments = {
  development: {
    apiBaseUrl: 'http://localhost:3000',
  },
  production: {
    apiBaseUrl: 'https://your-api-gateway-url.amazonaws.com',
  },
};

const env = __DEV__ ? 'development' : 'production';
export const config = environments[env];
```

But using environment variables is more flexible and follows best practices.



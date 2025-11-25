# Environment-Based Configuration

The API client now supports environment-based configuration using dotenv-style variables. This allows you to configure the API client without hardcoding values.

## What Was Added

### New Files

1. **`src/config.ts`** - Configuration utilities
   - `createConfig()` - Create config with smart defaults
   - `createConfigFromEnv()` - Create config from environment variables
   - `getDefaultBaseURL()` - Get default API URL for current environment
   - `DEFAULT_API_CONFIG` - Default configuration values

2. **`ENV_EXAMPLE.md`** - Environment variable examples for all platforms

3. **Updated `src/index.ts`** - Export configuration utilities

### Updated Files

1. **`apps/web/src/config/api.ts`** - Now uses `createConfig()`
2. **`apps/mobile/src/config/api.ts`** - Now uses `createConfigFromEnv()`

### Documentation

1. **`apps/web/ENV_SETUP.md`** - Web app environment setup guide
2. **`apps/mobile/ENV_SETUP.md`** - Mobile app environment setup guide
3. **`README.md`** - Updated with configuration examples

## How It Works

The configuration utility automatically detects the environment and loads variables with the appropriate prefix:

| Environment | Prefix | Example |
|------------|--------|---------|
| Vite (Web) | `VITE_` | `VITE_API_BASE_URL` |
| Expo (Mobile) | `EXPO_PUBLIC_` | `EXPO_PUBLIC_API_BASE_URL` |
| Node.js | None | `API_BASE_URL` |

## Supported Variables

All environments support these configuration options:

- **`API_BASE_URL`** - API base URL (e.g., `http://localhost:3000`)
- **`API_TIMEOUT`** - Request timeout in milliseconds (default: 30000)
- **`API_KEY`** - API key for authentication (optional)
- **`API_WITH_CREDENTIALS`** - Send cookies with requests (default: false)
- **`API_DEBUG`** - Enable debug logging (default: false)

## Usage Examples

### Web App (Vite)

**Before:**
```typescript
import { createApiClient } from '@aws-starter-kit/api-client';

export const apiClient = createApiClient({
  baseURL: getApiBaseUrl(), // Manual function
  timeout: 30000,
});
```

**After:**
```typescript
import { createApiClient, createConfig } from '@aws-starter-kit/api-client';

export const apiClient = createApiClient(createConfig());
```

Create `apps/web/.env.local`:
```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_API_DEBUG=true
```

### Mobile App (Expo)

**Before:**
```typescript
import { createApiClient } from '@aws-starter-kit/api-client';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'default-url';

export const apiClient = createApiClient({
  baseURL: API_BASE_URL,
  timeout: 30000,
});
```

**After:**
```typescript
import { createApiClient, createConfigFromEnv } from '@aws-starter-kit/api-client';

export const apiClient = createApiClient(createConfigFromEnv());
```

Create `apps/mobile/.env`:
```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_API_DEBUG=true
```

## Smart Defaults

### `createConfig()` (Recommended for Web)

Automatically detects the API URL:

- **Local development** (`localhost`): `http://localhost:3000`
- **Production**: Uses `window.location.origin`

```typescript
const config = createConfig();
// No .env needed for basic usage
```

With environment override:
```bash
# .env.local
VITE_API_BASE_URL=https://api.staging.example.com
```

### `createConfigFromEnv()` (Recommended for Mobile)

Loads from environment variables with fallback defaults:

```typescript
const config = createConfigFromEnv();
// Requires EXPO_PUBLIC_API_BASE_URL in .env
```

## Configuration Priority

1. **Explicit overrides** (passed to functions)
2. **Environment variables** (from .env files)
3. **Smart defaults** (auto-detection)
4. **Fallback defaults** (hardcoded)

Example:
```typescript
// Override takes precedence over env vars
const config = createConfig({
  baseURL: 'https://api.example.com',  // This wins
  timeout: 60000,                       // This wins
});
```

## Debug Mode

Enable debug logging to see configuration:

**Web:**
```bash
VITE_API_DEBUG=true
```

**Mobile:**
```bash
EXPO_PUBLIC_API_DEBUG=true
```

Console output:
```
[API Client] Configuration: {
  baseURL: 'http://localhost:3000',
  timeout: 30000,
  withCredentials: false,
  hasApiKey: false
}
```

## Benefits

1. **Environment-Specific**: Different configs for dev, staging, prod
2. **No Hardcoding**: Configuration lives in .env files
3. **Git-Friendly**: .env files are ignored, .env.example checked in
4. **Type-Safe**: Full TypeScript support
5. **Cross-Platform**: Works in web, mobile, and Node.js
6. **Secure**: Sensitive values stay out of source code
7. **Flexible**: Override any setting programmatically

## Migration Guide

### For Web Apps

1. Remove manual `getApiBaseUrl()` function
2. Import `createConfig` from api-client
3. Replace `createApiClient({ baseURL: ... })` with `createApiClient(createConfig())`
4. (Optional) Create `.env.local` for custom config

### For Mobile Apps

1. Import `createConfigFromEnv` from api-client
2. Replace manual config object with `createConfigFromEnv()`
3. Create `.env` file with `EXPO_PUBLIC_API_BASE_URL`
4. Restart Expo with cache clear

## Troubleshooting

### Variables Not Loading

1. Check prefix matches environment (VITE_, EXPO_PUBLIC_, or none)
2. Restart dev server after changing .env
3. Verify variable names are exact (case-sensitive)
4. Check .env file location (must be in app directory)

### Web: Vite Variables Not Working

- Variables must start with `VITE_`
- Use `.env.local` for local overrides
- Restart Vite dev server

### Mobile: Expo Variables Not Working

- Variables must start with `EXPO_PUBLIC_`
- Clear Expo cache: `./clear-and-start.sh`
- Check Metro bundler console for errors

## Security Notes

- **Never commit secrets** to .env files
- Web: VITE_ variables are exposed in browser (public data only)
- Mobile: EXPO_PUBLIC_ variables are bundled in app (public data only)
- For sensitive tokens, use secure backend auth flow
- `.env.local` and `.env` are git-ignored by default

## Reference

See these files for detailed setup:
- `apps/web/ENV_SETUP.md` - Web app configuration
- `apps/mobile/ENV_SETUP.md` - Mobile app configuration
- `ENV_EXAMPLE.md` - Quick reference for all platforms
- `README.md` - Usage examples and API reference



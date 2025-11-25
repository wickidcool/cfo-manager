# Web App Environment Setup

## Creating Your Environment File

Create a `.env.local` file in the `apps/web` directory:

```bash
cd apps/web
cp ENV_SETUP.md .env.local  # Then edit .env.local
```

## Environment Variables

Copy and paste these into your `.env.local` file:

```bash
# Web App Environment Variables
#
# Vite will automatically load .env.local during development.
# These variables must be prefixed with VITE_ to be exposed to the browser.

# API Configuration
# ==================

# API Base URL
# Leave commented to auto-detect based on window.location.origin
# Uncomment and set for custom API URL:
# VITE_API_BASE_URL=http://localhost:3000

# Request timeout in milliseconds (default: 30000)
# VITE_API_TIMEOUT=30000

# API Key for authentication (if required)
# VITE_API_KEY=your-api-key-here

# Send credentials (cookies) with requests (default: false)
# VITE_API_WITH_CREDENTIALS=false

# Enable debug logging (default: false)
# VITE_API_DEBUG=true
```

## Auto-Detection

If `VITE_API_BASE_URL` is not set, the API client will automatically determine the URL:

- **Local Development** (`localhost`): `http://localhost:3000`
- **Production**: Uses `window.location.origin`

This works seamlessly with the CloudFront + API Gateway setup where:
- Web is served from: `https://your-domain.com`
- API is accessed at: `https://your-domain.com/api/*`

## Using Environment Variables

The API client is already configured to use these variables in `src/config/api.ts`:

```typescript
import { createApiClient, createConfig } from '@aws-starter-kit/api-client';

export const apiClient = createApiClient(createConfig());
```

## Testing Different Environments

### Local API (default)

No .env.local needed - will use `http://localhost:3000`

### Custom API URL

Create `.env.local`:
```bash
VITE_API_BASE_URL=https://api.staging.example.com
```

### Debug Mode

Create `.env.local`:
```bash
VITE_API_DEBUG=true
```

Then check the browser console for configuration logs.

## Important Notes

1. **Restart Required**: After changing environment variables, restart the Vite dev server
2. **Client-Side Only**: These variables are exposed to the browser
3. **No Secrets**: Don't put sensitive secrets in VITE_ variables
4. **Git Ignored**: `.env.local` is automatically ignored by git

## Vite Environment Files

Vite loads environment files in this order (highest priority first):

1. `.env.[mode].local` - Mode-specific local file (e.g., `.env.development.local`)
2. `.env.local` - Local file for all modes
3. `.env.[mode]` - Mode-specific file (e.g., `.env.production`)
4. `.env` - Base environment file

For most use cases, `.env.local` is sufficient.

## Troubleshooting

### Variables Not Loading

1. Ensure they start with `VITE_`
2. Restart the dev server
3. Check for typos in variable names
4. Verify file is named `.env.local` (not `.env.local.txt`)

### API URL Not Working

Check the browser console for:
```
[API Config] Local development - API URL: http://localhost:3000
```

If you don't see this, the configuration isn't loading properly.


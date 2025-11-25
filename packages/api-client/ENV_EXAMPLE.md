# Environment Variables Example

Copy these to your app's `.env` file and update the values as needed.

## For Web App (Vite)

Create `apps/web/.env`:

```bash
# API Base URL
# For local development: http://localhost:3000
# For production: https://your-api-gateway-url.amazonaws.com
VITE_API_BASE_URL=http://localhost:3000

# Request timeout in milliseconds
VITE_API_TIMEOUT=30000

# API Key (if using authentication)
# VITE_API_KEY=your-api-key-here

# Send credentials (cookies) with requests
VITE_API_WITH_CREDENTIALS=false

# Enable debug logging
VITE_API_DEBUG=false
```

## For Mobile App (Expo)

Create `apps/mobile/.env`:

```bash
# API Base URL
# For local development: http://localhost:3000
# For production: https://your-api-gateway-url.amazonaws.com
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000

# Request timeout in milliseconds
EXPO_PUBLIC_API_TIMEOUT=30000

# API Key (if using authentication)
# EXPO_PUBLIC_API_KEY=your-api-key-here

# Send credentials (cookies) with requests
EXPO_PUBLIC_API_WITH_CREDENTIALS=false

# Enable debug logging
EXPO_PUBLIC_API_DEBUG=false
```

## For Node.js (Backend/Scripts)

Create `.env` in your script directory:

```bash
# API Base URL
API_BASE_URL=http://localhost:3000

# Request timeout in milliseconds
API_TIMEOUT=30000

# API Key (if using authentication)
API_KEY=your-api-key-here

# Send credentials (cookies) with requests
API_WITH_CREDENTIALS=false

# Enable debug logging
API_DEBUG=false
```

## Environment Variable Naming

The config utility automatically detects the environment and looks for variables with these prefixes:

- **Vite (Web)**: `VITE_*`
- **Expo (Mobile)**: `EXPO_PUBLIC_*`
- **Node.js**: No prefix

All environments support the same base variable names:
- `API_BASE_URL`
- `API_TIMEOUT`
- `API_KEY`
- `API_WITH_CREDENTIALS`
- `API_DEBUG`


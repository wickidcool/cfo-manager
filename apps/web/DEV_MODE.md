# Development Mode Guide

The web app now has full development mode support with hot module replacement, environment variables, and optimized developer experience.

## Starting the App

### Development Mode (Default)

```bash
npm run web
# or
npm run web:dev
# or
nx serve web
```

This starts the Vite dev server with:
- **Hot Module Replacement (HMR)** - Instant updates without page reload
- **Fast Refresh** - React components update without losing state
- **Source Maps** - Easier debugging with original source code
- **Development Build** - Unminified code for better error messages
- **Port 3000** - Default development port

### Production Mode

```bash
npm run web:prod
```

This starts the dev server with production-like settings:
- Minified code
- No source maps
- Production optimizations

## Features

### 1. Hot Module Replacement (HMR)

Changes to your code are instantly reflected in the browser without a full page reload:

- **React Components** - Update without losing component state
- **CSS/Styles** - Instant style updates
- **Fast Refresh** - Preserves component state during edits

### 2. Environment Variables

Create `.env.local` to customize your development environment:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=30000
VITE_API_KEY=dev-key-here
VITE_API_DEBUG=true

# Custom Dev Settings
VITE_CUSTOM_VAR=value
```

**Load Priority:**
1. `.env.local` - Local overrides (highest priority, git-ignored)
2. `.env.development` - Development defaults
3. `.env` - Base defaults

### 3. API Proxy

The dev server automatically proxies `/api/*` requests to your backend:

```typescript
// This request goes to http://localhost:3000/api/users
fetch('/api/users')
```

**Default Backend:** `http://localhost:3000`  
**Custom Backend:** Set `VITE_API_BASE_URL` in `.env.local`

### 4. Optimized Dependencies

These packages are pre-bundled for faster startup:
- React & React DOM
- Chakra UI
- Zustand
- Axios

### 5. Chunk Splitting

Production builds split code into optimized chunks:
- `react-vendor` - React and React DOM
- `chakra-vendor` - Chakra UI components
- `utils` - Zustand, Axios, utilities

This enables better caching and faster subsequent loads.

### 6. Global Constants

Available in your code:

```typescript
if (__DEV__) {
  console.log('Running in development mode');
}

if (__PROD__) {
  console.log('Running in production mode');
}
```

TypeScript definitions:
```typescript
declare const __DEV__: boolean;
declare const __PROD__: boolean;
```

## Development Workflow

### 1. Start Development Server

```bash
npm run web
```

Server starts at `http://localhost:3000`

### 2. Make Changes

Edit any file in `src/` - changes appear instantly in the browser.

### 3. Check Console

The browser console shows:
- API configuration
- Component updates
- Any errors or warnings

### 4. Debug with Source Maps

Open DevTools → Sources → see original TypeScript code with proper line numbers.

## Advanced Configuration

### Custom Port

Modify `apps/web/project.json`:

```json
{
  "targets": {
    "serve": {
      "options": {
        "port": 4000
      }
    }
  }
}
```

### Custom Proxy Rules

Edit `apps/web/vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
    '/auth': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
}
```

### Additional Babel Plugins

Add to `vite.config.ts`:

```typescript
react({
  babel: {
    plugins: [
      // Add Babel plugins here
    ],
  },
})
```

## Build Modes

### Development Build

```bash
npm run build:web:dev
```

Creates development build in `dist/apps/web`:
- Source maps enabled
- Not minified
- Easier to debug

### Production Build

```bash
npm run build:web
```

Creates production build:
- Minified
- Optimized chunks
- Tree-shaken
- No source maps (by default)

## Troubleshooting

### Port Already in Use

If port 3000 is taken, Vite will try the next available port (3001, 3002, etc.)

To force a specific port:
```bash
nx serve web --port=4000
```

### HMR Not Working

1. **Clear Vite cache:**
   ```bash
   rm -rf node_modules/.vite
   npm run web
   ```

2. **Check for syntax errors** - HMR fails silently on syntax errors

3. **Restart dev server** - Sometimes a restart is needed

### Environment Variables Not Loading

1. Variables must start with `VITE_`
2. Restart dev server after changing `.env` files
3. Check file is named correctly (`.env.local` not `.env.local.txt`)

### API Proxy Not Working

1. Verify backend is running on the target port
2. Check `VITE_API_BASE_URL` setting
3. Look for CORS errors in console
4. Restart dev server after config changes

### Slow Startup

1. **Clear cache:**
   ```bash
   rm -rf node_modules/.vite
   ```

2. **Check dependencies** - Ensure all packages are installed

3. **Close other apps** - Free up system resources

## Performance Tips

### 1. Use Fast Refresh

React Fast Refresh preserves component state. Structure components to take advantage:

```typescript
// Good - state preserved
export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### 2. Lazy Loading

```typescript
const LazyComponent = lazy(() => import('./LazyComponent'));
```

### 3. Memoization

```typescript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

### 4. Code Splitting

```typescript
// Splits at route level
const Users = lazy(() => import('./pages/Users'));
```

## VS Code Integration

### Recommended Extensions

- ESLint
- Prettier
- Vite (for syntax highlighting)
- TypeScript + JavaScript

### Settings

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run web` | Start dev server (development mode) |
| `npm run web:dev` | Start dev server (explicit development) |
| `npm run web:prod` | Start dev server (production mode) |
| `npm run build:web` | Build for production |
| `npm run build:web:dev` | Build for development |
| `npm run test:web` | Run tests |
| `npm run test:watch` | Run tests in watch mode |

## Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Fast Refresh](https://reactnative.dev/docs/fast-refresh)
- [Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [HMR API](https://vitejs.dev/guide/api-hmr.html)


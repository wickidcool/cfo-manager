# Web App Quick Start

Get the web app running in development mode in seconds.

## 🚀 Quick Start (2 Steps)

### 1. Start the Development Server

```bash
npm run web
```

Or from the web app directory:

```bash
cd apps/web
npm start
```

### 2. Open Your Browser

The app automatically opens at:
```
http://localhost:3000
```

That's it! 🎉

## What You Get

✅ **Hot Module Replacement (HMR)** - Instant updates without page reload  
✅ **Fast Refresh** - React components update without losing state  
✅ **TypeScript Support** - Full type checking and IntelliSense  
✅ **Auto API Detection** - Automatically connects to API at `localhost:3000`  
✅ **Source Maps** - Debug with original TypeScript code  
✅ **Error Overlay** - Helpful error messages in the browser

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run web` | Start dev server (recommended) |
| `npm run web:dev` | Start dev server (explicit dev mode) |
| `npm run web:prod` | Start dev server with production build |
| `npm run build:web` | Build for production |
| `npm run build:web:dev` | Build for development (with source maps) |
| `npm run test:web` | Run tests |
| `npm run test:watch` | Run tests in watch mode |

## Configuration (Optional)

### Custom API URL

Create `.env.local`:

```bash
cd apps/web
cat > .env.local << 'EOF'
VITE_API_BASE_URL=http://localhost:3000
VITE_API_DEBUG=true
EOF
```

### Enable Debug Mode

```bash
echo "VITE_API_DEBUG=true" >> .env.local
```

## Features

### Hot Module Replacement

Edit any file in `src/` and see changes instantly:

1. Open `src/App.tsx`
2. Change some text
3. Save the file
4. See changes immediately in browser (no reload!)

### React Fast Refresh

Component state is preserved during edits:

1. Interact with the UI (e.g., load users)
2. Edit the component code
3. Save
4. Your data is still there!

### Development Tools

Open browser DevTools (`F12` or `Cmd+Opt+I`):

- **Console** - See API configuration and logs
- **Elements** - Inspect and modify DOM/CSS
- **Sources** - Debug with TypeScript source maps
- **Network** - Monitor API calls
- **React DevTools** - Inspect component tree

## Project Structure

```
apps/web/
├── src/
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   ├── config/
│   │   └── api.ts           # API client configuration
│   ├── store/
│   │   └── user-store.ts    # Zustand state management
│   ├── theme/
│   │   └── index.ts         # Chakra UI theme
│   └── vite-env.d.ts        # TypeScript definitions
├── public/                  # Static assets
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── .env.local              # Your local environment (create this)
```

## Customization

### Change Port

Edit `apps/web/project.json`:

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

Or use command line:

```bash
nx serve web --port=4000
```

### Add Environment Variables

Any variable starting with `VITE_` is available in your code:

```bash
# .env.local
VITE_FEATURE_FLAG=true
VITE_CUSTOM_VAR=value
```

```typescript
// Use in code
if (import.meta.env.VITE_FEATURE_FLAG) {
  console.log('Feature enabled!');
}
```

## Troubleshooting

### Port Already in Use

Vite will automatically try the next available port (3001, 3002, etc.)

Or specify a different port:
```bash
nx serve web --port=4000
```

### Changes Not Appearing

1. Check console for errors
2. Try hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
3. Clear cache and restart:
   ```bash
   rm -rf node_modules/.vite
   npm run web
   ```

### TypeScript Errors

If you see type errors:

1. Restart TypeScript server in VS Code: `Cmd+Shift+P` → "TypeScript: Restart TS Server"
2. Check `tsconfig.json` for errors
3. Ensure all dependencies are installed: `npm install`

### HMR Not Working

1. Clear Vite cache: `rm -rf node_modules/.vite`
2. Check for syntax errors
3. Restart dev server

### API Requests Failing

1. Verify backend is running
2. Check API URL in console logs
3. Look for CORS errors
4. Set `VITE_API_DEBUG=true` in `.env.local`

## Next Steps

1. **Read the docs:**
   - `DEV_MODE.md` - Comprehensive development guide
   - `ENV_SETUP.md` - Environment variable configuration
   - `README.md` - Project overview

2. **Customize the app:**
   - Edit `src/App.tsx` - Main component
   - Modify `src/theme/index.ts` - Chakra UI theme
   - Add new components in `src/`

3. **Connect to API:**
   - Start the backend (if available)
   - Or configure API URL in `.env.local`

4. **Deploy:**
   - Build: `npm run build:web`
   - Output in: `dist/apps/web/`

## Tips

- **Use TypeScript** - Types help catch errors early
- **Install React DevTools** - Browser extension for React debugging
- **Enable ESLint** - Auto-format on save in VS Code
- **Use git branches** - Create feature branches for new work
- **Read error messages** - Vite provides helpful error overlays

## Help & Resources

- **Vite Docs:** https://vitejs.dev/
- **React Docs:** https://react.dev/
- **Chakra UI:** https://chakra-ui.com/
- **Zustand:** https://docs.pmnd.rs/zustand/
- **TypeScript:** https://www.typescriptlang.org/

---

**Happy coding!** 🚀


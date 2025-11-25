# Mobile App Assets

This directory contains image assets for the React Native mobile application.

## Required Assets

### App Icon (`icon.png`)
- **Size**: 1024x1024px
- **Format**: PNG
- **Purpose**: Main app icon shown on device home screens
- **Platform**: iOS and Android

### Splash Screen (`splash.png`)
- **Size**: 1284x2778px (iPhone 14 Pro Max)
- **Format**: PNG
- **Purpose**: Loading screen shown when app starts
- **Platform**: iOS and Android
- **Background**: Should match the backgroundColor in app.json (#3B82F6)

### Adaptive Icon (`adaptive-icon.png`)
- **Size**: 1024x1024px
- **Format**: PNG
- **Purpose**: Android adaptive icon (safe area in center 640x640px)
- **Platform**: Android only

### Favicon (`favicon.png`)
- **Size**: 48x48px
- **Format**: PNG
- **Purpose**: Web favicon when running as PWA
- **Platform**: Web only

## Creating Assets

You can create these assets using:

1. **Design Tools**:
   - Figma (https://www.figma.com/)
   - Canva (https://www.canva.com/)
   - Adobe Photoshop or Illustrator

2. **Icon Generators**:
   - App Icon Generator (https://www.appicon.co/)
   - Expo Icon Generator (https://expo.dev/tools)
   - MakeAppIcon (https://makeappicon.com/)

3. **Placeholder Generator**:
   - For quick testing, use https://placeholder.com/

## Temporary Solution

Until you create proper assets, you can use placeholder images. The app will work but may show warnings about missing assets during development.

To generate quick placeholders:

```bash
# Create a simple colored square (requires ImageMagick)
convert -size 1024x1024 xc:#3B82F6 icon.png
convert -size 1284x2778 xc:#3B82F6 splash.png
convert -size 1024x1024 xc:#3B82F6 adaptive-icon.png
convert -size 48x48 xc:#3B82F6 favicon.png
```

Or download free icon templates and customize them for your app.


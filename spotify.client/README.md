# Geekify Mobile Music App

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Build for Mobile
```bash
npm run build:mobile
```

### 3. Add Platforms
```bash
npx cap add android
npx cap add ios
```

### 4. Run on Device
```bash
# Android
npm run android

# iOS
npm run ios
```

### 5. Deploy to Cloudflare Pages
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
npm run deploy
```

## Mobile Features
- Native mobile app with Capacitor
- Optimized touch controls
- Status bar styling
- Keyboard handling
- Responsive design

## Hosting
- Hosted on Cloudflare Pages
- Fast global CDN
- Automatic HTTPS
- Custom domain support
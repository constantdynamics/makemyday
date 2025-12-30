# Make My Day - PWA (Progressive Web App)

A mobile-first Progressive Web App for discovering unique activities near you.

## 🎯 Features

- **Progressive Web App**: Install on any device, works offline
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Fast Performance**: Built with Vite for lightning-fast loading
- **Premium Features**: Themed adventures, daily menus, vacation planner
- **Community Feed**: Share and discover adventures from others

## 🚀 Quick Start

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

### Build for Production

```bash
npm run build
```

Output will be in `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 📦 Deployment

### GitHub Pages

The app automatically deploys to GitHub Pages when pushing to main branch:

1. Push code to `main` or configured branch
2. GitHub Actions builds the PWA
3. Deploys to `https://[username].github.io/makemyday/`

### Manual Deployment

```bash
npm run deploy
```

This builds and pushes to GitHub Pages using `gh-pages`.

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Vite PWA Plugin** - PWA functionality
- **React Router** - Client-side routing
- **CSS3** - Styling (no framework needed)

## 📱 PWA Features

- ✅ Offline support with Service Worker
- ✅ Installable on mobile and desktop
- ✅ Push notifications ready
- ✅ App-like experience
- ✅ Fast loading and caching
- ✅ Responsive and mobile-first

## 🎨 Screens

1. **Welcome** - Landing page with features
2. **Login/Register** - Authentication
3. **Dashboard** - Main app with spin wheel
4. **Community** - Social feed
5. **Premium** - Subscription plans
6. **Settings** - User preferences

## 🔧 Configuration

Update base URL in `vite.config.ts`:

```ts
export default defineConfig({
  base: '/makemyday/', // Change to your repo name
  // ...
});
```

Update manifest in `public/manifest.webmanifest`:

```json
{
  "start_url": "/makemyday/",
  "scope": "/makemyday/"
}
```

## 📊 Performance

- Lighthouse Score: 100 (Performance, Accessibility, Best Practices, SEO)
- First Contentful Paint: < 1s
- Time to Interactive: < 2s
- PWA Compliant: ✅

## 🔐 Security

- HTTPS required for PWA features
- Content Security Policy configured
- XSS protection enabled

## 📄 License

Private - Part of Make My Day project

## 🤝 Contributing

This is part of the Make My Day monorepo. See main README for contribution guidelines.

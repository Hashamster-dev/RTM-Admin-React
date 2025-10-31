# RTM Admin Panel - Build Guide

## Building for Production

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Environment Setup

1. **Create a `.env` file** (or `.env.production` for production builds):
```env
VITE_API_BASE_URL=https://your-api-domain.com/api
```

2. **For local development**, create `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Build Commands

#### Development Build
```bash
npm run build
```
This creates a production build in the `dist/` folder.

#### Production Build with Type Checking
```bash
npm run build:prod
```
Runs type checking and creates an optimized production build.

#### Preview Production Build
```bash
npm run preview
```
Starts a local server on port 4173 to preview the production build.

#### Type Checking Only
```bash
npm run type-check
```
Runs TypeScript type checking without building.

### Build Output

After building, the `dist/` folder will contain:
- `index.html` - Entry HTML file
- `assets/` - Optimized JavaScript and CSS files
  - `react-vendor-*.js` - React dependencies (chunked for better caching)
  - `ui-vendor-*.js` - UI library dependencies
  - `index-*.js` - Application code
  - `index-*.css` - Styles

### Deployment

The `dist/` folder contains the static files ready for deployment to:
- Static hosting (Vercel, Netlify, GitHub Pages)
- Web servers (Nginx, Apache)
- CDN services

### Environment Variables

Make sure to set the `VITE_API_BASE_URL` environment variable before building:
- Development: `http://localhost:3000/api`
- Production: Your production API URL (e.g., `https://api.rtm.com/api`)

The environment variable is embedded at build time, so you need to rebuild when changing it.

### Build Optimization

The build is configured with:
- Code splitting for better caching
- Minification with esbuild
- Tree shaking to remove unused code
- Vendor chunk separation for optimal caching


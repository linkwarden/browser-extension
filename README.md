# Linkwarden Browser Extension

The Unofficial Browser Extension for [Linkwarden](https://github.com/linkwarden/linkwarden).

## Features

- **Quick Link Saving**: Add and organize new links to Linkwarden with a single click
- **Screenshot Capture**: Upload screenshots of the current page to Linkwarden
- **Bulk Tab Saving**: Save all tabs in the current window to Linkwarden
- **Flexible Authentication**: Sign in using API key or Username/Password
- **Server Validation**: Automatic server availability check when saving configuration
- **Smart Collection Management**: Create and manage collections with enhanced search functionality
- **Dynamic Tag System**: Create, search, and manage tags with intelligent auto-completion
- **Theme Support**: Light, dark, and system theme modes available
- **Enhanced Search**: Magnifying glass search interface for collections and tags
- **Smart Caching**: 60-second frontend caching for instant popup loading
- **Cross-Browser Support**: Built for both Chromium (Manifest V3) and Firefox (Manifest V2)

![Image](/assets/linkwarden-extension.png)

## Installation

### From Source

#### Requirements

- Node.js 24.x or later (configured via mise)
- npm 10.x or later
- Git

#### Build Steps

1. **Clone the repository**

```bash
git clone https://github.com/lilaflo/linkwarden-browser-extension.git
cd linkwarden-browser-extension
```

2. **Build for your browser**

For Chromium-based browsers (Chrome, Edge, Brave, etc.):
```bash
chmod +x ./build.sh && ./build.sh
```

For Firefox:
```bash
chmod +x ./build.sh && ./build.sh --firefox
```

3. **Load the extension**

The built extension will be in the `dist/` directory. Load it as an unpacked extension in your browser.

#### Development Build

For development with automatic rebuilds:

```bash
npm install
npm run dev          # Chromium
npm run dev:firefox  # Firefox
```

## Development

### Technology Stack

- **React 19** with TypeScript
- **Vite 4** for build tooling with custom multi-entry configuration
- **TanStack Query v5** for API state management
- **Radix UI v2** for accessible components
- **Tailwind CSS 4** for styling
- **React Hook Form** + **Zod v4** for form validation
- **Axios** for HTTP requests to Linkwarden API

### Build Commands

```bash
npm run dev              # Development build (Chromium) with watch mode
npm run dev:firefox      # Development build (Firefox) with watch mode
npm run dev:chromium     # Development build (Chromium) with watch mode
npm run build            # Production build (Chromium)
npm run build:firefox    # Production build (Firefox)
npm run build:chromium   # Production build (Chromium)
npm run lint             # Run ESLint with TypeScript support
npm run preview          # Preview the built extension
```

### Architecture

#### Extension Structure

- **Background Script** (`src/pages/Background/index.ts`): Handles context menus, tab monitoring, omnibox integration ("lk" keyword), and badge indicators
- **Popup** (`src/pages/Popup/`): Main extension popup UI for adding bookmarks
- **Options Page** (`src/pages/Options/`): Configuration interface for API settings and theme selection

#### Manifest Versions

- **Chromium**: Manifest V3 with service worker background script
- **Firefox**: Manifest V2 with persistent background script

#### Data Flow

1. **Configuration**: Stored in `browser.storage.local` via `src/@/lib/config.ts`
2. **API Integration**: `src/@/lib/actions/` contains functions for links, collections, and tags
3. **Caching**: `src/@/lib/cache.ts` manages 60-second intelligent caching for collections and tags
4. **Browser APIs**: `src/@/lib/utils.ts` provides cross-browser compatibility layer

#### Caching System

The extension uses an intelligent frontend caching system for optimal performance:

- **60-Second Cache Window**: Collections and tags are cached for 60 seconds after first load
- **Instant Subsequent Opens**: Within the cache window, popup opens instantly with no loading indicators
- **Automatic Refresh**: After 60 seconds, data is automatically refreshed from the API
- **Browser Storage Persistence**: Cache persists across popup sessions using browser storage
- **User-Triggered**: Caching is triggered by user actions (opening popup) rather than background processes

**Cache Flow:**
1. User opens popup → Check cache validity
2. If cache valid (< 60s old) → Use cached data instantly
3. If cache invalid → Fetch fresh data from API → Update cache
4. Data is sorted and stored in browser storage for next use

### Project Structure

```
linkwarden-browser-extension/
├── src/
│   ├── @/                    # Main application code (path alias)
│   │   ├── components/       # React components
│   │   │   ├── ui/           # Base UI components (shadcn/ui)
│   │   │   ├── BookmarkForm.tsx
│   │   │   ├── OptionsForm.tsx
│   │   │   └── SearchDropdown.tsx  # Reusable search dropdown
│   │   └── lib/
│   │       ├── actions/      # API functions
│   │       │   ├── collections.ts
│   │       │   ├── links.ts
│   │       │   └── tags.ts
│   │       ├── cache.ts      # Frontend caching system
│   │       ├── config.ts     # Configuration management
│   │       ├── utils.ts      # Utility functions
│   │       └── validators.ts # Zod schemas
│   └── pages/
│       ├── Background/       # Background script
│       ├── Options/          # Options page
│       └── Popup/            # Popup interface
├── chromium/
│   └── manifest.json         # Manifest V3 for Chromium
├── firefox/
│   └── manifest.json         # Manifest V2 for Firefox
├── build.sh                  # Build script for distribution
└── vite.config.ts            # Vite configuration
```

### Key Components

- **SearchDropdown** (`src/@/components/SearchDropdown.tsx`): Reusable dropdown component with search functionality for both collections and tags, supporting creation of new items
- **BookmarkForm** (`src/@/components/BookmarkForm.tsx`): Main bookmark form with integrated caching and SearchDropdown
- **OptionsForm** (`src/@/components/OptionsForm.tsx`): Configuration form with theme selector

## Authors

- Jordan Higuera Higuera <jordan_higuera@hotmail.com>
- Florian Fackler <github@fackler.xyz>

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

- `npm run dev` - Development build for Chromium with watch mode
- `npm run dev:firefox` - Development build for Firefox with watch mode
- `npm run dev:chromium` - Development build for Chromium with watch mode
- `npm run build` - Production build for Chromium (TypeScript compilation + Vite build)
- `npm run build:firefox` - Production build for Firefox
- `npm run build:chromium` - Production build for Chromium
- `npm run lint` - Run ESLint with TypeScript support
- `npm run preview` - Preview the built extension

### Building for Browser Distribution

- `./build.sh` - Build for Chromium browsers (installs deps, builds, copies chromium/manifest.json)
- `./build.sh --firefox` - Build for Firefox (installs deps, builds, copies firefox/manifest.json)

The build script installs dependencies, runs `npm run build`, and copies the appropriate manifest file to the dist folder.

## Architecture

This is a browser extension for Linkwarden (bookmark manager) with cross-browser support:

### Extension Structure

- **Background Script**: `src/pages/Background/index.ts` - Handles context menus, tab monitoring, omnibox integration, and bookmark sync
- **Popup**: `src/pages/Popup/` - Main extension popup UI for adding bookmarks
- **Options Page**: `src/pages/Options/` - Configuration interface for API settings
- **Content Scripts**: None currently used

### Manifest Versions

- **Chromium**: Uses Manifest V3 (`chromium/manifest.json`) with service worker background
- **Firefox**: Uses Manifest V2 (`firefox/manifest.json`) with persistent background script

### Core Libraries

- **React 18** + **TypeScript** for UI components
- **Vite** for bundling with custom multi-entry configuration
- **TanStack Query** for API state management
- **Radix UI** + **Tailwind CSS** for styled components
- **React Hook Form** + **Zod** for form validation
- **Axios** for HTTP requests to Linkwarden API

### Data Flow

1. **Configuration**: Stored in browser.storage.local via `src/@/lib/config.ts`
2. **API Integration**: `src/@/lib/actions/` contains functions for links, collections, tags
3. **Caching**: `src/@/lib/cache.ts` manages 60-second intelligent caching for collections and tags
4. **Browser APIs**: `src/@/lib/utils.ts` provides cross-browser compatibility layer

### Key Features

- Add current page to Linkwarden with collection/tag selection
- **Enhanced Collection Management**: Create new collections directly from search dropdown
- **Smart Tag System**: Create and manage tags with search functionality and auto-completion
- **Improved Search UX**: Magnifying glass icons and intuitive search interface
- Screenshot capture and upload
- Save all tabs in current window
- Context menu integration
- Omnibox search ("lk" keyword)
- Badge indicator for already-saved pages
- **Theme Support**: Light, dark, and system theme modes
- Cross-browser bookmark sync (experimental, mostly commented out)

### File Organization

- `src/@/` - Main application code with path alias
- `src/@/components/` - React components including shadcn/ui components
  - `SearchDropdown.tsx` - Generic dropdown component with search for collections/tags
  - `BookmarkForm.tsx` - Enhanced with SearchDropdown integration and 60-second caching
  - `OptionsForm.tsx` - Updated with theme selector
- `src/@/lib/` - Business logic, API calls, utilities, validators
  - `actions/collections.ts` - Collection API with creation support
  - `actions/tags.ts` - Tag API with creation functionality
  - `cache.ts` - 60-second intelligent caching system for collections and tags
- `src/hooks/` - Custom React hooks
- `src/pages/` - Extension-specific pages (Background, Popup, Options)

### Development Notes

- Uses TypeScript strict mode with additional linting rules
- Path alias `@/*` maps to `src/*` for clean imports
- Vite config handles multiple entry points for extension pages
- Browser API compatibility handled through `getBrowser()` utility
- Extension permissions include storage, tabs, bookmarks, contextMenus, and host permissions

## Recent Enhancements

### SearchDropdown Component
- **Reusable Architecture**: Single component handles both collections and tags
- **Search Functionality**: Magnifying glass icon with real-time filtering
- **Creation Support**: Create new collections and tags directly from search
- **Multi-select Support**: Tags support multiple selection with checkmarks
- **Keyboard Navigation**: Enter to create, Escape to close

### UI/UX Improvements
- **Theme Integration**: Comprehensive light/dark/system theme support
- **Enhanced Search**: Improved search experience with visual feedback
- **Better Responsiveness**: Optimized for various screen sizes
- **Accessible Components**: Using Radix UI for better accessibility

### Caching System
- **60-Second Cache Window**: Collections and tags are cached for 60 seconds after first load
- **Instant Subsequent Opens**: Within cache window, popup opens instantly with no loading indicators
- **Browser Storage Persistence**: Cache persists across popup sessions using browser storage
- **Automatic Refresh**: After 60 seconds, data is automatically refreshed from the API

### Development Workflow
- **Watch Mode**: Use `npm run dev` or `npm run dev:firefox` for development with automatic rebuilds
- **Browser-Specific Builds**: Separate build commands for Chromium and Firefox
- **Cross-Browser Compatibility**: Manifest V3 for Chromium, Manifest V2 for Firefox

## Authors
- Jordan Higuera Higuera <jordan_higuera@hotmail.com> (Original Author)
- Florian Fackler <github@fackler.xyz> (Current Maintainer)

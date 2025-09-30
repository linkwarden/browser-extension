# Changelog

All notable changes to the Linkwarden Browser Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.1] - 2024-12-30

### 🚀 Performance Improvements
- **Frontend Caching System**: Implemented intelligent 60-second caching for collections and tags
- **Instant Popup Loading**: Eliminated loading delays for subsequent popup opens within cache window
- **User-Triggered Caching**: Replaced background worker with user-action triggered API calls

### 🔧 Architecture Changes
- **Removed Background Worker**: Eliminated periodic cache refresh system running every 60 seconds
- **Simplified State Management**: Streamlined caching logic with React Query integration
- **Browser Storage Integration**: Enhanced cache persistence across popup sessions

### ✨ User Experience
- **Smart Cache Validation**: Automatically checks cache age before deciding to fetch fresh data
- **Zero Loading on Repeat Opens**: Instant popup display when cache is valid (< 60 seconds)
- **Automatic Refresh**: Fresh data fetching after 60-second cache expiry

### 🛠️ Technical Details
- Cache stored in browser storage with timestamp validation
- React Query handles both API calls and local caching
- Automatic sorting and persistence of collections and tags
- Removed cache refresh interval configuration from options UI

### 📦 Removed Features
- Background worker periodic refresh system
- Cache refresh interval configuration option
- Complex background/frontend coordination logic

---

## [1.4.0] - 2024-12-29

### 🎉 Major Features
- **Fixed Tag Creation**: Resolved critical "Error required [tags]" issue by implementing correct API format
- **Enhanced Theme Management**: Replaced theme toggle with integrated select field in options form
- **Smart Authentication**: Added automatic API Key method pre-selection when existing config uses API key

### ✨ Enhancements
- **Auto Meta Description**: Automatically extract and populate page meta descriptions for bookmarks
- **Improved Sorting**: Case-insensitive alphabetical sorting for collections and tags
- **Enhanced UX**: Move theme selection to top of options form for better accessibility
- **Container Optimization**: Increased popup container height for better content visibility

### 🛠️ Technical Improvements
- **Browser Compatibility**: Enhanced build system with browser-specific manifest support (Chrome/Firefox)
- **Development Workflow**: Added watch mode and browser-specific build scripts
- **Comprehensive Debugging**: Added emoji-marked console logging for better troubleshooting
- **API Format Fixes**: Corrected tag submission format to match Linkwarden API requirements

### 🔧 Bug Fixes
- Fixed tag creation by using correct API wrapper format: `{ tags: [{ label: "name" }] }`
- Resolved TypeScript build errors in SearchDropdown component
- Fixed form validation for bookmark tags array default values
- Improved error handling with multiple fallback error message sources

### 📦 Build System
- Added custom Vite plugin for automatic manifest copying during development
- Implemented BROWSER environment variable for selecting correct manifest version
- Enhanced build scripts for Firefox (Manifest V2) and Chromium (Manifest V3) compatibility

---

## [1.3.3] - Previous Version

### Features
- Basic bookmark creation and management
- Collection support
- Options configuration
- Theme toggle functionality

### Known Issues (Fixed in 1.4.0)
- Tag creation failing with "Error required [tags]"
- Theme toggle not integrated with main form
- Limited debugging capabilities
- Build system missing browser-specific manifest support

---

## Development Notes

### Tag Creation Fix (1.4.0)
The major breakthrough in this version was analyzing the Linkwarden source code to understand the exact API requirements:

**Before (Broken):**
```json
{ "name": "tag-name" }
```

**After (Working):**
```json
{
  "tags": [
    { "label": "tag-name" }
  ]
}
```

This structural difference was why collections worked but tags failed - collections use direct objects while tags require a wrapper array with different property names.

### Browser Compatibility
- **Chrome/Chromium**: Uses Manifest V3 with service workers
- **Firefox**: Uses Manifest V2 with background scripts
- Build system automatically copies correct manifest based on BROWSER environment variable

### Development Commands
- `npm run dev` - Development with watch mode
- `npm run dev:firefox` - Firefox-specific development
- `npm run dev:chromium` - Chromium-specific development
- `npm run build:firefox` - Firefox production build
- `npm run build:chromium` - Chromium production build

---

## Contributors
- Jordan Higuera Higuera <jordan_higuera@hotmail.com>
- Florian Fackler <github@fackler.xyz>

## Links
- [Linkwarden](https://linkwarden.app/)
- [GitHub Repository](https://github.com/lilaflo/linkwarden-browser-extension)
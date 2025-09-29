# Linkwarden Browser Extension

The Official Browser Extension for [Linkwarden](https://github.com/linkwarden/linkwarden).

## Features

- **Quick Link Saving**: Add and organize new links to Linkwarden with a single click
- **Screenshot Capture**: Upload screenshots of the current page to Linkwarden
- **Bulk Tab Saving**: Save all tabs in the current window to Linkwarden
- **Flexible Authentication**: Sign in using API key or Username/Password
- **Smart Collection Management**: Create and manage collections with enhanced search functionality
- **Dynamic Tag System**: Create, search, and manage tags with intelligent auto-completion
- **Theme Support**: Light, dark, and system theme modes available
- **Enhanced Search**: Magnifying glass search interface for collections and tags
- **Improved UI**: Streamlined interface with better responsiveness and user experience

![Image](/assets/linkwarden-extension.png)

## Installation

You can get the browser extension from both the Chrome Web Store and Firefox Add-ons:

<a href="https://chrome.google.com/webstore/detail/linkwarden/pnidmkljnhbjfffciajlcpeldoljnidn"><img src="/assets/chrome.png" alt="Chrome Web Store"></a>
<a href="https://addons.mozilla.org/en-US/firefox/addon/linkwarden"><img src="/assets/firefox.png" alt="Firefox Add-ons"></a>

## Issues and Feature Requests

We decided to keep the issues and feature requests in the main repository to keep everything in one place. Please report any issues or feature requests from the official repository, starting the title with "[Browser Extension]" [here](https://github.com/linkwarden/linkwarden/issues/new/choose).

## Build From Source

### Requirements

- LTS NodeJS 18.x.x
- NPM Version 9.x.x
- Bash
- Git

### Step 1: Clone this repo

Clone this repository by running the following in your terminal:

```
git clone https://github.com/linkwarden/browser-extension.git
```

### Step 2: Build

Head to the generated folder:

```
cd browser-extension
```

And run:

```
chmod +x ./build.sh && ./build.sh
```

After the above command, use the `/dist` folder as an unpacked extension in your browser.

### Alternative Development Build

For development with hot reloading:

```bash
npm install
npm run debug
```

This starts a watch mode that automatically rebuilds the extension when files change.

## Development

### Recent Improvements

- **SearchDropdown Component**: Reusable dropdown component with search functionality for both collections and tags
- **Tag Creation API**: Added ability to create new tags directly from the extension
- **Enhanced UI Components**: Improved styling and responsiveness
- **Firefox Compatibility**: Enhanced Firefox manifest and build process
- **Theme Integration**: Better theme support throughout the application

### Technology Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **TanStack Query** for state management
- **Radix UI** for accessible components
- **Tailwind CSS** for styling
- **Zod** for schema validation

### Project Structure

```
src/
├── @/components/          # Reusable UI components
│   ├── SearchDropdown.tsx # Enhanced search dropdown
│   ├── BookmarkForm.tsx   # Main bookmark form
│   └── ui/               # Base UI components
├── lib/
│   ├── actions/          # API functions
│   ├── config.ts         # Configuration management
│   └── utils.ts          # Utility functions
└── pages/                # Extension pages
    ├── Popup/            # Main popup interface
    └── Options/          # Extension options page
```

## Authors

- Jordan Higuera Higuera <jordan_higuera@hotmail.com>
- Florian Fackler <florian@fackler.cloud>

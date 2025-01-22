# Linkwarden Browser Extension

The Official Browser Extension for [Linkwarden](https://github.com/linkwarden/linkwarden).

## Features

- Add and organize new links to Linkwarden with a single click.
- Upload screenshots of the current page to Linkwarden.
- Save all tabs in the current window to Linkwarden.
- Sign in using API key or Username/Password.

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

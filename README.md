# Linkwarden Browser Extension

Extension for [Linkwarden](https://github.com/linkwarden/linkwarden), a self-hosted, open-source collaborative bookmark
manager to
collect, organize and archive webpages.

**Features**

- Add and organize new links to Linkwarden with a single click.

![Image](/assets/linkwarden-extension.png)

## Installation

For Chrome, Brave and other Chromium based browsers you can get this extension from the [Chrome Web Store](https://chrome.google.com/webstore/detail/linkwarden/pnidmkljnhbjfffciajlcpeldoljnidn).

Firefox is under development.

## Build From Source

### Requirements

- LTS NodeJS 18.x.x
- NPM Version 9.x.x
- Bash

### Build

Run the following in your terminal.

```console
user@bash:~$ chmod +x ./build.sh && ./build.sh
```

After the above command use the `/dist` folder as an unpacked extension in your browser.

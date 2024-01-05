#!/usr/bin/env bash

# Install deps
npm install

# Build
npm run build

# Check if --firefox argument was passed
if [ "$1" = "--firefox" ]; then
   # Copy to firefox/manifest.json
   cp src/manifest.json firefox/manifest.json
else
   # Copy to dist/manifest.json
   cp src/manifest.json dist/manifest.json
fi

# Done (for now...)
echo "Done! ✅"

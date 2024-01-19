#!/usr/bin/env bash

# Install deps
npm install

# Build
npm run build

# Check if --firefox argument was passed
if [ "$1" = "--firefox" ]; then
   # Copy to firefox/manifest.json
   echo "Built for Firefox..."
   cp firefox/manifest.json dist/manifest.json
else
   # Copy to dist/manifest.json
   echo "Built for Chrom(ium)e..."
   cp src/manifest.json dist/manifest.json
fi

# Done (for now...)
echo "Done! ✅"

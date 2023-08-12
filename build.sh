#!/usr/bin/env bash

# Install deps
npm install

# Build
npm run build

# Copy to manifest to dist
cp src/manifest.json dist/manifest.json

#  Done (for now...)
echo "Done! ✅"

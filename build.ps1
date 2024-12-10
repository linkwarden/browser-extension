# Install deps
npm install

# Build
npm run build

# Check if --firefox argument was passed
if ($args[0] -eq "--firefox") {
    # Copy to firefox/manifest.json
    Write-Host "Built for Firefox..."
    Copy-Item -Path "firefox/manifest.json" -Destination "dist/manifest.json"
} else {
    # Copy to dist/manifest.json
    Write-Host "Built for Chrom(ium)e..."
    Copy-Item -Path "src/manifest.json" -Destination "dist/manifest.json"
}

# Done (for now...)
Write-Host "Done! "

#!/usr/bin/env bash
set -euo pipefail

# Generate image manifest with dimensions for all images in static/images/
# Outputs JSON to static/images/manifest.json

IMAGES_DIR="static/images"
MANIFEST_FILE="$IMAGES_DIR/manifest.json"

# Start JSON object
echo "{" > "$MANIFEST_FILE"

first=true
shopt -s nullglob
for img in "$IMAGES_DIR"/*.jpg "$IMAGES_DIR"/*.jpeg "$IMAGES_DIR"/*.png "$IMAGES_DIR"/*.webp "$IMAGES_DIR"/*.gif "$IMAGES_DIR"/*.svg; do
    [ -f "$img" ] || continue

    filename=$(basename "$img")

    # Get dimensions using identify (ImageMagick)
    dimensions=$(identify -format "%wx%h" "$img" 2>/dev/null) || continue
    width=$(echo "$dimensions" | cut -d'x' -f1)
    height=$(echo "$dimensions" | cut -d'x' -f2)

    # Add comma before entries (except first)
    if [ "$first" = true ]; then
        first=false
    else
        echo "," >> "$MANIFEST_FILE"
    fi

    # Write entry (no trailing comma)
    printf '  "%s": {"width": %s, "height": %s}' "$filename" "$width" "$height" >> "$MANIFEST_FILE"
done

# Close JSON object
echo "" >> "$MANIFEST_FILE"
echo "}" >> "$MANIFEST_FILE"

echo "Generated $MANIFEST_FILE"

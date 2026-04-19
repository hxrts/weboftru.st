#!/usr/bin/env bash
set -euo pipefail

# Generate image manifest with dimensions for all images in static/images/
# Only regenerates if manifest is missing or out of date

IMAGES_DIR="static/images"
MANIFEST_FILE="$IMAGES_DIR/manifest.json"

# Get image dimensions (uses sips on macOS, identify on Linux)
get_dimensions() {
    local img="$1"
    if command -v identify &>/dev/null; then
        identify -format "%w %h\n" "$img" 2>/dev/null
    elif command -v sips &>/dev/null; then
        local w h
        w=$(sips -g pixelWidth "$img" 2>/dev/null | awk '/pixelWidth:/{print $2}')
        h=$(sips -g pixelHeight "$img" 2>/dev/null | awk '/pixelHeight:/{print $2}')
        echo "$w $h"
    else
        echo "Error: Neither ImageMagick (identify) nor sips available" >&2
        return 1
    fi
}

# Check if manifest needs regeneration
needs_update() {
    # No manifest file
    [ ! -f "$MANIFEST_FILE" ] && return 0

    # Check each image
    shopt -s nullglob
    for img in "$IMAGES_DIR"/*.jpg "$IMAGES_DIR"/*.jpeg "$IMAGES_DIR"/*.png "$IMAGES_DIR"/*.webp "$IMAGES_DIR"/*.gif "$IMAGES_DIR"/*.svg; do
        [ -f "$img" ] || continue

        # Image is newer than manifest
        [ "$img" -nt "$MANIFEST_FILE" ] && return 0

        # Image not in manifest
        filename=$(basename "$img")
        grep -q "\"$filename\"" "$MANIFEST_FILE" || return 0
    done

    return 1
}

# Generate the manifest
generate_manifest() {
    echo "{" > "$MANIFEST_FILE"

    first=true
    shopt -s nullglob
    for img in "$IMAGES_DIR"/*.jpg "$IMAGES_DIR"/*.jpeg "$IMAGES_DIR"/*.png "$IMAGES_DIR"/*.webp "$IMAGES_DIR"/*.gif "$IMAGES_DIR"/*.svg; do
        [ -f "$img" ] || continue

        filename=$(basename "$img")

        read -r width height < <(get_dimensions "$img") || continue

        if [ "$first" = true ]; then
            first=false
        else
            echo "," >> "$MANIFEST_FILE"
        fi

        printf '  "%s": {"width": %s, "height": %s}' "$filename" "$width" "$height" >> "$MANIFEST_FILE"
    done

    echo "" >> "$MANIFEST_FILE"
    echo "}" >> "$MANIFEST_FILE"

    echo "Generated $MANIFEST_FILE"
}

# Main
if needs_update; then
    generate_manifest
else
    echo "Manifest is up to date"
fi

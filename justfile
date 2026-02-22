# default recipe
default:
    @just --list

# generate image manifest
manifest:
    ./scripts/generate-image-manifest.sh

# start dev server
serve: manifest
    zola serve

# build and serve (rebuilds first, then starts dev server)
build-serve: manifest
    zola build && zola serve

# build site to public/
build: manifest
    zola build
    @echo "Built to public/"

# build site via nix to result/
nix-build:
    nix build
    @echo "Built to result/"

# clean build artifacts
clean:
    rm -rf public/

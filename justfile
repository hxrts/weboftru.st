# default recipe
default:
    @just --list

# start dev server
serve:
    zola serve

# build and serve (rebuilds first, then starts dev server)
build-serve:
    zola build && zola serve

# build site to public/
build:
    zola build
    @echo "Built to public/"

# build site via nix to result/
nix-build:
    nix build
    @echo "Built to result/"

# clean build artifacts
clean:
    rm -rf public/

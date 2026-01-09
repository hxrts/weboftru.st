# default recipe
default:
    @just --list

# start dev server
serve:
    zola serve

# build site to public/
build:
    zola build

# build site via nix to result/
nix-build:
    nix build

# clean build artifacts
clean:
    rm -rf public/

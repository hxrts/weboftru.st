{
  description = "weboftru.st";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        packages = {
          default = pkgs.stdenv.mkDerivation {
            pname = "weboftrust";
            version = "0.1.0";
            src = ./.;

            nativeBuildInputs = [ pkgs.zola ];

            buildPhase = ''
              zola build
            '';

            installPhase = ''
              cp -r public $out
            '';
          };
        };

        devShells.default = pkgs.mkShell {
          buildInputs = [ pkgs.zola ];

          shellHook = ''
            echo "Zola development environment"
            echo "Run 'zola serve' to start the dev server"
          '';
        };
      }
    );
}

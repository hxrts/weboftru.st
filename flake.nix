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
          default = pkgs.buildNpmPackage {
            pname = "weboftrust";
            version = "0.1.0";
            src = ./.;
            npmDepsHash = "sha256-+SxgiT6TYfhnjigcYE/C2fIoiuMMxhnZWoEUq/N6M1g=";

            nativeBuildInputs = [ pkgs.zola ] ++ pkgs.lib.optionals pkgs.stdenv.isLinux [ pkgs.chromium ];
            env = pkgs.lib.optionalAttrs pkgs.stdenv.isLinux {
              CHROME_EXECUTABLE_PATH = "${pkgs.chromium}/bin/chromium";
            };

            npmBuildScript = "build";
            installPhase = "cp -r public $out";
          };
        };

        devShells.default = pkgs.mkShell {
          buildInputs = [
            pkgs.zola
            pkgs.nodejs_22
            pkgs.just
            pkgs.git
            pkgs.libwebp
            pkgs.imagemagick
          ];

          shellHook = ''
            # Colors (matching your zsh prompt)
            MAGENTA='\033[0;35m'
            GREEN='\033[0;32m'
            ORANGE='\033[38;5;214m'
            RESET='\033[0m'

            # Build prompt before each command
            set_prompt() {
              local pwd_short="''${PWD/#$HOME/\~}"
              local branch=$(git branch 2>/dev/null | grep '^*' | sed 's/* //')
              local git_part=""
              [[ -n "$branch" ]] && git_part=" \[$GREEN\]($branch)\[$RESET\]"
              PS1="\[$MAGENTA\]$pwd_short\[$RESET\]$git_part \[$ORANGE\][nix] >\[$RESET\] "
            }
            PROMPT_COMMAND=set_prompt
          '';
        };
      }
    );
}

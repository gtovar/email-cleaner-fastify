#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="${1:-$(pwd)}"
cd "$REPO_ROOT"

if git diff --cached --name-only | grep -q '^README.md$'; then
  echo "Updating 'Last updated' date in README.md..."
  last_updated="Last updated: $(date '+%B %Y')"
  case "$(uname -s)" in
    Darwin)
      sed -i '' "s/^Last updated:.*/$last_updated/" README.md
      ;;
    *)
      sed -i "s/^Last updated:.*/$last_updated/" README.md
      ;;
  esac
  git add README.md
else
  echo "README.md not changed - skipping auto-update."
fi


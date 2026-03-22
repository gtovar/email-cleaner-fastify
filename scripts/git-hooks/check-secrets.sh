#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="${1:-$(pwd)}"
cd "$REPO_ROOT"

if command -v gitleaks >/dev/null 2>&1; then
  if ! gitleaks protect --staged --redact --verbose >/dev/null 2>&1; then
    echo "BLOCK: gitleaks detected a potential secret in staged changes" >&2
    exit 1
  fi
else
  echo "WARN: gitleaks is not installed; secret scanning skipped" >&2
fi


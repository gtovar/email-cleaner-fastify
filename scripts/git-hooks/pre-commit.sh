#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

"$SCRIPT_DIR/check-readme-timestamp.sh" "$REPO_ROOT"
"$SCRIPT_DIR/check-governance.sh" "$REPO_ROOT"
"$SCRIPT_DIR/check-comment-hygiene.sh" "$REPO_ROOT"
"$SCRIPT_DIR/check-secrets.sh" "$REPO_ROOT"

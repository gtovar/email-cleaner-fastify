#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="${1:-$(pwd)}"

if [[ ! -d "$REPO_ROOT/.git" ]]; then
  echo "comment-hygiene: not a git repo: $REPO_ROOT" >&2
  exit 1
fi

cd "$REPO_ROOT"

if ! command -v rg >/dev/null 2>&1; then
  echo "comment-hygiene: rg is required" >&2
  exit 1
fi

failures=0

report_block() {
  echo "BLOCK: $1" >&2
  failures=$((failures + 1))
}

collect_staged_matches() {
  local mode="$1"
  shift

  while IFS= read -r -d '' path; do
    git show ":$path" | awk -v path="$path" -v mode="$mode" '
      function has_marker(line) {
        return line ~ /(^|[^[:alnum:]_])(TODO|FIXME)([^[:alnum:]_]|$)/
      }

      function is_actionable(line) {
        return line ~ /(^|[^[:alnum:]_])(TODO|FIXME):[[:space:]]*[^[:space:]]/
      }

      {
        if (mode == "todo") {
          comment = ""

          if (path ~ /\.md$/) {
            comment = $0
          } else if (path ~ /\.sh$/) {
            if ($0 ~ /(^|[[:space:]])#[[:space:]]*/) {
              comment = $0
              sub(/^.*#[[:space:]]*/, "", comment)
            }
          } else if ($0 ~ /\/\/[[:space:]]*/) {
            comment = $0
            sub(/^.*\/\/[[:space:]]*/, "", comment)
          } else if ($0 ~ /\/\*[[:space:]]*/) {
            comment = $0
            sub(/^.*\/\*[[:space:]]*/, "", comment)
          } else if ($0 ~ /^[[:space:]]*\*[[:space:]]*/) {
            comment = $0
            sub(/^[[:space:]]*\*[[:space:]]*/, "", comment)
          }

          if (comment != "" && has_marker(comment) && !is_actionable(comment)) {
            printf "%s:%d:%s\n", path, NR, $0
          }
        }

        if (mode == "empty-slash" && $0 ~ /^[[:space:]]*\/\/[[:space:]]*$/) {
          printf "%s:%d:%s\n", path, NR, $0
        }

        if (mode == "empty-hash" && $0 ~ /^[[:space:]]*#[[:space:]]*$/) {
          printf "%s:%d:%s\n", path, NR, $0
        }
      }
    '
  done < <(git diff --cached --name-only -z --diff-filter=ACMR -- "$@")
}

if output="$(collect_staged_matches todo '*.md' '*.js' '*.jsx' '*.ts' '*.tsx' '*.mjs' '*.cjs' '*.sh')" && [[ -n "$output" ]]; then
  report_block "TODO/FIXME comments must use actionable 'TODO:' or 'FIXME:' text"
  printf '%s\n' "$output" >&2
fi

if output="$(collect_staged_matches empty-slash '*.js' '*.jsx' '*.ts' '*.tsx' '*.mjs' '*.cjs')" && [[ -n "$output" ]]; then
  report_block "empty single-line comments are not allowed"
  printf '%s\n' "$output" >&2
fi

if output="$(collect_staged_matches empty-hash '*.sh')" && [[ -n "$output" ]]; then
  report_block "empty shell comments are not allowed"
  printf '%s\n' "$output" >&2
fi

if (( failures > 0 )); then
  echo "comment-hygiene: failed" >&2
  exit 1
fi

echo "comment-hygiene: OK"

#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="${1:-$(pwd)}"

if [[ ! -d "$REPO_ROOT/.git" ]]; then
  echo "pre-commit-cognitive: not a git repo: $REPO_ROOT" >&2
  exit 1
fi

cd "$REPO_ROOT"

STAGED_FILES=()
while IFS= read -r file; do
  STAGED_FILES+=("$file")
done < <(git diff --cached --name-only --diff-filter=ACMR)

if (( ${#STAGED_FILES[@]} == 0 )); then
  echo "pre-commit-cognitive: no staged changes"
  exit 0
fi

has_staged_file() {
  local target="$1"
  local file
  for file in "${STAGED_FILES[@]}"; do
    [[ "$file" == "$target" ]] && return 0
  done
  return 1
}

has_npm_script() {
  local script_name="$1"
  [[ -f "package.json" ]] || return 1
  node -e "const fs=require('node:fs'); const p=JSON.parse(fs.readFileSync('package.json','utf8')); process.exit((p.scripts||{})['$script_name'] ? 0 : 1)"
}

matches_any() {
  local file
  for file in "${STAGED_FILES[@]}"; do
    case "$file" in
      src/*|tests/*|migrations/*|app/*|lib/*|config/*)
        return 0
        ;;
    esac
  done
  return 1
}

matches_structural_change() {
  local file
  for file in "${STAGED_FILES[@]}"; do
    case "$file" in
      migrations/*|src/routes/*|src/events/*|src/plugins/*|src/models/*|src/middlewares/*|config/*)
        return 0
        ;;
    esac
  done
  return 1
}

check_markdown_fences() {
  local file line trimmed fence_count
  for file in "${STAGED_FILES[@]}"; do
    [[ "$file" == *.md ]] || continue
    [[ -f "$file" ]] || continue
    fence_count=0
    while IFS= read -r line || [[ -n "$line" ]]; do
      trimmed="${line#"${line%%[![:space:]]*}"}"
      if [[ "$trimmed" == '```'* ]]; then
        fence_count=$((fence_count + 1))
      fi
    done < "$file"
    if (( fence_count % 2 != 0 )); then
      echo "BLOCK: broken fenced code blocks in $file" >&2
      return 1
    fi
  done
}

failures=0

fail_check() {
  echo "BLOCK: $1" >&2
  failures=$((failures + 1))
}

if matches_any; then
  if [[ -f "PROJECT_STATE.md" ]] && ! has_staged_file "PROJECT_STATE.md"; then
    fail_check "code changes detected but PROJECT_STATE.md is not staged"
  fi

  if [[ -f "README_REENTRY.md" ]] && ! has_staged_file "README_REENTRY.md"; then
    echo "WARN: code changes detected but README_REENTRY.md is not staged" >&2
  fi

  if [[ -f "Sprint_Log.md" ]] && ! has_staged_file "Sprint_Log.md"; then
    echo "WARN: code changes detected but Sprint_Log.md is not staged" >&2
  fi
fi

if matches_structural_change && [[ -d "docs/adr" ]]; then
  if ! printf '%s\n' "${STAGED_FILES[@]}" | grep -Eq '^(docs/adr/.+\.md|PROJECT_STATE\.md|Sprint_Log\.md)$'; then
    fail_check "ADR/DDR signal detected but no ADR and no state/log update is staged"
  fi
fi

if printf '%s\n' "${STAGED_FILES[@]}" | grep -Eq '(^docs/|\.md$)'; then
  if has_npm_script "lint:docs"; then
    if ! npm run lint:docs >/dev/null 2>&1; then
      fail_check "markdownlint failed (npm run lint:docs)"
    fi
  fi

  if ! check_markdown_fences; then
    failures=$((failures + 1))
  fi
fi

if (( failures > 0 )); then
  echo "Aduana Cognitiva: commit blocked" >&2
  exit 1
fi

echo "pre-commit-cognitive: OK"

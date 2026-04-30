#!/usr/bin/env bash
set -euo pipefail

OWNER="${1:-imranshiundu}"
REPO="${2:-pocket-bricks}"

git init
if ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin "https://github.com/${OWNER}/${REPO}.git"
fi

git add .
git commit -m "Initial open-source release" || true
gh repo create "${OWNER}/${REPO}" --public --source=. --remote=origin --push || git push -u origin main

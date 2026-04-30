#!/usr/bin/env bash
set -euo pipefail

REPO="imranshiundu/pocket-bricks"
APK_NAME="Pocket-Bricks.apk"
OUT_DIR="${HOME}/storage/downloads"

printf '\nPocket Bricks Android installer\n'
printf 'Repository: https://github.com/%s\n\n' "$REPO"

if ! command -v curl >/dev/null 2>&1; then
  pkg install -y curl
fi

if [ ! -d "$OUT_DIR" ]; then
  printf 'Termux storage is not ready. Run this once, then accept the Android permission:\n\n'
  printf '  termux-setup-storage\n\n'
  termux-setup-storage || true
  mkdir -p "$OUT_DIR" 2>/dev/null || OUT_DIR="$HOME"
fi

API="https://api.github.com/repos/${REPO}/releases/latest"
URL=$(curl -fsSL "$API" | grep -o 'https://[^" ]*Pocket-Bricks.apk' | head -n 1 || true)

if [ -z "$URL" ]; then
  printf 'No release APK was found yet.\n'
  printf 'Open GitHub Actions > Build Native Android APK, or push a tag such as android-1.2.0.\n'
  printf 'Releases page: https://github.com/%s/releases\n' "$REPO"
  exit 1
fi

DEST="${OUT_DIR}/${APK_NAME}"
printf 'Downloading %s\n' "$URL"
curl -L "$URL" -o "$DEST"
printf '\nDownloaded: %s\n' "$DEST"
printf 'Open the APK from your Downloads folder to install it.\n'
printf 'If Android blocks it, allow installs from Termux or your file manager, then try again.\n'

if command -v termux-open >/dev/null 2>&1; then
  termux-open "$DEST" || true
fi

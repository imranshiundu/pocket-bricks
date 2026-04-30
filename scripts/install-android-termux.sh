#!/usr/bin/env bash
set -euo pipefail

REPO="${POCKET_BRICKS_REPO:-imranshiundu/pocket-bricks}"
TAG="${POCKET_BRICKS_TAG:-android-latest}"
APK_NAME="${POCKET_BRICKS_APK:-pocket-bricks-debug.apk}"
URL="https://github.com/${REPO}/releases/download/${TAG}/${APK_NAME}"

say() { printf '\n%s\n' "$1"; }
fail() { printf '\nPocket Bricks install failed: %s\n' "$1" >&2; exit 1; }

say "Pocket Bricks Android installer"
say "Downloading APK from: ${URL}"

if ! command -v curl >/dev/null 2>&1 && ! command -v wget >/dev/null 2>&1; then
  if command -v pkg >/dev/null 2>&1; then
    say "Installing curl in Termux..."
    pkg update -y
    pkg install -y curl
  else
    fail "curl or wget is required. Install one and run this script again."
  fi
fi

DOWNLOAD_DIR="${POCKET_BRICKS_DOWNLOAD_DIR:-}"
if [ -z "$DOWNLOAD_DIR" ]; then
  if [ -d "$HOME/storage/downloads" ]; then
    DOWNLOAD_DIR="$HOME/storage/downloads"
  elif [ -d "/sdcard/Download" ]; then
    DOWNLOAD_DIR="/sdcard/Download"
  else
    DOWNLOAD_DIR="$PWD"
  fi
fi

if ! mkdir -p "$DOWNLOAD_DIR" 2>/dev/null; then
  if command -v termux-setup-storage >/dev/null 2>&1; then
    say "Asking Android for Termux storage access..."
    termux-setup-storage
    DOWNLOAD_DIR="$HOME/storage/downloads"
    mkdir -p "$DOWNLOAD_DIR"
  else
    fail "cannot write to ${DOWNLOAD_DIR}. Choose another folder with POCKET_BRICKS_DOWNLOAD_DIR."
  fi
fi

APK_PATH="${DOWNLOAD_DIR}/${APK_NAME}"
TMP_PATH="${APK_PATH}.download"
rm -f "$TMP_PATH"

if command -v curl >/dev/null 2>&1; then
  curl -L --fail --progress-bar "$URL" -o "$TMP_PATH" || fail "APK release not found. Ask the maintainer to run the Build Android APK workflow with Publish latest APK enabled."
else
  wget -O "$TMP_PATH" "$URL" || fail "APK release not found. Ask the maintainer to run the Build Android APK workflow with Publish latest APK enabled."
fi

mv "$TMP_PATH" "$APK_PATH"
say "APK saved to: ${APK_PATH}"

say "Opening Android package installer..."
if command -v termux-open >/dev/null 2>&1; then
  termux-open "$APK_PATH" || true
elif command -v am >/dev/null 2>&1; then
  am start -a android.intent.action.VIEW -d "file://${APK_PATH}" -t "application/vnd.android.package-archive" || true
else
  say "Open the APK manually from your Downloads folder."
fi

cat <<'DONE'

If Android blocks the install:
1. Tap Settings when Android asks.
2. Allow installs from Termux or your file manager.
3. Go back and tap the APK again.

After install, Pocket Bricks appears in the app drawer like a normal Android app.
DONE

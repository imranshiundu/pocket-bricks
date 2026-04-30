# Pocket Bricks hosting and release checklist

Use this when preparing the public version.

## Vercel hosting

1. Import `imranshiundu/pocket-bricks` into Vercel.
2. Vercel should read `vercel.json` automatically.
3. Confirm these settings:

```text
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

4. Deploy.
5. Open the Vercel URL on a phone and test:
   - Start.
   - Pause.
   - Left/right/down.
   - Rotate.
   - Drop.
   - Local memory after refresh.
   - Offline reload after one successful load.

## Android APK release

1. Go to GitHub Actions.
2. Open **Build Android APK**.
3. Press **Run workflow**.
4. Keep `publish_latest` enabled.
5. Wait for green status.
6. Open **Releases**.
7. Confirm release `android-latest` exists.
8. Confirm `pocket-bricks-debug.apk` is attached.

## Test public Android install

On an Android phone:

1. Open the release page.
2. Download `pocket-bricks-debug.apk`.
3. Tap it.
4. Allow unknown app install if Android asks.
5. Open Pocket Bricks from the app drawer.
6. Confirm the game opens full-screen and does not look like a web page.

## Test Termux install

```bash
pkg update -y
pkg install -y git curl termux-api
termux-setup-storage
git clone https://github.com/imranshiundu/pocket-bricks.git
cd pocket-bricks
bash scripts/install-android-termux.sh
```

## Stop noisy GitHub emails

Normal pushes to `main` no longer trigger the APK workflow. It only runs manually or when a `v*` tag is pushed.

GitHub Pages deployment is manual-only too. Vercel is the main hosted path.

## Update behavior

The APK checks GitHub Releases occasionally. When a newer tag exists, the app shows **GET UPDATE** and opens the Releases page.

No WebSocket server is used because GitHub does not provide a simple public WebSocket release stream and a custom server would add unnecessary cost and battery usage.

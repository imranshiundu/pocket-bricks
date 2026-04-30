# Native Android build

Pocket Bricks is packaged as a real Android APK with Capacitor.

The web game remains the source of truth. Capacitor wraps it inside a native Android shell so players install an APK, get a launcher icon, fullscreen app mode, haptics-ready controls, and local device storage through the WebView.

## Build locally

```bash
npm install
npx cap add android
npm run sync:android
cd android
./gradlew assembleDebug
```

The debug APK will be created under:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

For public releases, use the GitHub Actions workflow. It builds an unsigned debug APK artifact for testers and open-source review.

## Updating users

GitHub cannot push browser-style WebSocket messages directly into an Android APK. The safe open-source approach used here is a lightweight GitHub release checker:

- The app checks the latest GitHub release tag.
- If the release is newer than the installed app version, it shows a small old-phone-style update notice.
- The update button opens the GitHub Releases page.
- No tracking, no background service, no forced auto-update, no secret server.

This keeps the app simple and safe while still letting users install newer APKs without Play Store.

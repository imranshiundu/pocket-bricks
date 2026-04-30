# Install Pocket Bricks on a phone

Pocket Bricks is distributed as a real Android APK. The web demo still exists, but the APK is the main phone install path.

## Android APK install

The repository builds an APK automatically with GitHub Actions.

1. Open the repository on your phone.
2. Tap **Actions**.
3. Open the newest successful **Build Android APK** workflow run.
4. Download the artifact named `pocket-bricks-debug-apk`.
5. If Android downloads a ZIP, extract it.
6. Tap `pocket-bricks-debug.apk`.
7. Android may ask you to allow installs from the browser or file manager.
8. Launch **Pocket Bricks** from the app drawer.

This gives the user a real installed app, not just a browser shortcut.

## GitHub Release install path

For a cleaner public install flow, create a GitHub Release and attach the APK there. Then users can install from the latest release assets.

The app has a built-in update notice. When a newer GitHub Release tag exists, it shows **GET UPDATE** inside the game and opens the Releases page.

## Why updates are not WebSocket-based

GitHub does not provide a public WebSocket stream for APK release updates. A custom WebSocket server just for update checks would be unnecessary for this small game.

Pocket Bricks uses a safer lightweight release checker:

- No server to maintain.
- No user tracking.
- No background battery drain.
- No forced updates.
- Works with normal GitHub Releases.

## Web demo install

The web version can still be installed as a browser-based app when GitHub Pages is enabled:

```text
https://imranshiundu.github.io/pocket-bricks/
```

### Android browser install

1. Open the live game URL.
2. Wait for the page to load once.
3. Tap **INSTALL APP** if the in-game install prompt appears.
4. If the prompt does not appear, open the browser menu.
5. Tap **Install app** or **Add to Home screen**.

### iPhone / iPad

1. Open the live game URL in Safari.
2. Tap the **Share** button.
3. Tap **Add to Home Screen**.
4. Keep the name **Pocket Bricks**.
5. Tap **Add**.

## Local memory

The app stores only game memory on the device:

- Best score.
- Last score.
- Games played.
- Best level.
- Best lines.
- Sound preference.
- Last update check state.

There is no account system, backend, analytics, tracking, ads, or cloud sync.

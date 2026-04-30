# Install Pocket Bricks on a phone

Pocket Bricks is a Progressive Web App. That means people can install it from the browser without a Play Store listing.

Once GitHub Pages is enabled, open this URL on the phone:

```text
https://imranshiundu.github.io/pocket-bricks/
```

## Android

### Chrome / Edge / Brave

1. Open the live game URL.
2. Wait for the page to load once.
3. Tap **INSTALL APP** if the in-game install prompt appears.
4. If the prompt does not appear, open the browser menu.
5. Tap **Install app** or **Add to Home screen**.
6. Launch **Pocket Bricks** from the phone home screen.

After installation, it opens like a normal app, uses the app icon, hides most browser chrome, and works offline after the first successful load.

## iPhone / iPad

1. Open the live game URL in Safari.
2. Tap the **Share** button.
3. Tap **Add to Home Screen**.
4. Keep the name **Pocket Bricks**.
5. Tap **Add**.
6. Launch it from the home screen.

On iOS, Safari controls the install flow. The web app still saves memory locally and can run from the home screen.

## Offline play

The game has a service worker. After the first online visit, the app shell is cached locally. A player can reopen it later without internet, as long as the browser has not cleared site storage.

## Local memory

The app stores only game memory in the browser:

- Best score.
- Last score.
- Games played.
- Best level.
- Best lines.
- Sound preference.

There is no account system, backend, analytics, tracking, ads, or cloud sync.

## Play Store path later

A Play Store release is possible later by wrapping the PWA with Trusted Web Activity or by building a small native wrapper. For now, the cleanest open-source distribution is:

1. Public GitHub repository.
2. GitHub Pages live app.
3. Install from browser to home screen.

This keeps the project lightweight and avoids store fees, review delays, and unnecessary native complexity.

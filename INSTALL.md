# Install Pocket Bricks on a phone

Pocket Bricks is distributed as a real Android APK. The web demo still exists, but the APK is not the main install path. The goal is simple: download the APK, tap it, install it, and play it from the Android app drawer.

## Fastest public Android install

Use this path when a release APK is available.

1. Open the repository on your phone.
2. Tap **Releases**.
3. Open the newest release.
4. Download `pocket-bricks-debug.apk`.
5. Tap the downloaded APK.
6. Android may ask you to allow installs from the browser or file manager.
7. Allow it, go back, and tap the APK again.
8. Launch **Pocket Bricks** from the app drawer.

That is the clean public path. No Play Store is required.

## Termux one-command install

This is for people who like installing from Termux.

```bash
pkg update -y
pkg install -y git curl termux-api
termux-setup-storage
git clone https://github.com/imranshiundu/pocket-bricks.git
cd pocket-bricks
bash scripts/install-android-termux.sh
```

The script downloads the APK from the GitHub `android-latest` release into your Downloads folder and opens Android's package installer.

If Android blocks the install:

1. Tap **Settings**.
2. Allow installs from **Termux** or your file manager.
3. Go back and tap the APK again.

## Maintainer: publish the easy APK release

For the Termux installer and direct APK link to work, the repository needs a release named `android-latest` with this asset:

```text
pocket-bricks-debug.apk
```

The current Android workflow already builds `pocket-bricks-debug.apk`. After a successful build, attach that APK to a GitHub Release. For a normal versioned release, push a tag like this from a computer:

```bash
git tag v1.1.1
git push origin v1.1.1
```

GitHub Actions will build and attach the APK to the version release.

For the easiest public install link, also create or update a release called:

```text
android-latest
```

Attach the same `pocket-bricks-debug.apk` file there. Then Termux users can install with the script above without needing to browse GitHub Actions artifacts.

## GitHub Actions artifact install

Use this only when a release APK has not been published yet.

1. Open the repository on your phone.
2. Tap **Actions**.
3. Open the newest successful **Build Android APK** workflow run.
4. Download the artifact named `pocket-bricks-debug-apk`.
5. If Android downloads a ZIP, extract it.
6. Tap `pocket-bricks-debug.apk`.
7. Android may ask you to allow installs from the browser or file manager.
8. Launch **Pocket Bricks** from the app drawer.

This is still a real installed app, but it is less friendly than Releases because GitHub artifact downloads can require a signed-in GitHub account.

## Build from source on a computer

```bash
npm install
npm test
npm run build:android-web
npx cap add android
npm run sync:android
cd android
./gradlew assembleDebug
```

The APK will be created at:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Copy it to your phone and tap it to install.

## Build from source on Termux

Building Android APKs fully inside Termux is possible for advanced users but not the recommended public path. Android SDK, Gradle, Java, and file permissions make it heavy and fragile on phones. For normal users, Termux should download and open the APK, not compile it.

Recommended Termux path:

```bash
bash scripts/install-android-termux.sh
```

## Updates

The installed app checks GitHub Releases occasionally. When a newer release tag exists, it shows **GET UPDATE** inside the game and opens the Releases page.

Why not WebSocket updates:

- GitHub does not provide a simple public WebSocket stream for APK releases.
- A custom WebSocket server would add cost, tracking risk, and battery drain.
- GitHub Releases are simpler and safer for an open-source game.

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

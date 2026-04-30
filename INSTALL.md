# Install Pocket Bricks on a phone

Pocket Bricks has two public paths:

1. **Hosted game** — deploy the web app to Vercel so anyone can open and play it instantly.
2. **Real Android app** — publish the APK through GitHub Releases so Android users can install it like a normal app.

The web app and APK use the same game code.

## Host it on Vercel

The repo is ready for Vercel. Import the GitHub repo into Vercel and use:

```text
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

`vercel.json` already contains these settings, so Vercel should detect them automatically.

After deployment, people can use the hosted app by opening your Vercel URL. On Android Chrome, supported browsers can also show **Install app** or **Add to Home screen**. That creates a browser-installed app shortcut. It is useful, but it is not the same as the APK.

## Fastest public Android APK install

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

The repository has a manual GitHub Action named **Build Android APK**.

To publish the easy APK:

1. Open the repo on GitHub.
2. Go to **Actions**.
3. Open **Build Android APK**.
4. Press **Run workflow**.
5. Leave `publish_latest` enabled.
6. Wait for the workflow to pass.

When it passes, GitHub creates or replaces a release named:

```text
android-latest
```

That release contains:

```text
pocket-bricks-debug.apk
```

That is the file normal Android users and Termux users should install.

For a versioned release, push a tag like this from a computer:

```bash
git tag v1.1.2
git push origin v1.1.2
```

GitHub Actions will build and attach the APK to the version release.

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

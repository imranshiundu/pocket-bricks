# Pocket Bricks Android APK

Pocket Bricks has two delivery paths:

1. Web build on Vercel for instant play in a browser.
2. Real Android APK for people who want a proper installed phone app.

The APK is not a PWA shortcut and it is not an Add to Home Screen flow. It is a native Android project in `native-android/` with its own Android package, launcher icon, local memory, settings screen, and direct links to updates.

## Fast install for normal Android users

1. Open the GitHub repository.
2. Go to **Releases**.
3. Download `Pocket-Bricks.apk`.
4. Open the file on the phone.
5. If Android asks, allow installation from the browser or file manager.
6. Install and open **Pocket Bricks** from the app drawer.

Repository: https://github.com/imranshiundu/pocket-bricks
Releases: https://github.com/imranshiundu/pocket-bricks/releases
Developer: https://imranisdev.top

## Termux install path

This path is for Android users who are comfortable with Termux.

```bash
pkg update -y
pkg install -y git curl
mkdir -p ~/apps
cd ~/apps
git clone https://github.com/imranshiundu/pocket-bricks.git
cd pocket-bricks
bash scripts/install-android-termux.sh
```

The Termux script downloads the latest release APK when one exists. Android still controls the final install permission, so the user may need to allow Termux or the file manager to install unknown apps.

## Build the APK yourself

```bash
git clone https://github.com/imranshiundu/pocket-bricks.git
cd pocket-bricks/native-android
gradle :app:assembleDebug --no-daemon
```

The APK will be created at:

```text
native-android/app/build/outputs/apk/debug/app-debug.apk
```

## GitHub Actions build

The APK workflow is intentionally not triggered on every push. This reduces failed-run email spam.

It runs when:

- someone manually starts **Build Native Android APK** in GitHub Actions, or
- a release tag such as `android-1.2.0` or `v1.2.0` is pushed.

When a tag build succeeds, GitHub attaches `Pocket-Bricks.apk` to the release.

## In-app settings

The installed APK has a top-right settings button. From there users can:

- select starting level,
- view local memory such as best score, last score, and plays,
- open APK releases for updates,
- open the source repository,
- open the developer website.

## Update model

Without Play Store distribution, Android cannot silently replace the APK. The safe update model is:

1. The app links to GitHub Releases.
2. The user downloads the latest `Pocket-Bricks.apk`.
3. Android installs it as an update over the existing app because the package name stays the same.

This is safer than pretending that a non-Play-Store app can auto-update itself invisibly.

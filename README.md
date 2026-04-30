# Pocket Bricks

<p align="center">
  <img src="./assets/screenshot.svg" alt="Pocket Bricks monochrome game screen and touch controls" width="420" />
</p>

Pocket Bricks is an open-source, smartphone-first falling-block puzzle game built to feel like the clean monochrome games people remember from old button phones: small LCD-style screen, simple controls, no clutter, fast restarts, and a focused score chase.

It is intentionally lightweight. No backend. No tracking. No copied assets. It has a Vercel web version for quick play, plus a real native Android APK for people who want an installed phone app.

> Legal note: this is an original open-source implementation inspired by classic monochrome mobile puzzle games. It does not include proprietary Nokia assets, proprietary Tetris assets, ROMs, official logos, official sounds, or copied game code. The public name is **Pocket Bricks** to keep the repository safe for open-source use.

## Play now

Web version:

```text
https://pocket-bricks.vercel.app
```

## Real Android APK

Pocket Bricks now includes a real Android app in:

```text
native-android/
```

This is not an Add to Home Screen shortcut and not a PWA-only delivery path. The APK has its own Android package, launcher icon, fullscreen app shell, touch controls, settings panel, local memory, repo links, developer links, and release-update path.

### Install on Android without Play Store

1. Open the repository on your phone.
2. Go to **Releases**.
3. Download `Pocket-Bricks.apk`.
4. Open the downloaded APK.
5. Allow **Install unknown apps** for the browser or file manager if Android asks.
6. Launch **Pocket Bricks** from your app drawer.

Releases:

```text
https://github.com/imranshiundu/pocket-bricks/releases
```

### Termux install

```bash
pkg update -y
pkg install -y git curl
mkdir -p ~/apps
cd ~/apps
git clone https://github.com/imranshiundu/pocket-bricks.git
cd pocket-bricks
bash scripts/install-android-termux.sh
```

The Termux script downloads the latest release APK into the phone Downloads folder and opens it for installation when possible.

## Updates

Without Play Store distribution, Android should not be forced to silently replace apps in the background. Pocket Bricks uses a safer open-source update model:

- APK builds are published on GitHub Releases.
- The installed app links users to the Releases page from settings.
- Users download the new `Pocket-Bricks.apk` and Android installs it over the existing app because the package name stays the same.

This avoids pretending that a sideloaded APK can safely auto-update invisibly.

## Settings in the APK

The native APK has a small **SET** button at the top-right of the game screen. From settings, users can:

- choose the starting level,
- view local memory: best score, last score, and plays,
- open APK releases,
- open the source repository,
- open developer details.

## GitHub Actions

The native APK workflow is:

```text
Build Native Android APK
```

It runs manually or when a tag is pushed:

```text
android-1.2.0
v1.2.0
```

It does not run on every normal push. That reduces failed-run email notifications.

## Web build

The web version can be deployed to Vercel. It remains useful for instant play, sharing, and testing, but it is not the only app path.

```bash
npm install
npm test
npm run serve
```

Then open:

```text
http://localhost:4173
```

## Build APK locally

```bash
git clone https://github.com/imranshiundu/pocket-bricks.git
cd pocket-bricks/native-android
gradle :app:assembleDebug --no-daemon
```

Output:

```text
native-android/app/build/outputs/apk/debug/app-debug.apk
```

## What it delivers

- Vercel-ready browser version.
- Real native Android APK project.
- Classic 10 x 20 falling-block board.
- Seven familiar block shapes.
- Smartphone keypad with left, right, down, rotate, and drop.
- Monochrome LCD visual direction.
- Local memory: best score, last score, plays, level preference, and sound preference.
- Top-right settings panel.
- GitHub Releases update path.
- Repository and developer links inside the app.
- Core web game logic separated from rendering and covered by tests.

## Project structure

```text
.
├── assets/                  # Original icon and visual assets
├── docs/                    # Architecture, gameplay, APK install notes
├── native-android/          # Real Android APK project
├── scripts/                 # Termux installer helper
├── src/                     # Web app/game source
├── tests/                   # Node test suite for the web game engine
├── index.html               # Web app entry
├── manifest.webmanifest     # Optional web install metadata
├── sw.js                    # Optional offline web cache
└── package.json             # Web scripts and metadata
```

## Open-source standards

This repository includes:

- MIT license.
- Contribution guide.
- Code of conduct.
- Security policy.
- GitHub Actions CI.
- Issue templates.

## Design rule

Pocket Bricks should stay small, direct, and old-phone-like. Avoid heavy animations, accounts, payments, ads, bloated dependencies, skins, loot mechanics, or AI features. The goal is not to modernize the memory away. The goal is to preserve the feeling while making it comfortable on smartphones.

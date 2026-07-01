**English** | [한국어](README.ko.md)

# llmwiki-app

Public distribution for **LLMWiki** — install the apps without an app store.

> 🚀 **New here? → Start with the [Setup guide (sign in · create a wiki · groups · ingest)](SETUP.md).** It's now **one "Sign in with GitHub"** — no token to create.

## 📱 Android app

- **Install / pair page** (GitHub Pages): https://mynameisjinhohong.github.io/llmwiki-app/
  The LLMWiki desktop app shows a QR pointing here (with the setup encoded in the URL `#fragment`).
  Scanning with a phone camera installs the app (if needed) and pairs it (syncs GitHub repo + settings).
- **APK** (GitHub Releases): https://github.com/mynameisjinhohong/llmwiki-app/releases/latest/download/llmwiki.apk

Android only (iOS can't sideload). The pairing QR carries your GitHub token in its `#fragment`, so
treat the QR as a secret — don't share or screenshot it.

## 🖥 Desktop app (Windows · macOS)

- **Windows**: [LLMWiki-Setup.exe](https://github.com/mynameisjinhohong/llmwiki-app/releases/download/desktop-latest/LLMWiki-Setup.exe)
- **macOS**: [LLMWiki.dmg](https://github.com/mynameisjinhohong/llmwiki-app/releases/download/desktop-latest/LLMWiki.dmg) (universal — Intel + Apple Silicon)
- **How to install + set up**: see [INSTALL-desktop.md](INSTALL-desktop.md)

Unsigned (free distribution), so the OS warns once on first run — Windows: *More info → Run anyway*;
macOS: *right-click → Open*. Both are built in CI
([.github/workflows/desktop-windows.yml](.github/workflows/desktop-windows.yml)) from the
self-contained build context in [`desktop/`](desktop/). Windows auto-updates; macOS updates by re-download.

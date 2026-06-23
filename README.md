**English** | [한국어](README.ko.md)

# llmwiki-app

Public distribution for **LLMWiki** — install the apps without an app store.

## 📱 Android app

- **Install / pair page** (GitHub Pages): https://mynameisjinhohong.github.io/llmwiki-app/
  The LLMWiki desktop app shows a QR pointing here (with the setup encoded in the URL `#fragment`).
  Scanning with a phone camera installs the app (if needed) and pairs it (syncs GitHub repo + settings).
- **APK** (GitHub Releases): https://github.com/mynameisjinhohong/llmwiki-app/releases/latest/download/llmwiki.apk

Android only (iOS can't sideload). The pairing QR carries your GitHub token in its `#fragment`, so
treat the QR as a secret — don't share or screenshot it.

## 🖥 Desktop app (Windows)

- **Installer**: https://github.com/mynameisjinhohong/llmwiki-app/releases/download/desktop-latest/LLMWiki-Setup.exe
- **How to install + set up**: see [INSTALL-desktop.md](INSTALL-desktop.md)

Windows only for now (macOS comes once Apple code signing is set up). Unsigned, so Windows
SmartScreen warns on first run — choose *More info → Run anyway*. The Windows installer is built
in CI ([.github/workflows/desktop-windows.yml](.github/workflows/desktop-windows.yml)) from the
self-contained build context in [`desktop/`](desktop/).

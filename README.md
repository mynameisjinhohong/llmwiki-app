# llmwiki-app

Public distribution for the **LLMWiki** Android app — install + device pairing without an app store.

- **Install / pair page** (GitHub Pages): https://mynameisjinhohong.github.io/llmwiki-app/
  The LLMWiki desktop app shows a QR pointing here (with the setup encoded in the URL `#fragment`).
  Scanning with a phone camera installs the app (if needed) and pairs it (syncs GitHub repo + settings).
- **APK** (GitHub Releases): https://github.com/mynameisjinhohong/llmwiki-app/releases/latest/download/llmwiki.apk

Android only (iOS can't sideload). The pairing QR carries your GitHub token in its `#fragment`, so
treat the QR as a secret — don't share or screenshot it.

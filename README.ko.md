[English](README.md) | **한국어**

# llmwiki-app

앱 스토어 없이 **LLMWiki** 앱을 설치·배포하기 위한 공개 저장소입니다.

> 🚀 **처음 사용하시나요? → [셋업 가이드 (GitHub 연동 · 토큰 발급)](SETUP.ko.md)** 부터 보세요. 앱 설치 후 GitHub 연결이 막히면 여기에 단계별로 다 있습니다.

## 📱 안드로이드 앱

- **설치 / 연동 페이지** (GitHub Pages): https://mynameisjinhohong.github.io/llmwiki-app/
  LLMWiki 데스크톱 앱이 이 페이지를 가리키는 QR을 표시합니다(설정은 URL의 `#fragment`에 인코딩).
  폰 카메라로 스캔하면 앱 설치(필요 시) + 연동(GitHub 저장소·설정 동기화)이 한 번에 됩니다.
- **APK** (GitHub Releases): https://github.com/mynameisjinhohong/llmwiki-app/releases/latest/download/llmwiki.apk

안드로이드 전용입니다(iOS는 사이드로드 불가). 연동 QR에는 GitHub 토큰이 `#fragment`에 담겨 있으니
**비밀로 취급**하세요 — 공유·스크린샷 금지.

## 🖥 데스크톱 앱 (Windows · macOS)

- **Windows**: [LLMWiki-Setup.exe](https://github.com/mynameisjinhohong/llmwiki-app/releases/download/desktop-latest/LLMWiki-Setup.exe)
- **macOS**: [LLMWiki.dmg](https://github.com/mynameisjinhohong/llmwiki-app/releases/download/desktop-latest/LLMWiki.dmg) (universal — Intel·Apple Silicon)
- **설치 + 설정 방법**: [INSTALL-desktop.md](INSTALL-desktop.md) 참고

**코드 서명 없이 무료 배포**라 첫 실행 시 OS 경고가 한 번 뜹니다 — Windows는 **추가 정보 → 실행**,
macOS는 **우클릭 → 열기**로 우회하면 됩니다(정상). 둘 다 [`desktop/`](desktop/)의 빌드 컨텍스트로부터
CI ([.github/workflows/desktop-windows.yml](.github/workflows/desktop-windows.yml))에서 빌드됩니다.
Windows는 인앱 자동 업데이트, macOS는 새 버전 재다운로드.

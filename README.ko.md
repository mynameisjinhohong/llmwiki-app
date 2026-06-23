[English](README.md) | **한국어**

# llmwiki-app

앱 스토어 없이 **LLMWiki** 앱을 설치·배포하기 위한 공개 저장소입니다.

## 📱 안드로이드 앱

- **설치 / 연동 페이지** (GitHub Pages): https://mynameisjinhohong.github.io/llmwiki-app/
  LLMWiki 데스크톱 앱이 이 페이지를 가리키는 QR을 표시합니다(설정은 URL의 `#fragment`에 인코딩).
  폰 카메라로 스캔하면 앱 설치(필요 시) + 연동(GitHub 저장소·설정 동기화)이 한 번에 됩니다.
- **APK** (GitHub Releases): https://github.com/mynameisjinhohong/llmwiki-app/releases/latest/download/llmwiki.apk

안드로이드 전용입니다(iOS는 사이드로드 불가). 연동 QR에는 GitHub 토큰이 `#fragment`에 담겨 있으니
**비밀로 취급**하세요 — 공유·스크린샷 금지.

## 🖥 데스크톱 앱 (Windows)

- **설치 파일**: https://github.com/mynameisjinhohong/llmwiki-app/releases/download/desktop-latest/LLMWiki-Setup.exe
- **설치 + 설정 방법**: [INSTALL-desktop.md](INSTALL-desktop.md) 참고

현재 **Windows만** 지원합니다(macOS는 Apple 코드 서명 작업 후 제공 예정). 서명이 없어 첫 실행 시
Windows SmartScreen 경고가 뜹니다 — **추가 정보 → 실행**을 선택하세요. Windows 설치 파일은
[`desktop/`](desktop/)의 자체 완결형 빌드 컨텍스트로부터 CI
([.github/workflows/desktop-windows.yml](.github/workflows/desktop-windows.yml))에서 빌드됩니다.

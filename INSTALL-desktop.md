# LLMWiki 데스크톱 앱 설치 (Windows)

LLMWiki 데스크톱 앱은 모바일 앱과 **같은 위키**를 PC에서 둘러보고 · 캡처하고 · 검색하고 · 폰과 연동할 수 있는 데스크톱 버전입니다.

> 현재 **Windows**만 배포합니다. macOS 빌드는 Apple 개발자 서명 작업 후 추후 제공할 예정입니다.

---

## 1. 다운로드 & 설치

1. 설치 파일을 받습니다 →
   **[LLMWiki-Setup.exe 다운로드](https://github.com/mynameisjinhohong/llmwiki-app/releases/download/desktop-latest/LLMWiki-Setup.exe)**
2. 받은 `LLMWiki-Setup.exe`를 실행합니다.
3. **Windows SmartScreen 경고**("Windows의 PC 보호" 파란 창)가 뜨면 — 이 앱은 코드 서명이 없어서 그렇습니다(정상). **추가 정보 → 실행**을 누르세요.
4. 설치 마법사를 진행합니다. (설치 위치 선택 가능, 관리자 권한 불필요 — 내 계정에만 설치)

설치가 끝나면 시작 메뉴/바탕화면의 **LLMWiki**로 실행합니다.

## 2. 처음 실행 시 설정

앱을 처음 열면 GitHub 위키 저장소를 연결해야 합니다.

1. **설정(⚙️)** 탭으로 이동
2. GitHub **사용자명 / 저장소 / 브랜치 / 토큰**을 입력하고 저장
   → 위키 저장소 준비와 **토큰(PAT) 발급 방법**은 **[SETUP.ko.md](SETUP.ko.md)** 에 단계별로 정리돼 있습니다. 토큰 발급이 가장 헷갈리니 꼭 참고하세요.
3. (선택) **검색용 LLM 키**를 입력하면 앱에서 위키 검색이 됩니다
4. 이제 **둘러보기 · 캡처 · 검색**을 PC에서 사용할 수 있습니다

> 데스크톱에서 **설정 → 모바일 연동**의 QR을 폰 카메라로 찍으면, 폰 앱 설치 + 같은 설정 동기화가 한 번에 됩니다.

## 3. 부팅 시 자동 실행 (선택)

**설정 → 시작 프로그램 → "부팅 시 자동 실행"** 을 켜면 PC를 켤 때 LLMWiki가 자동으로 뜹니다. 데스크톱이 떠 있어야 폰의 "정리(ingest)" 요청을 받아 처리할 수 있으므로, 자동화를 쓰신다면 켜두는 것을 권장합니다.

## 보안 메모

- GitHub 토큰·LLM 키는 **이 PC에만** 저장됩니다(외부 전송 없음).
- 연동 QR에는 토큰이 들어있으니 **공유·스크린샷 금지**입니다.

---

## (관리자용) 새 버전 빌드·배포

Windows 설치 파일은 GitHub Actions(Windows 러너)에서 빌드됩니다 — 로컬에 Wine 불필요.

1. 앱을 수정했다면 소스 저장소에서 `npm run sync:desktop`으로 `desktop/`(소스 + `dist/` 웹 번들)을 이 레포에 갱신하고 커밋·푸시합니다.
2. **Actions 탭 → "Build Windows desktop app" → Run workflow** 실행 (또는 `gh workflow run desktop-windows.yml`, 또는 `desktop-v*` 태그 푸시).
3. 완료되면 `desktop-latest` 릴리스의 `LLMWiki-Setup.exe`가 갱신됩니다(위 다운로드 링크는 항상 최신을 가리킵니다).

> 빌드는 서명 없이 생성되므로 최종 사용자에게 SmartScreen 경고가 표시됩니다. 정식 배포 시 코드 서명 인증서로 해결할 수 있습니다.

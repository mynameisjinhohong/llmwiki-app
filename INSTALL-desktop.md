# LLMWiki 데스크톱 앱 설치 (Windows · macOS)

LLMWiki 데스크톱 앱은 모바일 앱과 **같은 위키**를 PC에서 둘러보고 · 캡처하고 · 검색하고 · 폰과 연동할 수 있는 데스크톱 버전입니다.

> **Windows · macOS** 모두 제공합니다. 둘 다 **코드 서명이 없어**(무료 배포) 첫 실행 시 OS 경고가 한 번 뜹니다 — 아래대로 우회하면 됩니다(정상, 악성 아님).

---

## 1. 다운로드 & 설치

### 🪟 Windows
1. **[LLMWiki-Setup.exe 다운로드](https://github.com/mynameisjinhohong/llmwiki-app/releases/download/desktop-latest/LLMWiki-Setup.exe)**
2. 받은 `LLMWiki-Setup.exe` 실행
3. **SmartScreen 경고**("Windows의 PC 보호" 파란 창)가 뜨면 → **추가 정보 → 실행**
4. 설치 마법사 진행 (관리자 권한 불필요 — 내 계정에만 설치). 이후 **자동 업데이트**됩니다.

### 🍎 macOS
1. **[LLMWiki.dmg 다운로드](https://github.com/mynameisjinhohong/llmwiki-app/releases/download/desktop-latest/LLMWiki.dmg)** (universal — Intel·Apple Silicon 공용)
2. `.dmg`를 열고 **LLMWiki** 앱을 **Applications**로 드래그
3. 첫 실행 시 **"확인되지 않은 개발자" 경고** → Applications에서 **LLMWiki 우클릭 → 열기 → 열기** (한 번만 하면 이후엔 그냥 실행). 서명이 없어서 그렇습니다.
   - 안 되면 터미널: `xattr -dr com.apple.quarantine /Applications/LLMWiki.app`
4. macOS는 **자동 업데이트가 없으니**, 새 버전은 위 링크에서 다시 받아 덮어씁니다.

설치 후 **LLMWiki**를 실행합니다.

## 2. 처음 실행 시 설정

앱을 처음 열면 GitHub 위키를 연결합니다. **자세한 그림은 [SETUP.ko.md](SETUP.ko.md) 참고.**

1. **위키 탭 → "GitHub로 로그인"** → 브라우저에 뜬 코드 승인. **토큰 발급 불필요.**
2. **위키 만들기/고르기**: "새 위키 만들기"(앱이 repo를 생성·초기화) 또는 "내 GitHub repo에서 위키 추가".
   > ⚠️ github.com에서 직접 만든 repo는 위키로 인식 안 됩니다 — 반드시 앱의 "새 위키 만들기"로.
3. **정리(ingest)** 준비 — 둘 중 하나:
   - **쉬움**: 설정 → 검색 LLM에 **무료 Gemini 키**(https://aistudio.google.com/apikey) → 정리 화면 **"API 정리"**
   - **고품질**: 이 PC에 **Claude Code** 설치 + `claude` 로그인 → **"정리(claude)"**
4. 이제 **둘러보기 · 캡처 · 정리 · 검색**을 PC에서 사용합니다.

> 데스크톱 **설정 → 모바일 연동**의 QR을 폰으로 찍으면, 폰 앱 설치 + 설정 동기화가 한 번에 됩니다.

## 3. 부팅 시 자동 실행 (선택)

**설정 → 시작 프로그램 → "부팅 시 자동 실행"** 을 켜면 PC를 켤 때 LLMWiki가 자동으로 뜹니다. 데스크톱이 떠 있어야 폰의 "정리(ingest)" 요청을 받아 처리할 수 있으므로, 자동화를 쓰신다면 켜두는 것을 권장합니다.

## 보안 메모

- GitHub 토큰·LLM 키는 **이 PC에만** 저장됩니다(외부 전송 없음).
- 연동 QR에는 토큰이 들어있으니 **공유·스크린샷 금지**입니다.

---

## (관리자용) 새 버전 빌드·배포

Windows·macOS 설치 파일은 GitHub Actions에서 각각 Windows·macOS 러너로 빌드됩니다.

1. 앱을 수정했다면 소스 저장소에서 `npm run sync:desktop`으로 `desktop/`(소스 + `dist/` 웹 번들)을 이 레포에 갱신하고 커밋·푸시합니다.
2. **Actions 탭 → "Build desktop apps (Windows + macOS)" → Run workflow** 실행 (또는 `gh workflow run desktop-windows.yml`, 또는 `desktop-v*` 태그 푸시).
3. 완료되면 `desktop-latest` 릴리스의 `LLMWiki-Setup.exe`(Windows) + `LLMWiki.dmg`(macOS)가 갱신됩니다(위 다운로드 링크는 항상 최신).

> **무료 배포를 위해 미서명으로** 빌드하므로 최초 실행 시 OS 경고가 뜹니다(사용자는 §1대로 우회). 경고를 완전히 없애려면 유료 서명(Apple $99/년, Windows 스토어[무료·MSIX] 또는 Azure Trusted Signing[~$10/월])을 얹으면 됩니다.

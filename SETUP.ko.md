[English](SETUP.md) | **한국어**

# LLMWiki 셋업 가이드 (GitHub 연동)

LLMWiki는 **회원님의 GitHub 비공개 저장소**를 위키 저장소로 씁니다 — 서버가 없어서, 내 기록은 100% 내 GitHub 안에 있습니다. 그래서 앱을 처음 켜면 GitHub에 한 번 연결해야 합니다. 필요한 건 **① 위키 저장소**와 **② 접근 토큰(PAT)** 두 가지입니다.

> 💡 **대부분 2번(토큰 발급)에서 막힙니다.** 천천히 그대로 따라오시면 됩니다. 5분이면 끝납니다.

---

## 0. 준비물
- GitHub 계정 — 없으면 https://github.com/signup 에서 무료 가입
- PC 또는 폰 브라우저

---

## 1. 위키 저장소 준비

아래 두 경우 중 **하나**입니다.

### (A) 내 위키를 새로 만드는 경우
1. https://github.com/new 접속
2. **Repository name**(저장소 이름): 예) `my-wiki`
3. **Private**(비공개) 선택 ✅ — 내 기록이니 비공개를 권장합니다
4. **Add a README file**(README 파일 추가) 체크 ✅ — *이걸 꼭 체크하세요.* 저장소에 `main` 브랜치가 생겨야 앱이 바로 동작합니다
5. **Create repository** 클릭

→ 이제 `내아이디/my-wiki` 저장소가 생겼습니다. (소유자 = 내 아이디)

### (B) 친구·모임의 공유 위키에 참가하는 경우
1. 관리자가 회원님을 **협업자(collaborator)** 로 초대하면 GitHub에서 알림/이메일이 옵니다
2. 그 알림(또는 `https://github.com/소유자/저장소/invitations`)에서 **Accept invitation**(초대 수락)을 누릅니다

→ 이제 공유 저장소 `관리자아이디/모임-wiki`에 접근할 수 있습니다. (소유자 = **관리자 아이디**, 내 아이디가 아닙니다!)

---

## 2. 접근 토큰(PAT) 발급 — ⭐ 가장 중요

앱이 저장소를 읽고 쓰려면 **토큰**이 필요합니다(비밀번호 대신 쓰는 열쇠). **Fine-grained 토큰**(권장 — 저장소 1개에만 권한을 줘서 안전)으로 안내합니다.

1. 👉 **https://github.com/settings/personal-access-tokens/new** 접속 (GitHub 로그인 상태에서)
   - 화면 제목: *"New fine-grained personal access token"*
2. **Token name**: `LLMWiki` (아무 이름이나 OK)
3. **Expiration**(만료 기간): 원하는 기간 선택
   - 만료되면 토큰이 멈춥니다 → 그때 다시 발급해 앱에 입력하면 됩니다. 귀찮으면 길게(예: custom으로 1년) 잡으세요
4. **Repository access**: **"Only select repositories"**(선택한 저장소만) 클릭 → 바로 아래 드롭다운에서 **1번에서 만든/참가한 위키 저장소**를 선택
   - 공유 위키라면 그 **공유 저장소**를 고르세요
5. **Permissions**(권한) → **Repository permissions** 펼치기 → 목록을 내려 **"Contents"** 찾기 → 오른쪽 드롭다운을 **"Read and write"**(읽기·쓰기)로 변경 ✅
   - 이거 하나면 됩니다. (Metadata는 자동으로 포함됩니다. 나머지 권한은 손댈 필요 없습니다)
6. 맨 아래 **Generate token** 클릭 → 화면에 나타나는 **`github_pat_…` 로 시작하는 토큰을 복사** 📋
   - ⚠️ **이 토큰은 지금 이 화면에서만 보입니다.** 창을 닫기 전에 꼭 복사하세요. (잃어버려도 괜찮아요 — 그냥 새로 발급하면 됩니다)

> **잘 안 되면 더 간단한 대안 — Classic 토큰**
> https://github.com/settings/tokens/new → Note 입력 → Expiration 선택 → **`repo`** 항목 체크 ✅ → **Generate token** → `ghp_…` 복사.
> (만들기는 더 쉽지만 *내 모든 저장소* 권한이라, 가능하면 위의 fine-grained를 권장합니다.)

---

## 3. 앱에 입력

앱의 **설정(⚙️)** 탭(또는 첫 실행 시 온보딩 화면)에서 아래 4개를 입력하고 **저장**:

| 칸 | 입력값 |
|---|---|
| **사용자명 (owner)** | 저장소 **소유자**의 GitHub 아이디 — 내 위키면 **내 아이디**, 공유 위키면 **관리자 아이디** |
| **저장소 (repo)** | 저장소 이름 (예: `my-wiki`) |
| **브랜치 (branch)** | `main` |
| **토큰 (token)** | 2번에서 복사한 `github_pat_…` 붙여넣기 |

저장 후 **"OK — 소유자/저장소"** 메시지가 뜨면 연결 성공입니다 🎉

---

## 4. 안 될 때 (자주 나오는 메시지별)

- **"Invalid token (401)"** → 토큰이 틀렸거나 만료됨. 2번에서 새로 발급해 다시 입력하세요.
- **"Repo not found or no access (404)"** → 다음을 확인:
  - **사용자명·저장소 철자**가 맞는지 (특히 공유 위키는 소유자가 **관리자 아이디**!)
  - fine-grained 토큰을 만들 때 **그 저장소를 선택**했는지 (2번-4단계)
  - 공유 위키라면 **초대를 수락**했는지 (1번-B)
- **"OK … (PUBLIC!)"** → 연결은 됐지만 저장소가 **공개** 상태입니다. 비공개를 권장 → GitHub 저장소의 *Settings → General → Danger Zone → Change visibility*에서 Private으로 변경.
- **토큰을 복사 못 하고 창을 닫음** → 그냥 2번에서 새로 발급하세요. (토큰은 여러 개 만들어도 됩니다)
- **그래도 안 되면** → 토큰을 새로 발급(만료를 길게)하고, 사용자명/저장소를 GitHub 주소창의 `github.com/사용자명/저장소`와 한 글자씩 대조해 보세요.

---

## 보안 메모
- GitHub 토큰·LLM 키는 **이 기기에만** 저장됩니다. 외부로 전송되지 않고, `api.github.com` 인증 헤더로만 쓰입니다.
- 토큰은 **비밀번호처럼** 다루세요 — 공유·스크린샷 금지. 혹시 노출되면 https://github.com/settings/tokens 에서 **Revoke**(폐기) 후 새로 발급하면 됩니다.

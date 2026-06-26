**English** | [한국어](SETUP.ko.md)

# LLMWiki setup guide (connecting GitHub)

LLMWiki uses **your own private GitHub repository** as its wiki store — there's no server, so your notes live entirely inside your GitHub. On first launch you connect the app to GitHub once. You need two things: **① a wiki repo** and **② an access token (PAT)**.

> 💡 **Most people get stuck on step 2 (the token).** Follow it slowly and you'll be done in ~5 minutes.

---

## 0. You'll need
- A GitHub account — sign up free at https://github.com/signup
- A browser (desktop or phone)

---

## 1. Prepare a wiki repo

It's **one** of these two cases.

### (A) Create your own new wiki
1. Go to https://github.com/new
2. **Repository name**: e.g. `my-wiki`
3. Choose **Private** ✅ (recommended — it's your personal record)
4. Check **Add a README file** ✅ — *don't skip this.* It creates the `main` branch so the app works right away
5. Click **Create repository**

→ You now have `your-username/my-wiki` (owner = you).

### (B) Join a friend's / group's shared wiki
1. When an admin invites you as a **collaborator**, GitHub sends a notification/email
2. Open it (or `https://github.com/OWNER/REPO/invitations`) and click **Accept invitation**

→ You can now access `admin-username/group-wiki` (owner = the **admin's** username, not yours!).

---

## 2. Create an access token (PAT) — ⭐ the important part

The app needs a **token** to read and write the repo. We'll use a **Fine-grained token** (recommended — scoped to a single repo).

1. 👉 Go to **https://github.com/settings/personal-access-tokens/new** (while logged in)
   - Title reads *"New fine-grained personal access token"*
2. **Token name**: `LLMWiki` (any name)
3. **Expiration**: pick a period
   - When it expires the token stops working → just create a new one and re-enter it. Set it long (e.g. custom 1 year) if you'd rather not redo it
4. **Repository access**: choose **"Only select repositories"** → in the dropdown pick the **wiki repo from step 1**
   - For a shared wiki, pick that shared repo
5. **Permissions** → expand **Repository permissions** → scroll to **"Contents"** → set it to **"Read and write"** ✅
   - That's the only one needed. (Metadata is included automatically; leave the rest alone)
6. Click **Generate token** at the bottom → **copy the `github_pat_…` token** shown 📋
   - ⚠️ **The token is shown only once, on this screen.** Copy it before closing. (Lost it? Just make a new one.)

> **Simpler alternative — Classic token**
> https://github.com/settings/tokens/new → add a note → pick expiration → check the **`repo`** scope ✅ → **Generate token** → copy the `ghp_…` value.
> (Easier to make, but it grants access to *all* your repos, so prefer the fine-grained one above.)

---

## 3. Enter it in the app

In the app's **Settings (⚙️)** tab (or the first-run onboarding screen), fill in and **Save**:

| Field | Value |
|---|---|
| **owner** | the repo **owner's** GitHub username — **your username** for your own wiki, the **admin's username** for a shared wiki |
| **repo** | the repository name (e.g. `my-wiki`) |
| **branch** | `main` |
| **token** | paste the `github_pat_…` from step 2 |

If it shows **"OK — owner/repo"**, you're connected 🎉

---

## 4. Troubleshooting (by message)

- **"Invalid token (401)"** → token is wrong or expired. Create a fresh one (step 2).
- **"Repo not found or no access (404)"** → check:
  - the **owner / repo spelling** (for a shared wiki the owner is the **admin's** username!)
  - that you **selected that repo** when creating the fine-grained token (step 2.4)
  - that you **accepted the invitation** for a shared wiki (step 1B)
- **"OK … (PUBLIC!)"** → connected, but the repo is **public**. Make it private under the repo's *Settings → General → Danger Zone → Change visibility*.
- **Closed the page before copying the token** → just create a new one (you can make several).

---

## Security
- Your GitHub token and LLM key are stored **only on this device** — never sent anywhere except as the auth header to `api.github.com`.
- Treat the token like a **password** — don't share or screenshot it. If it leaks, **Revoke** it at https://github.com/settings/tokens and make a new one.

**English** | [한국어](SETUP.ko.md)

# LLMWiki setup guide

LLMWiki uses **your own private GitHub repository** as the wiki — there's no server, so your notes live entirely inside your GitHub. You connect to GitHub once.

> 💡 **It's easy now.** You used to create a token by hand; today it's **one "Sign in with GitHub"**. Just follow step 1.

---

## 0. You'll need
- A **GitHub account** (free: https://github.com/signup)
- The **app**: 📱 phone → https://mynameisjinhohong.github.io/llmwiki-app/ · 🖥 desktop → [INSTALL-desktop.md](INSTALL-desktop.md)

---

## 1. Connect GitHub — "Sign in with GitHub" (recommended, easiest)

1. In the app's **Wiki tab** (or the first-run screen), tap **"Sign in with GitHub"**.
2. A **code** appears (e.g. `AB12-CD34`) and your browser opens → enter the code on GitHub and **Authorize**.
3. That's it — the app connects automatically. **No token to create or copy.**

> Desktop and mobile sign in separately (storage is per-device). You can also sync phone↔PC via the desktop's **Settings → Pair mobile** QR.

---

## 2. Create or choose a wiki

Once connected, pick which wiki to use. In the Wiki tab:

- **🆕 Create a new wiki** — enter a name under "Create a new wiki" → **the app creates and initializes a private GitHub repo** for you.
  > ⚠️ **Don't create the repo yourself on github.com.** The app only treats repos it created (which carry a wiki marker) as wikis. Always use "Create a new wiki".
- **📂 Add from your repos** — "Add a wiki from your GitHub repos" → pick from the list (only marked wiki repos show).
- **👥 Join a group wiki** — see section 3.

Add several wikis (personal / book club / study group…) and **switch between them with one tap** in the Wiki tab.

---

## 3. Use it as a group

Several people share one wiki (serverless — you're just GitHub collaborators on the same private repo).

**Admin (wiki owner):**
1. Wiki tab → **👥 Members** → invite by the person's **GitHub username**.

**Invited member:**
1. In GitHub's notification/email (or `https://github.com/OWNER/REPO/invitations`), click **Accept invitation**.
2. In the app, **Sign in with GitHub** (if you haven't) → **"Add a wiki from your GitHub repos"** → the shared wiki appears → add it.
   > Not there? See "group wiki doesn't appear" in troubleshooting.

Everyone connects with their own account/device, and the results merge into **one integrated wiki**.

---

## 4. Writing: capture → ingest

1. **Capture** — save notes/links/photos in the Capture tab; they land in `inbox` (raw).
2. **Ingest** — turn the inbox into well-synthesized wiki pages. Two ways:
   - **🟢 "API ingest" (easy, no CLI)** — put a **free Gemini key** in Settings → Search LLM, then tap **"API ingest"**. Get a key at https://aistudio.google.com/apikey (no card).
   - **⚙️ CLI ingest (higher quality)** — install **Claude Code** on the desktop + `claude` login, then tap **"Ingest (claude)"**. Handles PDFs etc. well, but needs the install + login.
   - (Group) each host ingests **only its own captures** → both sides land in the shared wiki.

---

## 5. Troubleshooting

- **Signed in, but a repo you own (esp. a new group wiki) isn't listed**
  → An old, narrowly-scoped token may still be active. In the Wiki tab, **re-link via "Sign in with GitHub"** and all your repos will show.
- **"Not an LLMWiki" / manual add is blocked**
  → It's a plain repo you made on github.com. Use **"Create a new wiki"**, or pick a repo that carries the wiki marker.
- **`spawn claude ENOENT` on ingest** (desktop)
  → Claude Code isn't installed on this PC. Use **"API ingest"** (free LLM key), or install Claude Code.
- **A group wiki doesn't appear in the picker**
  → Check that you (1) **accepted the invitation** on GitHub and (2) signed into the app with **the exact invited account**. Still missing? In the Wiki tab use **Advanced: connect manually** with owner = admin's username, repo = wiki name (leave the token blank if you're signed in).
- **"Invalid token (401)" / "Repo not found (404)"** (manual connect)
  → Expired/mistyped token, or wrong owner/repo spelling. Re-link, or match spelling against `github.com/owner/repo`.
- **"OK … (PUBLIC!)"** → connected, but the repo is public. Make it **Private** under the repo's *Settings → General → Change visibility*.

---

## Advanced: connect manually with a token (PAT)

Only needed when OAuth can't be used (plain web browser, org policy, etc.). Wiki tab → **"Advanced: connect manually"**:

1. **Prepare the wiki repo**: create it with the app's **"Create a new wiki"** first (the marker is required). For a group wiki, accept the invite.
2. **Fine-grained token**: https://github.com/settings/personal-access-tokens/new → name it → pick expiration → **Repository access = Only select repositories** (choose that wiki) → **Permissions → Contents = Read and write** → **Generate token** → copy the `github_pat_…`.
3. Enter **owner** / **repo** / **branch** (`main`) / **token** in the advanced form and save.

---

## Security
- Your GitHub token and LLM key are stored **only on this device** — never sent anywhere except as the auth header to `api.github.com`.
- Treat tokens and the pairing QR like a **password** — don't share or screenshot. If leaked, revoke at https://github.com/settings/tokens.

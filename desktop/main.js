// Electron desktop shell for LLMWiki.
// Serves the Expo web export (../dist) via a custom `app://local/` protocol — a
// STABLE origin (so localStorage / saved config persists across launches) with no
// open network port. Same UI as the mobile app.

const { app, BrowserWindow, protocol, shell, ipcMain, globalShortcut, dialog } = require('electron');
const { spawn, execFile } = require('node:child_process');
const http = require('node:http');
const os = require('node:os');
const fs = require('node:fs');
const path = require('node:path');

// In a packaged app the web bundle is placed under Resources (extraResources);
// in dev it's the repo's ../dist (the Expo web export).
const DIST = app.isPackaged
  ? path.join(process.resourcesPath, 'dist')
  : path.join(__dirname, '..', 'dist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
};

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

function resolveFile(reqUrl) {
  let p = decodeURIComponent(new URL(reqUrl).pathname);
  if (!p || p === '/') p = '/index.html';
  let filePath = path.normalize(path.join(DIST, p));
  // SPA fallback + path-escape guard
  if (!filePath.startsWith(DIST) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html');
  }
  return filePath;
}

// ---- Desktop AI agent bridge: run ingest/lint via the local CLI (agent.mjs) ----
// Packaged: agent.mjs is bundled under Resources/agent; config goes to userData (writable,
// since Resources is read-only). Dev: both live in the sibling llmwiki-agent repo.
const AGENT_SCRIPT = app.isPackaged
  ? path.join(process.resourcesPath, 'agent', 'agent.mjs')
  : path.join(__dirname, '..', '..', 'llmwiki-agent', 'agent.mjs');
const AGENT_DIR = path.dirname(AGENT_SCRIPT);
const AGENT_CONFIG = app.isPackaged
  ? path.join(app.getPath('userData'), 'llmwiki-agent.config.json')
  : path.join(__dirname, '..', '..', 'llmwiki-agent', 'llmwiki-agent.config.json');

// GUI apps launched from Finder inherit a minimal PATH; prepend the common Homebrew/local
// bins so the configured CLI (claude/gemini/codex) is found when spawned.
function agentSpawnEnv(extra) {
  return {
    ...process.env,
    PATH: `/opt/homebrew/bin:/usr/local/bin:${process.env.PATH || ''}`,
    ELECTRON_RUN_AS_NODE: '1',
    LLMWIKI_AGENT_CONFIG: AGENT_CONFIG,
    ...(extra || {}),
  };
}

function readAgentConfig() {
  try {
    return JSON.parse(fs.readFileSync(AGENT_CONFIG, 'utf8'));
  } catch {
    return {};
  }
}

ipcMain.handle('agent:getConfig', () => {
  const c = readAgentConfig();
  return {
    runner: c.runner ?? 'claude',
    repoPath: c.repoPath ?? '',
    branch: c.branch ?? 'main',
    runners: ['claude', 'gemini', 'codex'],
    ingestHost: c.ingestHost !== false, // default on; off → this desktop won't auto-ingest
  };
});

ipcMain.handle('agent:setConfig', (_e, patch) => {
  const next = { ...readAgentConfig(), ...(patch || {}) };
  fs.writeFileSync(AGENT_CONFIG, JSON.stringify(next, null, 2) + '\n');
  return { ok: true };
});

let agentRunning = false;

// Run ingest/lint via the local CLI (agent.mjs). Serialized: one at a time.
function runAgent(op, lang) {
  return new Promise((resolve) => {
    if (agentRunning) {
      resolve({ ok: false, busy: true, output: 'A run is already in progress.' });
      return;
    }
    agentRunning = true;
    const finish = (r) => {
      agentRunning = false;
      resolve(r);
    };
    const flag = op === 'lint' ? '--lint' : '--ingest';
    let out = '';
    const child = spawn(process.execPath, [AGENT_SCRIPT, flag], {
      cwd: AGENT_DIR,
      // ELECTRON_RUN_AS_NODE makes Electron run the script as plain Node (no system node needed).
      env: agentSpawnEnv(lang ? { LLMWIKI_AGENT_LANG: lang } : {}),
    });
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (out += d));
    child.on('error', (e) => finish({ ok: false, output: String(e.message) }));
    child.on('close', (code) => finish({ ok: code === 0, output: out.slice(-8000) }));
  });
}

ipcMain.handle('agent:run', (_e, arg) => {
  const op = typeof arg === 'string' ? arg : arg?.op;
  const lang = arg && typeof arg === 'object' ? arg.lang : undefined;
  return runAgent(op, lang);
});

// Read-only wiki search via the local CLI (used by the desktop Ask tab).
ipcMain.handle('agent:query', (_e, arg) =>
  new Promise((resolve) => {
    const question = (arg && arg.question) || '';
    const lang = arg && arg.lang;
    if (!question) {
      resolve({ ok: false, output: '' });
      return;
    }
    let out = '';
    const child = spawn(process.execPath, [AGENT_SCRIPT, '--query'], {
      cwd: AGENT_DIR,
      env: agentSpawnEnv({ LLMWIKI_AGENT_QUERY: question, ...(lang ? { LLMWIKI_AGENT_LANG: lang } : {}) }),
    });
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (out += d));
    child.on('error', (e) => resolve({ ok: false, output: String(e.message) }));
    child.on('close', (code) => resolve({ ok: code === 0, output: out.trim().slice(-12000) }));
  }),
);

// Fetch a public LLM-conversation share link by RENDERING it in a hidden window.
// Claude shares are client-rendered + Cloudflare-gated (curl gets nothing); a real
// Chromium loads them. ChatGPT shares work too. The hidden window is logged-out, so
// Claude renders just the public conversation.
const SHARE_RE = /^https:\/\/(chatgpt\.com|claude\.ai)\/share\//;
const SHARE_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function extractRenderedText(wc) {
  let last = '';
  for (let i = 0; i < 25; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    let t = '';
    try {
      t = await wc.executeJavaScript('(document.body && document.body.innerText) || ""');
    } catch {
      /* page is navigating */
    }
    if (/just a moment|verifying you are human|enable javascript/i.test(t) && i < 12) {
      last = t;
      continue; // possible Cloudflare interstitial — keep waiting
    }
    if (t && t.length > 200 && t === last) return t; // content stabilized
    last = t;
  }
  return last;
}

ipcMain.handle('share:fetch', async (_e, url) => {
  if (!SHARE_RE.test(url || '')) return { ok: false, error: 'unsupported url' };
  const w = new BrowserWindow({ show: false, webPreferences: { javascript: true } });
  try {
    await w.loadURL(url, { userAgent: SHARE_UA });
    const text = await extractRenderedText(w.webContents);
    if (/just a moment|verifying you are human/i.test(text)) {
      return { ok: false, error: 'blocked by Cloudflare — copy the conversation text instead' };
    }
    return { ok: true, text: (text || '').slice(0, 100000) };
  } catch (e) {
    return { ok: false, error: String((e && e.message) || e) };
  } finally {
    if (!w.isDestroyed()) w.destroy();
  }
});

// ---- Storeless install + pairing: serve the latest APK + a landing page on the LAN ----
const PAIR_PORT = 8788;
const APK_DIRS = [path.join(__dirname, 'apk'), '/tmp/llmwiki-apk'];

function lanIP() {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const i of ifaces[name] || []) {
      if (i.family === 'IPv4' && !i.internal) return i.address;
    }
  }
  return null;
}

function latestApk() {
  for (const dir of APK_DIRS) {
    try {
      const fixed = path.join(dir, 'llmwiki.apk');
      if (fs.existsSync(fixed)) return fixed;
      const files = fs
        .readdirSync(dir)
        .filter((f) => /\.apk$/.test(f))
        .map((f) => ({ f, m: fs.statSync(path.join(dir, f)).mtimeMs }))
        .sort((a, b) => b.m - a.m);
      if (files.length) return path.join(dir, files[0].f);
    } catch {
      /* dir missing */
    }
  }
  return null;
}

const PAIR_HTML = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LLMWiki</title></head>
<body style="font-family:system-ui,-apple-system,sans-serif;max-width:420px;margin:0 auto;padding:36px 22px;text-align:center;color:#111">
<h2 style="margin-bottom:8px">LLMWiki 연동</h2>
<p id="msg" style="color:#555">앱을 여는 중…</p>
<p><a id="apk" href="/llmwiki.apk" style="display:none;background:#2563eb;color:#fff;padding:14px 22px;border-radius:10px;text-decoration:none;font-weight:600">앱 설치 (APK)</a></p>
<p><button id="pairbtn" onclick="openApp()" style="display:none;background:#e5e7eb;border:0;padding:12px 18px;border-radius:10px;font-size:15px">앱에서 열기 / 연동</button></p>
<script>
var d=new URLSearchParams(location.search).get('d');
function openApp(){ if(d) location.href='llmwiki://pair?d='+d; }
var left=false; document.addEventListener('visibilitychange',function(){ if(document.hidden) left=true; });
if(d) openApp();
setTimeout(function(){ if(!left){ document.getElementById('msg').textContent='앱이 안 열렸나요? 처음이면 설치하고, 설치 후 이 페이지를 새로고침하면 연동됩니다.'; document.getElementById('apk').style.display='inline-block'; if(d) document.getElementById('pairbtn').style.display='inline-block'; } }, 1500);
</script></body></html>`;

let pairServer = null;
function startPairServer() {
  if (pairServer) return;
  pairServer = http.createServer((req, res) => {
    let pathname = '/';
    try {
      pathname = new URL(req.url, 'http://localhost').pathname;
    } catch {
      /* default */
    }
    if (pathname === '/llmwiki.apk') {
      const apk = latestApk();
      if (!apk) {
        res.writeHead(404);
        return res.end('no apk available');
      }
      res.writeHead(200, {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="llmwiki.apk"',
      });
      return fs.createReadStream(apk).pipe(res);
    }
    if (pathname === '/pair' || pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(PAIR_HTML);
    }
    res.writeHead(404);
    res.end('not found');
  });
  pairServer.on('error', (e) => console.error('pair server:', e.message));
  pairServer.listen(PAIR_PORT, '0.0.0.0', () => console.log(`pair/apk server on 0.0.0.0:${PAIR_PORT}`));
}

ipcMain.handle('pair:baseUrl', () => {
  const ip = lanIP();
  return ip ? `http://${ip}:${PAIR_PORT}` : null;
});

// ---- App version (shown in Settings so the user can see what build they're on) ----
ipcMain.handle('app:version', () => app.getVersion());

// ---- Launch at login (auto-start on boot) — macOS/Windows via the OS login items ----
ipcMain.handle('autolaunch:get', () => {
  try {
    // Electron's login-item API is macOS/Windows only.
    if (process.platform === 'linux') return { supported: false, enabled: false };
    return { supported: true, enabled: app.getLoginItemSettings().openAtLogin };
  } catch (e) {
    return { supported: false, enabled: false, error: String((e && e.message) || e) };
  }
});
ipcMain.handle('autolaunch:set', (_e, enabled) => {
  try {
    if (process.platform === 'linux') return { ok: false, supported: false, enabled: false };
    app.setLoginItemSettings({ openAtLogin: !!enabled, openAsHidden: false });
    return { ok: true, supported: true, enabled: app.getLoginItemSettings().openAtLogin };
  } catch (e) {
    return { ok: false, supported: true, enabled: false, error: String((e && e.message) || e) };
  }
});

// ---- Auto-update via electron-updater (Windows). The build's `publish` config bundles
// an app-update.yml pointing at the desktop-latest release; clicking "Update" downloads
// the new installer in the background and silently installs + relaunches the app.
let autoUpdater = null;
try {
  autoUpdater = require('electron-updater').autoUpdater;
} catch {
  // module not bundled (e.g. older build) → update feature simply disabled, no crash
}

function progressWin() {
  return BrowserWindow.getAllWindows().find((w) => !w.isDestroyed());
}

if (autoUpdater) {
  autoUpdater.autoDownload = false; // ask the user first
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.on('download-progress', (p) => {
    try {
      progressWin()?.setProgressBar(Math.max(0, Math.min(1, (p.percent || 0) / 100)));
    } catch {}
  });
  autoUpdater.on('update-downloaded', () => {
    try {
      progressWin()?.setProgressBar(-1);
    } catch {}
    autoUpdater.quitAndInstall(true, true); // silent install + relaunch
  });
  autoUpdater.on('error', () => {
    try {
      progressWin()?.setProgressBar(-1);
    } catch {}
  });
}

ipcMain.handle('update:check', async (_e, lang) => {
  let current = '';
  try {
    current = app.getVersion();
  } catch {}
  if (!autoUpdater) return { status: 'unavailable', current };
  if (process.platform !== 'win32') return { status: 'unsupported', current };
  if (!app.isPackaged) return { status: 'dev', current };
  const ko = lang === 'ko';
  try {
    const r = await autoUpdater.checkForUpdates();
    const latest = (r && r.updateInfo && r.updateInfo.version) || current;
    if (!r || !r.isUpdateAvailable) return { status: 'uptodate', current, latest };
    const choice = await dialog.showMessageBox({
      type: 'info',
      title: ko ? '업데이트 있음' : 'Update available',
      message: ko ? `LLMWiki 새 버전(${latest})이 있습니다.` : `LLMWiki ${latest} is available.`,
      detail: ko
        ? '지금 다운로드해 자동으로 업데이트할까요? 다운로드가 끝나면 앱이 재시작됩니다. 설정은 유지됩니다.'
        : 'Download and install now? The app restarts when it finishes. Your settings are kept.',
      buttons: ko ? ['업데이트', '나중에'] : ['Update', 'Later'],
      defaultId: 0,
      cancelId: 1,
    });
    if (choice.response === 0) autoUpdater.downloadUpdate(); // → 'update-downloaded' → quitAndInstall
    return { status: 'available', current, latest };
  } catch (e) {
    return { status: 'error', current, error: String((e && e.message) || e) };
  }
});

// ---- Poller: while the app is open, watch GitHub for a mobile ingest trigger ----
function git(args) {
  return new Promise((resolve) => {
    execFile('git', args, { maxBuffer: 8 * 1024 * 1024 }, (e, so) => resolve({ ok: !e, out: (so || '').trim() }));
  });
}

let pollerTimer = null;
async function pollTick() {
  if (agentRunning) return; // serialize with manual runs
  const cfg = readAgentConfig();
  if (cfg.ingestHost === false) return; // this desktop opted out of being the ingest host
  const repo = cfg.repoPath;
  const branch = cfg.branch || 'main';
  if (!repo) return;
  const f = await git(['-C', repo, 'fetch', 'origin', branch]);
  if (!f.ok) return;
  const trig = await git(['-C', repo, 'cat-file', '-e', `origin/${branch}:.llmwiki/ingest-request.json`]);
  if (!trig.ok) return; // no pending trigger
  // agent.mjs --ingest pulls, ingests, removes the trigger, and pushes.
  await runAgent('ingest', undefined);
}

function startPoller() {
  if (pollerTimer) return;
  const cfg = readAgentConfig();
  const ms = Math.max(10, cfg.intervalSec || 20) * 1000;
  pollerTimer = setInterval(() => {
    pollTick().catch(() => {});
  }, ms);
}

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 440,
    height: 860,
    title: 'LLMWiki',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('app://')) return { action: 'allow' };
    shell.openExternal(url);
    return { action: 'deny' };
  });
  win.loadURL('app://local/');
}

app.whenReady().then(() => {
  protocol.handle('app', async (request) => {
    if (!fs.existsSync(path.join(DIST, 'index.html'))) {
      return new Response('<h2 style="font-family:sans-serif;padding:24px">web build missing — run <code>npx expo export -p web</code> in the mobile repo</h2>', {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    const filePath = resolveFile(request.url);
    const data = await fs.promises.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    return new Response(data, { headers: { 'Content-Type': MIME[ext] || 'application/octet-stream' } });
  });
  createWindow();
  startPoller(); // watch GitHub for mobile ingest triggers while the app is open
  startPairServer(); // serve the APK + pairing landing page on the LAN

  // Global quick-capture: copy anything, press ⌘⇧L → app focuses and the renderer
  // seeds the clipboard into the Capture field (listens for 'quick-capture').
  globalShortcut.register('CommandOrControl+Shift+L', () => {
    if (!win) return;
    if (win.isMinimized()) win.restore();
    win.show();
    win.focus();
    win.webContents.send('quick-capture');
  });
});

app.on('will-quit', () => {
  if (pollerTimer) clearInterval(pollerTimer);
  if (pairServer) pairServer.close();
  globalShortcut.unregisterAll();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

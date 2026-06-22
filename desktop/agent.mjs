// llmwiki-agent — runs wiki ingest/lint on this machine via an installed AI CLI
// (Claude Code / Gemini / Codex), driven either by a GitHub trigger (poll mode) or
// directly (--ingest / --lint). Outbound-only: it makes git calls to GitHub and
// spawns a local CLI. No inbound network surface.
//
//   node agent.mjs            # poll GitHub for a trigger, then ingest
//   node agent.mjs --once     # one poll tick, then exit
//   node agent.mjs --ingest   # ingest now (no trigger needed), then exit
//   node agent.mjs --lint     # lint now, then exit
//   node agent.mjs --dry      # (with poll) detect trigger only; never run the CLI or push
//
// Node built-ins only. The desktop app spawns this with Electron's bundled node.

import { execFile, spawn } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = process.env.LLMWIKI_AGENT_CONFIG || join(HERE, 'llmwiki-agent.config.json');
const ONCE = process.argv.includes('--once');
const DRY = process.argv.includes('--dry');
const INGEST_NOW = process.argv.includes('--ingest');
const LINT_NOW = process.argv.includes('--lint');
const QUERY = process.argv.includes('--query');

function loadConfig() {
  const def = {
    repoPath: '',
    branch: 'main',
    runner: 'claude',
    intervalSec: 20,
    triggerPath: '.llmwiki/ingest-request.json',
    auto: false,
    runners: {
      claude: { cmd: 'claude', args: ['-p', '{PROMPT}', '--permission-mode', 'bypassPermissions'] },
      gemini: { cmd: 'gemini', args: ['-y', '-p', '{PROMPT}'] },
      codex: { cmd: 'codex', args: ['exec', '--full-auto', '{PROMPT}'] },
    },
    git: { push: true },
  };
  if (existsSync(CONFIG_PATH)) {
    try {
      Object.assign(def, JSON.parse(readFileSync(CONFIG_PATH, 'utf8')));
    } catch (e) {
      console.error('config parse error:', e.message);
    }
  }
  return def;
}

const cfg = loadConfig();

function readContentLang() {
  try {
    const j = JSON.parse(readFileSync(join(cfg.repoPath, '.llmwiki.json'), 'utf8'));
    if (typeof j.contentLanguage === 'string') return j.contentLanguage;
  } catch {
    /* ignore */
  }
  return '';
}

// Language for the agent's user-facing report: app UI lang (env, set by the desktop
// app) > config > wiki content language > English.
const REPORT_LANG = process.env.LLMWIKI_AGENT_LANG || cfg.reportLang || readContentLang() || 'en';
const LANG_NAMES = { ko: 'Korean (한국어)', en: 'English', ja: 'Japanese (日本語)', zh: 'Chinese (中文)' };
const LANG_LINE = `Write your final summary/report to the user in ${LANG_NAMES[REPORT_LANG] || REPORT_LANG}.`;

const INGEST_PROMPT = [
  'Process my inbox and ingest it into the wiki, following docs/wiki-schema.md EXACTLY (read it first).',
  '- Turn each top-level item in inbox/ (*.md) into well-synthesized, interlinked wiki pages under wiki/.',
  '- Image captures: an inbox note with an ![](media/...) reference points to a binary in inbox/media/.',
  '  Move that binary to sources/media/, OCR/caption it, and embed it in the relevant page.',
  '- Update wiki/index.md and append a dated block to wiki/log.md.',
  '- Move each processed inbox item to inbox/archive/YYYY-MM/.',
  '- Redact any secrets per the schema HARD RULES.',
  '- IMPORTANT: do NOT run git (no add/commit/push) — the wrapper handles git.',
  'Finish with a one-paragraph summary of pages created/updated and any redactions.',
  LANG_LINE,
].join('\n');

const LINT_PROMPT = [
  'Lint my wiki, following docs/wiki-schema.md §6 (read it first).',
  '- Check: contradictions, stale claims, orphan pages, broken [[wikilinks]], missing backlinks, duplicate pages, index drift.',
  '- AUTO-FIX only safe structural issues: broken links, missing backlinks, and index.md entries.',
  '- Do NOT merge, delete, or reword content — only report those.',
  '- IMPORTANT: do NOT run git (no add/commit/push) — the wrapper handles git.',
  'Finish with a short report: issues found and fixes applied.',
  LANG_LINE,
].join('\n');

/** Read-only wiki query (search) prompt, per docs/wiki-schema.md §6. */
function queryPrompt(q) {
  return [
    'Answer this question from my wiki, following docs/wiki-schema.md §6 (Query).',
    `QUESTION: ${q}`,
    '- Search wiki/ (grep/read) for relevant pages.',
    '- Synthesize an answer. Cite each claim with [[Page]].',
    '- If the wiki has no good answer, say so plainly — do not invent.',
    '- READ-ONLY: do not modify, create, or delete files, and do not run git.',
    LANG_LINE,
  ].join('\n');
}

function git(args) {
  return new Promise((resolve) => {
    execFile('git', ['-C', cfg.repoPath, ...args], { maxBuffer: 16 * 1024 * 1024 }, (err, stdout, stderr) => {
      resolve({ ok: !err, stdout: (stdout || '').trim(), stderr: (stderr || '').trim() });
    });
  });
}

function runCli(runnerName, prompt) {
  const r = cfg.runners[runnerName];
  if (!r) return Promise.resolve({ ok: false, output: `unknown runner: ${runnerName}` });
  const args = r.args.map((a) => a.replace('{PROMPT}', prompt));
  return new Promise((resolve) => {
    let out = '';
    let errOut = '';
    const child = spawn(r.cmd, args, { cwd: cfg.repoPath, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (errOut += d));
    child.on('error', (e) => resolve({ ok: false, output: `spawn error: ${e.message}` }));
    child.on('close', (code) => resolve({ ok: code === 0, output: out.trim() || errOut.trim(), code }));
  });
}

async function triggerPresent() {
  const f = await git(['fetch', 'origin', cfg.branch]);
  if (!f.ok) {
    console.error('fetch failed:', f.stderr);
    return false;
  }
  const t = await git(['cat-file', '-e', `origin/${cfg.branch}:${cfg.triggerPath}`]);
  if (t.ok) return true;
  if (cfg.auto) {
    const ls = await git(['ls-tree', '--name-only', `origin/${cfg.branch}`, 'inbox/']);
    return ls.stdout.split('\n').some((p) => /^inbox\/[^/]+\.md$/.test(p));
  }
  return false;
}

/** kind: 'ingest' | 'lint'. Pull → run CLI → (ingest: clear trigger) → commit/push. */
async function applyOp(kind) {
  const pull = await git(['pull', '--rebase', 'origin', cfg.branch]);
  if (!pull.ok) {
    console.error('  pull failed:', pull.stderr);
    return { ok: false, error: 'pull failed: ' + pull.stderr };
  }
  console.log(`  running ${cfg.runner} (${kind})…`);
  const cli = await runCli(cfg.runner, kind === 'lint' ? LINT_PROMPT : INGEST_PROMPT);
  console.log(`  cli(${cfg.runner}): ${cli.ok ? 'ok' : 'exit ' + cli.code}`);
  if (kind === 'ingest' && existsSync(join(cfg.repoPath, cfg.triggerPath))) {
    await git(['rm', '-f', '--', cfg.triggerPath]);
  }
  await git(['add', '-A']);
  const status = await git(['status', '--porcelain']);
  if (!status.stdout) {
    return { ok: true, changed: 0, summary: cli.output };
  }
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const commit = await git(['commit', '-m', `${kind} (agent/${cfg.runner}): ${stamp}`]);
  let pushed = false;
  if (cfg.git.push && commit.ok) {
    const p = await git(['push', 'origin', cfg.branch]);
    pushed = p.ok;
    if (!p.ok) console.error('  push failed:', p.stderr);
  }
  console.log(`  committed=${commit.ok} pushed=${pushed}`);
  return { ok: commit.ok, changed: status.stdout.split('\n').filter(Boolean).length, pushed, summary: cli.output };
}

async function tick() {
  if (!(await triggerPresent())) return;
  console.log(`${new Date().toISOString()}  trigger detected → ingest (${cfg.runner})`);
  if (DRY) {
    console.log('  [dry] would: pull → run CLI → remove trigger → commit/push');
    return;
  }
  await applyOp('ingest');
}

async function main() {
  if (!cfg.repoPath) {
    console.error('repoPath not configured in', CONFIG_PATH);
    process.exit(1);
  }

  if (QUERY) {
    const question = process.env.LLMWIKI_AGENT_QUERY || '';
    if (!question) {
      console.error('no query provided (LLMWIKI_AGENT_QUERY)');
      process.exit(1);
    }
    const cli = await runCli(cfg.runner, queryPrompt(question));
    process.stdout.write(cli.output || '');
    process.exit(cli.ok ? 0 : 1);
  }

  if (INGEST_NOW || LINT_NOW) {
    const kind = LINT_NOW ? 'lint' : 'ingest';
    console.log(`llmwiki-agent ${kind} (direct)  repo=${cfg.repoPath}  runner=${cfg.runner}`);
    const r = await applyOp(kind);
    if (r.summary) console.log('\n--- summary ---\n' + r.summary);
    process.exit(r.ok ? 0 : 1);
  }

  console.log(
    `llmwiki-agent poller  repo=${cfg.repoPath}  runner=${cfg.runner}  every=${cfg.intervalSec}s  trigger=${cfg.triggerPath}${cfg.auto ? '  (auto)' : ''}${DRY ? '  [DRY]' : ''}`,
  );
  for (;;) {
    try {
      await tick();
    } catch (e) {
      console.error('tick error:', e?.message ?? e);
    }
    if (ONCE) break;
    await new Promise((r) => setTimeout(r, cfg.intervalSec * 1000));
  }
}

main();

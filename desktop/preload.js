// Exposes a minimal, safe bridge to the renderer (the shared React app).
// The web app checks `window.llmwiki?.isDesktop` to enable desktop-only features
// (running ingest/lint via the local AI CLI through the main process).
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('llmwiki', {
  isDesktop: true,
  agentGetConfig: () => ipcRenderer.invoke('agent:getConfig'),
  agentSetConfig: (patch) => ipcRenderer.invoke('agent:setConfig', patch),
  agentRun: (op, lang) => ipcRenderer.invoke('agent:run', { op, lang }), // op: 'ingest' | 'lint'
  agentQuery: (question, lang) => ipcRenderer.invoke('agent:query', { question, lang }),
  onQuickCapture: (cb) => ipcRenderer.on('quick-capture', () => cb()),
  fetchShare: (url) => ipcRenderer.invoke('share:fetch', url),
  getPairBaseUrl: () => ipcRenderer.invoke('pair:baseUrl'),
  getAutoLaunch: () => ipcRenderer.invoke('autolaunch:get'),
  setAutoLaunch: (enabled) => ipcRenderer.invoke('autolaunch:set', enabled),
  checkUpdate: (lang) => ipcRenderer.invoke('update:check', lang),
  getAppVersion: () => ipcRenderer.invoke('app:version'),
});

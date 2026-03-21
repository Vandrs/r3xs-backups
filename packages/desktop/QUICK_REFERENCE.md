# Quick Reference - Electron Desktop Package

## 📁 File Structure
```
src/
├── main/
│   ├── index.js         → App lifecycle (whenReady, quit, activate)
│   ├── window.js        → BrowserWindow factory (createWindow)
│   └── ipc-handlers.js  → 4 IPC handlers + core integration
├── preload/
│   └── index.js         → contextBridge API (7 methods)
└── renderer/
    └── index.html       → UI (minimal test page)
```

## 🔌 API Surface (window.electronAPI)

| Method                     | Returns                  | Description                    |
|----------------------------|--------------------------|--------------------------------|
| `selectSourceDir()`        | `Promise<string\|null>`  | Open folder dialog (source)    |
| `selectDestDir()`          | `Promise<string\|null>`  | Open folder dialog (dest)      |
| `startBackup(options)`     | `Promise<{success,...}>` | Start backup operation         |
| `cancelBackup()`           | `Promise<{success,...}>` | Cancel running backup          |
| `onBackupProgress(cb)`     | `Function` (cleanup)     | Listen to progress events      |
| `onBackupComplete(cb)`     | `Function` (cleanup)     | Listen to completion event     |
| `onBackupError(cb)`        | `Function` (cleanup)     | Listen to error events         |

## 📤 IPC Events (Main → Renderer)

| Event              | Payload                                              |
|--------------------|------------------------------------------------------|
| `backup-progress`  | `{ phase, current, total, currentFile, stats }`     |
| `backup-complete`  | `{ success, stats, message }`                       |
| `backup-error`     | `{ message }`                                       |

## 🚀 Commands

```bash
npm install          # Install deps
npm test             # Run tests (7 tests)
npm run lint         # ESLint check
npm run dev          # Launch app (dev mode)
npm run build        # Build distributable
```

## 🔒 Security Flags

```javascript
webPreferences: {
  contextIsolation: true,   // ✅ Isolate renderer from Node.js
  nodeIntegration: false,   // ✅ Disable require() in renderer
  sandbox: true,            // ✅ Enable OS-level sandbox
  preload: 'path/to/preload.js'
}
```

## 🧪 Quick Test

```bash
NODE_ENV=development npm run dev
# Then in DevTools console:
window.electronAPI  // Should be defined
require('fs')       // Should throw error
```

## 📦 Dependencies

- `electron` 28.1.0 (devDep)
- `@r3xs-backup/core` * (dep)
- `jest` 29.7.0 (devDep)
- `eslint` 8.56.0 (devDep)

## 🎯 Coverage Targets

- IPC handlers: ✅ 81.25% (target: 80%+)
- Overall: 47.27% (entry/window need integration tests)

## 📋 Commit Message

```
feat: implement Electron main process and preload script

Implements secure Electron desktop app structure:
- Main process with app lifecycle management
- BrowserWindow factory with security best practices
- IPC handlers integrating @r3xs-backup/core services
- Preload script exposing minimal contextBridge API

Security:
- contextIsolation, sandbox, no nodeIntegration
- Minimal API surface (7 methods)
- Input validation on all IPC handlers

Tests: 7/7 unit tests passing, 81% coverage on handlers
```

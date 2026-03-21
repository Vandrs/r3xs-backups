# Electron Architecture Overview

## Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         RENDERER PROCESS                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  index.html (UI)                                           │ │
│  │  - Form inputs (source/dest dirs, mode, strategy)          │ │
│  │  - Progress display                                        │ │
│  │  - Status messages                                         │ │
│  └─────────────────────────┬──────────────────────────────────┘ │
│                            │                                     │
│                            │ window.electronAPI                  │
│                            │ (exposed by contextBridge)          │
│                            ▼                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  SAFE API SURFACE (preload/index.js)                       │ │
│  │  • selectSourceDir()                                       │ │
│  │  • selectDestDir()                                         │ │
│  │  • startBackup(options)                                    │ │
│  │  • cancelBackup()                                          │ │
│  │  • onBackupProgress(callback)                              │ │
│  │  • onBackupComplete(callback)                              │ │
│  │  • onBackupError(callback)                                 │ │
│  └─────────────────────────┬──────────────────────────────────┘ │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             │ IPC (contextIsolation barrier)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                          MAIN PROCESS                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  index.js (App Lifecycle)                                  │ │
│  │  • app.whenReady() → registerIpcHandlers() + createWindow()│ │
│  │  • window-all-closed → quit                                │ │
│  │  • activate → recreate window (macOS)                      │ │
│  └─────────────────────────┬──────────────────────────────────┘ │
│                            │                                     │
│                            ▼                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  window.js (BrowserWindow Factory)                         │ │
│  │  • createWindow() → BrowserWindow with security flags      │ │
│  │  • load index.html                                         │ │
│  │  • DevTools (dev mode only)                                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ipc-handlers.js (Business Logic Orchestration)            │ │
│  │                                                             │ │
│  │  IPC HANDLERS:                                             │ │
│  │  ┌──────────────────┐  ┌──────────────────┐                │ │
│  │  │ select-source-dir├─▶│ dialog.showOpen  │                │ │
│  │  └──────────────────┘  └──────────────────┘                │ │
│  │  ┌──────────────────┐  ┌──────────────────┐                │ │
│  │  │ select-dest-dir  ├─▶│ dialog.showOpen  │                │ │
│  │  └──────────────────┘  └──────────────────┘                │ │
│  │  ┌──────────────────┐  ┌──────────────────────────────┐    │ │
│  │  │ start-backup     ├─▶│ 1. validatePaths()           │    │ │
│  │  │                  │  │ 2. scanFiles()               │    │ │
│  │  │                  │  │ 3. copyFilesWithProgress()   │    │ │
│  │  │                  │  │ 4. emit progress events      │    │ │
│  │  └──────────────────┘  └──────────────────────────────┘    │ │
│  │  ┌──────────────────┐  ┌──────────────────┐                │ │
│  │  │ cancel-backup    ├─▶│ set cancel flag  │                │ │
│  │  └──────────────────┘  └──────────────────┘                │ │
│  └─────────────────────────┬──────────────────────────────────┘ │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             │ require('@r3xs-backup/core')
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                       @r3xs-backup/core                           │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  validatePaths(source, dest) → {valid, error?}             │  │
│  │  scanFiles(source, mode) → string[]                        │  │
│  │  copyFiles(files, source, dest, strategy) → stats          │  │
│  └────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

## Security Boundaries

### 🔒 Renderer Process (Sandboxed)
- **NO** direct Node.js access (`require` disabled)
- **NO** Electron API access
- **ONLY** access to `window.electronAPI` (via contextBridge)

### 🛡️ Preload Script (Privileged but Isolated)
- Runs with Node.js access
- **ONLY** exposes whitelisted APIs via `contextBridge`
- Cannot be modified by renderer
- Single responsibility: API bridge

### 🔐 Main Process (Fully Privileged)
- Full Node.js and Electron API access
- Validates ALL IPC inputs
- Orchestrates business logic via core services
- Never exposes raw Node.js/fs APIs to renderer

---

## Data Flow: Backup Operation

```
USER ACTION (Renderer)
  │
  └─▶ Click "Start Backup"
       │
       └─▶ window.electronAPI.startBackup({
             sourcePath: '/mnt/sdcard',
             destPath: '/home/backup',
             mode: 'full',
             conflictStrategy: 'overwrite'
           })
            │
            │ (IPC invoke)
            ▼
       ┌────────────────────────────────────────┐
       │ MAIN PROCESS: start-backup handler     │
       ├────────────────────────────────────────┤
       │ 1. Validate paths                      │
       │    └─▶ @r3xs-backup/core.validatePaths │
       │                                        │
       │ 2. Scan files                          │
       │    └─▶ @r3xs-backup/core.scanFiles     │
       │                                        │
       │ 3. Copy files (loop)                   │
       │    ┌─▶ @r3xs-backup/core.copyFiles     │
       │    │   (1 file at a time)              │
       │    │                                   │
       │    ├─▶ Check cancel flag               │
       │    │                                   │
       │    └─▶ Every 10 files OR 1s:           │
       │        event.sender.send(              │
       │          'backup-progress',            │
       │          { current, total, stats }     │
       │        )                               │
       │                                        │
       │ 4. Complete                            │
       │    └─▶ event.sender.send(              │
       │          'backup-complete',            │
       │          { success, stats }            │
       │        )                               │
       └────────────────────────────────────────┘
            │
            │ (IPC events)
            ▼
       ┌────────────────────────────────────────┐
       │ RENDERER: Event Listeners              │
       ├────────────────────────────────────────┤
       │ onBackupProgress((data) => {           │
       │   updateProgressBar(data.current,      │
       │                     data.total)        │
       │   updateStats(data.stats)              │
       │ })                                     │
       │                                        │
       │ onBackupComplete((data) => {           │
       │   showSuccessMessage(data.message)     │
       │ })                                     │
       └────────────────────────────────────────┘
            │
            ▼
       USER SEES UPDATED UI
```

---

## File Responsibilities

### `src/main/index.js` (29 lines)
- **Single Responsibility:** Application lifecycle management
- **Dependencies:** window.js, ipc-handlers.js
- **Exports:** None (entry point)
- **SOLID:** Single Responsibility — only handles app lifecycle events

### `src/main/window.js` (50 lines)
- **Single Responsibility:** BrowserWindow creation and configuration
- **Dependencies:** Electron (BrowserWindow)
- **Exports:** `createWindow()`
- **SOLID:** 
  - Single Responsibility — only creates windows
  - Open/Closed — can extend with new window types without modifying

### `src/main/ipc-handlers.js` (213 lines)
- **Single Responsibility:** IPC communication orchestration
- **Dependencies:** Electron (ipcMain, dialog), @r3xs-backup/core
- **Exports:** `registerIpcHandlers()`
- **SOLID:**
  - Single Responsibility — only registers and handles IPC
  - Dependency Inversion — depends on core abstractions, not implementations

### `src/preload/index.js` (68 lines)
- **Single Responsibility:** Secure API bridge
- **Dependencies:** Electron (contextBridge, ipcRenderer)
- **Exports:** None (side-effect: exposes `window.electronAPI`)
- **SOLID:**
  - Interface Segregation — minimal API surface
  - Open/Closed — new APIs added without changing existing

---

## Testing Strategy

### Unit Tests
- ✅ `ipc-handlers.test.js` — Mock Electron APIs, verify handler logic
- 🔲 `window.test.js` — (Future) Test window configuration

### Integration Tests
- 🔲 E2E with Spectron — Launch full app, test UI interactions
- 🔲 IPC flow tests — Verify end-to-end backup execution

### Manual Tests
- ✅ `npm run dev` → Verify UI loads
- ✅ DevTools console → Verify `window.electronAPI` exists
- ✅ Security test → Verify `require` is blocked in renderer

---

## Security Checklist ✅

| Protection                          | Status | Implementation               |
|-------------------------------------|--------|------------------------------|
| Context Isolation                   | ✅     | `contextIsolation: true`     |
| Node Integration Disabled           | ✅     | `nodeIntegration: false`     |
| Sandbox Enabled                     | ✅     | `sandbox: true`              |
| Minimal Preload API                 | ✅     | Only 7 methods exposed       |
| Content Security Policy             | ✅     | CSP header in index.html     |
| IPC Input Validation                | ✅     | validatePaths() before exec  |
| No Remote Module                    | ✅     | Not used                     |
| No eval() in Renderer               | ✅     | Not used                     |
| HTTPS-only External Resources       | ✅     | No external resources        |
| Signed Builds                       | 🔲     | TODO: Configure code signing |

---

## Performance Considerations

- **Progress Throttling:** Updates sent max every 1s to avoid flooding IPC
- **Async Operations:** All file operations use async/await (non-blocking)
- **Cancellation:** Checks flag between files (< 1s response time)
- **Memory:** No file buffering (core handles streaming)

---

## Known Limitations

1. **No Multi-Window Support:** Single BrowserWindow only
2. **No State Persistence:** Window size/position not saved
3. **No Auto-Update:** electron-updater not configured yet
4. **No Logging:** Console.error only (no file logging)

**Rationale:** KISS principle — features added only when needed.

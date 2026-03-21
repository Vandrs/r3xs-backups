# Desktop App Testing Guide

## Quick Start

```bash
cd packages/desktop
npm install
NODE_ENV=development npm run dev
```

---

## Manual Testing Checklist

### ✅ 1. App Launch
- [ ] Window opens with 1000x700 size
- [ ] Title shows "R3XS Backup"
- [ ] DevTools opens automatically (development mode)
- [ ] No console errors

### ✅ 2. Security Verification

Open DevTools console and run:

```javascript
// Should FAIL (security working)
require('fs')
// ❌ Error: require is not defined

process.exit()
// ❌ Error: process is not defined

// Should SUCCEED (API exposed)
window.electronAPI
// ✅ Object { selectSourceDir: function, ... }

Object.keys(window.electronAPI)
// ✅ Array [ "selectSourceDir", "selectDestDir", ... ]
```

### ✅ 3. Dialog Selection

Click the test buttons in the UI:

- [ ] **"Selecionar Origem"** → Native folder dialog opens
- [ ] Select a folder → Path appears in status
- [ ] **"Selecionar Destino"** → Native folder dialog opens
- [ ] Cancel dialog → Status shows "cancelado"

### ✅ 4. Backup Flow (Console Test)

In DevTools console:

```javascript
// Register progress listener
const cleanupProgress = window.electronAPI.onBackupProgress((data) => {
  console.log('📊 Progress:', data);
});

const cleanupComplete = window.electronAPI.onBackupComplete((data) => {
  console.log('✅ Complete:', data);
});

const cleanupError = window.electronAPI.onBackupError((error) => {
  console.error('❌ Error:', error);
});

// Start backup (adjust paths to your system)
const result = await window.electronAPI.startBackup({
  sourcePath: '/path/to/test/roms',  // Must exist!
  destPath: '/tmp/backup-test',
  mode: 'full',
  conflictStrategy: 'overwrite'
});

console.log('Result:', result);

// Cleanup listeners when done
cleanupProgress();
cleanupComplete();
cleanupError();
```

**Expected console output:**
```
📊 Progress: { phase: 'scanning', message: 'Escaneando arquivos...' }
📊 Progress: { phase: 'copying', current: 0, total: 15, ... }
📊 Progress: { phase: 'copying', current: 10, total: 15, ... }
📊 Progress: { phase: 'copying', current: 15, total: 15, stats: { success: 15, failed: 0, skipped: 0 } }
✅ Complete: { success: true, stats: { ... }, message: 'Backup concluído...' }
```

### ✅ 5. Error Handling

Test with invalid paths:

```javascript
const result = await window.electronAPI.startBackup({
  sourcePath: '/nonexistent/path',
  destPath: '/tmp/test',
  mode: 'full',
  conflictStrategy: 'overwrite'
});

console.log(result);
// ❌ Error: { success: false, error: 'Diretório de origem não existe...' }
```

### ✅ 6. Cancellation

```javascript
// Start a long backup
window.electronAPI.startBackup({
  sourcePath: '/large/roms/folder',
  destPath: '/tmp/backup',
  mode: 'full',
  conflictStrategy: 'overwrite'
});

// Cancel after 2 seconds
setTimeout(async () => {
  const result = await window.electronAPI.cancelBackup();
  console.log('Cancel result:', result);
}, 2000);
```

### ✅ 7. Window Behavior

- [ ] Resize window → Min size enforced (800x600)
- [ ] Close window → App quits (Windows/Linux)
- [ ] Close window → App stays in dock (macOS)
- [ ] macOS: Click dock icon → Window recreates

---

## Automated Tests

```bash
# Run unit tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm run test:watch

# Lint code
npm run lint
```

**Expected results:**
```
Test Suites: 1 passed
Tests:       7 passed
Coverage:    81.25% (ipc-handlers.js)
Lint:        0 errors
```

---

## Production Build Test

```bash
# Build for current platform
npm run build

# Test built app (Linux)
./dist/linux-unpacked/r3xs-backup

# Test built app (Windows)
./dist/win-unpacked/R3XS\ Backup.exe
```

---

## Common Issues

### Issue: "Cannot find module '@r3xs-backup/core'"
**Solution:**
```bash
cd ../core
npm install
cd ../desktop
npm install
```

### Issue: "Electron not found"
**Solution:**
```bash
npm install
```

### Issue: DevTools not opening
**Solution:**
```bash
NODE_ENV=development npm run dev
# Ensure NODE_ENV is set!
```

### Issue: "require is not defined" when testing
**Success!** This means security is working correctly.

---

## Security Tests

### Test 1: Node.js API Blocked

```javascript
// In renderer DevTools console:
const fs = require('fs');
// ❌ MUST FAIL
```

✅ **Pass:** Error thrown  
❌ **Fail:** fs object returned

### Test 2: Process Access Blocked

```javascript
process.versions
// ❌ MUST FAIL
```

✅ **Pass:** Error thrown  
❌ **Fail:** Version object returned

### Test 3: Only electronAPI Exposed

```javascript
Object.keys(window).filter(k => k.includes('electron'))
// ✅ SHOULD RETURN: ["electronAPI"]
```

### Test 4: CSP Active

Open Network tab in DevTools, try to load external resource:

```javascript
fetch('https://example.com')
// ❌ SHOULD BE BLOCKED by CSP
```

---

## Performance Benchmarks

Create test data:

```bash
mkdir -p /tmp/test-roms
for i in {1..100}; do
  dd if=/dev/urandom of=/tmp/test-roms/rom$i.zip bs=1M count=10
done
```

Run backup:

```javascript
console.time('backup');
await window.electronAPI.startBackup({
  sourcePath: '/tmp/test-roms',
  destPath: '/tmp/backup',
  mode: 'full',
  conflictStrategy: 'overwrite'
});
console.timeEnd('backup');
```

**Expected performance:**
- 100 files (1GB total): < 10s on SSD
- Progress updates: ~10 events (throttled correctly)
- Memory usage: < 200MB

---

## Next Steps After Testing

1. ✅ All tests pass → Proceed to renderer UI implementation
2. ❌ Security tests fail → Review preload/window config
3. ❌ IPC handlers fail → Check core package integration
4. ❌ Performance issues → Review progress throttling logic

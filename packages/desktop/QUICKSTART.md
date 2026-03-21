# 🚀 Quick Start - R3XS Backup Desktop

## Executar a Aplicação

### Opção 1: Da raiz do monorepo

```bash
npm install
npm run dev --workspace=@r3xs-backup/desktop
```

### Opção 2: Diretamente no package

```bash
cd packages/desktop
npm install  # se ainda não instalou
npm run dev
```

## Primeira Execução

1. A janela Electron abrirá automaticamente
2. Você verá a interface completa do R3XS Backup
3. No log, aparecerá: "🎮 R3XS Backup Desktop - Pronto para uso"

## Teste Rápido

### 1. Criar Pastas de Teste

```bash
mkdir -p /tmp/r3xs-test/source/roms/snes
mkdir -p /tmp/r3xs-test/source/roms/gba
mkdir -p /tmp/r3xs-test/dest
echo "Test ROM 1" > /tmp/r3xs-test/source/roms/snes/game1.sfc
echo "Test ROM 2" > /tmp/r3xs-test/source/roms/gba/game2.gba
echo "Save 1" > /tmp/r3xs-test/source/roms/snes/game1.srm
```

### 2. Executar Backup

1. Clique em **"Selecionar"** ao lado de "Origem"
2. Escolha `/tmp/r3xs-test/source`
3. Clique em **"Selecionar"** ao lado de "Destino"
4. Escolha `/tmp/r3xs-test/dest`
5. Selecione **"Completo (ROMs + Saves)"**
6. Clique em **"Iniciar Backup"**

### 3. Observar Resultados

- Barra de progresso deve animar
- Logs mostram cada etapa
- Ao final: "✅ Backup concluído com sucesso!"

### 4. Verificar Arquivos

```bash
tree /tmp/r3xs-test/dest
# /tmp/r3xs-test/dest/
# └── roms/
#     ├── snes/
#     │   ├── game1.sfc
#     │   └── game1.srm
#     └── gba/
#         └── game2.gba
```

## Testes

### Checklist Manual

#### ✅ 1. App Launch
- [ ] Window opens with 1000x700 size
- [ ] Title shows "R3XS Backup"
- [ ] DevTools opens automatically (development mode)
- [ ] No console errors

#### ✅ 2. Security Verification

Abra o console do DevTools e execute:

```javascript
require('fs')       // ❌ Error: require is not defined
process.exit()      // ❌ Error: process is not defined
window.electronAPI  // ✅ Object { selectSourceDir: function, ... }
Object.keys(window.electronAPI) // ✅ Array [ "selectSourceDir", ... ]
```

#### ✅ 3. Dialog Selection
- [ ] **"Selecionar Origem"** → Native folder dialog opens
- [ ] Select a folder → Path appears in status
- [ ] **"Selecionar Destino"** → Native folder dialog opens
- [ ] Cancel dialog → Status shows "cancelado"

#### ✅ 4. Window Behavior
- [ ] Resize window → Min size enforced (800x600)
- [ ] Close window → App quits (Windows/Linux)
- [ ] Close window → App stays in dock (macOS)
- [ ] macOS: Click dock icon → Window recreates

### Testes Automatizados

```bash
npm test                  # testes unitários
npm run test:coverage     # com cobertura
npm run test:watch        # modo watch
npm run lint              # lint
```

**Resultados esperados:**
```
Test Suites: 1 passed
Tests:       7 passed
Coverage:    81.25% (ipc-handlers.js)
Lint:        0 errors
```

### Testes de Segurança

#### Test 1: Node.js API Blocked
```javascript
const fs = require('fs'); // ❌ MUST FAIL
```
✅ **Pass:** Error thrown — ❌ **Fail:** fs object returned

#### Test 2: Process Access Blocked
```javascript
process.versions // ❌ MUST FAIL
```
✅ **Pass:** Error thrown — ❌ **Fail:** Version object returned

#### Test 3: Only electronAPI Exposed
```javascript
Object.keys(window).filter(k => k.includes('electron'))
// ✅ SHOULD RETURN: ["electronAPI"]
```

#### Test 4: CSP Active
```javascript
fetch('https://example.com') // ❌ SHOULD BE BLOCKED by CSP
```

## DevTools (Debug)

Abra o DevTools do Electron:

- **Linux/Windows:** `Ctrl + Shift + I`
- **macOS:** `Cmd + Option + I`

No console, você pode:

```javascript
console.log(window.electronAPI);          // Verificar API disponível
await window.electronAPI.selectSourceDir(); // Testar manualmente
```

## Troubleshooting

### ❌ Erro: "Cannot find module '@r3xs-backup/core'"
```bash
npm install
# Ou instalar apenas o core:
cd packages/core && npm install
```

### ❌ Erro: "electronAPI is not defined"

Verificar que o preload está configurado corretamente em `src/main/window.js`:

```javascript
webPreferences: {
  preload: path.join(__dirname, '../preload/index.js'),
  contextIsolation: true,
  nodeIntegration: false
}
```

### ❌ Estilos não carregam

Abra DevTools e verifique erros de CSP. O header deve permitir:
```
style-src 'self' 'unsafe-inline'
```

### ❌ Backup não inicia

1. Verifique o console do DevTools
2. Certifique-se de que `@r3xs-backup/core` está instalado
3. Verifique que os IPC handlers estão registrados no main process

### ❌ DevTools não abre
```bash
NODE_ENV=development npm run dev
```

## Estrutura de Arquivos

```
packages/desktop/
├── src/
│   ├── main/
│   │   ├── index.js          # Entry point do main process
│   │   ├── window.js         # Configuração da janela
│   │   └── ipc-handlers.js   # Handlers IPC
│   ├── preload/
│   │   └── index.js          # Script de preload (expõe API)
│   └── renderer/
│       ├── index.html        # Interface HTML
│       ├── styles/
│       │   └── main.css      # Estilos completos
│       └── scripts/
│           ├── ui.js         # Manipulação de DOM
│           └── app.js        # Lógica de controle
├── package.json
└── README.md
```

---

**Boa sorte com os testes! 🎮**

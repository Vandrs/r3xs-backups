# Electron Main Process & Preload Implementation

## ✅ Arquivos Criados

```
packages/desktop/src/
├── main/
│   ├── index.js         (B1) - App lifecycle & entry point
│   ├── window.js        (B2) - BrowserWindow factory
│   └── ipc-handlers.js  (B3) - IPC communication handlers
├── preload/
│   └── index.js         (C1) - Secure contextBridge API
└── renderer/
    └── index.html       (Minimal test UI)
```

---

## 📋 Resumo de Implementação

### **B1: Main Process Entry Point** (`src/main/index.js`)
- ✅ App lifecycle completo (ready, window-all-closed, activate)
- ✅ Registra IPC handlers antes de criar janela
- ✅ Suporte macOS (recreate window on activate)
- ✅ Clean shutdown sem warnings

**Security flags aplicados:**
- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`

---

### **B2: Window Management** (`src/main/window.js`)
- ✅ BrowserWindow com dimensões configuradas (1000x700, min 800x600)
- ✅ Preload script corretamente configurado
- ✅ DevTools habilitado apenas em `NODE_ENV=development`
- ✅ `ready-to-show` event previne flash branco
- ✅ Carrega `src/renderer/index.html`

**Trade-off:** Não persiste tamanho/posição da janela (KISS). Será adicionado futuramente se necessário.

---

### **B3: IPC Handlers** (`src/main/ipc-handlers.js`)
Implementa 4 handlers IPC:

| Handler            | Função                                      |
|--------------------|---------------------------------------------|
| `select-source-dir`| Dialog seleção de diretório de origem      |
| `select-dest-dir`  | Dialog seleção de diretório de destino     |
| `start-backup`     | Executa backup usando `@r3xs-backup/core`  |
| `cancel-backup`    | Cancela backup em andamento                 |

**Integração com Core:**
1. Valida paths com `validatePaths()`
2. Escaneia arquivos com `scanFiles()`
3. Copia com `copyFiles()` reportando progresso
4. Emite eventos: `backup-progress`, `backup-complete`, `backup-error`

**Progress reporting:**
- A cada 10 arquivos copiados OU
- A cada 1 segundo (1000ms)
- Payload: `{ phase, current, total, currentFile, stats }`

**Cancelamento:**
- Flag `backupState.cancelled` verificada em loop
- Interrompe cópia de forma graceful

---

### **C1: Preload Script** (`src/preload/index.js`)
Expõe API mínima via `contextBridge.exposeInMainWorld`:

```javascript
window.electronAPI = {
  selectSourceDir()       // Promise<string|null>
  selectDestDir()         // Promise<string|null>
  startBackup(options)    // Promise<{success, stats, error?}>
  cancelBackup()          // Promise<{success, message}>
  onBackupProgress(cb)    // Returns cleanup function
  onBackupComplete(cb)    // Returns cleanup function
  onBackupError(cb)       // Returns cleanup function
}
```

**Security:** Nenhum acesso a Node.js APIs no renderer — apenas IPC controlado.

**Listeners:** Todos retornam função de cleanup para evitar memory leaks.

---

## 🧪 Como Testar

### Pré-requisitos
```bash
cd packages/desktop
npm install
```

### 1. Verificar Lint
```bash
npm run lint
# ✅ Deve passar sem erros
```

### 2. Iniciar App em Modo Dev
```bash
NODE_ENV=development npm run dev
```

**Verificações:**
- ✅ Janela abre com título "R3XS Backup"
- ✅ DevTools aberto automaticamente
- ✅ Console não mostra erros
- ✅ `window.electronAPI` está definido (testar no DevTools console)

### 3. Testar Dialogs
No app aberto, clique nos botões:
- **"Selecionar Origem"** → Deve abrir dialog de seleção
- **"Selecionar Destino"** → Deve abrir dialog de seleção
- Status deve atualizar com caminho selecionado

### 4. Testar API no DevTools Console
```javascript
// Verificar API disponível
console.log(window.electronAPI);

// Testar select
const source = await window.electronAPI.selectSourceDir();
console.log('Source:', source);

// Testar backup (requer paths válidos)
const result = await window.electronAPI.startBackup({
  sourcePath: '/path/to/source',
  destPath: '/path/to/dest',
  mode: 'full',
  conflictStrategy: 'overwrite'
});
console.log('Result:', result);
```

### 5. Testar Segurança
No DevTools console, tentar acessar Node.js diretamente:
```javascript
require('fs'); // ❌ Deve lançar erro: require is not defined
process.exit(); // ❌ Deve lançar erro: process is not defined
```

✅ **Esperado:** Ambos devem falhar (security working).

---

## 🔒 Security Checklist

| Item                          | Status |
|-------------------------------|--------|
| `contextIsolation: true`      | ✅     |
| `nodeIntegration: false`      | ✅     |
| `sandbox: true`               | ✅     |
| contextBridge usado           | ✅     |
| IPC handlers validam input    | ✅     |
| Sem `remote` module           | ✅     |
| Sem `require` no renderer     | ✅     |
| CSP header em HTML            | ✅     |

---

## 🎯 Próximos Passos

1. Implementar UI completa do renderer (formulário de backup)
2. Adicionar testes unitários para IPC handlers
3. Implementar persistência de configurações (electron-store)
4. Adicionar tray icon e notificações

---

## 📝 Decisões de Design

### SOLID
- **Single Responsibility:** Cada módulo tem uma responsabilidade clara
  - `index.js` → lifecycle
  - `window.js` → window management
  - `ipc-handlers.js` → IPC communication
  - `preload/index.js` → secure API bridge

### Clean Architecture
- Main process não conhece detalhes do renderer
- Comunicação via contratos IPC bem definidos
- Core services isolados (dependency inversion)

### KISS
- Sem frameworks extras (apenas Electron + Core)
- Progress reporting simples (eventos diretos)
- Estado de backup em plain object (não Redux/MobX)

### Security-First
- Electron Security Checklist aplicado integralmente
- Princípio do menor privilégio no preload script
- CSP header no HTML

---

## ⚠️ Riscos & Mitigações

| Risco                              | Mitigação                                      |
|------------------------------------|------------------------------------------------|
| Memory leak em listeners           | Funções de cleanup retornadas                  |
| Backup longo trava UI              | Comunicação assíncrona via IPC events          |
| Paths inválidos causam crash       | Validação explícita antes de executar          |
| Cancelamento deixa arquivos pela metade | Verifica flag entre cada arquivo         |

---

## 🔄 Rollback Plan

Se a implementação causar problemas:
1. `git revert` do commit
2. Remover arquivos criados manualmente se necessário
3. Implementação não afeta outros pacotes (isolamento completo)

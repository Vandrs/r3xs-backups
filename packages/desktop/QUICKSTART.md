# 🚀 Quick Start - R3XS Backup Desktop

## Executar a Aplicação

### Opção 1: Da raiz do monorepo

```bash
# Certifique-se de que as dependências estão instaladas
npm install

# Execute o desktop
npm run dev --workspace=@r3xs-backup/desktop
```

### Opção 2: Diretamente no package

```bash
cd packages/desktop
npm install  # se ainda não instalou
npm run dev
```

---

## Primeira Execução

1. A janela Electron abrirá automaticamente
2. Você verá a interface completa do R3XS Backup
3. No log, aparecerá: "🎮 R3XS Backup Desktop - Pronto para uso"

---

## Teste Rápido

### 1. Criar Pastas de Teste

```bash
# Criar estrutura de teste
mkdir -p /tmp/r3xs-test/source/roms/snes
mkdir -p /tmp/r3xs-test/source/roms/gba
mkdir -p /tmp/r3xs-test/dest

# Criar arquivos de teste
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
# Deve mostrar:
# /tmp/r3xs-test/dest/
# └── roms/
#     ├── snes/
#     │   ├── game1.sfc
#     │   └── game1.srm
#     └── gba/
#         └── game2.gba
```

---

## DevTools (Debug)

Abra o DevTools do Electron:

- **Linux/Windows:** `Ctrl + Shift + I`
- **macOS:** `Cmd + Option + I`

No console, você pode:

```javascript
// Verificar API disponível
console.log(window.electronAPI);

// Testar manualmente
await window.electronAPI.selectSourceDir();
```

---

## Troubleshooting

### ❌ Erro: "Cannot find module '@r3xs-backup/core'"

**Solução:**
```bash
# Instalar dependências de todos os workspaces
npm install

# Ou instalar apenas o core
cd packages/core
npm install
```

### ❌ Erro: "electronAPI is not defined"

**Solução:**
Verificar que o preload está configurado corretamente em `src/main/window.js`:

```javascript
webPreferences: {
  preload: path.join(__dirname, '../preload/index.js'),
  contextIsolation: true,
  nodeIntegration: false
}
```

### ❌ Estilos não carregam

**Solução:**
Abra DevTools e verifique erros de CSP. O header deve permitir:
```
style-src 'self' 'unsafe-inline'
```

### ❌ Backup não inicia

**Solução:**
1. Verifique o console do DevTools
2. Certifique-se de que `@r3xs-backup/core` está instalado
3. Verifique que os IPC handlers estão registrados no main process

---

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
│       ├── index.html        # ✨ NOVO: Interface HTML
│       ├── styles/
│       │   └── main.css      # ✨ NOVO: Estilos completos
│       └── scripts/
│           ├── ui.js         # ✨ NOVO: Manipulação de DOM
│           └── app.js        # ✨ NOVO: Lógica de controle
├── package.json
└── README.md
```

---

## Próximos Passos

1. ✅ Testar todos os casos de teste (ver `TEST_INSTRUCTIONS.md`)
2. ✅ Verificar visual (ver `VISUAL_DESCRIPTION.md`)
3. ✅ Ler resumo completo (ver `IMPLEMENTATION_SUMMARY.md`)
4. 📝 Criar commit (mensagem sugerida no IMPLEMENTATION_SUMMARY.md)
5. 🚀 Abrir Pull Request

---

## Links Úteis

- [Electron Docs](https://www.electronjs.org/docs)
- [IPC Communication](https://www.electronjs.org/docs/latest/tutorial/ipc)
- [Context Isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)

---

**Boa sorte com os testes! 🎮**

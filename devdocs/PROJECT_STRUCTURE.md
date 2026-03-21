# Estrutura e Visão Geral do Projeto

## 🎮 R3XS Backup

**Ferramenta de backup de ROMs e save states de handhelds R36S/R35S com ArkOS.**  
Monorepo com 3 pacotes npm: `core`, `cli` e `desktop`.

---

## 📅 Status

**Data:** 21/03/2026 | **Versão:** 1.0.0 (em desenvolvimento) | **Fase:** Monorepo (core + CLI + Desktop)

---

## 🏗️ Tech Stack

| Camada | Tecnologia |
|--------|------------|
| Runtime | Node.js ≥ 16.0.0 |
| CLI | Commander.js 11.x, chalk, ora |
| Desktop | Electron 28.x, electron-builder 24.x |
| Filesystem | fs-extra 11.x |
| Testes | Jest 29.x |
| Workspaces | npm workspaces |

---

## 📁 Estrutura de Diretórios

```
r3xs-backup/
├── packages/
│   ├── core/                   # @r3xs-backup/core — lógica de negócio
│   │   ├── src/
│   │   │   ├── index.js        # API pública (scanFiles, copyFiles, validatePaths, resolveConflict)
│   │   │   ├── services/       # fileScanner, fileCopier, conflictResolver
│   │   │   └── utils/          # validators
│   │   └── tests/
│   ├── cli/                    # @r3xs-backup/cli — ferramenta CLI
│   │   ├── src/
│   │   │   ├── index.js        # Entry point Commander.js
│   │   │   └── commands/backup.js
│   │   └── tests/
│   └── desktop/                # @r3xs-backup/desktop — GUI Electron
│       ├── src/
│       │   ├── main/           # Processo principal + handlers IPC
│       │   ├── preload/        # contextBridge API
│       │   └── renderer/       # HTML + CSS + JS (UI)
│       ├── assets/             # icon.png
│       └── tests/
├── devdocs/                    # Documentação técnica
├── package.json                # Workspace root
└── .eslintrc.js
```

---

## 📦 Responsabilidades dos Módulos

### `packages/core`
| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/index.js` | API pública do pacote core |
| `src/services/fileScanner.js` | Busca recursiva de arquivos com filtros por extensão |
| `src/services/fileCopier.js` | Cópia de arquivos preservando estrutura de diretórios |
| `src/services/conflictResolver.js` | Estratégias de conflito: `overwrite`, `skip`, `newer` |
| `src/utils/validators.js` | Validação de caminhos e permissões |

### `packages/cli`
| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/index.js` | Configuração do Commander.js e parsing de args |
| `src/commands/backup.js` | Orquestração do fluxo de backup, feedback visual |

### `packages/desktop`
| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/main/index.js` | Processo principal do Electron |
| `src/main/ipc-handlers.js` | Handlers IPC que delegam ao core |
| `src/preload/index.js` | contextBridge expõe API ao renderer |
| `src/renderer/` | Interface gráfica (HTML/CSS/JS) |

---

## 🔄 Fluxo de Dados

```
CLI:
  index.js (Commander) → commands/backup.js → @r3xs-backup/core

Desktop:
  Renderer → IPC → main/ipc-handlers.js → @r3xs-backup/core
```

---

## 🧪 Testes

### Executar

```bash
npm test                        # Todos os workspaces
npm test -w @r3xs-backup/core   # Apenas core
npm run test:coverage           # Com relatório de cobertura
```

### Metas de Cobertura

| Escopo | Mínimo |
|--------|--------|
| Services | 90% |
| Commands | 80% |
| Utils | 95% |

---

## 🚀 Desenvolvimento Local

```bash
npm install          # Instala todas as dependências (workspaces)
npm start            # Executa a CLI
```

---

## 📄 Licença

MIT License — veja [LICENSE](../LICENSE) para detalhes.

---

**Última Atualização:** 21/03/2026 | **Status:** ✅ Monorepo estruturado e documentado

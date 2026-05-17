# AGENTS.md — Ponto de entrada para agentes autônomos

Guia enxuto e índice de documentação para agentes (humanos ou bots) que vão operar neste repositório.

---

## Project Overview

`r3xs-backup` é um monorepo Node.js com ferramentas para backup de ROMs e save states (handhelds R36S/R35S com ArkOS). O código está organizado em npm workspaces na pasta `packages/` e foca em CLI e Desktop (Electron).

- Workspaces:
  - `packages/core` — lógica de negócio (scan, copy, validações)
  - `packages/cli` — CLI (Commander.js)
  - `packages/desktop` — Desktop (Electron)

- Language: JavaScript (ES6+, CommonJS)
- Runtime: Node.js ≥ 16.0.0
- Package manager: npm (workspaces)

---

## Comandos essenciais

Comandos mínimos para um agente operar no repo. Para a lista completa, veja docs/DEVELOPERS_GUIDE.md.

| Objetivo | Comando |
|---|---|
| Instalar dependências | npm install |
| Rodar testes | npm test |
| Lint | npm run lint |
| Cobertura | npm run test:coverage |

---

## Project Structure

Árvore principal (compacta):

```
r3xs-backup/
├── packages/
│   ├── core/     # @r3xs-backup/core — lógica de negócio (scan, copy, config)
│   ├── cli/      # @r3xs-backup/cli — ferramenta CLI (Commander.js)
│   └── desktop/  # @r3xs-backup/desktop — app Electron (UI + IPC)
├── docs/
└── package.json  # workspace root scripts e configurações
```

---

## Workflow obrigatório para agentes

Antes de começar a trabalhar, siga estas regras obrigatórias. O board do GitHub é a fonte de verdade para tasks:

- Board: "Roms warehouse" — https://github.com/users/Vandrs/projects/3
- Project Number: 3
- Node ID (GraphQL): PVT_kwHOAE7hg84BUt_W

Regras mínimas:

- Antes de qualquer trabalho: verifique o board "Roms warehouse" e identifique (ou crie) o card/issue correspondente. Se a atividade não existir, crie a issue e adicione ao board.
- Mova o card para **Doing** ao iniciar o trabalho.
- Nunca commitar diretamente na branch `main`. Sempre crie uma branch com o padrão `feature/<name>` ou `fix/<name>`.
- Ao concluir o trabalho: abra um Pull Request e mova o card no board para o status apropriado (Review / Done / etc.).
- Para agentes trabalhando em paralelo em tasks independentes: use `git worktree` para evitar conflitos de diretório de trabalho.

Exemplos de git worktree:

```bash
# Criar worktree para uma task independente
git worktree add ../r3xs-backup-feature-x feature/feature-x

# Listar worktrees ativos
git worktree list

# Remover worktree após merge da branch
git worktree remove ../r3xs-backup-feature-x
```

Observações:

- Cada worktree compartilha o mesmo repositório git (objeto db) mas tem diretório de trabalho separado, permitindo que agentes operem em paralelo sem conflitos de working tree.
- Sempre referencie o card/issue na descrição do PR para rastreabilidade.

---

## Índice de documentação (docs/)

Tabela rápida com os principais artefatos em docs/ e o que cada um contém:

| Arquivo | Conteúdo |
|---|---|
| docs/INDEX.md | Índice navegável completo |
| docs/CONTRIBUTING.md | Fluxo de contribuição, fluxo do board, git worktree, PR checklist |
| docs/DEVELOPERS_GUIDE.md | Comandos, git workflow, troubleshooting, code style |
| docs/ROADMAP.md | Visão de alto nível das fases e features planejadas |
| docs/TESTING.md | Estratégia e guia de testes TDD |
| docs/PROJECT_STRUCTURE.md | Arquitetura e métricas |
| docs/MONOREPO_ONBOARDING.md | Onboarding rápido por pacote |
| docs/adrs/ | ADRs de decisões de arquitetura (ADR-001 a ADR-004) |

---

> Detalhes completos: [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)

## Code Style

> Detalhes completos: [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)

### General

- **Indentation:** 2 spaces (no tabs)
- **Quotes:** Single quotes (`'`) throughout
- **Semicolons:** Always required
- **Variable declarations:** `const` by default; `let` only when reassignment is needed; never `var`
- **Async:** `async/await` everywhere — no callbacks, no `.then()` chains
- **Iteration:** `for...of` loops over arrays (not `.forEach`)

### Naming Conventions

- **Variables and functions:** `camelCase` (e.g., `scanFiles`, `copyFiles`, `resolveConflict`)
- **Classes:** `PascalCase` (no classes in source yet, but follow this when adding)
- **File names:** `camelCase` (e.g., `fileScanner.js`, `conflictResolver.js`)
- **Test `describe` blocks:** `PascalCase` matching the module name (e.g., `describe('FileScanner', ...)`)
- **Test names:** Portuguese, starting with "deve" (e.g., `'deve copiar arquivos preservando estrutura de diretórios'`)
- **Boolean variables:** Descriptive names (e.g., `sourceExists`, `shouldCopy`, `isNewer`)

### Imports

CommonJS `require()` only — no ESM `import`. Group imports in this order, with
a blank line between groups:

```javascript
// 1. Node.js builtins
const path = require('path');
const os = require('os');

// 2. External npm packages
const fs = require('fs-extra');
const chalk = require('chalk');

// 3. Internal modules (relative paths)
const { scanFiles } = require('../services/fileScanner');
const { validatePaths } = require('../utils/validators');
```

### Exports

- **Service/utility modules:** Named exports at the **bottom** of the file
- **Command modules:** Single default function export

```javascript
// Named exports (services, utils)
module.exports = {
  copyFiles,
  isSourceNewer,
};

// Default export (commands)
module.exports = backupCommand;
```

### Type Documentation

Use JSDoc on all exported functions. No TypeScript — plain JS only.

```javascript
/**
 * Copia lista de arquivos preservando estrutura de diretórios
 * @param {string[]} files - Array de caminhos absolutos dos arquivos
 * @param {string} sourceBase - Diretório base de origem
 * @param {string} destBase - Diretório base de destino
 * @param {string} conflictStrategy - Estratégia de conflito
 * @returns {Promise<{success: number, skipped: number, failed: number}>}
 */
async function copyFiles(files, sourceBase, destBase, conflictStrategy) {
```

---

> Detalhes completos: [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)

## Error Handling

Follow the layered error handling strategy:

| Layer | Pattern |
|-------|---------|
| **Services** | `try/catch` → `console.error(message)` → return safe default (`[]`, `false`, increment `stats.failed`) |
| **Business rules** | `throw new Error('message')` to be caught by the caller |
| **Validation** | Return `{ valid: false, error: 'message' }` — never throw |
| **CLI boundary** | Catch all errors in `index.js`, print with `chalk.red`, call `process.exit(1)` |

```javascript
// Service-level error (safe default)
try {
  await fs.copyFile(source, dest);
  stats.success++;
} catch (error) {
  console.error(`Erro ao copiar ${source}: ${error.message}`);
  stats.failed++;
}

// Business rule violation (throw)
if (!options.full && !options.savesOnly) {
  throw new Error('Modo de backup não especificado. Use full=true ou savesOnly=true');
}

// Validation (return structured result)
if (!await fs.pathExists(sourcePath)) {
  return { valid: false, error: `Diretório de origem não existe: ${sourcePath}` };
}
```

Use plain `Error` with descriptive messages — no custom error subclasses.

---

> Detalhes completos: [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)

## Testing Conventions

Follow **TDD**: write tests before implementation.

- **One test file per module**, located at `tests/unit/<module>.test.js`
- **AAA structure** with comments labeling each section:
  ```javascript
  test('deve copiar arquivo quando não existir', async () => {
    // Arrange
    const sourceFile = path.join(tmpDir, 'rom.zip');
    await fs.writeFile(sourceFile, 'content');
    // Act
    const result = await copyFiles([sourceFile], tmpDir, destDir, 'overwrite');
    // Assert
    expect(result.success).toBe(1);
  });
  ```
- **Real filesystem** in `os.tmpdir()` — minimal mocking. Only mock `console.*` and `process.exit`:
  ```javascript
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(process, 'exit').mockImplementation(() => {});
  ```
- **Cleanup** with `afterEach`: remove temp directories created during tests
- **Never depend on real system files** — always create fixtures in tmpdir
- Detect test environment with: `process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined`

---

> Detalhes completos: [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)

## Git Conventions

Use **Conventional Commits**:

```
feat: adiciona backup incremental
fix: corrige filtro de extensões case-sensitive
docs: atualiza README com exemplos
test: adiciona testes para modo compress
refactor: extrai lógica de filtro para helper
style: corrige indentação em fileCopier
chore: atualiza dependências
```

Branch naming: `feature/<name>` or `fix/<name>`.

---

> Detalhes completos: [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)

## PR Checklist

Before opening a PR, verify:

- [ ] All tests pass (`npm test`)
- [ ] Coverage meets targets (`npm run test:coverage`)
- [ ] Lint passes with no errors (`npm run lint`)
- [ ] No stray `console.log` or `debugger` statements
- [ ] JSDoc present on all new exported functions
- [ ] Commits follow Conventional Commits format
- [ ] `docs/` updated if behaviour or structure changed

---

## Diretriz para agentes autônomos

Agentes autônomos (humanos ou bots) que buscam trabalho neste repositório devem consultar o board do GitHub "Roms warehouse" antes de planejar ou implementar tarefas. O board (https://github.com/users/Vandrs/projects/3) é a referência atual para quais issues/tarefas têm prioridade e qual o status de progresso. Não assuma uma lista fixa de colunas ou estados a partir deste arquivo — o board pode mudar e é a fonte de verdade para status e priorização.

Procedimento mínimo recomendado para agentes:

- Verifique o board "Roms warehouse" e identifique a tarefa a ser tratada.
- Confirme a prioridade e qualquer comentário/nota no card antes de iniciar trabalho.
- Se for iniciar trabalho, abra uma issue ou comentário vinculando-se ao card/issue correspondente para rastreabilidade.
- Atualize o board (ou peça ao maintainer responsável) para refletir mudança de status quando o trabalho progredir.

Esta diretriz evita descoordenação entre documentação estática e o estado real do trabalho no board.

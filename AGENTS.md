# AGENTS.md

Guidelines for agentic coding agents operating in this repository.

---

## Project Overview

`r3xs-backup` is a **Node.js CLI tool** that backs up ROMs and save states from
R36S/R35S handhelds running ArkOS. It copies files from an SD card's `easyroms/`
folder to a local destination. There is no build or compilation step — source
files in `src/` are run directly with Node.js.

- **Language:** JavaScript (ES6+, CommonJS)
- **Runtime:** Node.js ≥ 16.0.0
- **Package manager:** npm (`save-exact=true` — all deps pinned to exact versions)

---

## Commands

```bash
# Install dependencies
npm install

# Run the CLI
npm start
# or
node src/index.js --source /mnt/sdcard --dest ~/backup --full

# Lint source and tests
npm run lint            # eslint src tests

# Run all tests
npm test

# Run tests in watch mode (during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Running a Single Test

```bash
# Run a single test file by filename substring
npm test -- fileScanner.test.js
npm test -- conflictResolver.test.js

# Run a single test (or group) by name substring
npm test -- -t "deve copiar arquivos preservando estrutura"
npm test -- -t "overwrite"

# Run a single file with extra flags
npm test -- --verbose fileScanner.test.js
npm test -- --runInBand --no-cache fileCopier.test.js
```

Jest configuration lives directly in `package.json` (no separate `jest.config.js`).
Test files are discovered via the pattern `**/tests/**/*.test.js`.

### Coverage Targets

| Scope    | Minimum |
|----------|---------|
| Services | 90%     |
| Commands | 80%     |
| Utils    | 95%     |

---

## Project Structure

```
src/
├── index.js              # CLI entry point (Commander.js setup, process.exit)
├── commands/
│   └── backup.js         # Orchestrator: validates → scans → copies
├── services/
│   ├── fileScanner.js    # Recursive file discovery + filtering
│   ├── fileCopier.js     # File copy with directory structure preservation
│   └── conflictResolver.js  # Conflict resolution strategies (overwrite/skip/newer)
└── utils/
    └── validators.js     # Path validation utilities

tests/
├── unit/                 # One test file per service module
└── integration/          # Full end-to-end flow (backup.test.js)

devdocs/                  # All developer documentation
```

---

## Code Style

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
- **Test names:** Portuguese, starting with `"deve"` (e.g., `'deve copiar arquivos preservando estrutura de diretórios'`)
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

## PR Checklist

Before opening a PR, verify:

- [ ] All tests pass (`npm test`)
- [ ] Coverage meets targets (`npm run test:coverage`)
- [ ] Lint passes with no errors (`npm run lint`)
- [ ] No stray `console.log` or `debugger` statements
- [ ] JSDoc present on all new exported functions
- [ ] Commits follow Conventional Commits format
- [ ] `devdocs/` updated if behaviour or structure changed

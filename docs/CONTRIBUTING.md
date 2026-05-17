# Guia de Contribuição

Obrigado por considerar contribuir com o R3XS Backup!

> **Docs relacionados:** [Guia do Desenvolvedor](./DEVELOPERS_GUIDE.md) | [Testes](./TESTING.md) | [Estrutura do Projeto](./PROJECT_STRUCTURE.md)

---

## Fluxo de Contribuição

### 0. Verifique o Board de Tasks

Toda atividade deve ter um card no board "Roms warehouse" antes de ser iniciada.

- Acesse o board: **Roms warehouse** — https://github.com/users/Vandrs/projects/3 (Project Number: 3 | Node ID: PVT_kwHOAE7hg84BUt_W)
- Identifique o card correspondente à tarefa. Se não existir, crie uma issue e adicione ao board.
- Mova o card para **Doing** antes de começar o trabalho.
- Ao concluir e abrir o PR, mova o card para o status correspondente.

### 1. Fork e Clone

```bash
git clone https://github.com/seu-usuario/r3xs-backup.git
cd r3xs-backup
npm install   # instala dependências de todos os workspaces (npm workspaces)
```

### 2. Crie uma Branch

```bash
git checkout -b feature/minha-feature
# ou
git checkout -b fix/meu-bugfix
```

> ⚠️ **Nunca commite diretamente na branch `main`.** Todo trabalho deve ocorrer em uma branch dedicada.

### 3. Desenvolvimento com TDD

Sempre escreva o teste antes da implementação. Identifique o pacote correto:

```bash
# Feature no pacote core (lógica de negócio)
packages/core/tests/unit/myFeature.test.js   # 1. Escrever teste
packages/core/src/services/myFeature.js      # 2. Implementar

# Feature no pacote cli (comandos)
packages/cli/tests/unit/myFeature.test.js    # 1. Escrever teste
packages/cli/src/commands/myFeature.js       # 2. Implementar
```

Ciclo TDD:

```bash
npm test                  # Rode o teste (deve falhar)
# ... implemente o código mínimo ...
npm test                  # Rode novamente (deve passar)
npm run test:watch        # Use watch durante o desenvolvimento
```

### 4. Commit

Use [Conventional Commits](https://www.conventionalcommits.org/):
`feat` · `fix` · `docs` · `test` · `refactor` · `style` · `chore`

```bash
git commit -m "feat: adiciona backup incremental"
git commit -m "fix: corrige filtro de extensões case-sensitive"
```

### 5. Push e Pull Request

```bash
git push origin feature/minha-feature
```

Abra um PR no GitHub com descrição clara, screenshots (se aplicável) e o checklist abaixo preenchido.

---

## Checklist do PR

- [ ] Node.js >= 16.0.0 (`node --version`)
- [ ] Código segue o style guide
- [ ] Lint sem erros (`npm run lint`)
- [ ] Todos os testes passam (`npm test`)
- [ ] Cobertura adequada por workspace (`npm run test:coverage`): services ≥ 90%, commands ≥ 80%, utils ≥ 95%
- [ ] Smoke test: `--help` e `--version` funcionam corretamente
- [ ] Sem `console.log` ou `debugger` esquecidos
- [ ] JSDoc presente em todas as funções exportadas
- [ ] `node_modules` ausente do repositório (`.gitignore` correto)
- [ ] `docs/` atualizado se comportamento ou estrutura mudou
- [ ] Commits seguem padrão semântico

---

## Style Guide

### JavaScript

- **ES6+**: `const`/`let`, arrow functions, `async/await` — sem callbacks ou `.then()`
- **Naming**: `camelCase` para variáveis/funções, `PascalCase` para classes
- **Indentação**: 2 espaços; **Strings**: single quotes; **Semicolons**: obrigatório

```javascript
// ✅ Correto
async function copyFile(source, dest) {
  const content = await fs.readFile(source, 'utf8');
  await fs.writeFile(dest, content);
}

// ❌ Incorreto — callback style
function copyFile(source, dest, callback) {
  fs.readFile(source, function(err, content) {
    fs.writeFile(dest, content, callback);
  });
}
```

### Estrutura de Módulos

- Um módulo por arquivo; exports nomeados no final; imports agrupados (builtins → externos → internos)

```javascript
// 1. Builtins
const path = require('path');

// 2. Externos
const fs = require('fs-extra');

// 3. Internos (referência ao pacote ou caminho relativo)
const { scanFiles } = require('../services/fileScanner');
const { validatePaths } = require('../utils/validators');

// ... código ...

module.exports = { backupCommand };
```

---

## Reportando Bugs

Abra uma issue com:

- **Título claro**: ex. "Erro ao copiar arquivos com acentos"
- **Passos para reproduzir**: comandos executados e output
- **Comportamento esperado vs. atual**
- **Ambiente**: OS, versão do Node.js (`node --version`)

## Sugerindo Features

Abra uma issue de feature request com: problema atual, solução proposta, alternativas consideradas.

## Prioridades

- **Alta**: bugs críticos (perda de dados), falhas de segurança, testes quebrando
- **Média**: novas features relevantes, melhorias de performance, refatorações
- **Baixa**: documentação, features "nice-to-have", otimizações menores

---

## Publicação NPM (Maintainers)

O root do monorepo é privado. Publique individualmente por pacote:

```bash
# Garantir qualidade antes de publicar
npm test
npm run test:coverage
npm run lint

# Atualizar versão (semver) no pacote alvo
npm version patch --workspace=@r3xs-backup/core

# Publicar pacotes públicos
npm publish --workspace=@r3xs-backup/core
npm publish --workspace=@r3xs-backup/cli

# Desktop é privado — distribuído via electron-builder
npm run build --workspace=@r3xs-backup/desktop

git push --tags
```

---

### Trabalhando com Agentes em Paralelo (git worktree)

Quando dois agentes (humanos ou bots) trabalham em tasks independentes simultaneamente, `git worktree` permite criar diretórios de trabalho separados que apontam para o mesmo repositório git — evitando conflitos de working tree.

Exemplos:

```bash
# Criar worktree para uma task independente
git worktree add ../r3xs-backup-feature-x feature/feature-x

# Listar worktrees ativos
git worktree list

# Remover worktree após merge da branch
git worktree remove ../r3xs-backup-feature-x
```

Cada worktree compartilha o mesmo repositório git (objetos) mas tem diretório de trabalho separado, permitindo que agentes operem em paralelo sem conflitos.

Dúvidas? Abra uma issue com a label `question`.

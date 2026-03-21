# Guia de Contribuição

Obrigado por considerar contribuir com o R3XS Backup!

> **Docs relacionados:** [Guia do Desenvolvedor](./DEVELOPERS_GUIDE.md) | [Testes](./TESTING.md) | [Estrutura do Projeto](./PROJECT_STRUCTURE.md)

---

## Fluxo de Contribuição

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

- [ ] Código segue o style guide
- [ ] Lint sem erros (`npm run lint`)
- [ ] Todos os testes passam (`npm test`)
- [ ] Cobertura adequada por workspace (`npm run test:coverage`): services ≥ 90%, commands ≥ 80%, utils ≥ 95%
- [ ] Sem `console.log` ou `debugger` esquecidos
- [ ] JSDoc presente em todas as funções exportadas
- [ ] `devdocs/` atualizado se comportamento ou estrutura mudou
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

Dúvidas? Abra uma issue com a label `question`.

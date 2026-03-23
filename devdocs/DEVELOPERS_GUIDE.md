# Guia do Desenvolvedor

Guia prático para desenvolvimento diário do R3XS Backup (monorepo npm workspaces).

> **📚 Docs Especializados:** [Workflow TDD completo →TESTING.md](./TESTING.md) | [Estrutura e Métricas →PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | [Guia de Contribuição →CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 🚀 Quick Start

```bash
# 1. Instalar todas as dependências (todos os pacotes)
npm install

# 2. Verificar instalação
npm test

# 3. Executar o CLI
npm start -- --source ./test-easyroms --dest ./backup --full

# 4. Executar a interface desktop
npm run dev
```

---

## 💻 Comandos Essenciais

| Categoria | Comando | Descrição |
|-----------|---------|-----------|
| **Testes** | `npm test` | Todos os pacotes |
| | `npm run test:watch` | Modo watch (recomendado!) |
| | `npm run test:coverage` | Relatório de cobertura |
| | `npm test --workspace=@r3xs-backup/core` | Apenas o pacote core |
| | `npm test --workspace=@r3xs-backup/cli` | Apenas o pacote cli |
| | `npm test --workspace=@r3xs-backup/desktop` | Apenas o pacote desktop |
| | `npm test --workspace=@r3xs-backup/core -- fileScanner.test.js` | Arquivo de teste específico |
| | `npm test -- -t "nome do teste"` | Teste por nome |
| **CLI** | `npm start` | Executa `@r3xs-backup/cli` |
| | `npm start -- --source /src --dest /dest --full` | Backup completo |
| | `npm start -- --source /src --dest /dest --saves-only` | Apenas saves |
| | `npm start -- --source /src --dest /dest --full --conflict skip` | Com estratégia de conflito |
| **Desktop** | `npm run dev` | Inicia app Electron |
| **Lint** | `npm run lint` | Lint em todos os pacotes |
| | `npm run lint --workspace=@r3xs-backup/core` | Lint em pacote específico |
| **Limpeza** | `rm -rf node_modules package-lock.json && npm install` | Reinstalar dependências |
| | `npm test -- --clearCache` | Limpar cache do Jest |
| | `rm -rf coverage` | Limpar relatórios |

---

## 📝 Git Workflow

### Tipos de Commit (Conventional Commits)

```
feat:     nova funcionalidade
fix:      correção de bug
docs:     documentação
test:     testes
refactor: refatoração de código
chore:    tarefas de manutenção
```

### Fluxo Básico

```bash
# 1. Criar branch
git checkout -b feature/minha-feature

# 2. Desenvolver com TDD
npm run test:watch  # Manter rodando

# 3. Commits frequentes
git add .
git commit -m "feat: implementa minha feature"

# 4. Push e PR
git push origin feature/minha-feature
```

---

## 🔍 Debug e Troubleshooting

### Debug de Testes

```bash
npm test -- --verbose                                   # Output detalhado
npm test -- --clearCache                                # Limpar cache
node --inspect-brk node_modules/.bin/jest --runInBand  # Node.js debugger
npm test --workspace=@r3xs-backup/core -- --runInBand --no-cache fileScanner.test.js
```

### Problemas Comuns

| Problema | Solução |
|----------|---------|
| **Testes não rodam** | `npm test -- --clearCache && rm -rf node_modules && npm install` |
| **Cobertura não abre** | Linux: `xdg-open coverage/lcov-report/index.html`<br>macOS: `open coverage/...` |
| **Node.js versão errada** | `node --version` (>= 16.0.0) → `nvm install 16 && nvm use 16` |
| **Testes falham só no CI** | `npm test -- --runInBand --coverage --verbose` (simula CI) |
| **Mock não funciona** | `jest.clearAllMocks()` e `jest.resetModules()` no `beforeEach()` |

---

## 🧹 Limpeza e Manutenção

```bash
# Reinstalar dependências (todos os pacotes)
rm -rf node_modules package-lock.json && npm install

# Limpar cache e relatórios
npm test -- --clearCache
rm -rf coverage

# Limpeza completa
rm -rf node_modules coverage && npm install
```

---

## 💡 Dicas e Boas Práticas

- ✅ Mantenha `npm run test:watch` rodando durante o desenvolvimento
- ✅ Escreva testes antes do código (TDD) — veja [TESTING.md](./TESTING.md)
- ✅ Commits pequenos, frequentes e semânticos
- ✅ Rode `npm test` e `npm run lint` antes de cada commit
- ✅ Rode `npm run test:coverage` antes de abrir PR (mínimo 80%)
- ✅ Atualize `devdocs/` sempre que alterar comportamento ou estrutura

---

## 🔗 Documentação Relacionada

### Para Usuários
- [README.md](../README.md) - Como usar o CLI

### Para Desenvolvedores
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Arquitetura e métricas
- [TESTING.md](./TESTING.md) - Guia completo de testes e TDD
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Como contribuir e publicar
- [ROADMAP.md](./ROADMAP.md) - Plano de evolução
- [ADR-001](./adrs/ADR-001-tech-stack.md) - Decisão de tech stack
- [ADR-002](./adrs/ADR-002-file-filtering-strategy.md) - Estratégia de filtros
- [ADR-003](./adrs/ADR-003-monorepo-structure.md) - Estrutura monorepo
- [ADR-004](./adrs/ADR-004-electron-desktop-architecture.md) - Arquitetura desktop Electron
- [INDEX.md](./INDEX.md) - Índice completo da documentação

### Links Externos Úteis
- [Commander.js](https://github.com/tj/commander.js) - Framework CLI
- [Jest](https://jestjs.io/) - Framework de testes
- [fs-extra](https://github.com/jprichardson/node-fs-extra) - Operações de filesystem
- [Conventional Commits](https://www.conventionalcommits.org/) - Padrão de commits

---

**Dúvidas?** Abra uma issue no GitHub!

**Última Atualização:** 21/03/2026

---

## ⚙️ Como adicionar novas extensões de save/state

As extensões reconhecidas pelo modo `--saves-only` estão centralizadas em um único arquivo de configuração para facilitar manutenção e evitar divergências entre módulos.

- Local do arquivo: `packages/core/src/config/backupExtensions.js`

- Para adicionar uma nova extensão de battery save (por exemplo, `.sram`) edite o array `SAVES_EXTENSIONS` e acrescente a string com a extensão — mantenha o ponto no início:

```js
// packages/core/src/config/backupExtensions.js
const SAVES_EXTENSIONS = ['.srm', '.sav', '.mcr', '.sram'];
```

- Para adicionar um novo padrão de state que não use extensão fixa (por exemplo, arquivos contendo `quicksave` no nome), edite o array `STATES_PATTERNS` adicionando a string ou expressão que represente o padrão (padrões simples são comparados com includes):

```js
// packages/core/src/config/backupExtensions.js
const STATES_PATTERNS = ['state', 'savestate', 'quicksave'];
```

- Depois de alterar o arquivo, valide a mudança executando os testes do pacote core:

```bash
npm test --workspace=@r3xs-backup/core
```

Observações:
- Mantenha o arquivo em formato simples e declarativo — preferimos arrays de strings para facilitar testes e leitura.
- Se precisar de padrões mais complexos (regex), verifique a implementação do `fileScanner` para garantir suporte e adicione testes unitários cobrindo os novos casos.

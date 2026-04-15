# Onboarding Rápido (Monorepo)

Este documento orienta um contribuidor novo a começar a trabalhar no repositório monorepo.

Objetivo: reduzir atrito — mostrar passos mínimos para rodar, testar e submeter um PR por pacote.

1) Pré-requisitos

- Node.js >= 16
- npm (versão compatível com workspaces)

2) Clonar e instalar

```bash
git clone https://github.com/Vandrs/r3xs-backup.git
cd r3xs-backup
npm install
```

3) Estrutura mínima

- packages/core — lógica de negócio (scan, copy, validações)
- packages/cli — interface de linha de comando
- packages/desktop — aplicação Electron (UI)

4) Trabalhando por pacote (recomendado)

- Rodar testes do pacote core:

  npm test --workspace=@r3xs-backup/core

- Executar CLI em desenvolvimento:

  npm start --workspace=@r3xs-backup/cli -- --source ./test-easyroms --dest ./backup --full

- Executar Desktop (dev):

  npm run dev:desktop

5) Ciclo de contribuição

- Crie branch: git checkout -b feature/minha-feature
- Escreva testes no pacote apropriado (TDD)
- Rode npm test --workspace=<pacote>
- Commit e push com Conventional Commits

6) Publicação / releases

O monorepo é privado. Publicação é feita por pacote (quando aplicável) — veja docs/RELEASES_AND_INSTALLATION.md.

7) Recursos rápidos

- Índice da docs: docs/INDEX.md
- Guia do desenvolvedor: docs/DEVELOPERS_GUIDE.md
- Guia de contribuição: docs/CONTRIBUTING.md

Última atualização: 15/04/2026

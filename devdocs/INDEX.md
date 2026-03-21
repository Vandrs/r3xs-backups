# Índice de Documentação

Guia de navegação da documentação do R3XS Backups.

## 📖 Para Usuários
- **[README.md](../README.md)** - Como instalar e usar o CLI

## 👨‍💻 Para Desenvolvedores

### Começar
- **[DEVELOPERS_GUIDE.md](./DEVELOPERS_GUIDE.md)** - Setup inicial e comandos essenciais
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Como contribuir com código (inclui checklist do PR)

### Arquitetura e Testes
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Visão geral da arquitetura e métricas
- **[TESTING.md](./TESTING.md)** - Estratégia e guia de testes

### Decisões de Arquitetura (ADRs)
- **[ADR-001](./adrs/ADR-001-tech-stack.md)** - Escolha de tech stack
- **[ADR-002](./adrs/ADR-002-file-filtering-strategy.md)** - Estratégia de filtros
- **[ADR-003](./adrs/ADR-003-monorepo-structure.md)** - Estrutura monorepo com npm workspaces
- **[ADR-004](./adrs/ADR-004-electron-desktop-architecture.md)** - Arquitetura da aplicação desktop

### Roadmap
- **[ROADMAP.md](./ROADMAP.md)** - Plano de evolução do projeto

## 🗺️ Fluxo de Leitura Recomendado

**Novo Usuário:** README.md  
**Novo Desenvolvedor:** PROJECT_STRUCTURE.md → DEVELOPERS_GUIDE.md → CONTRIBUTING.md  
**Decisões de Design:** ADRs na pasta `adrs/`

## 🔍 Buscar Informação

**Preciso de...**
- Como usar o CLI → [README.md](../README.md)
- Setup e comandos → [DEVELOPERS_GUIDE.md](./DEVELOPERS_GUIDE.md)
- Contribuir → [CONTRIBUTING.md](./CONTRIBUTING.md)
- Rodar testes → [TESTING.md](./TESTING.md)
- Entender arquitetura → [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
- Ver roadmap → [ROADMAP.md](./ROADMAP.md)
- Decisões técnicas → [ADRs](./adrs/)

## 📧 Faltou Algo?

Se você não encontrou o que procurava:
1. Use o comando `grep -r "sua busca" devdocs/`
2. Abra uma issue no GitHub
3. Consulte os maintainers

---

**Última Atualização:** 21/03/2026

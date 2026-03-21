# R3XS Backups

🎮 Ferramentas de backup de ROMs e save states para handhelds R36S/R35S com ArkOS.

Escolha entre:
- **CLI** - Interface de linha de comando para scripts e automação
- **Desktop App** - Interface gráfica para usuários que preferem GUIs

## 📋 Descrição

O **R3XS Backups** facilita o backup dos seus jogos e saves do handheld R36S/R35S. Simplesmente conecte o cartão SD no PC e escolha a ferramenta que preferir para fazer backup completo ou apenas dos save states.

## 📦 Estrutura do Monorepo

Este projeto é um monorepo npm com três pacotes:

```
r3xs-backup/
├── packages/
│   ├── core/       (@r3xs-backup/core)      # Lógica compartilhada de backup
│   ├── cli/        (@r3xs-backup/cli)       # Interface de linha de comando
│   └── desktop/    (@r3xs-backup/desktop)   # Interface gráfica Electron
```

Cada pacote pode ser usado independentemente, mas todos compartilham a mesma lógica de backup através do `@r3xs-backup/core`.

## 🚀 Instalação

### Para Usuários Finais

#### Opção 1: CLI (Linha de Comando)

```bash
npm install -g r3xs-backup
```

#### Opção 2: Desktop App (Interface Gráfica)

Baixe o instalador para sua plataforma na seção [Releases](../../releases):

- **Windows**: `R3XS-Backup-Setup-X.X.X.exe`
- **Linux**: `R3XS-Backup-X.X.X.AppImage` ou `.deb`

### Para Desenvolvedores

Clone o repositório e instale as dependências de todos os workspaces:

```bash
git clone https://github.com/seu-usuario/r3xs-backup.git
cd r3xs-backup
npm install
```

## 💻 Uso

### 🖥️ Desktop App (Interface Gráfica)

A aplicação desktop oferece uma interface visual intuitiva para gerenciar seus backups.

#### Executar em Modo Desenvolvimento

```bash
# Da raiz do monorepo
npm run dev --workspace=@r3xs-backup/desktop

# Ou diretamente no package
cd packages/desktop
npm run dev
```

#### Construir Distribuível

```bash
# Da raiz do monorepo
cd packages/desktop

# Build para todas as plataformas
npm run build:all

# Build apenas para Windows
npm run build:win

# Build apenas para Linux
npm run build:linux
```

Os instaladores serão gerados em `packages/desktop/dist/`.

#### Funcionalidades da Interface

- ✅ Seleção visual de diretórios (origem e destino)
- ✅ Escolha entre backup completo ou apenas saves
- ✅ Estratégias de conflito configuráveis (overwrite, skip, newer)
- ✅ Barra de progresso em tempo real
- ✅ Log detalhado de cada etapa do backup
- ✅ Estatísticas finais (arquivos copiados, pulados, falhas)

**Plataformas Suportadas:** Windows, Linux (AppImage, .deb)

📖 **Documentação completa:** [packages/desktop/QUICKSTART.md](./packages/desktop/QUICKSTART.md)

---

### ⌨️ CLI (Linha de Comando)

### Backup Completo (ROMs + Saves)

Copia todos os arquivos encontrados recursivamente na pasta `easyroms`:

```bash
r3xs-backup --source /media/sdcard/easyroms --dest ~/backups/r36s --full
```

### Backup Apenas de Save States

Copia apenas arquivos que contenham "state" na extensão (ex: `.state`, `.state1`, `.savestate`):

```bash
r3xs-backup --source /media/sdcard/easyroms --dest ~/backups/r36s --saves-only
```

### Estratégias de Conflito

Quando um arquivo já existe no destino, você pode escolher:

#### Sobrescrever tudo
```bash
r3xs-backup --source /media/sdcard/easyroms --dest ~/backups/r36s --full --conflict overwrite
```

#### Ignorar duplicados
```bash
r3xs-backup --source /media/sdcard/easyroms --dest ~/backups/r36s --full --conflict skip
```

#### Sobrescrever apenas se mais recente (padrão)
```bash
r3xs-backup --source /media/sdcard/easyroms --dest ~/backups/r36s --full --conflict newer
```

## 📖 Opções

| Opção | Descrição | Obrigatório |
|-------|-----------|-------------|
| `--source <path>` | Caminho da pasta easyroms no cartão SD | ✅ Sim |
| `--dest <path>` | Caminho de destino do backup | ✅ Sim |
| `--full` | Backup completo (todos os arquivos) | Sim* |
| `--saves-only` | Backup apenas de save states | Sim* |
| `--conflict <strategy>` | Estratégia de conflito: `overwrite`, `skip`, `newer` | Não (padrão: `newer`) |

\* Você deve escolher `--full` **OU** `--saves-only`

## 📂 Estrutura do ArkOS

O ArkOS organiza os arquivos na seguinte estrutura:

```
easyroms/
├── nes/          (NES ROMs e saves)
├── snes/         (SNES ROMs e saves)
├── psx/          (PlayStation ROMs e saves)
├── gba/          (Game Boy Advance)
└── ...
```

A ferramenta busca **recursivamente** em todas as subpastas.

## ✅ Exemplos Práticos

### Exemplo 1: Backup completo pela primeira vez
```bash
r3xs-backup --source /media/username/R36S/easyroms --dest ~/Documents/R36S-Backups --full
```

### Exemplo 2: Backup diário apenas dos saves
```bash
r3xs-backup --source /media/username/R36S/easyroms --dest ~/Documents/R36S-Backups --saves-only --conflict newer
```

### Exemplo 3: Backup forçando sobrescrita
```bash
r3xs-backup --source /media/username/R36S/easyroms --dest ~/Documents/R36S-Backups --full --conflict overwrite
```

## 🧪 Desenvolvimento

Este é um **monorepo npm** com três workspaces independentes. Cada pacote tem seus próprios testes e linting.

### Comandos Globais (executam em todos os workspaces)

```bash
# Instalar dependências de todos os workspaces
npm install

# Executar testes de todos os pacotes
npm test

# Executar testes em modo watch
npm run test:watch

# Verificar cobertura de testes
npm run test:coverage

# Lint de todos os pacotes
npm run lint
```

### Executar Pacote Específico

```bash
# CLI
npm start --workspace=@r3xs-backup/cli -- --source ./test --dest ./backup --full

# Desktop
npm run dev --workspace=@r3xs-backup/desktop

# Core (rodar testes)
npm test --workspace=@r3xs-backup/core
```

### Estrutura de Desenvolvimento

```
packages/
├── core/              # Lógica de backup compartilhada
│   ├── src/           # Serviços (fileScanner, fileCopier, etc)
│   └── tests/         # Testes unitários e integração
├── cli/               # Interface CLI (Commander.js)
│   ├── src/           # Commands e entry point
│   └── tests/         # Testes CLI
└── desktop/           # Interface Electron
    ├── src/
    │   ├── main/      # Main process
    │   ├── preload/   # Preload script (security bridge)
    │   └── renderer/  # UI (HTML/CSS/JS)
    └── tests/         # Testes Electron
```

## 📚 Documentação

### Para Usuários

#### CLI
- **README.md** (este arquivo) - Como usar o CLI

#### Desktop App
- **[packages/desktop/QUICKSTART.md](./packages/desktop/QUICKSTART.md)** - Início rápido e guia de uso
- **[packages/desktop/IMPLEMENTATION.md](./packages/desktop/IMPLEMENTATION.md)** - Detalhes de implementação

### Para Desenvolvedores
- **[devdocs/INDEX.md](./devdocs/INDEX.md)** - Índice completo da documentação
- **[devdocs/PROJECT_STRUCTURE.md](./devdocs/PROJECT_STRUCTURE.md)** - Arquitetura e estrutura
- **[devdocs/CONTRIBUTING.md](./devdocs/CONTRIBUTING.md)** - Como contribuir
- **[devdocs/TESTING.md](./devdocs/TESTING.md)** - Guia de testes
- **[devdocs/ROADMAP.md](./devdocs/ROADMAP.md)** - Plano de evolução
- **[AGENTS.md](./AGENTS.md)** - Guia para agentes de IA

📖 **[Ver índice completo da documentação](./devdocs/INDEX.md)**

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

Veja o [guia de contribuição](./devdocs/CONTRIBUTING.md) para mais detalhes.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

## 🎮 Compatibilidade

- ✅ R36S com ArkOS
- ✅ R35S com ArkOS
- ✅ Outros dispositivos com estrutura similar de `easyroms`

## ⚠️ Avisos

- Sempre mantenha backups dos seus saves em múltiplos locais
- Teste a restauração dos backups periodicamente
- Certifique-se de ter espaço suficiente no destino antes de iniciar o backup

---

Feito com ❤️ para a comunidade de handheld retrogaming

# R3XS Backups

🎮 Ferramentas de backup de ROMs e save states para handhelds R36S/R35S com ArkOS.

Escolha entre:
- **CLI** - Interface de linha de comando para scripts e automação
- **Desktop App** - Interface gráfica para usuários que preferem GUIs

## 📋 Descrição

O **R3XS Backups** facilita o backup dos seus jogos e saves do handheld R36S/R35S. Simplesmente conecte o cartão SD no PC e escolha a ferramenta que preferir para fazer backup completo ou apenas dos save states.

## 🚀 Instalação

### ⌨️ CLI (Linha de Comando)

```bash
npm install -g r3xs-backup
```

### 🖥️ Desktop App (Interface Gráfica)

Baixe o instalador para sua plataforma na seção [Releases](../../releases):

- **Windows**: `R3XS-Backup-Setup-X.X.X.exe`
- **Linux**: `R3XS-Backup-X.X.X.AppImage` ou `.deb`

## 💻 Uso

### 🖥️ Desktop App

A aplicação desktop oferece uma interface visual intuitiva para gerenciar seus backups:

- ✅ Seleção visual de diretórios (origem e destino)
- ✅ Escolha entre backup completo ou apenas saves
- ✅ Estratégias de conflito configuráveis (overwrite, skip, newer)
- ✅ Barra de progresso em tempo real
- ✅ Log detalhado de cada etapa do backup
- ✅ Estatísticas finais (arquivos copiados, pulados, falhas)

**Plataformas Suportadas:** Windows, Linux (AppImage, .deb)

📖 **Guia de uso:** [packages/desktop/QUICKSTART.md](./packages/desktop/QUICKSTART.md)

---

### ⌨️ CLI

#### Opções

| Opção | Descrição | Obrigatório |
|-------|-----------|-------------|
| `--source <path>` | Caminho da pasta easyroms no cartão SD | ✅ Sim |
| `--dest <path>` | Caminho de destino do backup | ✅ Sim |
| `--full` | Backup completo (todos os arquivos) | Sim* |
| `--saves-only` | Backup apenas de save states — captura tanto save states (arquivos com `state` no nome: `.state`, `.state1`, `.savestate`, etc.) quanto battery saves (`.srm`, `.sav`, `.mcr`) | Sim* |
| `--conflict <strategy>` | Estratégia de conflito: `overwrite`, `skip`, `newer` | Não (padrão: `newer`) |

\* Você deve escolher `--full` **OU** `--saves-only`

#### Estratégias de Conflito

Quando um arquivo já existe no destino, use `--conflict` para definir o comportamento:

| Estratégia | Comportamento |
|------------|---------------|
| `newer` *(padrão)* | Sobrescreve apenas se o arquivo de origem for mais recente |
| `overwrite` | Sobrescreve sempre |
| `skip` | Ignora arquivos que já existem no destino |

#### Exemplos Práticos

```bash
# Backup completo pela primeira vez
r3xs-backup --source /media/username/R36S/easyroms --dest ~/Documents/R36S-Backups --full

# Backup diário apenas dos saves (mantém apenas os mais recentes)
r3xs-backup --source /media/username/R36S/easyroms --dest ~/Documents/R36S-Backups --saves-only --conflict newer

# Backup forçando sobrescrita de todos os arquivos
r3xs-backup --source /media/username/R36S/easyroms --dest ~/Documents/R36S-Backups --full --conflict overwrite
```

A ferramenta busca **recursivamente** em todas as subpastas de `easyroms`.

## 🎮 Compatibilidade

- ✅ R36S com ArkOS
- ✅ R35S com ArkOS
- ✅ Outros dispositivos com estrutura similar de `easyroms`

## ⚠️ Avisos

- Sempre mantenha backups dos seus saves em múltiplos locais
- Teste a restauração dos backups periodicamente
- Certifique-se de ter espaço suficiente no destino antes de iniciar o backup

## 🤝 Para Contribuidores

Contribuições são bem-vindas! Consulte o [guia de contribuição](./devdocs/CONTRIBUTING.md) para instruções detalhadas.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

---

Feito com ❤️ para a comunidade de handheld retrogaming

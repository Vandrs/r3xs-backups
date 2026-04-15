# Roadmap do Projeto

## Fase 1: CLI MVP ✅ (Atual)

**Status:** Concluído  
**Versão:** v1.0.0  

### Features
- [x] Backup full (todos os arquivos)
- [x] Backup saves-only (arquivos com "state")
- [x] Busca recursiva em easyroms/
- [x] Estratégias de conflito (overwrite, skip, newer)
- [x] Preservação de estrutura de diretórios
- [x] Feedback visual (spinner, cores)
- [x] Testes automatizados (TDD)
- [x] Documentação completa

### Tech Stack
- Node.js + Commander.js
- Jest (testes)
- fs-extra (filesystem)
- chalk + ora (UI)

---

## Fase 2: CLI Avançado

**Status:** Planejado  
**Target:** v1.5.0  

### Features Planejadas
- [ ] Backup incremental (apenas arquivos modificados)
- [ ] Compressão (zip/tar.gz)
- [ ] Arquivo de configuração (.r3xs-backup.json)
- [ ] Profiles de backup salvos
- [ ] Listagem de backups existentes
- [ ] Restauração de backups
- [ ] Dry-run mode (simular sem copiar)
- [ ] Progress bar detalhado
- [ ] Logs estruturados (arquivo .log)
- [ ] Exclusão de padrões (--exclude)

### Exemplos de Uso

```bash
# Backup incremental
r3xs-backup --source /media/sdcard --dest ~/backups --incremental

# Com compressão
r3xs-backup --source /media/sdcard --dest ~/backups --full --compress zip

# Usando profile salvo
r3xs-backup --profile daily-saves

# Listar backups
r3xs-backup --list ~/backups

# Restaurar backup
r3xs-backup --restore ~/backups/2026-03-18 --dest /media/sdcard
```

---

## Fase 3: GUI com Electron

**Status:** Em desenvolvimento  
**Target:** v2.0.0 (parcial)  

### Features
- [x] Interface gráfica desktop (Electron)
- [x] Configurações visuais (source/dest paths, backup mode, conflict strategy)
- [ ] Histórico de backups com timeline
- [ ] Visualização de saves (thumbnails)
- [ ] Agendamento de backups
- [ ] Notificações desktop
- [ ] Drag & drop de diretórios
- [ ] Multi-idioma (PT-BR, EN)
- [ ] Tray icon (rodar em background)

### Mockup Conceitual

```
┌─────────────────────────────────────────┐
│  R3XS Backups                    [_][□][X]│
├─────────────────────────────────────────┤
│  Origem:  /media/sdcard/easyroms  [...]  │
│  Destino: ~/Documents/R36S-Backup [...]  │
│                                          │
│  Modo: ○ Full  ● Saves Only             │
│  Conflitos: ▼ Sobrescrever se mais novo │
│                                          │
│  [📁 Adicionar Profile] [▶️ Fazer Backup] │
├─────────────────────────────────────────┤
│  Histórico de Backups:                   │
│  ✅ 21/03/2026 10:30 - 1.2GB (450 arqs)  │
│  ✅ 17/03/2026 18:15 - 1.1GB (445 arqs)  │
│  ✅ 15/03/2026 09:00 - 1.0GB (432 arqs)  │
└─────────────────────────────────────────┘
```

### Arquitetura Electron

```
packages/desktop/
├── src/main/        (Main process + IPC handlers)
├── src/preload/     (contextBridge API)
├── src/renderer/    (HTML + CSS + JS)
└── assets/          (icon)
```

---

## Fase 4: Cloud & Sync

**Status:** Futuro  
**Target:** v3.0.0  

### Features
- [ ] Upload para cloud (Google Drive, Dropbox)
- [ ] Sincronização automática
- [ ] Versionamento de saves
- [ ] Diff de saves (comparar estados)
- [ ] Backup para múltiplos destinos
- [ ] Criptografia de backups
- [ ] Autenticação de usuário
- [ ] Compartilhamento de saves

---

## Fase 5: Comunidade & Ecosystem

**Status:** Futuro distante  
**Target:** v4.0.0  

### Features
- [ ] Marketplace de saves (compartilhar progresso)
- [ ] Integração com RetroAchievements
- [ ] Estatísticas de gameplay
- [ ] Backup de screenshots/videos
- [ ] Suporte a outros handhelds (Anbernic, Miyoo, etc.)
- [ ] Plugin system
- [ ] API REST para integrações
- [ ] Mobile app (gerenciar backups remotamente)

---

## Melhorias Contínuas

### Performance
- [ ] Cópia paralela de arquivos (worker threads)
- [ ] Deduplicação de arquivos (hash-based)
- [ ] Streaming de arquivos grandes
- [ ] Cache de metadados

### DevOps
- [ ] CI/CD com GitHub Actions
- [ ] Publicação automática no NPM
- [ ] Releases automatizados
- [ ] Docker image
- [ ] Homebrew formula

### Qualidade
- [x] Linting (ESLint)
- [ ] Formatação (Prettier)
- [ ] Commit hooks (Husky)
- [ ] Changelog automático
- [ ] Cobertura de testes > 95%

---

## Como Contribuir com o Roadmap

1. Abra uma issue com label `enhancement`
2. Descreva a feature proposta
3. Discuta viabilidade com maintainers
4. Após aprovação, adicione ao roadmap

---

## Priorização

Usamos a matriz de priorização:

| Urgência/Impacto | Alto Impacto | Baixo Impacto |
|------------------|--------------|---------------|
| **Urgente**      | Fazer agora  | Agendar       |
| **Não urgente**  | Planejar     | Backlog       |

---

### Referência de tasks

O board do GitHub "Roms warehouse" (https://github.com/users/Vandrs/projects/3) é a fonte de verdade para priorização e status das tasks. Consulte o board para ver a priorização e o status atualizados; este documento não lista colunas ou estados fixos para evitar desalinhamento com o board.

## Changelog

Veja [CHANGELOG.md](../CHANGELOG.md) para histórico de versões.

# Releases e Instalação

Este documento descreve como instalar, gerar builds e publicar artefatos para os pacotes do monorepo.

Resumo rápido

- O repositório é um monorepo npm workspaces. O root é privado; publique individualmente os pacotes que devem ser públicos.
- Pacotes principais:
  - @r3xs-backup/core — biblioteca (máquinas/CI podem publicar)
  - @r3xs-backup/cli — ferramenta de linha de comando (pode ser publicada no npm)
  - @r3xs-backup/desktop — app Electron (normalmente distribuído via installers, não npm)

Instalação para usuários

1) Uso do CLI (se existir pacote publicado no npm)

```bash
# se existir pacote publicado (nome público do bin definido em packages/cli/package.json)
# exemplo de instalação global — usar o nome real do pacote: @r3xs-backup/cli
# OBS: publicar pacotes com escopo geralmente requer um nome alternativo não-escopado
# (p.ex. publicar bin "r3xs-backup"), confirmar no registro npm do projeto.
npm install -g @r3xs-backup/cli
# executar (caso o bin esteja publicado como r3xs-backup)
r3xs-backup --source /media/sdcard --dest ~/backups --full
```

2) Uso a partir do código-fonte (desenvolvimento)

```bash
git clone https://github.com/Vandrs/r3xs-backup.git
cd r3xs-backup
npm install

# executar CLI localmente (recomendado via root scripts)
npm run start:cli
# ou explicitamente por workspace
npm start --workspace=@r3xs-backup/cli -- --source /media/sdcard --dest ~/backups --full
```

Desktop App

- Se houver releases: faça download da page Releases (Windows .exe / Linux AppImage ou .deb)
- Para gerar localmente, execute o script de build do workspace desktop:

```bash
npm run build:desktop
# ou especificamente
npm run build --workspace=@r3xs-backup/desktop
```

Processo de release (maintainers)

1) Verifique testes, lint e coverage

```bash
# Executar verificação completa (root — roda testes e lint nos workspaces)
npm test
npm run lint
npm run test:coverage
```

2) Atualize versão no pacote alvo e publique

```bash
# exemplo: atualizar versão do core
npm version patch --workspace=@r3xs-backup/core

# publicar pacote público (executar a partir do workspace ou usando --workspace)
npm publish --workspace=@r3xs-backup/cli
```

3) Desktop: gerar instaladores

```bash
npm run build --workspace=@r3xs-backup/desktop
# artifacts/ ou dist/ com instaladores dependendo da configuração do electron-builder
```

Notas e boas práticas

- Não commit arquivos binários no repositório
- Tagueie releases com git tags (git push --tags)
 - Se o pacote CLI não estiver publicado, prefira instruções de uso via `npm run start:cli` (root) ou execução explícita por workspace

Links úteis

- Releases do projeto: https://github.com/Vandrs/r3xs-backup/releases

Última atualização: 15/04/2026

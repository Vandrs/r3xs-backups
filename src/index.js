#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const backupCommand = require('./commands/backup');
const packageJson = require('../package.json');

const program = new Command();

program
  .name('r3xs-backup')
  .description('Ferramenta CLI para backup de ROMs e save states de handhelds R36S/R35S com ArkOS')
  .version(packageJson.version);

program
  .requiredOption('-s, --source <path>', 'Caminho da pasta easyroms no cartão SD')
  .requiredOption('-d, --dest <path>', 'Caminho de destino do backup')
  .option('-f, --full', 'Backup completo (todos os arquivos)')
  .option('--saves-only', 'Backup apenas de save states')
  .option(
    '-c, --conflict <strategy>',
    'Estratégia de conflito: overwrite, skip, newer',
    'newer'
  )
  .action(async (options) => {
    // Validar estratégia de conflito (CLI-specific concern)
    const validStrategies = ['overwrite', 'skip', 'newer'];
    if (!validStrategies.includes(options.conflict)) {
      console.error(
        chalk.red(`Erro: Estratégia inválida "${options.conflict}". Use: overwrite, skip ou newer`)
      );
      process.exit(1);
    }

    // Delegate mode validation to backupCommand
    try {
      await backupCommand(options);
    } catch (error) {
      console.error(chalk.red(`Erro: ${error.message}`));
      process.exit(1);
    }
  });

program.parse();

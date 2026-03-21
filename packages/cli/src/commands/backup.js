const chalk = require('chalk');
const ora = require('ora');

const { scanFiles, copyFiles, validatePaths } = require('@r3xs-backup/core');

/**
 * Executa o comando de backup
 * @param {object} options - Opções do comando
 */
async function backupCommand(options) {
  const { source, dest, full, savesOnly, conflict } = options;

  // Validate backup mode
  if (!full && !savesOnly) {
    throw new Error('Modo de backup não especificado. Use full=true ou savesOnly=true');
  }
  
  if (full && savesOnly) {
    throw new Error('Modos conflitantes. Escolha apenas full=true OU savesOnly=true');
  }

  // Determinar modo de backup
  const mode = full ? 'full' : 'saves-only';

  // Só exibir logs se não estivermos em ambiente de teste
  const isTest = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;
  
  if (!isTest) {
    console.log(chalk.blue.bold('\n🎮 R3XS Backups\n'));
    console.log(chalk.gray(`Origem: ${source}`));
    console.log(chalk.gray(`Destino: ${dest}`));
    console.log(chalk.gray(`Modo: ${mode}`));
    console.log(chalk.gray(`Conflitos: ${conflict}\n`));
  }

  // Validar caminhos
  const spinner = isTest ? { start: () => spinner, succeed: () => {}, fail: () => {}, stop: () => {}, warn: () => {} } : ora('Validando caminhos...');
  spinner.start();
  const validation = await validatePaths(source, dest);

  if (!validation.valid) {
    spinner.fail(chalk.red(validation.error));
    process.exit(1);
  }
  spinner.succeed(chalk.green('Caminhos validados'));

  // Escanear arquivos
  spinner.start('Escaneando arquivos...');
  const files = await scanFiles(source, mode);

  if (files.length === 0) {
    spinner.warn(chalk.yellow('Nenhum arquivo encontrado'));
    process.exit(0);
  }

  spinner.succeed(chalk.green(`${files.length} arquivo(s) encontrado(s)`));

  // Copiar arquivos
  spinner.start('Copiando arquivos...');
  const result = await copyFiles(files, source, dest, conflict);

  spinner.stop();

  // Exibir resultado
  if (!isTest) {
    console.log(chalk.green.bold('\n✅ Backup concluído!\n'));
    console.log(chalk.green(`  Copiados: ${result.success}`));
    if (result.skipped > 0) {
      console.log(chalk.yellow(`  Ignorados: ${result.skipped}`));
    }
    if (result.failed > 0) {
      console.log(chalk.red(`  Falhas: ${result.failed}`));
    }
    console.log();
  }
}

module.exports = backupCommand;

const fs = require('fs-extra');
const path = require('path');
const { resolveConflict } = require('./conflictResolver');

/**
 * Copia lista de arquivos preservando estrutura de diretórios
 * @param {string[]} files - Array de caminhos absolutos dos arquivos
 * @param {string} sourceBase - Diretório base de origem
 * @param {string} destBase - Diretório base de destino
 * @param {string} conflictStrategy - Estratégia de conflito
 * @returns {Promise<{success: number, skipped: number, failed: number}>}
 */
async function copyFiles(files, sourceBase, destBase, conflictStrategy = 'newer') {
  const stats = {
    success: 0,
    skipped: 0,
    failed: 0,
  };

  for (const sourceFile of files) {
    try {
      // Calcular caminho relativo e destino
      const relativePath = path.relative(sourceBase, sourceFile);
      const destFile = path.join(destBase, relativePath);

      // Resolver conflito
      const shouldCopy = await resolveConflict(sourceFile, destFile, conflictStrategy);

      if (!shouldCopy) {
        stats.skipped++;
        continue;
      }

      // Garantir que diretório de destino existe
      await fs.ensureDir(path.dirname(destFile));

      // Copiar arquivo
      await fs.copyFile(sourceFile, destFile);
      stats.success++;
    } catch (error) {
      console.error(`Erro ao copiar ${sourceFile}: ${error.message}`);
      stats.failed++;
    }
  }

  return stats;
}

module.exports = {
  copyFiles,
};

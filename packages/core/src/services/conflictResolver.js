const fs = require('fs-extra');

/**
 * Resolve conflitos quando arquivo já existe no destino
 * @param {string} sourcePath - Caminho do arquivo de origem
 * @param {string} destPath - Caminho do arquivo de destino
 * @param {string} strategy - Estratégia: 'overwrite', 'skip', 'newer'
 * @returns {Promise<boolean>} true = copiar, false = pular
 */
async function resolveConflict(sourcePath, destPath, strategy = 'newer') {
  try {
    // Verificar se destino existe
    const destExists = await fs.pathExists(destPath);

    // Se destino não existe, sempre copiar
    if (!destExists) {
      return true;
    }

    // Aplicar estratégia
    switch (strategy) {
    case 'overwrite':
      return true;

    case 'skip':
      return false;

    case 'newer':
      return await isSourceNewer(sourcePath, destPath);

    default:
      // Padrão: usar 'newer'
      return await isSourceNewer(sourcePath, destPath);
    }
  } catch (error) {
    console.error(`Erro ao resolver conflito: ${error.message}`);
    return false;
  }
}

/**
 * Verifica se arquivo de origem é mais recente que destino
 * @param {string} sourcePath - Caminho da origem
 * @param {string} destPath - Caminho do destino
 * @returns {Promise<boolean>}
 */
async function isSourceNewer(sourcePath, destPath) {
  try {
    const sourceStat = await fs.stat(sourcePath);
    const destStat = await fs.stat(destPath);

    // Comparar timestamps de modificação
    return sourceStat.mtime >= destStat.mtime;
  } catch (error) {
    // Se der erro ao comparar, copiar por segurança
    return true;
  }
}

module.exports = {
  resolveConflict,
  isSourceNewer,
};

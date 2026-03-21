const fs = require('fs-extra');

/**
 * Valida caminhos de origem e destino
 * @param {string} source - Caminho de origem
 * @param {string} dest - Caminho de destino
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
async function validatePaths(source, dest) {
  // Validar origem
  const sourceExists = await fs.pathExists(source);
  if (!sourceExists) {
    return {
      valid: false,
      error: `Caminho de origem não existe: ${source}`,
    };
  }

  const sourceStat = await fs.stat(source);
  if (!sourceStat.isDirectory()) {
    return {
      valid: false,
      error: `Origem não é um diretório: ${source}`,
    };
  }

  // Criar destino se não existir
  try {
    await fs.ensureDir(dest);
  } catch (error) {
    return {
      valid: false,
      error: `Não foi possível criar diretório de destino: ${error.message}`,
    };
  }

  return { valid: true };
}

module.exports = {
  validatePaths,
};

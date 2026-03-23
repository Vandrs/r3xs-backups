const fs = require('fs-extra');
const path = require('path');

const { isSaveFile } = require('../config/backupExtensions');

/**
 * Escaneia recursivamente um diretório e retorna lista de arquivos
 * @param {string} sourcePath - Caminho do diretório a escanear
 * @param {string} mode - Modo de busca: 'full' ou 'saves-only'
 * @returns {Promise<string[]>} Array com caminhos absolutos dos arquivos
 */
async function scanFiles(sourcePath, mode) {
  const files = [];

  try {
    // Verificar se diretório existe
    const exists = await fs.pathExists(sourcePath);
    if (!exists) {
      return [];
    }

    // Função recursiva para buscar arquivos
    const scan = async (dirPath) => {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          // Recursão em subdiretórios
          await scan(fullPath);
        } else if (entry.isFile()) {
          // Aplicar filtro baseado no modo
          if (shouldIncludeFile(fullPath, mode)) {
            files.push(fullPath);
          }
        }
      }
    };

    await scan(sourcePath);
    return files;
  } catch (error) {
    console.error(`Erro ao escanear arquivos: ${error.message}`);
    return [];
  }
}

/**
 * Determina se um arquivo deve ser incluído baseado no modo
 * @param {string} filePath - Caminho do arquivo
 * @param {string} mode - Modo: 'full' ou 'saves-only'
 * @returns {boolean}
 */
function shouldIncludeFile(filePath, mode) {
  if (mode === 'full') {
    return true;
  }

  if (mode === 'saves-only') {
    return isSaveFile(filePath);
  }

  return false;
}

module.exports = {
  scanFiles,
  shouldIncludeFile,
};

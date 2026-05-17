const fs = require('fs-extra');
const path = require('path');

const { isSaveFile } = require('../config/backupExtensions');

/** Modos de scan válidos aceitos por scanFiles. */
const VALID_MODES = ['full', 'saves-only'];

/**
 * Escaneia recursivamente um diretório e retorna lista de arquivos.
 * - Segue symlinks com detecção de ciclos para evitar loops infinitos.
 * - Symlinks que apontam para fora do diretório raiz são ignorados (boundary check).
 * - Erros em subdiretórios individuais são registrados e ignorados para que o
 *   scan continue nos demais diretórios.
 * @param {string} sourcePath - Caminho do diretório a escanear
 * @param {string} mode - Modo de busca: 'full' ou 'saves-only'
 * @returns {Promise<string[]>} Array com caminhos absolutos dos arquivos
 * @throws {Error} Se mode for inválido
 */
async function scanFiles(sourcePath, mode) {
  // Validação de modo — falha explícita antes de qualquer I/O
  if (!VALID_MODES.includes(mode)) {
    throw new Error(`Modo de scan inválido: '${mode}'. Modos válidos: ${VALID_MODES.join(', ')}`);
  }

  // Verificar se diretório existe
  const exists = await fs.pathExists(sourcePath);
  if (!exists) {
    return [];
  }

  // Resolver o caminho real do diretório raiz para boundary check de symlinks
  let realSourceRoot;
  try {
    realSourceRoot = await fs.realpath(sourcePath);
  } catch (error) {
    console.error(`Erro ao resolver caminho de origem ${sourcePath}: ${error.message}`);
    return [];
  }

  const files = [];

  // Conjunto de realPaths visitados para detectar ciclos via symlinks
  const visitedRealPaths = new Set();

  // Função recursiva para buscar arquivos com tratamento de erro por diretório
  const scan = async (dirPath) => {
    // Resolver o caminho real para detectar ciclos via symlinks
    let realDirPath;
    try {
      realDirPath = await fs.realpath(dirPath);
    } catch (error) {
      console.error(`Erro ao resolver caminho ${dirPath}: ${error.message}`);
      return;
    }

    if (visitedRealPaths.has(realDirPath)) {
      // Ciclo detectado — ignorar para evitar recursão infinita
      return;
    }
    visitedRealPaths.add(realDirPath);

    let entries;
    try {
      entries = await fs.readdir(dirPath, { withFileTypes: true });
    } catch (error) {
      console.error(`Erro ao escanear ${dirPath}: ${error.message}`);
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Recursão em subdiretórios reais
        await scan(fullPath);
      } else if (entry.isSymbolicLink()) {
        // Resolver o alvo do symlink para aplicar boundary check e detecção de ciclo
        let realTarget;
        try {
          realTarget = await fs.realpath(fullPath);
        } catch (error) {
          // Symlink quebrado — ignorar silenciosamente
          console.error(`Erro ao resolver symlink ${fullPath}: ${error.message}`);
          continue;
        }

        // Boundary check: rejeitar symlinks que escapam do diretório raiz
        const boundaryPrefix = realSourceRoot + path.sep;
        if (realTarget !== realSourceRoot && !realTarget.startsWith(boundaryPrefix)) {
          console.error(`Symlink fora do diretório de origem ignorado: ${fullPath}`);
          continue;
        }

        let stat;
        try {
          stat = await fs.stat(fullPath);
        } catch (error) {
          console.error(`Erro ao obter stat de ${fullPath}: ${error.message}`);
          continue;
        }

        if (stat.isDirectory()) {
          await scan(fullPath);
        } else if (stat.isFile()) {
          if (shouldIncludeFile(fullPath, mode)) {
            files.push(fullPath);
          }
        }
      } else if (entry.isFile()) {
        // Aplicar filtro baseado no modo
        if (shouldIncludeFile(fullPath, mode)) {
          files.push(fullPath);
        }
      }
      // Outros tipos (FIFO, socket, dispositivo de bloco/caractere) são ignorados
    }
  };

  try {
    await scan(sourcePath);
  } catch (error) {
    console.error(`Erro ao escanear arquivos: ${error.message}`);
    return [];
  }

  return files;
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

const { ipcMain, dialog } = require('electron');
const path = require('path');

const { scanFiles, copyFiles, validatePaths } = require('@r3xs-backup/core');

/**
 * Estado do backup em andamento
 * @type {{active: boolean, cancelled: boolean}}
 */
const backupState = {
  active: false,
  cancelled: false,
};

/**
 * Registra todos os handlers IPC
 */
function registerIpcHandlers() {
  // Handler: Selecionar diretório de origem
  ipcMain.handle('select-source-dir', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Selecione o diretório de origem (ex: /mnt/sdcard/easyroms)',
    });

    if (result.canceled) {
      return null;
    }

    return result.filePaths[0];
  });

  // Handler: Selecionar diretório de destino
  ipcMain.handle('select-dest-dir', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
      title: 'Selecione o diretório de destino',
    });

    if (result.canceled) {
      return null;
    }

    return result.filePaths[0];
  });

  // Handler: Iniciar backup
  ipcMain.handle('start-backup', async (event, options) => {
    const { sourcePath, destPath, mode, conflictStrategy } = options;

    try {
      // Resetar estado
      backupState.active = true;
      backupState.cancelled = false;

      // 1. Validar paths
      const validation = await validatePaths(sourcePath, destPath);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // 2. Escanear arquivos
      event.sender.send('backup-progress', {
        phase: 'scanning',
        message: 'Escaneando arquivos...',
      });

      const files = await scanFiles(sourcePath, mode);

      if (files.length === 0) {
        return {
          success: true,
          stats: { success: 0, failed: 0, skipped: 0 },
          message: 'Nenhum arquivo encontrado para backup',
        };
      }

      // 3. Copiar arquivos com progresso
      event.sender.send('backup-progress', {
        phase: 'copying',
        message: `Copiando ${files.length} arquivo(s)...`,
        total: files.length,
        current: 0,
      });

      const stats = await copyFilesWithProgress(
        event,
        files,
        sourcePath,
        destPath,
        conflictStrategy
      );

      // Verificar se foi cancelado
      if (backupState.cancelled) {
        return {
          success: false,
          cancelled: true,
          stats,
          message: 'Backup cancelado pelo usuário',
        };
      }

      // 4. Finalizar
      event.sender.send('backup-complete', {
        success: true,
        stats,
        message: `Backup concluído: ${stats.success} arquivo(s) copiado(s)`,
      });

      return {
        success: true,
        stats,
      };
    } catch (error) {
      event.sender.send('backup-error', {
        message: error.message,
      });

      return {
        success: false,
        error: error.message,
      };
    } finally {
      backupState.active = false;
      backupState.cancelled = false;
    }
  });

  // Handler: Cancelar backup
  ipcMain.handle('cancel-backup', async () => {
    if (backupState.active) {
      backupState.cancelled = true;
      return { success: true, message: 'Cancelamento solicitado' };
    }

    return { success: false, message: 'Nenhum backup em andamento' };
  });
}

/**
 * Copia arquivos reportando progresso ao renderer
 * @param {Electron.IpcMainInvokeEvent} event - Evento IPC
 * @param {string[]} files - Lista de arquivos para copiar
 * @param {string} sourceBase - Diretório base de origem
 * @param {string} destBase - Diretório base de destino
 * @param {string} conflictStrategy - Estratégia de conflito
 * @returns {Promise<{success: number, failed: number, skipped: number}>}
 */
async function copyFilesWithProgress(event, files, sourceBase, destBase, conflictStrategy) {
  const stats = { success: 0, failed: 0, skipped: 0 };
  let lastProgressTime = Date.now();
  const PROGRESS_INTERVAL_MS = 1000;

  for (let i = 0; i < files.length; i++) {
    // Verificar cancelamento
    if (backupState.cancelled) {
      break;
    }

    const file = files[i];
    const relativePath = path.relative(sourceBase, file);

    try {
      // Copiar arquivo individual usando core service
      const result = await copyFiles(
        [file],
        sourceBase,
        destBase,
        conflictStrategy
      );

      stats.success += result.success;
      stats.failed += result.failed;
      stats.skipped += result.skipped;
    } catch (error) {
      console.error(`Erro ao copiar ${file}: ${error.message}`);
      stats.failed++;
    }

    // Reportar progresso a cada 10 arquivos ou 1 segundo
    const shouldReport = (i + 1) % 10 === 0 || Date.now() - lastProgressTime >= PROGRESS_INTERVAL_MS;

    if (shouldReport) {
      event.sender.send('backup-progress', {
        phase: 'copying',
        current: i + 1,
        total: files.length,
        currentFile: relativePath,
        stats: { ...stats },
      });
      lastProgressTime = Date.now();
    }
  }

  // Enviar progresso final
  event.sender.send('backup-progress', {
    phase: 'copying',
    current: files.length,
    total: files.length,
    stats: { ...stats },
  });

  return stats;
}

module.exports = {
  registerIpcHandlers,
};

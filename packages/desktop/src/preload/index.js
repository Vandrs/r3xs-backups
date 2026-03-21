const { contextBridge, ipcRenderer } = require('electron');

/**
 * Expõe API segura ao renderer process via contextBridge
 * Disponível em window.electronAPI
 */
contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Abre dialog para selecionar diretório de origem
   * @returns {Promise<string|null>} Caminho selecionado ou null se cancelado
   */
  selectSourceDir: () => ipcRenderer.invoke('select-source-dir'),

  /**
   * Abre dialog para selecionar diretório de destino
   * @returns {Promise<string|null>} Caminho selecionado ou null se cancelado
   */
  selectDestDir: () => ipcRenderer.invoke('select-dest-dir'),

  /**
   * Inicia processo de backup
   * @param {Object} options - Opções de backup
   * @param {string} options.sourcePath - Caminho do diretório de origem
   * @param {string} options.destPath - Caminho do diretório de destino
   * @param {string} options.mode - Modo de backup ('full' ou 'saves-only')
   * @param {string} options.conflictStrategy - Estratégia de conflito ('overwrite', 'skip', 'newer')
   * @returns {Promise<{success: boolean, stats: Object, error?: string}>}
   */
  startBackup: (options) => ipcRenderer.invoke('start-backup', options),

  /**
   * Cancela backup em andamento
   * @returns {Promise<{success: boolean, message: string}>}
   */
  cancelBackup: () => ipcRenderer.invoke('cancel-backup'),

  /**
   * Registra callback para receber atualizações de progresso
   * @param {Function} callback - Função chamada com dados de progresso
   * @returns {Function} Função para remover o listener
   */
  onBackupProgress: (callback) => {
    const listener = (_, data) => callback(data);
    ipcRenderer.on('backup-progress', listener);
    // Retorna função para cleanup
    return () => ipcRenderer.removeListener('backup-progress', listener);
  },

  /**
   * Registra callback para receber notificação de conclusão
   * @param {Function} callback - Função chamada quando backup completa
   * @returns {Function} Função para remover o listener
   */
  onBackupComplete: (callback) => {
    const listener = (_, data) => callback(data);
    ipcRenderer.on('backup-complete', listener);
    return () => ipcRenderer.removeListener('backup-complete', listener);
  },

  /**
   * Registra callback para receber notificação de erro
   * @param {Function} callback - Função chamada quando ocorre erro
   * @returns {Function} Função para remover o listener
   */
  onBackupError: (callback) => {
    const listener = (_, error) => callback(error);
    ipcRenderer.on('backup-error', listener);
    return () => ipcRenderer.removeListener('backup-error', listener);
  },
});

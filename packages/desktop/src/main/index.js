const { app, BrowserWindow } = require('electron');

const { createWindow } = require('./window');
const { registerIpcHandlers } = require('./ipc-handlers');

/**
 * Inicializa a aplicação quando Electron estiver pronto
 */
app.whenReady().then(() => {
  // Registrar handlers IPC antes de criar janela
  registerIpcHandlers();

  // Criar janela principal
  createWindow();

  // Evento macOS: recriar janela quando dock icon é clicado
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

/**
 * Encerrar app quando todas as janelas forem fechadas (exceto macOS)
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

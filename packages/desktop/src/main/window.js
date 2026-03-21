const { BrowserWindow } = require('electron');
const path = require('path');

/**
 * Cria e configura a janela principal da aplicação
 * @returns {BrowserWindow} Instância da janela criada
 */
function createWindow() {
  const isDev = process.env.NODE_ENV === 'development';

  const window = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      // Security best practices
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      // Preload script path
      preload: path.join(__dirname, '../preload/index.js'),
    },
    // Esconder até ready-to-show para evitar flash branco
    show: false,
  });

  // Carregar HTML do renderer
  const indexPath = path.join(__dirname, '../renderer/index.html');
  window.loadFile(indexPath);

  // DevTools apenas em desenvolvimento
  if (isDev) {
    window.webContents.openDevTools();
  }

  // Mostrar janela apenas quando estiver pronta
  window.once('ready-to-show', () => {
    window.show();
  });

  // Cleanup ao fechar
  window.on('closed', () => {
    // Referência será liberada no main process
  });

  return window;
}

module.exports = {
  createWindow,
};

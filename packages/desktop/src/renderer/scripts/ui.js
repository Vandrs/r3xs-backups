/**
 * UI.js - Manipulação de DOM e estado visual
 * 
 * Responsabilidades (Single Responsibility Principle):
 * - Manipular elementos do DOM
 * - Atualizar estado visual dos componentes
 * - Gerenciar logs e mensagens de feedback
 * 
 * Não contém lógica de negócio ou controle de fluxo.
 */

const UI = (() => {
  // Cache de elementos do DOM
  const elements = {
    sourcePath: null,
    destPath: null,
    startButton: null,
    cancelButton: null,
    progressSection: null,
    progressBar: null,
    progressText: null,
    currentFile: null,
    logContainer: null,
  };

  // Estado interno
  const state = {
    logCount: 0,
    maxLogs: 100,
  };

  /**
   * Inicializa cache de elementos do DOM
   * Deve ser chamado quando o DOM estiver pronto
   */
  function init() {
    elements.sourcePath = document.getElementById('source-path');
    elements.destPath = document.getElementById('dest-path');
    elements.startButton = document.getElementById('start-backup-btn');
    elements.cancelButton = document.getElementById('cancel-backup-btn');
    elements.progressSection = document.querySelector('.progress');
    elements.progressBar = document.getElementById('progress-bar');
    elements.progressText = document.getElementById('progress-text');
    elements.currentFile = document.getElementById('current-file');
    elements.logContainer = document.getElementById('log-container');
  }

  /**
   * Define o caminho da pasta de origem
   * @param {string} path - Caminho absoluto da pasta
   */
  function setSourcePath(path) {
    if (!elements.sourcePath) return;
    elements.sourcePath.value = path;
    elements.sourcePath.classList.add('has-value');
  }

  /**
   * Define o caminho da pasta de destino
   * @param {string} path - Caminho absoluto da pasta
   */
  function setDestPath(path) {
    if (!elements.destPath) return;
    elements.destPath.value = path;
    elements.destPath.classList.add('has-value');
  }

  /**
   * Obtém o caminho da pasta de origem
   * @returns {string}
   */
  function getSourcePath() {
    return elements.sourcePath ? elements.sourcePath.value : '';
  }

  /**
   * Obtém o caminho da pasta de destino
   * @returns {string}
   */
  function getDestPath() {
    return elements.destPath ? elements.destPath.value : '';
  }

  /**
   * Habilita o botão "Iniciar Backup"
   */
  function enableStartButton() {
    if (!elements.startButton) return;
    elements.startButton.disabled = false;
  }

  /**
   * Desabilita o botão "Iniciar Backup"
   */
  function disableStartButton() {
    if (!elements.startButton) return;
    elements.startButton.disabled = true;
  }

  /**
   * Habilita o botão "Cancelar"
   */
  function enableCancelButton() {
    if (!elements.cancelButton) return;
    elements.cancelButton.disabled = false;
  }

  /**
   * Desabilita o botão "Cancelar"
   */
  function disableCancelButton() {
    if (!elements.cancelButton) return;
    elements.cancelButton.disabled = true;
  }

  /**
   * Exibe a seção de progresso
   */
  function showProgress() {
    if (!elements.progressSection) return;
    elements.progressSection.style.display = 'block';
    resetProgress();
  }

  /**
   * Oculta a seção de progresso
   */
  function hideProgress() {
    if (!elements.progressSection) return;
    elements.progressSection.style.display = 'none';
  }

  /**
   * Reseta a barra de progresso para 0%
   */
  function resetProgress() {
    if (!elements.progressBar) return;
    elements.progressBar.style.width = '0%';
    elements.progressBar.parentElement.setAttribute('aria-valuenow', '0');
    if (elements.progressText) {
      elements.progressText.textContent = '0 / 0 arquivos (0%)';
    }
    if (elements.currentFile) {
      elements.currentFile.textContent = '';
    }
  }

  /**
   * Atualiza a barra de progresso
   * @param {number} current - Número de arquivos processados
   * @param {number} total - Total de arquivos
   * @param {number} percentage - Percentual de conclusão (0-100)
   */
  function updateProgress(current, total, percentage) {
    if (!elements.progressBar || !elements.progressText) return;

    const safePercentage = Math.min(100, Math.max(0, percentage));
    elements.progressBar.style.width = `${safePercentage}%`;
    elements.progressBar.parentElement.setAttribute('aria-valuenow', safePercentage.toString());
    elements.progressText.textContent = `${current} / ${total} arquivos (${safePercentage.toFixed(1)}%)`;
  }

  /**
   * Define o arquivo atual sendo processado
   * @param {string} filename - Nome do arquivo
   */
  function setCurrentFile(filename) {
    if (!elements.currentFile) return;
    elements.currentFile.textContent = filename ? `Processando: ${filename}` : '';
  }

  /**
   * Formata timestamp para logs
   * @returns {string} Timestamp no formato HH:MM:SS
   */
  function formatTimestamp() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  /**
   * Adiciona uma entrada no log
   * @param {string} message - Mensagem a ser exibida
   * @param {string} level - Nível do log: 'info' | 'success' | 'error' | 'warning'
   */
  function addLog(message, level = 'info') {
    if (!elements.logContainer) return;

    // Limita o número de logs para evitar problemas de performance
    if (state.logCount >= state.maxLogs) {
      const firstEntry = elements.logContainer.firstElementChild;
      if (firstEntry) {
        firstEntry.remove();
        state.logCount--;
      }
    }

    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${level}`;

    const timestamp = document.createElement('span');
    timestamp.className = 'timestamp';
    timestamp.textContent = formatTimestamp();

    const messageSpan = document.createElement('span');
    messageSpan.className = 'message';
    messageSpan.textContent = message;

    logEntry.appendChild(timestamp);
    logEntry.appendChild(messageSpan);
    elements.logContainer.appendChild(logEntry);

    state.logCount++;

    // Auto-scroll para o final
    elements.logContainer.scrollTop = elements.logContainer.scrollHeight;
  }

  /**
   * Limpa todos os logs
   */
  function clearLogs() {
    if (!elements.logContainer) return;
    elements.logContainer.innerHTML = '';
    state.logCount = 0;
  }

  /**
   * Exibe uma mensagem de erro
   * @param {string} message - Mensagem de erro
   */
  function showError(message) {
    addLog(`❌ ERRO: ${message}`, 'error');
  }

  /**
   * Exibe uma mensagem de sucesso
   * @param {string} message - Mensagem de sucesso
   */
  function showSuccess(message) {
    addLog(`✅ ${message}`, 'success');
  }

  /**
   * Exibe uma mensagem de aviso
   * @param {string} message - Mensagem de aviso
   */
  function showWarning(message) {
    addLog(`⚠️  ${message}`, 'warning');
  }

  /**
   * Obtém o modo de backup selecionado
   * @returns {string} 'full' ou 'savesOnly'
   */
  function getSelectedMode() {
    const modeInput = document.querySelector('input[name="mode"]:checked');
    return modeInput ? modeInput.value : 'full';
  }

  /**
   * Obtém a estratégia de conflito selecionada
   * @returns {string} 'newer' | 'overwrite' | 'skip'
   */
  function getSelectedConflictStrategy() {
    const conflictInput = document.querySelector('input[name="conflict"]:checked');
    return conflictInput ? conflictInput.value : 'newer';
  }

  // Interface pública
  return {
    init,
    setSourcePath,
    setDestPath,
    getSourcePath,
    getDestPath,
    enableStartButton,
    disableStartButton,
    enableCancelButton,
    disableCancelButton,
    showProgress,
    hideProgress,
    resetProgress,
    updateProgress,
    setCurrentFile,
    addLog,
    clearLogs,
    showError,
    showSuccess,
    showWarning,
    getSelectedMode,
    getSelectedConflictStrategy,
  };
})();

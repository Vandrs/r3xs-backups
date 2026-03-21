/**
 * App.js - Lógica de controle da aplicação
 * 
 * Responsabilidades (Single Responsibility Principle):
 * - Coordenar interações do usuário
 * - Validar formulário
 * - Comunicar com o main process via IPC
 * - Gerenciar fluxo de backup
 * 
 * Dependency Inversion: Depende da abstração UI, não de implementações concretas de DOM.
 */

(function() {
  'use strict';

  // Estado da aplicação
  const appState = {
    isBackupRunning: false,
    hasSourcePath: false,
    hasDestPath: false,
  };

  /**
   * Valida se o formulário está completo e válido
   * @returns {boolean}
   */
  function validateForm() {
    const sourcePath = UI.getSourcePath();
    const destPath = UI.getDestPath();

    appState.hasSourcePath = Boolean(sourcePath);
    appState.hasDestPath = Boolean(destPath);

    const isValid = appState.hasSourcePath && appState.hasDestPath;
    const pathsAreDifferent = sourcePath !== destPath;

    if (isValid && !pathsAreDifferent) {
      UI.showWarning('As pastas de origem e destino não podem ser iguais');
      return false;
    }

    return isValid;
  }

  /**
   * Atualiza o estado dos botões com base na validação do formulário
   */
  function updateButtonStates() {
    const isFormValid = validateForm();

    if (isFormValid && !appState.isBackupRunning) {
      UI.enableStartButton();
    } else {
      UI.disableStartButton();
    }

    if (appState.isBackupRunning) {
      UI.enableCancelButton();
    } else {
      UI.disableCancelButton();
    }
  }

  /**
   * Handler para seleção da pasta de origem
   */
  async function handleSelectSource() {
    try {
      const path = await window.electronAPI.selectSourceDir();
      if (path) {
        UI.setSourcePath(path);
        UI.addLog(`Pasta de origem selecionada: ${path}`, 'info');
        updateButtonStates();
      }
    } catch (error) {
      UI.showError(`Erro ao selecionar pasta de origem: ${error.message}`);
    }
  }

  /**
   * Handler para seleção da pasta de destino
   */
  async function handleSelectDest() {
    try {
      const path = await window.electronAPI.selectDestDir();
      if (path) {
        UI.setDestPath(path);
        UI.addLog(`Pasta de destino selecionada: ${path}`, 'info');
        updateButtonStates();
      }
    } catch (error) {
      UI.showError(`Erro ao selecionar pasta de destino: ${error.message}`);
    }
  }

  /**
   * Inicia o processo de backup
   */
  async function handleStartBackup() {
    if (!validateForm()) {
      UI.showError('Formulário inválido. Verifique os campos.');
      return;
    }

    const options = {
      sourcePath: UI.getSourcePath(),
      destPath: UI.getDestPath(),
      mode: UI.getSelectedMode(),
      conflictStrategy: UI.getSelectedConflictStrategy(),
    };

    UI.clearLogs();
    UI.addLog('='.repeat(60), 'info');
    UI.addLog('Iniciando backup...', 'info');
    UI.addLog(`Origem: ${options.sourcePath}`, 'info');
    UI.addLog(`Destino: ${options.destPath}`, 'info');
    UI.addLog(`Modo: ${options.mode === 'full' ? 'Completo (ROMs + Saves)' : 'Apenas Saves'}`, 'info');
    UI.addLog(`Conflitos: ${getConflictStrategyLabel(options.conflictStrategy)}`, 'info');
    UI.addLog('='.repeat(60), 'info');

    appState.isBackupRunning = true;
    updateButtonStates();

    UI.showProgress();

    try {
      await window.electronAPI.startBackup(options);
    } catch (error) {
      UI.showError(`Erro ao iniciar backup: ${error.message}`);
      appState.isBackupRunning = false;
      updateButtonStates();
      UI.hideProgress();
    }
  }

  /**
   * Cancela o backup em andamento
   */
  async function handleCancelBackup() {
    try {
      UI.addLog('Solicitando cancelamento do backup...', 'warning');
      await window.electronAPI.cancelBackup();
      UI.showWarning('Backup cancelado pelo usuário');
      appState.isBackupRunning = false;
      updateButtonStates();
      UI.hideProgress();
    } catch (error) {
      UI.showError(`Erro ao cancelar backup: ${error.message}`);
    }
  }

  /**
   * Retorna o label descritivo da estratégia de conflito
   * @param {string} strategy - 'newer' | 'overwrite' | 'skip'
   * @returns {string}
   */
  function getConflictStrategyLabel(strategy) {
    const labels = {
      newer: 'Sobrescrever se mais recente',
      overwrite: 'Sobrescrever tudo',
      skip: 'Ignorar duplicados',
    };
    return labels[strategy] || strategy;
  }

  /**
   * Handler de progresso do backup
   * @param {Object} data - Dados de progresso
   * @param {number} data.current - Arquivos processados
   * @param {number} data.total - Total de arquivos
   * @param {string} data.currentFile - Arquivo atual
   * @param {string} data.phase - Fase atual ('scanning' | 'copying')
   */
  function handleBackupProgress(data) {
    // Calcula percentual se current e total estiverem disponíveis
    const percentage = data.total > 0 ? (data.current / data.total) * 100 : 0;
    
    if (data.current !== undefined && data.total !== undefined) {
      UI.updateProgress(data.current, data.total, percentage);
    }
    
    if (data.currentFile) {
      UI.setCurrentFile(data.currentFile);
    }

    // Log de mensagens da fase
    if (data.message && data.phase === 'scanning') {
      UI.addLog(data.message, 'info');
    }

    // Log periódico (a cada 50 arquivos ou múltiplos de 10% do total)
    if (data.current && data.total) {
      const logInterval = Math.max(1, Math.floor(data.total / 10));
      if (data.current % Math.min(50, logInterval) === 0 || data.current === data.total) {
        UI.addLog(`Progresso: ${data.current}/${data.total} arquivos (${percentage.toFixed(1)}%)`, 'info');
      }
    }
  }

  /**
   * Handler de conclusão do backup
   * @param {Object} stats - Estatísticas do backup
   * @param {number} stats.success - Arquivos copiados com sucesso
   * @param {number} stats.failed - Arquivos com erro
   * @param {number} stats.skipped - Arquivos ignorados
   */
  function handleBackupComplete(stats) {
    appState.isBackupRunning = false;
    updateButtonStates();

    UI.hideProgress();
    UI.setCurrentFile('');

    UI.addLog('='.repeat(60), 'success');
    UI.showSuccess('Backup concluído com sucesso!');
    UI.addLog(`✓ Sucesso: ${stats.success} arquivo(s)`, 'success');
    
    if (stats.skipped > 0) {
      UI.addLog(`○ Ignorados: ${stats.skipped} arquivo(s)`, 'info');
    }
    
    if (stats.failed > 0) {
      UI.addLog(`✗ Falha: ${stats.failed} arquivo(s)`, 'error');
    }
    
    UI.addLog('='.repeat(60), 'success');
  }

  /**
   * Handler de erro do backup
   * @param {Object} error - Objeto de erro
   * @param {string} error.message - Mensagem de erro
   */
  function handleBackupError(error) {
    appState.isBackupRunning = false;
    updateButtonStates();

    UI.hideProgress();
    UI.setCurrentFile('');

    UI.addLog('='.repeat(60), 'error');
    UI.showError(`Backup falhou: ${error.message}`);
    UI.addLog('='.repeat(60), 'error');
  }

  /**
   * Registra todos os event listeners da aplicação
   */
  function registerEventListeners() {
    // Botões de seleção de pasta
    document.getElementById('select-source-btn').addEventListener('click', handleSelectSource);
    document.getElementById('select-dest-btn').addEventListener('click', handleSelectDest);

    // Botões de ação
    document.getElementById('start-backup-btn').addEventListener('click', handleStartBackup);
    document.getElementById('cancel-backup-btn').addEventListener('click', handleCancelBackup);

    // Listeners de mudança nos radio buttons para validação
    const modeInputs = document.querySelectorAll('input[name="mode"]');
    const conflictInputs = document.querySelectorAll('input[name="conflict"]');

    modeInputs.forEach(input => {
      input.addEventListener('change', () => {
        UI.addLog(`Modo alterado: ${UI.getSelectedMode()}`, 'info');
      });
    });

    conflictInputs.forEach(input => {
      input.addEventListener('change', () => {
        UI.addLog(`Estratégia de conflito alterada: ${getConflictStrategyLabel(UI.getSelectedConflictStrategy())}`, 'info');
      });
    });
  }

  /**
   * Registra listeners IPC do Electron
   */
  function registerIPCListeners() {
    if (!window.electronAPI) {
      UI.showError('ERRO CRÍTICO: electronAPI não está disponível. Verifique o preload script.');
      return;
    }

    // Registra listeners IPC
    window.electronAPI.onBackupProgress(handleBackupProgress);
    window.electronAPI.onBackupComplete(handleBackupComplete);
    window.electronAPI.onBackupError(handleBackupError);

    UI.addLog('Aplicação inicializada com sucesso', 'success');
    UI.addLog('Selecione as pastas de origem e destino para começar', 'info');
  }

  /**
   * Inicializa a aplicação
   */
  function init() {
    // Inicializa UI
    UI.init();

    // Registra event listeners
    registerEventListeners();
    registerIPCListeners();

    // Estado inicial dos botões
    updateButtonStates();

    // Log inicial
    UI.addLog('🎮 R3XS Backup Desktop - Pronto para uso', 'info');
  }

  // Inicializa quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

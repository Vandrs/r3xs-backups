const path = require('path');
const fs = require('fs-extra');
const os = require('os');

// Mock Electron modules
const mockDialog = {
  showOpenDialog: jest.fn(),
};

const mockIpcMain = {
  handle: jest.fn(),
};

jest.mock('electron', () => ({
  ipcMain: mockIpcMain,
  dialog: mockDialog,
}));

// Mock core services
const mockScanFiles = jest.fn();
const mockCopyFiles = jest.fn();
const mockValidatePaths = jest.fn();

jest.mock('@r3xs-backup/core', () => ({
  scanFiles: mockScanFiles,
  copyFiles: mockCopyFiles,
  validatePaths: mockValidatePaths,
}));

const { registerIpcHandlers } = require('../../src/main/ipc-handlers');

describe('IPC Handlers', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = path.join(os.tmpdir(), `r3xs-test-${Date.now()}`);
    jest.clearAllMocks();
    mockIpcMain.handle.mockClear();
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  describe('registerIpcHandlers', () => {
    test('deve registrar todos os 4 handlers IPC', () => {
      registerIpcHandlers();

      const registeredHandlers = mockIpcMain.handle.mock.calls.map(call => call[0]);

      expect(registeredHandlers).toContain('select-source-dir');
      expect(registeredHandlers).toContain('select-dest-dir');
      expect(registeredHandlers).toContain('start-backup');
      expect(registeredHandlers).toContain('cancel-backup');
      expect(mockIpcMain.handle).toHaveBeenCalledTimes(4);
    });
  });

  describe('select-source-dir handler', () => {
    test('deve retornar caminho quando dialog não for cancelado', async () => {
      registerIpcHandlers();
      const handler = mockIpcMain.handle.mock.calls.find(
        call => call[0] === 'select-source-dir'
      )[1];

      mockDialog.showOpenDialog.mockResolvedValue({
        canceled: false,
        filePaths: ['/mnt/sdcard/easyroms'],
      });

      const result = await handler();

      expect(result).toBe('/mnt/sdcard/easyroms');
      expect(mockDialog.showOpenDialog).toHaveBeenCalledWith(
        expect.objectContaining({
          properties: ['openDirectory'],
        })
      );
    });

    test('deve retornar null quando dialog for cancelado', async () => {
      registerIpcHandlers();
      const handler = mockIpcMain.handle.mock.calls.find(
        call => call[0] === 'select-source-dir'
      )[1];

      mockDialog.showOpenDialog.mockResolvedValue({
        canceled: true,
        filePaths: [],
      });

      const result = await handler();

      expect(result).toBeNull();
    });
  });

  describe('start-backup handler', () => {
    test('deve retornar erro quando validação falhar', async () => {
      registerIpcHandlers();
      const handler = mockIpcMain.handle.mock.calls.find(
        call => call[0] === 'start-backup'
      )[1];

      mockValidatePaths.mockResolvedValue({
        valid: false,
        error: 'Diretório de origem não existe',
      });

      const mockEvent = {
        sender: { send: jest.fn() },
      };

      const result = await handler(mockEvent, {
        sourcePath: '/invalid/path',
        destPath: '/dest',
        mode: 'full',
        conflictStrategy: 'overwrite',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Diretório de origem não existe');
      expect(mockEvent.sender.send).toHaveBeenCalledWith(
        'backup-error',
        expect.objectContaining({
          message: expect.stringContaining('origem'),
        })
      );
    });

    test('deve executar backup com sucesso quando paths válidos', async () => {
      registerIpcHandlers();
      const handler = mockIpcMain.handle.mock.calls.find(
        call => call[0] === 'start-backup'
      )[1];

      mockValidatePaths.mockResolvedValue({ valid: true });
      mockScanFiles.mockResolvedValue([
        '/source/file1.zip',
        '/source/file2.zip',
      ]);
      mockCopyFiles.mockResolvedValue({
        success: 1,
        failed: 0,
        skipped: 0,
      });

      const mockEvent = {
        sender: { send: jest.fn() },
      };

      const result = await handler(mockEvent, {
        sourcePath: '/source',
        destPath: '/dest',
        mode: 'full',
        conflictStrategy: 'overwrite',
      });

      expect(result.success).toBe(true);
      expect(result.stats.success).toBe(2);

      // Verificar eventos de progresso enviados
      const progressCalls = mockEvent.sender.send.mock.calls.filter(
        call => call[0] === 'backup-progress'
      );
      expect(progressCalls.length).toBeGreaterThan(0);

      // Verificar evento de conclusão
      expect(mockEvent.sender.send).toHaveBeenCalledWith(
        'backup-complete',
        expect.objectContaining({
          success: true,
          stats: expect.any(Object),
        })
      );
    });

    test('deve retornar mensagem quando nenhum arquivo encontrado', async () => {
      registerIpcHandlers();
      const handler = mockIpcMain.handle.mock.calls.find(
        call => call[0] === 'start-backup'
      )[1];

      mockValidatePaths.mockResolvedValue({ valid: true });
      mockScanFiles.mockResolvedValue([]);

      const mockEvent = {
        sender: { send: jest.fn() },
      };

      const result = await handler(mockEvent, {
        sourcePath: '/empty/dir',
        destPath: '/dest',
        mode: 'full',
        conflictStrategy: 'overwrite',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('Nenhum arquivo encontrado');
      expect(result.stats.success).toBe(0);
    });
  });

  describe('cancel-backup handler', () => {
    test('deve retornar erro quando nenhum backup em andamento', async () => {
      registerIpcHandlers();
      const handler = mockIpcMain.handle.mock.calls.find(
        call => call[0] === 'cancel-backup'
      )[1];

      const result = await handler();

      expect(result.success).toBe(false);
      expect(result.message).toContain('Nenhum backup em andamento');
    });
  });
});

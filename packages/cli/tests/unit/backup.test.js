const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const backupCommand = require('../../src/commands/backup');

describe('Backup Command', () => {
  let testDir;
  let sourceDir;
  let destDir;
  let consoleLogSpy;
  let consoleErrorSpy;
  let processExitSpy;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `r3xs-backup-cmd-test-${Date.now()}`);
    sourceDir = path.join(testDir, 'source');
    destDir = path.join(testDir, 'dest');
    await fs.ensureDir(sourceDir);
    
    // Silenciar console
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach(async () => {
    await fs.remove(testDir);
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  test('deve executar backup full com sucesso', async () => {
    await fs.writeFile(path.join(sourceDir, 'file.txt'), 'content');

    const options = {
      source: sourceDir,
      dest: destDir,
      full: true,
      savesOnly: false,
      conflict: 'overwrite',
    };

    await backupCommand(options);

    expect(await fs.pathExists(path.join(destDir, 'file.txt'))).toBe(true);
  });

  test('deve executar backup saves-only', async () => {
    await fs.writeFile(path.join(sourceDir, 'game.rom'), 'rom');
    await fs.writeFile(path.join(sourceDir, 'game.state'), 'save');

    const options = {
      source: sourceDir,
      dest: destDir,
      full: false,
      savesOnly: true,
      conflict: 'newer',
    };

    await backupCommand(options);

    expect(await fs.pathExists(path.join(destDir, 'game.rom'))).toBe(false);
    expect(await fs.pathExists(path.join(destDir, 'game.state'))).toBe(true);
  });

  test('deve sair com erro quando caminho de origem inválido', async () => {
    const options = {
      source: '/caminho/inexistente',
      dest: destDir,
      full: true,
      savesOnly: false,
      conflict: 'overwrite',
    };

    await backupCommand(options);

    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  test('deve sair com aviso quando nenhum arquivo encontrado', async () => {
    // Diretório vazio
    const options = {
      source: sourceDir,
      dest: destDir,
      full: true,
      savesOnly: false,
      conflict: 'overwrite',
    };

    await backupCommand(options);

    expect(processExitSpy).toHaveBeenCalledWith(0);
  });

  test('deve aplicar estratégia de conflito corretamente', async () => {
    await fs.writeFile(path.join(sourceDir, 'file.txt'), 'new content');
    await fs.ensureDir(destDir);
    await fs.writeFile(path.join(destDir, 'file.txt'), 'old content');

    const options = {
      source: sourceDir,
      dest: destDir,
      full: true,
      savesOnly: false,
      conflict: 'skip',
    };

    await backupCommand(options);

    const content = await fs.readFile(path.join(destDir, 'file.txt'), 'utf8');
    expect(content).toBe('old content');
  });

  // ===== New TDD Tests for Defensive Validation =====

  test('deve lançar erro quando nenhum modo for especificado', async () => {
    const options = {
      source: sourceDir,
      dest: destDir,
      conflict: 'newer',
    };

    await expect(backupCommand(options)).rejects.toThrow('Modo de backup não especificado');
  });

  test('deve lançar erro quando ambos os modos forem especificados', async () => {
    const options = {
      source: sourceDir,
      dest: destDir,
      full: true,
      savesOnly: true,
      conflict: 'newer',
    };

    await expect(backupCommand(options)).rejects.toThrow('Modos conflitantes');
  });

  test('deve aceitar full=true com savesOnly=undefined', async () => {
    await fs.writeFile(path.join(sourceDir, 'file.txt'), 'content');

    const options = {
      source: sourceDir,
      dest: destDir,
      full: true,
      conflict: 'overwrite',
    };

    await backupCommand(options);

    expect(await fs.pathExists(path.join(destDir, 'file.txt'))).toBe(true);
  });

  test('deve aceitar savesOnly=true com full=undefined', async () => {
    await fs.writeFile(path.join(sourceDir, 'game.state'), 'save');

    const options = {
      source: sourceDir,
      dest: destDir,
      savesOnly: true,
      conflict: 'newer',
    };

    await backupCommand(options);

    expect(await fs.pathExists(path.join(destDir, 'game.state'))).toBe(true);
  });
});

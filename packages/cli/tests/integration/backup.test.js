const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const backupCommand = require('../../src/commands/backup');

describe('Backup Integration Tests', () => {
  let testDir;
  let sourceDir;
  let destDir;
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `r3xs-integration-${Date.now()}`);
    sourceDir = path.join(testDir, 'easyroms');
    destDir = path.join(testDir, 'backup');
    await fs.ensureDir(sourceDir);
    
    // Silenciar todos os console outputs nos testes
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    await fs.remove(testDir);
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test('deve fazer backup completo de estrutura ArkOS simulada', async () => {
    // Simular estrutura ArkOS
    await fs.ensureDir(path.join(sourceDir, 'nes'));
    await fs.ensureDir(path.join(sourceDir, 'snes'));
    await fs.ensureDir(path.join(sourceDir, 'psx'));

    await fs.writeFile(path.join(sourceDir, 'nes/mario.nes'), 'mario rom');
    await fs.writeFile(path.join(sourceDir, 'nes/mario.nes.state'), 'mario save');
    await fs.writeFile(path.join(sourceDir, 'snes/zelda.smc'), 'zelda rom');
    await fs.writeFile(path.join(sourceDir, 'snes/zelda.zip'), 'zelda zip');
    await fs.writeFile(path.join(sourceDir, 'psx/ff7.iso'), 'ff7 rom');

    const options = {
      source: sourceDir,
      dest: destDir,
      full: true,
      savesOnly: false,
      conflict: 'overwrite',
    };

    await backupCommand(options);

    // Verificar que todos os arquivos foram copiados
    expect(await fs.pathExists(path.join(destDir, 'nes/mario.nes'))).toBe(true);
    expect(await fs.pathExists(path.join(destDir, 'nes/mario.nes.state'))).toBe(true);
    expect(await fs.pathExists(path.join(destDir, 'snes/zelda.smc'))).toBe(true);
    expect(await fs.pathExists(path.join(destDir, 'snes/zelda.zip'))).toBe(true);
    expect(await fs.pathExists(path.join(destDir, 'psx/ff7.iso'))).toBe(true);
    
    // Verificar conteúdo
    const content = await fs.readFile(path.join(destDir, 'nes/mario.nes'), 'utf8');
    expect(content).toBe('mario rom');
  });

  test('deve fazer backup apenas de saves', async () => {
    await fs.ensureDir(path.join(sourceDir, 'nes'));
    await fs.writeFile(path.join(sourceDir, 'nes/mario.nes'), 'rom');
    await fs.writeFile(path.join(sourceDir, 'nes/mario.nes.state'), 'save');
    await fs.writeFile(path.join(sourceDir, 'nes/zelda.zip.state1'), 'save1');

    const options = {
      source: sourceDir,
      dest: destDir,
      full: false,
      savesOnly: true,
      conflict: 'overwrite',
    };

    await backupCommand(options);

    // Apenas saves devem existir
    expect(await fs.pathExists(path.join(destDir, 'nes/mario.nes'))).toBe(false);
    expect(await fs.pathExists(path.join(destDir, 'nes/mario.nes.state'))).toBe(true);
    expect(await fs.pathExists(path.join(destDir, 'nes/zelda.zip.state1'))).toBe(true);
    
    // Verificar conteúdo
    const saveContent = await fs.readFile(path.join(destDir, 'nes/mario.nes.state'), 'utf8');
    expect(saveContent).toBe('save');
  });
});

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const { copyFiles } = require('../../src/services/fileCopier');

describe('FileCopier', () => {
  let testDir;
  let sourceDir;
  let destDir;
  let consoleErrorSpy;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `r3xs-copier-test-${Date.now()}`);
    sourceDir = path.join(testDir, 'source');
    destDir = path.join(testDir, 'dest');
    await fs.ensureDir(sourceDir);
    await fs.ensureDir(destDir);
    
    // Silenciar console.error nos testes
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    await fs.remove(testDir);
    consoleErrorSpy.mockRestore();
  });

  describe('copyFiles', () => {
    test('deve copiar arquivos preservando estrutura de diretórios', async () => {
      // Arrange
      await fs.ensureDir(path.join(sourceDir, 'nes'));
      await fs.ensureDir(path.join(sourceDir, 'snes'));
      await fs.writeFile(path.join(sourceDir, 'nes/mario.nes'), 'content1');
      await fs.writeFile(path.join(sourceDir, 'snes/zelda.smc'), 'content2');

      const files = [
        path.join(sourceDir, 'nes/mario.nes'),
        path.join(sourceDir, 'snes/zelda.smc'),
      ];

      // Act
      const result = await copyFiles(files, sourceDir, destDir, 'overwrite');

      // Assert
      expect(result.success).toBe(2);
      expect(result.skipped).toBe(0);
      expect(result.failed).toBe(0);

      const destFile1 = await fs.readFile(path.join(destDir, 'nes/mario.nes'), 'utf8');
      const destFile2 = await fs.readFile(path.join(destDir, 'snes/zelda.smc'), 'utf8');
      expect(destFile1).toBe('content1');
      expect(destFile2).toBe('content2');
    });

    test('deve respeitar estratégia skip', async () => {
      // Arrange
      await fs.ensureDir(path.join(sourceDir, 'nes'));
      await fs.ensureDir(path.join(destDir, 'nes'));
      await fs.writeFile(path.join(sourceDir, 'nes/game.nes'), 'new content');
      await fs.writeFile(path.join(destDir, 'nes/game.nes'), 'old content');

      const files = [path.join(sourceDir, 'nes/game.nes')];

      // Act
      const result = await copyFiles(files, sourceDir, destDir, 'skip');

      // Assert
      expect(result.success).toBe(0);
      expect(result.skipped).toBe(1);
      expect(result.failed).toBe(0);

      // Conteúdo deve permanecer o antigo
      const destContent = await fs.readFile(path.join(destDir, 'nes/game.nes'), 'utf8');
      expect(destContent).toBe('old content');
    });

    test('deve respeitar estratégia overwrite', async () => {
      // Arrange
      await fs.ensureDir(path.join(sourceDir, 'nes'));
      await fs.ensureDir(path.join(destDir, 'nes'));
      await fs.writeFile(path.join(sourceDir, 'nes/game.nes'), 'new content');
      await fs.writeFile(path.join(destDir, 'nes/game.nes'), 'old content');

      const files = [path.join(sourceDir, 'nes/game.nes')];

      // Act
      const result = await copyFiles(files, sourceDir, destDir, 'overwrite');

      // Assert
      expect(result.success).toBe(1);
      expect(result.skipped).toBe(0);

      // Conteúdo deve ser sobrescrito
      const destContent = await fs.readFile(path.join(destDir, 'nes/game.nes'), 'utf8');
      expect(destContent).toBe('new content');
    });

    test('deve contar falhas quando arquivo não pode ser copiado', async () => {
      const files = ['/arquivo/inexistente.txt'];

      const result = await copyFiles(files, sourceDir, destDir, 'overwrite');

      expect(result.success).toBe(0);
      expect(result.failed).toBe(1);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    test('deve criar diretórios intermediários se não existirem', async () => {
      // Arrange
      await fs.ensureDir(path.join(sourceDir, 'a/b/c'));
      await fs.writeFile(path.join(sourceDir, 'a/b/c/deep.txt'), 'deep content');

      const files = [path.join(sourceDir, 'a/b/c/deep.txt')];

      // Act
      await copyFiles(files, sourceDir, destDir, 'overwrite');

      // Assert
      const exists = await fs.pathExists(path.join(destDir, 'a/b/c/deep.txt'));
      expect(exists).toBe(true);
    });

    test('deve retornar estatísticas corretas para operação mista', async () => {
      // Arrange
      await fs.ensureDir(path.join(sourceDir, 'nes'));
      await fs.ensureDir(path.join(destDir, 'nes'));
      await fs.writeFile(path.join(sourceDir, 'nes/file1.nes'), 'content1');
      await fs.writeFile(path.join(sourceDir, 'nes/file2.nes'), 'content2');
      await fs.writeFile(path.join(destDir, 'nes/file2.nes'), 'existing');

      const files = [
        path.join(sourceDir, 'nes/file1.nes'),
        path.join(sourceDir, 'nes/file2.nes'),
        '/arquivo/invalido.txt',
      ];

      // Act
      const result = await copyFiles(files, sourceDir, destDir, 'skip');

      // Assert
      expect(result.success).toBe(1); // file1
      expect(result.skipped).toBe(1); // file2 (já existe)
      expect(result.failed).toBe(1); // arquivo inválido
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});

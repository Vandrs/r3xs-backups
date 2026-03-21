const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const { scanFiles } = require('../../src/services/fileScanner');

describe('FileScanner', () => {
  let testDir;

  beforeEach(async () => {
    // Criar diretório temporário para testes
    testDir = path.join(os.tmpdir(), `r3xs-test-${Date.now()}`);
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    // Limpar diretório de testes
    await fs.remove(testDir);
  });

  describe('scanFiles - modo full', () => {
    test('deve encontrar todos os arquivos recursivamente', async () => {
      // Arrange: criar estrutura de arquivos
      await fs.ensureDir(path.join(testDir, 'nes'));
      await fs.ensureDir(path.join(testDir, 'snes/subdir'));
      await fs.writeFile(path.join(testDir, 'nes/mario.nes'), '');
      await fs.writeFile(path.join(testDir, 'nes/mario.nes.state'), '');
      await fs.writeFile(path.join(testDir, 'snes/zelda.smc'), '');
      await fs.writeFile(path.join(testDir, 'snes/subdir/metroid.zip'), '');

      // Act
      const files = await scanFiles(testDir, 'full');

      // Assert
      expect(files).toHaveLength(4);
      expect(files).toEqual(
        expect.arrayContaining([
          expect.stringContaining('mario.nes'),
          expect.stringContaining('mario.nes.state'),
          expect.stringContaining('zelda.smc'),
          expect.stringContaining('metroid.zip'),
        ])
      );
    });

    test('deve retornar array vazio quando diretório não existe', async () => {
      const files = await scanFiles('/caminho/inexistente', 'full');
      expect(files).toEqual([]);
    });

    test('deve retornar array vazio para diretório vazio', async () => {
      const emptyDir = path.join(testDir, 'empty');
      await fs.ensureDir(emptyDir);

      const files = await scanFiles(emptyDir, 'full');
      expect(files).toEqual([]);
    });
  });

  describe('scanFiles - modo saves-only', () => {
    test('deve encontrar apenas arquivos com "state" na extensão', async () => {
      // Arrange
      await fs.ensureDir(path.join(testDir, 'nes'));
      await fs.writeFile(path.join(testDir, 'nes/mario.nes'), '');
      await fs.writeFile(path.join(testDir, 'nes/mario.nes.state'), '');
      await fs.writeFile(path.join(testDir, 'nes/zelda.zip.state1'), '');
      await fs.writeFile(path.join(testDir, 'nes/zelda.zip'), '');

      // Act
      const files = await scanFiles(testDir, 'saves-only');

      // Assert
      expect(files).toHaveLength(2);
      expect(files).toEqual(
        expect.arrayContaining([
          expect.stringContaining('mario.nes.state'),
          expect.stringContaining('zelda.zip.state1'),
        ])
      );
    });

    test('deve ser case-insensitive', async () => {
      await fs.ensureDir(path.join(testDir, 'nes'));
      await fs.writeFile(path.join(testDir, 'nes/game.STATE'), '');
      await fs.writeFile(path.join(testDir, 'nes/game.State'), '');

      const files = await scanFiles(testDir, 'saves-only');

      expect(files).toHaveLength(2);
    });

    test('deve aceitar variações: savestate, quickstate', async () => {
      await fs.ensureDir(path.join(testDir, 'psx'));
      await fs.writeFile(path.join(testDir, 'psx/ff7.savestate'), '');
      await fs.writeFile(path.join(testDir, 'psx/ff8.quickstate'), '');
      await fs.writeFile(path.join(testDir, 'psx/ff9.memstate'), '');

      const files = await scanFiles(testDir, 'saves-only');

      expect(files).toHaveLength(3);
    });

    test('não deve incluir arquivos sem "state" na extensão', async () => {
      await fs.ensureDir(path.join(testDir, 'gba'));
      await fs.writeFile(path.join(testDir, 'gba/pokemon.gba'), '');
      await fs.writeFile(path.join(testDir, 'gba/pokemon.sav'), '');
      await fs.writeFile(path.join(testDir, 'gba/readme.txt'), '');

      const files = await scanFiles(testDir, 'saves-only');

      expect(files).toEqual([]);
    });
  });

  describe('scanFiles - busca recursiva profunda', () => {
    test('deve buscar em múltiplos níveis de profundidade', async () => {
      // Estrutura: easyroms/nes/roms/action/mario.nes
      await fs.ensureDir(path.join(testDir, 'nes/roms/action'));
      await fs.ensureDir(path.join(testDir, 'snes/adventure/rpg'));
      await fs.writeFile(path.join(testDir, 'nes/roms/action/mario.nes'), '');
      await fs.writeFile(path.join(testDir, 'snes/adventure/rpg/ff6.smc'), '');

      const files = await scanFiles(testDir, 'full');

      expect(files).toHaveLength(2);
    });
  });
});

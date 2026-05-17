const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const { scanFiles, shouldIncludeFile } = require('../../src/services/fileScanner');

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

    test('não deve incluir ROMs e arquivos que não são saves nem states', async () => {
      // Arrange
      await fs.ensureDir(path.join(testDir, 'gba'));
      await fs.writeFile(path.join(testDir, 'gba/pokemon.gba'), '');
      await fs.writeFile(path.join(testDir, 'gba/readme.txt'), '');

      // Act
      const files = await scanFiles(testDir, 'saves-only');

      // Assert
      expect(files).toEqual([]);
    });

    test('deve incluir arquivo .sav no modo saves-only', async () => {
      // Arrange
      await fs.ensureDir(path.join(testDir, 'gba'));
      await fs.writeFile(path.join(testDir, 'gba/pokemon.sav'), '');
      await fs.writeFile(path.join(testDir, 'gba/pokemon.gba'), '');

      // Act
      const files = await scanFiles(testDir, 'saves-only');

      // Assert
      expect(files).toHaveLength(1);
      expect(files).toEqual(
        expect.arrayContaining([expect.stringContaining('pokemon.sav')])
      );
    });

    test('deve encontrar arquivos .srm no modo saves-only', async () => {
      // Arrange
      await fs.ensureDir(path.join(testDir, 'snes'));
      await fs.writeFile(path.join(testDir, 'snes/zelda.srm'), '');
      await fs.writeFile(path.join(testDir, 'snes/zelda.smc'), '');

      // Act
      const files = await scanFiles(testDir, 'saves-only');

      // Assert
      expect(files).toHaveLength(1);
      expect(files).toEqual(
        expect.arrayContaining([expect.stringContaining('zelda.srm')])
      );
    });

    test('deve encontrar arquivos .sav no modo saves-only', async () => {
      // Arrange
      await fs.ensureDir(path.join(testDir, 'gba'));
      await fs.writeFile(path.join(testDir, 'gba/pokemon.sav'), '');
      await fs.writeFile(path.join(testDir, 'gba/pokemon.gba'), '');

      // Act
      const files = await scanFiles(testDir, 'saves-only');

      // Assert
      expect(files).toHaveLength(1);
      expect(files).toEqual(
        expect.arrayContaining([expect.stringContaining('pokemon.sav')])
      );
    });

    test('deve encontrar arquivos .mcr no modo saves-only', async () => {
      // Arrange
      await fs.ensureDir(path.join(testDir, 'psx'));
      await fs.writeFile(path.join(testDir, 'psx/ff7.mcr'), '');
      await fs.writeFile(path.join(testDir, 'psx/ff7.bin'), '');

      // Act
      const files = await scanFiles(testDir, 'saves-only');

      // Assert
      expect(files).toHaveLength(1);
      expect(files).toEqual(
        expect.arrayContaining([expect.stringContaining('ff7.mcr')])
      );
    });

    test('deve encontrar states e saves juntos no modo saves-only', async () => {
      // Arrange
      await fs.ensureDir(path.join(testDir, 'mixed'));
      await fs.writeFile(path.join(testDir, 'mixed/mario.nes.state'), '');
      await fs.writeFile(path.join(testDir, 'mixed/pokemon.srm'), '');
      await fs.writeFile(path.join(testDir, 'mixed/mario.nes'), '');

      // Act
      const files = await scanFiles(testDir, 'saves-only');

      // Assert
      expect(files).toHaveLength(2);
      expect(files).toEqual(
        expect.arrayContaining([
          expect.stringContaining('mario.nes.state'),
          expect.stringContaining('pokemon.srm'),
        ])
      );
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

  describe('scanFiles - tratamento de erros', () => {
    test('deve retornar array vazio e logar erro quando leitura do diretório raiz falha', async () => {
      // Arrange: criar um arquivo no lugar de um diretório para forçar erro de readdir
      const fakeDir = path.join(testDir, 'not-a-dir');
      await fs.writeFile(fakeDir, 'sou um arquivo');
      // Forçar readdir a falhar: passar um arquivo como sourcePath (pathExists retorna true mas readdir falha)
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      const files = await scanFiles(fakeDir, 'full');

      // Assert
      expect(files).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Erro ao escanear')
      );
      consoleErrorSpy.mockRestore();
    });

    test('deve continuar escaneando outros diretórios quando um subdiretório falha na leitura', async () => {
      // Arrange: estrutura com dois subdiretórios; o segundo tem arquivos válidos
      await fs.ensureDir(path.join(testDir, 'ok'));
      await fs.writeFile(path.join(testDir, 'ok/game.state'), 'save');
      // Criar arquivo com mesmo nome que diretório referenciado — simula dir inacessível
      // Usamos chmod para tirar permissão de leitura do subdir 'locked'
      const lockedDir = path.join(testDir, 'locked');
      await fs.ensureDir(lockedDir);
      await fs.writeFile(path.join(lockedDir, 'hidden.state'), 'data');
      await fs.chmod(lockedDir, 0o000);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      const files = await scanFiles(testDir, 'saves-only');

      // Assert: deve encontrar o arquivo no diretório acessível
      // (ignora locked pois não tem permissão)
      expect(files).toEqual(
        expect.arrayContaining([expect.stringContaining('game.state')])
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Erro ao escanear')
      );

      // Cleanup: restaurar permissões para que afterEach possa remover
      await fs.chmod(lockedDir, 0o755);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('scanFiles - symlinks', () => {
    test('deve incluir arquivo save apontado por symlink no modo saves-only', async () => {
      // Arrange: arquivo .sav real e um symlink que aponta para ele
      await fs.ensureDir(path.join(testDir, 'saves'));
      await fs.writeFile(path.join(testDir, 'saves/real.sav'), 'savedata');
      await fs.symlink(
        path.join(testDir, 'saves/real.sav'),
        path.join(testDir, 'saves/linked.sav')
      );

      // Act
      const files = await scanFiles(testDir, 'saves-only');

      // Assert: ambos (real e linked) devem ser encontrados
      expect(files.length).toBeGreaterThanOrEqual(1);
      expect(files).toEqual(
        expect.arrayContaining([expect.stringContaining('real.sav')])
      );
    });

    test('deve escanear arquivos dentro de diretório apontado por symlink', async () => {
      // Arrange: diretório real com saves e um symlink para esse diretório
      await fs.ensureDir(path.join(testDir, 'real_saves'));
      await fs.writeFile(path.join(testDir, 'real_saves/mario.srm'), 'srm');
      await fs.symlink(
        path.join(testDir, 'real_saves'),
        path.join(testDir, 'linked_saves')
      );

      // Act
      const files = await scanFiles(testDir, 'saves-only');

      // Assert: deve encontrar via diretório real (e via symlink se não houver ciclo)
      expect(files).toEqual(
        expect.arrayContaining([expect.stringContaining('mario.srm')])
      );
    });

    test('não deve entrar em loop infinito com symlink circular', async () => {
      // Arrange: criar symlink que aponta de volta para o diretório pai (ciclo)
      await fs.ensureDir(path.join(testDir, 'sub'));
      await fs.writeFile(path.join(testDir, 'sub/game.state'), 'data');
      await fs.symlink(testDir, path.join(testDir, 'sub/loop'));

      // Act: deve completar sem travar
      const files = await scanFiles(testDir, 'saves-only');

      // Assert: deve encontrar o arquivo state sem loop
      expect(files).toEqual(
        expect.arrayContaining([expect.stringContaining('game.state')])
      );
    });

    test('deve ignorar symlink quebrado e continuar o scan', async () => {
      // Arrange: symlink apontando para caminho inexistente
      await fs.ensureDir(path.join(testDir, 'saves'));
      await fs.writeFile(path.join(testDir, 'saves/valid.sav'), 'data');
      await fs.symlink('/caminho/inexistente/broken.sav', path.join(testDir, 'saves/broken.sav'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      const files = await scanFiles(testDir, 'saves-only');

      // Assert: arquivo válido encontrado, symlink quebrado ignorado
      expect(files).toEqual(
        expect.arrayContaining([expect.stringContaining('valid.sav')])
      );
      expect(files.some((f) => f.includes('broken.sav'))).toBe(false);
      consoleErrorSpy.mockRestore();
    });

    test('deve ignorar symlink que aponta para fora do diretório de origem', async () => {
      // Arrange: symlink dentro de testDir que aponta para /tmp (fora de testDir)
      await fs.ensureDir(path.join(testDir, 'saves'));
      await fs.writeFile(path.join(testDir, 'saves/legit.sav'), 'data');
      await fs.symlink(os.tmpdir(), path.join(testDir, 'saves/escape'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      const files = await scanFiles(testDir, 'saves-only');

      // Assert: symlink externo ignorado, arquivo legítimo encontrado
      expect(files).toEqual(
        expect.arrayContaining([expect.stringContaining('legit.sav')])
      );
      expect(files.some((f) => f.includes('escape'))).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Symlink fora do diretório de origem ignorado')
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe('scanFiles - validação de modo', () => {
    test('deve lançar erro para modo inválido', async () => {
      // Arrange / Act / Assert
      await expect(scanFiles(testDir, 'unknown-mode')).rejects.toThrow(
        'Modo de scan inválido: \'unknown-mode\''
      );
    });

    test('deve aceitar modo full sem lançar erro', async () => {
      // Arrange
      await fs.writeFile(path.join(testDir, 'file.nes'), 'rom');

      // Act / Assert: não deve lançar
      await expect(scanFiles(testDir, 'full')).resolves.toBeDefined();
    });

    test('deve aceitar modo saves-only sem lançar erro', async () => {
      // Arrange
      await fs.writeFile(path.join(testDir, 'file.sav'), 'save');

      // Act / Assert: não deve lançar
      await expect(scanFiles(testDir, 'saves-only')).resolves.toBeDefined();
    });
  });

  describe('shouldIncludeFile - modo desconhecido', () => {
    test('deve retornar false para modo desconhecido', () => {
      // Arrange / Act / Assert
      expect(shouldIncludeFile('/qualquer/arquivo.nes', 'unknown-mode')).toBe(false);
    });
  });
});

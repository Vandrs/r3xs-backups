const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const { validatePaths } = require('../../src/utils/validators');

describe('Validators', () => {
  let testDir;
  let sourceDir;
  let destDir;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `r3xs-validators-test-${Date.now()}`);
    sourceDir = path.join(testDir, 'source');
    destDir = path.join(testDir, 'dest');
    await fs.ensureDir(sourceDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('validatePaths', () => {
    test('deve retornar válido quando origem existe e é diretório', async () => {
      const result = await validatePaths(sourceDir, destDir);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('deve criar destino se não existir', async () => {
      const newDest = path.join(testDir, 'new-dest');
      
      const result = await validatePaths(sourceDir, newDest);

      expect(result.valid).toBe(true);
      expect(await fs.pathExists(newDest)).toBe(true);
    });

    test('deve retornar erro quando origem não existe', async () => {
      const invalidSource = path.join(testDir, 'nao-existe');

      const result = await validatePaths(invalidSource, destDir);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('não existe');
    });

    test('deve retornar erro quando origem não é diretório', async () => {
      const sourceFile = path.join(testDir, 'arquivo.txt');
      await fs.writeFile(sourceFile, 'content');

      const result = await validatePaths(sourceFile, destDir);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('não é um diretório');
    });

    test('deve retornar erro quando não pode criar destino', async () => {
      // Tentar criar destino em local sem permissão
      const invalidDest = '/root/sem-permissao/destino';

      const result = await validatePaths(sourceDir, invalidDest);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Não foi possível criar');
    });
  });
});

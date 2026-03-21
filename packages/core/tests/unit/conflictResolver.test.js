const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const { resolveConflict } = require('../../src/services/conflictResolver');

describe('ConflictResolver', () => {
  let testDir;
  let sourceFile;
  let destFile;

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `r3xs-conflict-test-${Date.now()}`);
    await fs.ensureDir(testDir);
    sourceFile = path.join(testDir, 'source.txt');
    destFile = path.join(testDir, 'dest.txt');
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('resolveConflict - estratégia overwrite', () => {
    test('deve sempre retornar true (copiar)', async () => {
      await fs.writeFile(sourceFile, 'source content');
      await fs.writeFile(destFile, 'dest content');

      const result = await resolveConflict(sourceFile, destFile, 'overwrite');

      expect(result).toBe(true);
    });

    test('deve retornar true mesmo se destino não existir', async () => {
      await fs.writeFile(sourceFile, 'source content');

      const result = await resolveConflict(sourceFile, destFile, 'overwrite');

      expect(result).toBe(true);
    });
  });

  describe('resolveConflict - estratégia skip', () => {
    test('deve retornar false se destino existir', async () => {
      await fs.writeFile(sourceFile, 'source content');
      await fs.writeFile(destFile, 'dest content');

      const result = await resolveConflict(sourceFile, destFile, 'skip');

      expect(result).toBe(false);
    });

    test('deve retornar true se destino não existir', async () => {
      await fs.writeFile(sourceFile, 'source content');

      const result = await resolveConflict(sourceFile, destFile, 'skip');

      expect(result).toBe(true);
    });
  });

  describe('resolveConflict - estratégia newer', () => {
    test('deve retornar true se origem for mais recente', async () => {
      // Criar destino primeiro (mais antigo)
      await fs.writeFile(destFile, 'old content');
      await sleep(100);
      // Criar origem depois (mais recente)
      await fs.writeFile(sourceFile, 'new content');

      const result = await resolveConflict(sourceFile, destFile, 'newer');

      expect(result).toBe(true);
    });

    test('deve retornar false se destino for mais recente', async () => {
      // Criar origem primeiro (mais antigo)
      await fs.writeFile(sourceFile, 'old content');
      await sleep(100);
      // Criar destino depois (mais recente)
      await fs.writeFile(destFile, 'new content');

      const result = await resolveConflict(sourceFile, destFile, 'newer');

      expect(result).toBe(false);
    });

    test('deve retornar true se destino não existir', async () => {
      await fs.writeFile(sourceFile, 'content');

      const result = await resolveConflict(sourceFile, destFile, 'newer');

      expect(result).toBe(true);
    });

    test('deve retornar true se timestamps forem iguais', async () => {
      await fs.writeFile(sourceFile, 'content');
      await fs.writeFile(destFile, 'content');
      
      // Forçar mesmo timestamp
      const stat = await fs.stat(sourceFile);
      await fs.utimes(destFile, stat.atime, stat.mtime);

      const result = await resolveConflict(sourceFile, destFile, 'newer');

      expect(result).toBe(true);
    });
  });

  describe('resolveConflict - estratégia inválida', () => {
    test('deve usar "newer" como padrão', async () => {
      await fs.writeFile(destFile, 'old');
      await sleep(100);
      await fs.writeFile(sourceFile, 'new');

      const result = await resolveConflict(sourceFile, destFile, 'invalid');

      expect(result).toBe(true);
    });
  });
});

// Utilitário para esperar em testes
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

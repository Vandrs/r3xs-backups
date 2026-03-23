const { STATES_PATTERNS, SAVES_EXTENSIONS, isSaveFile } = require('../../src/config/backupExtensions');

describe('BackupExtensions', () => {
  describe('isSaveFile - save states', () => {
    test('deve retornar true para arquivo com extensão .state', () => {
      // Arrange / Act / Assert
      expect(isSaveFile('/roms/nes/mario.nes.state')).toBe(true);
    });

    test('deve retornar true para arquivo com variação state1', () => {
      expect(isSaveFile('/roms/nes/zelda.zip.state1')).toBe(true);
    });

    test('deve retornar true para arquivo com extensão savestate', () => {
      expect(isSaveFile('/roms/psx/ff7.savestate')).toBe(true);
    });

    test('deve retornar true para arquivo .STATE em maiúsculo (case-insensitive)', () => {
      expect(isSaveFile('/roms/nes/game.STATE')).toBe(true);
    });

    test('deve retornar true para arquivo com extensão quickstate', () => {
      expect(isSaveFile('/roms/psx/ff8.quickstate')).toBe(true);
    });

    test('deve retornar true para arquivo com extensão memstate', () => {
      expect(isSaveFile('/roms/psx/game.memstate')).toBe(true);
    });
  });

  describe('isSaveFile - battery saves', () => {
    test('deve retornar true para arquivo .srm', () => {
      expect(isSaveFile('/roms/gba/pokemon.srm')).toBe(true);
    });

    test('deve retornar true para arquivo .sav', () => {
      expect(isSaveFile('/roms/gba/pokemon.sav')).toBe(true);
    });

    test('deve retornar true para arquivo .mcr', () => {
      expect(isSaveFile('/roms/psx/ff7.mcr')).toBe(true);
    });

    test('deve retornar true para arquivo .SRM em maiúsculo (case-insensitive)', () => {
      expect(isSaveFile('/roms/gba/game.SRM')).toBe(true);
    });

    test('deve retornar true para arquivo .SAV em maiúsculo (case-insensitive)', () => {
      expect(isSaveFile('/roms/gba/game.SAV')).toBe(true);
    });
  });

  describe('isSaveFile - não-saves', () => {
    test('deve retornar false para ROM .nes', () => {
      expect(isSaveFile('/roms/nes/mario.nes')).toBe(false);
    });

    test('deve retornar false para arquivo .zip', () => {
      expect(isSaveFile('/roms/nes/zelda.zip')).toBe(false);
    });

    test('deve retornar false para ROM .gba', () => {
      expect(isSaveFile('/roms/gba/game.gba')).toBe(false);
    });

    test('deve retornar false para arquivo .txt', () => {
      expect(isSaveFile('/roms/readme.txt')).toBe(false);
    });

    test('deve retornar false para arquivo .bin', () => {
      expect(isSaveFile('/roms/game.bin')).toBe(false);
    });

    test('deve retornar false para arquivo .rom', () => {
      expect(isSaveFile('/roms/rom.rom')).toBe(false);
    });
  });

  describe('constantes exportadas', () => {
    test('STATES_PATTERNS deve conter o padrão "state"', () => {
      expect(STATES_PATTERNS).toContain('state');
    });

    test('SAVES_EXTENSIONS deve conter exatamente [".srm", ".sav", ".mcr"]', () => {
      expect(SAVES_EXTENSIONS).toEqual(['.srm', '.sav', '.mcr']);
    });
  });
});

const path = require('path');

/**
 * Substrings usadas para identificar save states de emulador no nome do arquivo.
 * A correspondência é feita por inclusão (substring) no basename, case-insensitive.
 * Exemplos de nomes detectados: mario.nes.state, zelda.zip.state1, ff7.savestate, game.STATE
 * @type {string[]}
 */
const STATES_PATTERNS = ['state'];

/**
 * Extensões exatas (com ponto) que identificam battery saves / SRAM.
 * A correspondência é feita por igualdade na extensão do arquivo, case-insensitive.
 * @type {string[]}
 */
const SAVES_EXTENSIONS = ['.srm', '.sav', '.mcr'];

/**
 * Determina se um arquivo pertence a alguma categoria de save (state ou battery save).
 * - States: basename em lowercase contém alguma substring de STATES_PATTERNS
 * - Saves: extensão em lowercase é igual a algum valor de SAVES_EXTENSIONS
 * @param {string} filePath - Caminho absoluto do arquivo
 * @returns {boolean} true se o arquivo é um state ou save, false caso contrário
 */
function isSaveFile(filePath) {
  const basename = path.basename(filePath).toLowerCase();
  const ext = path.extname(filePath).toLowerCase();

  const isState = STATES_PATTERNS.some((pattern) => basename.includes(pattern));
  const isSave = SAVES_EXTENSIONS.includes(ext);

  return isState || isSave;
}

module.exports = {
  STATES_PATTERNS,
  SAVES_EXTENSIONS,
  isSaveFile,
};

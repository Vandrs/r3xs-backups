// Exporta todos os services
const { scanFiles } = require('./services/fileScanner');
const { copyFiles } = require('./services/fileCopier');
const { resolveConflict } = require('./services/conflictResolver');

// Exporta todos os utils
const { validatePaths } = require('./utils/validators');

module.exports = {
  // Services
  scanFiles,
  copyFiles,
  resolveConflict,
  
  // Utils
  validatePaths,
};

'use strict';

module.exports = {
  overrides: [
    {
      // All renderer scripts run in Chromium: enable browser globals,
      // disable Node.js globals which are not available in the renderer.
      files: ['src/renderer/**/*.js'],
      env: {
        browser: true,
        es6: true,
        node: false,
      },
    },
    {
      // ui.js intentionally assigns `const UI` to expose it as a script-tag
      // global consumed by app.js. ESLint cannot see cross-file usage, so
      // no-unused-vars fires here. We allow top-level vars matching /^UI$/
      // to be unused from ESLint's single-file perspective.
      files: ['src/renderer/scripts/ui.js'],
      rules: {
        'no-unused-vars': ['error', { vars: 'all', varsIgnorePattern: '^UI$', argsIgnorePattern: '^_' }],
      },
    },
    {
      // app.js reads the UI global defined in ui.js (loaded first via
      // <script> tag in index.html). Declaring it readonly suppresses
      // no-undef without implying this file owns the definition.
      files: ['src/renderer/scripts/app.js'],
      globals: {
        UI: 'readonly',
      },
    },
    {
      files: ['src/main/**/*.js', 'src/preload/**/*.js', 'tests/**/*.js'],
      env: {
        node: true,
        es6: true,
      },
    },
  ],
};

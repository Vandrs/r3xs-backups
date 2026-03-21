# Guia de Testes

## Visão Geral

Este projeto segue a metodologia **Test-Driven Development (TDD)**. Os testes são escritos antes da implementação e servem como especificação executável do comportamento esperado.

> **Nota:** Para workflow TDD completo e guia de contribuição, veja [CONTRIBUTING.md](CONTRIBUTING.md). Para debugging detalhado, veja [DEVELOPERS_GUIDE.md](DEVELOPERS_GUIDE.md).

## Estrutura de Testes

```
packages/
├── core/tests/
│   ├── unit/
│   │   ├── fileScanner.test.js
│   │   ├── fileCopier.test.js
│   │   ├── conflictResolver.test.js
│   │   └── validators.test.js
│   └── integration/
│       └── backup.test.js
├── cli/tests/
│   ├── unit/backup.test.js
│   └── integration/backup.test.js
└── desktop/tests/
    └── unit/ipc-handlers.test.js
```

## Executar Testes

```bash
# Todos os pacotes
npm test
npm run test:watch
npm run test:coverage

# Pacote específico
npm test --workspace=@r3xs-backup/core
npm test --workspace=@r3xs-backup/cli
npm test --workspace=@r3xs-backup/desktop

# Arquivo ou teste específico (dentro de um pacote)
npm test --workspace=@r3xs-backup/core -- fileScanner.test.js
npm test --workspace=@r3xs-backup/core -- -t "deve copiar"
```

## Convenções de Testes

### Estrutura AAA (Arrange-Act-Assert)

```javascript
test('deve fazer algo', async () => {
  // Arrange: preparar dados
  const input = 'foo';
  // Act: executar ação
  const result = await minhaFuncao(input);
  // Assert: verificar resultado
  expect(result).toBe('bar');
});
```

### Nomenclatura

- Descrever comportamento, não implementação
- Usar "deve" no início: `deve copiar arquivo quando não existir`
- Ser específico: ✅ `deve filtrar .state` ❌ `funciona`

### Dados de Teste

- Usar diretórios temporários (`os.tmpdir()`)
- Limpar após cada teste (`afterEach`)
- Nunca depender de arquivos reais do sistema
- Isolar testes uns dos outros

## Cobertura de Testes

### Metas

| Tipo | Cobertura Mínima |
|------|------------------|
| Serviços | 90% |
| Comandos | 80% |
| Utils | 95% |

### Verificar Cobertura

```bash
npm run test:coverage
```

Relatórios gerados em `coverage/core/`, `coverage/cli/` e `coverage/desktop/`.

## Testes por Pacote

### `@r3xs-backup/core`

- **fileScanner** — busca recursiva, filtro por modo (full/saves-only), case-insensitive, dirs vazios
- **conflictResolver** — estratégias overwrite, skip e newer
- **fileCopier** — preserva estrutura, respeita estratégias, contabiliza sucessos/falhas/pulados
- **backup (integração)** — fluxo completo: full e saves-only em estrutura ArkOS simulada

### `@r3xs-backup/cli`

- **backup (unit)** — validação de argumentos, saída de erro no CLI
- **backup (integração)** — execução end-to-end via interface de linha de comando

### `@r3xs-backup/desktop`

- **ipc-handlers** — handlers IPC do Electron: comunicação renderer↔main, erros e respostas

## Mocks e Stubs

Evitamos mocks excessivos. Preferimos filesystem real em `os.tmpdir()`.

Mockar apenas `console.*` e `process.exit`:

```javascript
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(process, 'exit').mockImplementation(() => {});
```

## CI/CD

Os testes rodam automaticamente no CI antes de merge. Nenhum PR pode ser mergeado com testes falhando.

## Troubleshooting

- **Testes pendurando** — verificar `await` faltando; usar `jest.setTimeout(10000)` para testes lentos
- **Testes flaky** — evitar `setTimeout`; garantir isolamento via `afterEach`
- **Coverage baixa** — abrir `coverage/<package>/lcov-report/index.html` para ver linhas descobertas

## Recursos

- [Jest Documentation](https://jestjs.io/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

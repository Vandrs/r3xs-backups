# ADR-001: Tech Stack Selection

**Status:** Aceito  
**Data:** 2026-03-18  
**Decisores:** Time de desenvolvimento  

## Contexto

Precisamos escolher as tecnologias para construir uma ferramenta CLI de backup para handhelds R36S/R35S com ArkOS, com visão futura de criar uma interface gráfica.

## Decisão

Escolhemos a seguinte stack:

### Core
- **Node.js** (≥16.0.0): Runtime JavaScript
- **Commander.js**: Framework CLI
- **fs-extra**: Operações de filesystem aprimoradas

### UI/UX
- **chalk**: Colorização de output no terminal
- **ora**: Spinners e indicadores de progresso

### Testes
- **Jest**: Framework de testes
- **ESLint**: Linter de código

### Futuro
- **Electron**: Interface gráfica desktop

## Razões

### Node.js
- **Prós:**
  - Ecossistema rico de bibliotecas para filesystem
  - Async/await nativo para operações I/O
  - Facilita migração para Electron (mesmo runtime)
  - Cross-platform (Windows, Mac, Linux)
  - Boa performance para operações de arquivo
  
- **Contras:**
  - Consumo de memória maior que linguagens compiladas (Go, Rust)
  - Menos performático que C++ para operações massivas
  
- **Alternativas consideradas:**
  - Python: Menos adequado para empacotamento Electron
  - Go: Excelente performance, mas mais complexo para GUI futura
  - Bash: Limitado para lógica complexa e GUI

### Commander.js
- **Prós:**
  - API simples e declarativa
  - Parsing robusto de argumentos
  - Help automático
  - Validações built-in
  
- **Contras:**
  - Menos features que Yargs
  
- **Alternativas consideradas:**
  - Yargs: Mais verboso
  - Minimist: Muito baixo nível

### fs-extra
- **Prós:**
  - Drop-in replacement do `fs` nativo
  - Métodos adicionais (copy, ensureDir, etc.)
  - Promises nativas
  
- **Contras:**
  - Dependência extra (mínima)

### Jest
- **Prós:**
  - Zero-config
  - Snapshot testing
  - Coverage integrado
  - Mocking fácil
  
- **Contras:**
  - Mais pesado que Mocha/AVA
  
- **Alternativas consideradas:**
  - Vitest: Muito novo, menos maduro
  - Mocha+Chai: Mais boilerplate

## Consequências

### Positivas
- Desenvolvimento rápido com ecossistema maduro
- Migração suave para Electron
- Testes robustos desde o início
- Cross-platform sem esforço extra

### Negativas
- Usuários precisarão ter Node.js instalado (até empacotar com Electron)
- Performance não será tão alta quanto linguagens compiladas
- Binário final será maior (~50-100MB com Electron)

### Neutras
- Curva de aprendizado baixa para desenvolvedores JavaScript
- Comunidade ativa para suporte

## Notas

- Para otimização futura, podemos considerar worker threads para cópias paralelas
- Electron permite empacotar binários standalone sem dependências externas
- Se performance se tornar crítica, podemos reescrever partes em Rust via N-API

## Referências

- [Commander.js Docs](https://github.com/tj/commander.js)
- [fs-extra Docs](https://github.com/jprichardson/node-fs-extra)
- [Jest Docs](https://jestjs.io/)
- [Electron Docs](https://www.electronjs.org/)

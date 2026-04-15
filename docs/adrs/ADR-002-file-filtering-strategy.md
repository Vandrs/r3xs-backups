# ADR-002: File Filtering Strategy

**Status:** Aceito  
**Data:** 2026-03-18  
**Decisores:** Time de desenvolvimento  

## Contexto

O backup do ArkOS precisa diferenciar entre:
1. **Backup completo**: Todos os arquivos (ROMs, saves, configs, etc.)
2. **Backup de saves**: Apenas save states

O ArkOS não segrega fisicamente ROMs de saves - ambos ficam nas mesmas pastas por emulador.

### Estrutura do ArkOS
```
easyroms/
├── nes/
│   ├── mario.nes              (ROM)
│   ├── mario.nes.state        (Save)
│   ├── zelda.zip              (ROM zipada)
│   └── zelda.zip.state1       (Save)
├── psx/
│   ├── ff7.iso                (ROM)
│   ├── ff7.iso.savestate      (Save)
│   └── ff7.state              (Save)
```

## Decisão

Implementamos a seguinte estratégia de filtragem:

### Modo `--full`
- **Comportamento:** Copia **TODOS** os arquivos encontrados recursivamente
- **Filtro:** Nenhum
- **Razão:** Simplicidade e segurança - garante que nada seja esquecido

### Modo `--saves-only`
- **Comportamento:** Copia apenas arquivos cuja **extensão contenha "state"**
- **Filtro:** Regex case-insensitive: `/\..*state.*/i`
- **Exemplos aceitos:**
  - `.state`
  - `.state1`, `.state2`, `.state9`
  - `.savestate`
  - `.quickstate`
  - `.memstate`
  
### Implementação
```javascript
function shouldCopyFile(filePath, mode) {
  if (mode === 'full') return true;
  
  if (mode === 'saves-only') {
    const ext = path.extname(filePath).toLowerCase();
    return ext.includes('state');
  }
  
  return false;
}
```

## Alternativas Consideradas

### Alt 1: Lista Explícita de Extensões de ROM
```javascript
const ROM_EXTENSIONS = ['.nes', '.smc', '.iso', '.bin', '.zip', '.gba'];
// Modo saves-only: copia tudo que NÃO está na lista
```

**Rejeitada porque:**
- Lista incompleta pode perder ROMs de sistemas menos comuns
- Manutenção constante ao adicionar emuladores
- `.zip` pode conter saves (ex: saves zipados)

### Alt 2: Diretórios Separados
```javascript
// Assumir que saves ficam em /saves/ ou /savestates/
```

**Rejeitada porque:**
- ArkOS **não** segrega fisicamente ROMs de saves
- Introduziria suposições incorretas sobre a estrutura

### Alt 3: Análise de Conteúdo (Magic Numbers)
```javascript
// Ler primeiros bytes do arquivo para identificar tipo
```

**Rejeitada porque:**
- Lento (requer leitura parcial de todos os arquivos)
- Complexo (múltiplos formatos de save)
- Overhead desnecessário para problema simples

### Alt 4: Whitelist + Blacklist Configurável
```javascript
config: {
  include: ['.state', '.savestate'],
  exclude: ['.iso', '.nes']
}
```

**Rejeitada porque:**
- Over-engineering para MVP
- Pode ser adicionada no futuro se necessário
- Aumenta superfície de erro para usuário comum

## Razões da Decisão

### Prós
1. **Simples e previsível:** Usuário entende facilmente a regra
2. **Robusto:** Funciona independente de nomenclatura de emulador
3. **Extensível:** Fácil adicionar novos modos no futuro
4. **Testável:** Casos de teste claros

### Contras
1. **Falsos positivos:** Arquivo como `gamestate.txt` seria copiado
   - **Mitigação:** Improvável no contexto ArkOS
2. **Dependência de convenção:** Assume que saves contenham "state"
   - **Mitigação:** É o padrão de facto do RetroArch/ArkOS

## Consequências

### Positivas
- Zero configuração necessária
- Performance: filtro rápido (apenas string matching)
- Manutenção: sem listas de extensões para atualizar

### Negativas
- Se emulador usar convenção diferente (ex: `.sav`), não será detectado
  - **Solução futura:** Adicionar `--include-pattern` para power users

### Neutras
- Usuário pode sempre usar `--full` se inseguro

## Casos de Teste

```javascript
// Devem ser copiados em --saves-only
'mario.nes.state'       ✅
'zelda.state1'          ✅
'ff7.savestate'         ✅
'game.STATE'            ✅ (case-insensitive)

// NÃO devem ser copiados em --saves-only
'mario.nes'             ❌
'zelda.zip'             ❌
'config.json'           ❌
'screenshot.png'        ❌
```

## Evolução Futura

### Fase 2: Patterns Customizáveis
```bash
r3xs-backup --saves-only --include-pattern "*.state*" --include-pattern "*.sav"
```

### Fase 3: Profiles
```json
{
  "profiles": {
    "retroarch": ["*.state*", "*.srm"],
    "ppsspp": ["*.ppst"],
    "all-saves": ["*.state*", "*.sav", "*.srm", "*.ppst"]
  }
}
```

## Referências

- [RetroArch Save Files](https://docs.libretro.com/guides/save-files/)
- [ArkOS Documentation](https://github.com/christianhaitian/arkos)

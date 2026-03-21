# Descrição Visual da Interface R3XS Backup

## Layout Geral

```
┌─────────────────────────────────────────────────────────────┐
│ 🎮 R3XS Backup                                 [─][□][×]   │
│ Backup de ROMs e Saves de R36S/R35S                        │
│ ════════════════════════════════════════════════════════════│
│                                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ SELEÇÃO DE PASTAS                                     │ │
│  │                                                        │ │
│  │  Origem (easyroms):                                   │ │
│  │  ┌──────────────────────────────────┬──────────────┐ │ │
│  │  │ Selecione a pasta de origem...   │ Selecionar   │ │ │
│  │  └──────────────────────────────────┴──────────────┘ │ │
│  │                                                        │ │
│  │  Destino (backup):                                    │ │
│  │  ┌──────────────────────────────────┬──────────────┐ │ │
│  │  │ Selecione a pasta de destino...  │ Selecionar   │ │ │
│  │  └──────────────────────────────────┴──────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─────────────────────┬────────────────────────────────┐  │
│  │ MODO DE BACKUP      │ CONFLITOS                      │  │
│  │                     │                                │  │
│  │ ● Completo          │ ● Sobrescrever se mais recente │  │
│  │ ○ Apenas Saves      │ ○ Sobrescrever tudo           │  │
│  │                     │ ○ Ignorar duplicados          │  │
│  └─────────────────────┴────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │        [ Iniciar Backup ]    [ Cancelar ]             │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ PROGRESSO (oculto inicialmente)                       │ │
│  │ ╔════════════════════════════════════════════╗        │ │
│  │ ║████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░║        │ │
│  │ ╚════════════════════════════════════════════╝        │ │
│  │ 250 / 500 arquivos (50.0%)                            │ │
│  │ Processando: roms/snes/super_mario_world.sfc          │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Log de Operações                                      │ │
│  │ ┌─────────────────────────────────────────────────┐  │ │
│  │ │ 14:23:15 🎮 R3XS Backup Desktop - Pronto        │  │ │
│  │ │ 14:23:20 Pasta de origem selecionada: /mnt...   │  │ │
│  │ │ 14:23:25 Pasta de destino selecionada: /home.. │  │ │
│  │ │ 14:23:30 ═════════════════════════════════════  │  │ │
│  │ │ 14:23:30 Iniciando backup...                    │  │ │
│  │ │ 14:23:35 Progresso: 50/500 arquivos (10.0%)     │  │ │
│  │ │ 14:23:40 Progresso: 100/500 arquivos (20.0%)    │  │ │
│  │ │ 14:23:45 ✅ Backup concluído com sucesso!       │  │ │
│  │ │ ▼                                               │  │ │
│  │ └─────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Paleta de Cores

### Principais
- **Primary Blue:** `#2196F3` (botões, links, barra de progresso)
- **Primary Dark:** `#1976D2` (hover, gradientes)
- **Primary Light:** `#BBDEFB` (fundo da seção de progresso)
- **Success Green:** `#4CAF50` (botão Iniciar, mensagens de sucesso)
- **Success Dark:** `#388E3C` (hover do botão Iniciar)
- **Error Red:** `#F44336` (botão Cancelar, mensagens de erro)
- **Error Dark:** `#D32F2F` (hover do botão Cancelar)
- **Warning Orange:** `#FF9800` (mensagens de aviso)

### Superfícies
- **Background:** `#FAFAFA` (fundo da página)
- **Surface:** `#FFFFFF` (cards/seções)
- **Border:** `#E0E0E0` (bordas de inputs)

### Textos
- **Text Primary:** `#212121` (texto principal)
- **Text Secondary:** `#757575` (placeholders, textos auxiliares)
- **Text Disabled:** `#BDBDBD` (texto desabilitado)

### Logs (Dark Theme)
- **Background:** `#2B2B2B` (fundo da seção)
- **Log Area:** `#1E1E1E` (área de logs)
- **Text:** `#E0E0E0` (texto padrão)
- **Timestamp:** `#888888` (timestamp)
- **Scrollbar:** `#555555` (thumb), `#2B2B2B` (track)

---

## Tipografia

- **Font Family:** `system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`
- **Base Size:** `14px`
- **Small:** `12px` (logs, arquivo atual)
- **Large:** `16px` (botões)
- **Heading:** `24px` (título principal)
- **Monospace (logs):** `'Courier New', Consolas, monospace`

---

## Spacing (Design Tokens)

```css
--spacing-xs:  4px   (espaçamento mínimo)
--spacing-sm:  8px   (gap entre elementos pequenos)
--spacing-md:  16px  (padding padrão de seções)
--spacing-lg:  24px  (margem entre seções)
--spacing-xl:  32px  (padding da página principal)
```

---

## Componentes Detalhados

### 1. Header

```
┌─────────────────────────────────────────────────┐
│ 🎮 R3XS Backup                                  │ ← Gradiente azul
│ Backup de ROMs e Saves de R36S/R35S             │   (#2196F3 → #1976D2)
└─────────────────────────────────────────────────┘
```

- **Background:** Gradiente linear 135deg
- **Texto:** Branco, peso 600 (semibold)
- **Padding:** 24px (vertical) × 32px (horizontal)
- **Box Shadow:** 0 3px 6px rgba(0,0,0,0.16)

---

### 2. Input com Botão

```
┌──────────────────────────────────┬──────────────┐
│ /mnt/sdcard/easyroms             │ Selecionar   │
└──────────────────────────────────┴──────────────┘
```

**Estado vazio:**
- Texto placeholder em cinza claro (#757575)
- Cursor `not-allowed`

**Estado preenchido:**
- Texto em negrito (#212121)
- Classe `.has-value` aplicada

**Botão:**
- Fundo azul (#2196F3)
- Hover: azul escuro (#1976D2)
- Active: translateY(1px) — efeito de clique

---

### 3. Radio Buttons

```
● Completo (ROMs + Saves)
○ Apenas Saves
```

- **Tamanho:** 18px × 18px
- **Accent Color:** `#2196F3` (azul primário)
- **Cursor:** pointer
- **Hover:** texto muda para azul

---

### 4. Botão Primário (Iniciar Backup)

```
┌──────────────────────┐
│   Iniciar Backup     │  ← Verde #4CAF50
└──────────────────────┘
```

**Estados:**
- **Normal:** `#4CAF50`, texto branco
- **Hover:** `#388E3C`, sombra 0 3px 6px
- **Disabled:** `#BDBDBD`, opacidade 60%, cursor not-allowed
- **Active:** translateY(1px)

**Dimensões:**
- Padding: 16px × 32px
- Min-width: 180px
- Font-size: 16px, peso 600

---

### 5. Botão Secundário (Cancelar)

```
┌──────────────────────┐
│      Cancelar        │  ← Vermelho #F44336
└──────────────────────┘
```

Mesmas propriedades do primário, mas cores vermelhas.

---

### 6. Barra de Progresso

```
╔════════════════════════════════════════════╗
║████████████████████░░░░░░░░░░░░░░░░░░░░░░░║ ← Gradiente azul
╚════════════════════════════════════════════╝   + shimmer
250 / 500 arquivos (50.0%)
Processando: roms/snes/super_mario_world.sfc
```

**Container:**
- Height: 24px
- Fundo: `#FAFAFA`
- Sombra interna: `inset 0 1px 3px rgba(0,0,0,0.1)`
- Border-radius: 4px

**Barra:**
- Gradiente: `#2196F3` → `#1976D2`
- Transição: `width 250ms ease-in-out`
- Animação shimmer: faixa branca translúcida passando a cada 2s

**Texto:**
- Progresso: peso 600, `#212121`
- Arquivo: fonte monospace, `#757575`, truncado com ellipsis

---

### 7. Seção de Logs

```
┌─────────────────────────────────────────────┐
│ Log de Operações                            │
│ ┌───────────────────────────────────────┐  │
│ │ 14:23:15 🎮 R3XS Backup Desktop        │  │ ← Fundo escuro
│ │ 14:23:20 Pasta de origem selecionada   │  │   #1E1E1E
│ │ 14:23:30 ═══════════════════════════   │  │
│ │ 14:23:35 ✅ Backup concluído!          │  │ ← Verde
│ │ 14:23:40 ❌ ERRO: Permissão negada     │  │ ← Vermelho
│ │ ▼                                      │  │
│ └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

**Container:**
- Fundo: `#2B2B2B` (dark theme)
- Título: `#E0E0E0`
- Border-bottom no título: `rgba(255,255,255,0.1)`

**Área de Logs:**
- Fundo: `#1E1E1E`
- Max-height: 220px
- Overflow-y: auto
- Font: Courier New, 12px

**Entrada de Log:**
```
┌────────┬──────────────────────────┐
│ 14:23  │ Mensagem do log aqui     │
└────────┴──────────────────────────┘
```

- Display: flex
- Gap: 8px
- Padding: 4px 8px
- Border-radius: 4px

**Cores por Nível:**
- **Info:** `#E0E0E0` (padrão)
- **Success:** `#4CAF50`, fundo `rgba(76,175,80,0.1)`
- **Error:** `#F44336`, fundo `rgba(244,67,54,0.1)`
- **Warning:** `#FF9800`, fundo `rgba(255,152,0,0.1)`

**Scrollbar Customizado:**
- Width: 8px
- Thumb: `#555555`, hover `#666666`
- Track: `#2B2B2B`

---

## Animações

### 1. Shimmer (Barra de Progresso)

```css
@keyframes shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

- Duração: 2s
- Repeat: infinito
- Efeito: faixa branca translúcida deslizando da esquerda para direita

### 2. Transições

- **Botões (background):** 150ms ease-in-out
- **Inputs (border):** 150ms ease-in-out
- **Barra de progresso (width):** 250ms ease-in-out

---

## Responsividade

### Desktop (> 900px)
- Layout padrão conforme especificado
- Seções lado a lado (opções)

### Tablet (600px - 900px)
- Opções em coluna (flex-direction: column)
- Botões em coluna
- Padding reduzido para 24px

### Mobile (< 600px)
- Min-width forçado: 400px (não responsivo completo)
- Input com botão em coluna
- Padding 16px
- Header 20px font-size

---

## Estados de Interação

### Hover
- **Botões:** Cor escurece + sombra aumenta
- **Radio labels:** Texto muda para azul

### Focus
- **Inputs:** Borda muda para azul (#2196F3)
- **Botões:** Outline padrão do navegador

### Active (Click)
- **Botões:** `translateY(1px)` — efeito de afundar

### Disabled
- **Botão primário/secundário:** Cinza (#BDBDBD), opacidade 60%
- **Cursor:** not-allowed

---

## Acessibilidade (ARIA)

- **Inputs:** `aria-label` descritivo
- **Barra de progresso:** `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- **Logs:** `role="log"`, `aria-live="polite"`, `aria-atomic="false"`
- **Seção de progresso:** `aria-live="polite"`

---

## Performance

### Otimizações
- Logs limitados a 100 entradas (auto-remove antigas)
- Throttle de progresso: atualiza a cada 10 arquivos OU 1 segundo
- Transições CSS via GPU (transform)
- Shadow DOM não usado (vanilla JS)

### Benchmarks Esperados
- Initial render: < 100ms
- Progress update: < 16ms (60fps)
- Log insertion: < 5ms
- Scroll: < 10ms

---

## Comparação Visual

**Antes (placeholder):**
```
[ R3XS Backup - Electron Desktop          ]
[ Interface renderer será implementada... ]
[ Test API                                ]
[ [Selecionar Origem] [Selecionar Destino] ]
```

**Depois (implementação completa):**
```
[           HEADER AZUL GRADIENTE          ]
[   CARDS BRANCOS COM SOMBRAS SUAVES       ]
[   INPUTS ESTILIZADOS + BOTÕES AZUIS      ]
[   OPÇÕES COM RADIO BUTTONS MODERNOS      ]
[   BOTÕES GRANDES VERDE/VERMELHO          ]
[   BARRA DE PROGRESSO ANIMADA (opcional)  ]
[   LOGS DARK THEME COM SCROLL             ]
```

---

## Arquivos e LOC

| Arquivo       | Linhas | Descrição                          |
|---------------|--------|------------------------------------|
| index.html    | 98     | Estrutura HTML semântica           |
| main.css      | 525    | Design system completo             |
| ui.js         | 288    | Manipulação de DOM (módulo puro)   |
| app.js        | 287    | Lógica de controle e IPC           |
| **TOTAL**     | **1198** | Linhas de código produzidas      |

---

## Diferenças da Especificação Original

### Ajustes Necessários

1. **API IPC:**
   - Especificação: `{source, dest, mode, conflict}`
   - Implementado: `{sourcePath, destPath, mode, conflictStrategy}`
   - **Motivo:** Compatibilidade com IPC handlers já implementados

2. **Evento de Progresso:**
   - Especificação: `{current, total, percentage, currentFile}`
   - Implementado: `{current, total, currentFile, phase, message}` → calcula `percentage` no client
   - **Motivo:** IPC handler não envia `percentage` pré-calculado

3. **Modo savesOnly:**
   - HTML: `value="savesOnly"` (camelCase)
   - Especificação: "saves-only" (kebab-case)
   - **Motivo:** Consistência com JavaScript conventions

### Melhorias Adicionadas

- ✅ Limite de 100 logs (previne vazamento de memória)
- ✅ Timestamp em cada log
- ✅ Throttle de progresso (performance)
- ✅ Animação shimmer na barra
- ✅ Scrollbar customizado nos logs
- ✅ Validação de pastas iguais
- ✅ ARIA completo para acessibilidade

---

## Conclusão

Interface completa, moderna e funcional implementada com **SOLID principles**:

- **S**: `ui.js` manipula DOM, `app.js` controla lógica
- **O**: Fácil extensão (adicionar novos modos/estratégias)
- **L**: Módulos substituíveis sem quebrar contratos
- **I**: Interface `UI` enxuta e focada
- **D**: `app.js` depende de abstração `UI`, não de DOM direta

**Clean Architecture**: Renderer isolado do main via IPC seguro.
**KISS**: Vanilla JS, sem frameworks desnecessários.
**DRY**: Design tokens centralizados, funções reutilizáveis.

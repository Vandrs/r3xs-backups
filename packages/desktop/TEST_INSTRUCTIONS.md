# Instruções de Teste Manual - Interface Renderer R3XS Backup

## Arquivos Criados

```
packages/desktop/src/renderer/
├── index.html              (Interface HTML completa)
├── styles/
│   └── main.css           (Design system moderno)
└── scripts/
    ├── ui.js              (Módulo de manipulação de DOM)
    └── app.js             (Lógica de controle da aplicação)
```

---

## Pré-requisitos

1. **Verificar que o main process e preload estão configurados:**
   ```bash
   ls packages/desktop/src/main/
   ls packages/desktop/src/preload/
   ```

2. **Verificar package.json do desktop:**
   Certifique-se de que `main` aponta para `src/main/index.js`

---

## Como Executar

### 1. Instalar Dependências (se ainda não instalado)

```bash
cd packages/desktop
npm install
```

### 2. Executar a Aplicação Electron

```bash
# Da raiz do monorepo
npm run dev:desktop

# OU dentro de packages/desktop
npm start
```

---

## Casos de Teste

### TC1: Inicialização

**Passos:**
1. Inicie a aplicação
2. Verifique a interface

**Resultado Esperado:**
- ✅ Janela abre com título "R3XS Backup"
- ✅ Header azul com título "🎮 R3XS Backup" e subtítulo
- ✅ Campos "Origem" e "Destino" vazios e readonly
- ✅ Botões "Selecionar" habilitados
- ✅ Modo "Completo" selecionado por padrão
- ✅ Conflito "Sobrescrever se mais recente" selecionado
- ✅ Botão "Iniciar Backup" **DESABILITADO** (cinza)
- ✅ Botão "Cancelar" **DESABILITADO** (cinza)
- ✅ Seção de progresso **OCULTA**
- ✅ Log mostra: "🎮 R3XS Backup Desktop - Pronto para uso"
- ✅ Log mostra: "Aplicação inicializada com sucesso"

---

### TC2: Seleção de Pastas

**Passos:**
1. Clique em "Selecionar" ao lado de "Origem"
2. Escolha uma pasta (ex: `/tmp/test-source`)
3. Clique em "Selecionar" ao lado de "Destino"
4. Escolha uma pasta diferente (ex: `/tmp/test-dest`)

**Resultado Esperado:**
- ✅ Dialog do sistema abre para seleção de pasta
- ✅ Caminho completo aparece no campo de entrada
- ✅ Texto do campo fica em negrito (classe `.has-value`)
- ✅ Log registra: "Pasta de origem selecionada: /caminho/completo"
- ✅ Log registra: "Pasta de destino selecionada: /caminho/completo"
- ✅ Botão "Iniciar Backup" fica **HABILITADO** (verde)

---

### TC3: Validação - Pastas Iguais

**Passos:**
1. Selecione a mesma pasta para origem e destino

**Resultado Esperado:**
- ✅ Log mostra aviso: "⚠️  As pastas de origem e destino não podem ser iguais"
- ✅ Botão "Iniciar Backup" permanece **DESABILITADO**

---

### TC4: Mudança de Opções

**Passos:**
1. Selecione "Apenas Saves"
2. Selecione "Sobrescrever tudo"
3. Selecione "Ignorar duplicados"

**Resultado Esperado:**
- ✅ Logs registram cada mudança:
  - "Modo alterado: savesOnly"
  - "Estratégia de conflito alterada: Sobrescrever tudo"
  - "Estratégia de conflito alterada: Ignorar duplicados"

---

### TC5: Iniciar Backup (Simulação)

**Pré-condição:** Pastas válidas selecionadas, com arquivos de teste.

**Passos:**
1. Clique em "Iniciar Backup"

**Resultado Esperado:**
- ✅ Logs mostram banner:
  ```
  ============================================================
  Iniciando backup...
  Origem: /caminho/origem
  Destino: /caminho/destino
  Modo: Completo (ROMs + Saves)
  Conflitos: Sobrescrever se mais recente
  ============================================================
  ```
- ✅ Botão "Iniciar Backup" fica **DESABILITADO**
- ✅ Botão "Cancelar" fica **HABILITADO** (vermelho)
- ✅ Seção de progresso aparece (fundo azul claro)
- ✅ Barra de progresso começa em 0%
- ✅ Progresso atualiza em tempo real:
  - Barra azul avança animadamente
  - Texto mostra "X / Y arquivos (Z%)"
  - Nome do arquivo atual aparece abaixo da barra

---

### TC6: Progresso em Tempo Real

**Observar durante backup:**

**Resultado Esperado:**
- ✅ Barra de progresso avança suavemente (transition de 250ms)
- ✅ Efeito "shimmer" animado sobre a barra
- ✅ Arquivo atual atualiza frequentemente
- ✅ Logs aparecem a cada 10% ou 50 arquivos:
  - "Progresso: 50/500 arquivos (10.0%)"
- ✅ Scroll automático do log para a última mensagem

---

### TC7: Conclusão com Sucesso

**Resultado Esperado:**
- ✅ Seção de progresso desaparece
- ✅ Botão "Iniciar Backup" volta a ficar **HABILITADO**
- ✅ Botão "Cancelar" volta a ficar **DESABILITADO**
- ✅ Logs mostram:
  ```
  ============================================================
  ✅ Backup concluído com sucesso!
  ✓ Sucesso: 500 arquivo(s)
  ○ Ignorados: 10 arquivo(s)  (se houver)
  ✗ Falha: 2 arquivo(s)        (se houver)
  ============================================================
  ```
- ✅ Mensagens de sucesso em **verde**
- ✅ Mensagens de erro em **vermelho**

---

### TC8: Cancelamento

**Passos:**
1. Inicie um backup
2. Durante o progresso, clique em "Cancelar"

**Resultado Esperado:**
- ✅ Log mostra: "Solicitando cancelamento do backup..."
- ✅ Backup para (pode demorar alguns segundos)
- ✅ Log mostra: "⚠️  Backup cancelado pelo usuário"
- ✅ Seção de progresso desaparece
- ✅ Botões voltam ao estado inicial

---

### TC9: Erro Durante Backup

**Simular:** Remover permissões da pasta de destino durante backup.

**Resultado Esperado:**
- ✅ Seção de progresso desaparece
- ✅ Logs mostram:
  ```
  ============================================================
  ❌ ERRO: Backup falhou: [mensagem do erro]
  ============================================================
  ```
- ✅ Mensagem em vermelho no log
- ✅ Botões voltam ao estado inicial

---

### TC10: Logs - Scroll e Limite

**Passos:**
1. Execute múltiplos backups consecutivos
2. Observe o comportamento dos logs

**Resultado Esperado:**
- ✅ Logs têm scroll vertical quando ultrapassam ~220px
- ✅ Máximo de 100 mensagens (logs antigos são removidos automaticamente)
- ✅ Auto-scroll sempre para a última mensagem
- ✅ Cores corretas:
  - Info: cinza claro (#E0E0E0)
  - Sucesso: verde (#4CAF50) com fundo translúcido
  - Erro: vermelho (#F44336) com fundo translúcido
  - Warning: laranja (#FF9800) com fundo translúcido

---

### TC11: Responsividade

**Passos:**
1. Redimensione a janela para 800x600 (mínimo)
2. Tente redimensionar para menos

**Resultado Esperado:**
- ✅ Layout permanece funcional em 800x600
- ✅ Não há elementos cortados ou sobrepostos
- ✅ Botões permanecem acessíveis

---

### TC12: Acessibilidade (Opcional)

**Ferramentas:** Leitor de tela (NVDA, JAWS) ou DevTools Accessibility

**Resultado Esperado:**
- ✅ Labels associados aos inputs via `for`/`id`
- ✅ `aria-label` em botões importantes
- ✅ `role="progressbar"` na barra de progresso
- ✅ `aria-live="polite"` em seção de progresso e logs
- ✅ Navegação por teclado funciona (Tab, Enter, Espaço)

---

## Verificação Visual

### Header
- Gradiente azul (#2196F3 → #1976D2)
- Texto branco, emoji 🎮 visível
- Sombra suave abaixo do header

### Campos de Entrada
- Bordas cinza (#E0E0E0)
- Fundo cinza claro (#FAFAFA)
- Ao focar: borda azul (#2196F3)
- Com valor: texto em negrito

### Botões
- **Primário (Iniciar):** Verde (#4CAF50)
  - Hover: verde escuro (#388E3C)
  - Desabilitado: cinza (#BDBDBD), opacidade 60%
- **Secundário (Cancelar):** Vermelho (#F44336)
  - Hover: vermelho escuro (#D32F2F)
- Efeito de clique: translateY(1px)

### Barra de Progresso
- Container: cinza (#FAFAFA), sombra interna
- Barra: gradiente azul (#2196F3 → #1976D2)
- Animação shimmer (faixa branca translúcida passando)
- Transição suave de 250ms

### Logs
- Fundo escuro (#2B2B2B, estilo terminal)
- Texto monoespaçado (Courier New)
- Scroll customizado (thumb cinza #555555)
- Timestamp em cinza claro (#888888)

---

## Checklist de Aceite Final

- [ ] Todos os 12 casos de teste passaram
- [ ] Design corresponde ao especificado (cores, fontes, spacing)
- [ ] Nenhum erro no console do DevTools
- [ ] Nenhum warning de CSP
- [ ] Performance suave (60fps) durante progresso
- [ ] Logs limitados a 100 entradas
- [ ] Auto-scroll funciona corretamente
- [ ] Validação de formulário correta
- [ ] IPC communication funcional

---

## Troubleshooting

### Problema: "electronAPI is not defined"
**Solução:** Verificar que o preload script está configurado no main process:
```javascript
// src/main/window.js
webPreferences: {
  preload: path.join(__dirname, '../preload/index.js'),
  contextIsolation: true,
  nodeIntegration: false
}
```

### Problema: Estilos não carregam
**Solução:** Verificar CSP no `<meta>` tag permite `style-src 'self' 'unsafe-inline'`

### Problema: Progresso não atualiza
**Solução:** 
1. Verificar que IPC events estão sendo emitidos no main process
2. Adicionar `console.log` em `handleBackupProgress` para debug
3. Verificar que `data.current` e `data.total` estão definidos

### Problema: Barra de progresso não anima
**Solução:** Verificar que a CSS está carregada corretamente:
```javascript
// No DevTools Console:
getComputedStyle(document.getElementById('progress-bar')).transition
// Deve retornar: "width 0.25s ease-in-out"
```

---

## Screenshot Checklist

Capture screenshots das seguintes telas:

1. **Estado inicial** (botões desabilitados)
2. **Campos preenchidos** (botão Iniciar habilitado)
3. **Backup em progresso** (barra a 50%)
4. **Backup concluído** (banner verde de sucesso)
5. **Erro** (banner vermelho)
6. **Logs com scroll** (100+ mensagens)

---

## Performance Benchmarks

- **Tempo de renderização inicial:** < 100ms
- **Atualização de progresso (10 arquivos):** < 16ms (60fps)
- **Inserção de log:** < 5ms
- **Scroll automático:** < 10ms
- **Validação de formulário:** < 1ms

---

## Próximos Passos

Após validação manual:

1. [ ] Criar testes automatizados E2E com Spectron/Playwright
2. [ ] Adicionar i18n (suporte multi-idioma)
3. [ ] Implementar persistência de configurações (último source/dest)
4. [ ] Adicionar tema escuro/claro
5. [ ] Implementar histórico de backups

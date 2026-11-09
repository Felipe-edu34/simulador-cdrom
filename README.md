# 💿 Simulador Interativo de Arquitetura de Consoles CD-ROM (1988–1994)

Um simulador visual e interativo que demonstra, passo a passo, como funcionavam os barramentos, processadores, memórias, chips gráficos, subsistemas de áudio e controladores de DMA dos três consoles que definiram a revolução do CD-ROM nos videogames:

1. **NEC PC Engine + CD-ROM² (1988)** — O pioneiro mundial do CD-ROM doméstico.
2. **Sega Mega Drive + Mega-CD (1991)** — Arquitetura multiprocessada com dois Motorola 68000, Gate Array ASIC e Word RAM.
3. **Sony PlayStation — SCPH-1000 (1994)** — Console projetado nativamente para o CD-ROM 2x e gráficos 3D em tempo real com SoC integrado e 7 canais de DMA.

---

## 🎯 Objetivo do Projeto

Explicar a transição histórica e técnica dos **cartuchos ROM (acesso instantâneo XIP)** para a **mídia óptica CD-ROM (alta capacidade de 650 MB, porém leitura sequencial lenta de 150 KB/s a 300 KB/s)** de forma:
- **Tecnicamente fiel** às documentações de arquitetura de hardware (*Rodrigo Copetti*, *RetroReversing*, *Archaic Pixels*, *Plutiedev* e *Nocash PSX-SPX*);
- **Acessível para qualquer público**, contando com **Modo Fácil (analogias do dia a dia)**, **Sugestões de Fala (Simples e Equilibrada)** e uma aba exclusiva de **Roteiro de Apresentação**.

---

## ✨ Principais Funcionalidades

- **Diagramas de Hardware Interativos (SVG):**
  - Barramentos 100% coloridos de ponta a ponta quando ativos, com **setas direcionais** e **pacotes animados** identificados por ícones de mídia (Código/Dados, Imagem/Gráficos, Vídeo FMV, Áudio e Disco Óptico).
  - **Sincronização de Hover e Clique:** Passe o mouse sobre qualquer chip ou barramento (incluindo a barra do *Main Bus & DMA*) para destacar instantaneamente sua instrução correspondente no painel lateral, ou clique em qualquer componente para inspecionar suas métricas técnicas completas.
- **Explicação de 100% dos Componentes Ativos em Cada Passo:**
  - Cada passo da simulação lista todas as instruções executadas por todos os componentes ativos simultaneamente naquele ciclo.
- **Modo Fácil & Notas de Apresentador (`Fala`):**
  - Alterne entre explicações acessíveis (comparações com *"mesa de trabalho"*, *"depósito"*, *"bancada giratória"* e *"avenida expressa"*) e o resumo técnico equilibrado para apresentações.
- **Simulador de Tempo de Loading (Cartucho XIP vs. CD-ROM DMA):**
  - Compare interativamente na aba **Comparativo & Loading** quanto tempo cada console levava para carregar fases de `64 KB` a `2 MB`.
- **Exportação de Diagramas:**
  - Exporte qualquer diagrama em alta resolução nos formatos **PNG** ou **SVG**, com suporte a **Modo Escuro / Modo Claro** e **Modo Apresentação (Tela Expandida)**.

---

## 🔄 Sequência de Animação de Cada Console

### 1. NEC PC Engine + CD-ROM² (1988) — *Visão Geral + 4 Passos em Sequência*
- **Passo 0 — Visão Geral:** Console base com seus 5 blocos (`CPU HuC6280` c/ `MMU 21-bit` + `6ch PSG` + `Timer/IRQ/IO`, `8 KB Work RAM Base ($F8)`, `VDC HuC6270`, `64 KB VRAM 16-bit exclusiva` e `VCE HuC6260`).
- **Passo 1 — Boot & System Card:** A `System Card` (no slot de 38 pinos) entrega a BIOS do CD-ROM² e expansão de RAM (`+192 KB` / `+2 MB`) para a `CPU HuC6280`, que inicializa a *Zero-Page*, a *Pilha (Stack)* e os ponteiros da BIOS nos `8 KB da Work RAM Base ($F8)`.
- **Passo 2 — Leitura CD 1x & Execução:** O leitor óptico `1x (150 KB/s)` envia os setores via `SCSI-1` para os `64 KB da CD-ROM² Work RAM` (depósito da fase), enquanto a `CPU HuC6280` executa a partida usando os `8 KB da Work RAM Base ($F8)` para guardar variáveis rápidas, física, controles e pilha (*Stack*).
- **Passo 3 — Vídeo Dual-Chip:** A `CPU` transfere os tiles e sprites da `CD-RAM` para o `VDC (HuC6270)`, que acessa com exclusividade os `64 KB de VRAM (16-bit)` e envia um stream digital de `9 bits` diretamente para o `VCE (HuC6260)` colorir até `482 cores` na tela.
- **Passo 4 — Áudio Triplo:** O mixer da base `IFU-30` combina o áudio `CD-DA` vindo do leitor óptico, os `6 canais Waveform PSG` da CPU e as vozes dubladas do chip `OKI MSM5205 ADPCM` (com `64 KB` dedicados).

### 2. Sega Mega Drive + Mega-CD (1991) — *Visão Geral + 4 Passos em Sequência*
- **Passo 0 — Visão Geral:** Os 4 blocos do Mega Drive base (`Motorola 68000 @ 7.67 MHz`, `64 KB RAM + Árbitro de Bus & I/O`, `VDP + SN76489 PSG integrado` e `Zilog Z80 + Yamaha YM2612`).
- **Passo 1 — Leitura CD & Sub-CPU (12.5 MHz):** O leitor `1x` com controlador `CDC Sanyo LC8951 (16 KB cache)` transfere dados a `150 KB/s` para o segundo `Motorola 68000 (12.5 MHz + 128 KB BIOS + 8 KB BRAM)`, abastecendo os `512 KB de Program RAM`.
- **Passo 2 — Ponte Gate Array ASIC & Word RAM:** Os dois processadores `68000` sincronizam comandos pelas `16 Comm Ports ($A12010–$A1202E)` e `IRQ2` do `Gate Array ASIC`, que aplica rotação/escala por hardware e entrega os tiles via *Bank Swap* na `Word RAM (256 KB)` para o Mega Drive.
- **Passo 3 — DMA para o VDP & 3 Memórias:** A `Word RAM` entrega os tiles na janela `$600000`, o `Main-CPU 68000` configura o DMA, o `Árbitro de Bus` pausa o `68000` e o `Z80` para evitar colisão e o `VDP` preenche suas 3 memórias internas (`64 KB VRAM`, `128 B CRAM` e `80 B VSRAM`).
- **Passo 4 — Orquestra FM + PSG + PCM + CD-DA:** No Mega Drive, o `Árbitro` e o `Z80` regem o `YM2612 (6ch FM)` e o `PSG (4ch)`; no Mega-CD, a `Sub-CPU (12.5 MHz)` alimenta o `Ricoh RF5C164 (8ch PCM + 64 KB)` em conjunto com o streaming `CD-DA` do leitor óptico.

### 3. Sony PlayStation — SCPH-1000 (1994) — *Visão Geral + 5 Passos em Sequência*
- **Passo 0 — Visão Geral:** Os 4 pilares da placa-mãe (`SoC Sony CXD8530BQ` com `R3000A + CP0 + GTE + MDEC + 4KB I-Cache + 1KB Scratchpad`, `2 MB EDO DRAM`, `Main Bus 32-bit @ 132 MB/s com 7 canais DMA Ch0–Ch6` e `Ponte BIU` com `BIOS 512 KB + 3 Timers + SIO0`).
- **Passo 1 — CD 2x & Sub Bus:** O subsistema independente de CD (`DSP + Sub-CPU Motorola 68HC05 + Controlador CXD1815Q + 32 KB SRAM`) valida a ondulação *Wobble Groove (SCEx)* do disco preto e entrega setores a `300 KB/s` na `Ponte BIU`.
- **Passo 2 — DMA Ch3 Assume o Bus & Scratchpad:** O `DMA Canal 3` interdita o *Main Bus* a `132 MB/s` para transferir os dados do CD até os `2 MB de EDO DRAM`, enquanto a CPU continua trabalhando sem espera dentro da `Scratchpad SRAM de 1 KB (0x1F800000)`.
- **Passo 3 — Pipeline 3D (GTE, Ordering Table & GPU):** O `GTE (COP2)` calcula até `1,5 milhão de vértices 3D/s`, a `EDO DRAM` organiza os polígonos por distância na *Ordering Table* (limpa em hardware pelo `DMA Ch6 OTC`) e o `DMA Ch2 (Linked-List)` envia a lista para a `Sony GPU + 1 MB VRAM`.
- **Passo 4 — Vídeo FMV (MDEC 24-bit):** Quadros `.STR` saem da `EDO DRAM` pelo `DMA Ch0` até o `MDEC` (que aplica `IDCT` e conversão `YCbCr → RGB 24-bit` a 30 fps), voltam em tiras `16×240` pelo `DMA Ch1` e seguem pelo `DMA Ch2` para o Framebuffer na `VRAM da GPU`.
- **Passo 5 — Áudio SPU 24 Canais & Streaming CD-XA:** Amostras saem da `EDO DRAM` via `DMA Ch4` cruzando a `Ponte BIU` até os `512 KB da SPU (24 canais ADPCM @ 44.1 kHz)`, enquanto o controlador de CD envia músicas e vozes `XA-ADPCM / CD-DA` por uma via direta para a `SPU` sem gastar CPU ou RAM.

---

## 📚 Fontes e Referências Técnicas

- **Rodrigo Copetti — Architecture of Consoles:**
  - [PC Engine / TurboGrafx-16 Architecture](https://classic.copetti.org/writings/consoles/pc-engine/)
  - [Arquitetura do Mega Drive / Sega Genesis (e Mega-CD)](https://www.copetti.org/pt-br/writings/consoles/mega-drive-genesis/)
  - [Arquitetura do PlayStation (PS1)](https://www.copetti.org/pt-br/writings/consoles/playstation/)
- **RetroReversing:**
  - [PC Engine Reverse Engineering](https://www.retroreversing.com/pc-engine/)
  - [Sega Mega-CD Architecture](https://www.retroreversing.com/sega-mega-cd)
  - [Sony PlayStation (PS1) Architecture](https://www.retroreversing.com/ps1)
- **Documentações de Desenvolvimento e Hardware:**
  - [Archaic Pixels — PC Engine Technical Wiki](https://www.archaicpixels.com/Main_Page)
  - [Plutiedev — Mega Drive & Mega-CD Development](https://plutiedev.com/)
  - [Nocash PSX-SPX — Playstation Specifications (Martin Korth)](https://problemkaputt.de/psx-spx.htm)

---

## 🚀 Como Executar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev

# 3. Gerar build de produção
npm run build
```

### ⌨️ Atalhos de Teclado no Simulador
- `→` / `←` : Avançar / Voltar passo da animação
- `Espaço` : Iniciar / Pausar reprodução automática
- `1`, `2`, `3` : Alternar entre **PC Engine CD**, **Mega-CD** e **PlayStation**
- `4` : Abrir aba **Comparativo & Loading**
- `5` : Abrir aba **Roteiro Fácil (Para Todos)**
- `P` : Alternar modo tela expandida
- `N` : Mostrar / Ocultar notas de fala
- `Esc` : Voltar da inspeção de chip para o passo atual

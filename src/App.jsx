import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Cpu,
  Disc,
  Layers,
  Play,
  Pause,
  RotateCcw,
  Sun,
  Moon,
  Download,
  FileCode,
  Info,
  ChevronLeft,
  ChevronRight,
  Zap,
  Mic,
  Gauge,
  BookOpen,
  Maximize2,
  Minimize2,
  ArrowRight,
  Sparkles,
  ExternalLink,
  MessageSquareHeart,
  HelpCircle,
  Image as ImageIcon,
  Music,
  Film
} from 'lucide-react';

// ============================================================================
// BASE DE DADOS COMPLETA (COPETTI, RETROREVERSING, ARCHAIC PIXELS, PLUTIEDEV & PSX-SPX)
// Todos os barramentos usam caminhos <path> direcionados do início ao fim!
// ============================================================================

const ARCHITECTURE_DATA = {
  pce: {
    id: 'pce',
    shortName: 'PC Engine CD-ROM²',
    name: 'NEC PC Engine + CD-ROM² (1988)',
    subtitle: 'HuC6280 (65C02 + MMU 21b + PSG + Timer/IRQ/IO) • Vídeo Dual-Chip (VDC ↔ VRAM 16b → VCE) • CD-ROM²',
    year: '1988',
    sources: [
      { label: 'Copetti — PC Engine', url: 'https://classic.copetti.org/writings/consoles/pc-engine/' },
      { label: 'Archaic Pixels — PCE Tech Wiki', url: 'https://www.archaicpixels.com/Main_Page' },
      { label: 'RetroReversing — PC Engine', url: 'https://www.retroreversing.com/pc-engine/' }
    ],
    simulationSteps: [
      {
        step: 0,
        shortTitle: 'Visão Geral',
        title: 'Console Base: Os 5 Blocos do PC Engine Original (HuC6280, RAM, VDC, VRAM e VCE)',
        summary:
          'O PC Engine base reúne 5 blocos: a CPU HuC6280 (núcleo 65C02 + MMU de 21 bits + 6 canais PSG + Timer/IRQ/IO no mesmo chip), 8 KB de Work RAM, o VDC (HuC6270) ligado aos 64 KB de VRAM de 16 bits e o VCE (HuC6260).',
        simpleAnalogy:
          'Imagine um trabalhador rápido que só consegue colocar 8 folhas na mesa por vez (64 KB), mas tem um fichário inteligente (MMU) que troca essas folhas de um arquivo de 2 MB, além de dois artistas de 16 bits (VDC e VCE) para desenhar e colorir.',
        flowSteps: [
          {
            nodeId: 'pce-cpu',
            tag: '1. CPU HuC6280 (CPU + MMU + PSG + Timer/IO)',
            iconType: 'code',
            text: 'Integra no mesmo chip o núcleo 65C02 (7.16 MHz), MMU de 21 bits (8× MPR), 6 canais de som PSG, Timer de 7 bits, Controlador IRQ e Porta I/O.'
          },
          {
            nodeId: 'pce-wram',
            tag: '2. Work RAM Base (8 KB SRAM)',
            iconType: 'code',
            text: 'Mapeada na página $F8 da MMU; guarda as variáveis da partida no console original (mas precisa de RAM extra para ler CDs).'
          },
          {
            nodeId: 'pce-vdc',
            tag: '3. VDC: HuC6270 (Gerador de Vídeo)',
            iconType: 'image',
            text: 'Primeiro chip gráfico: monta o plano de fundo (Tiles 8×8) e até 64 Sprites (com DMA próprio p/ SATB) lendo palavras de 16 bits.'
          },
          {
            nodeId: 'pce-vram',
            tag: '4. VRAM Dedicada (64 KB — Bus 16-bit)',
            iconType: 'image',
            text: 'Ligada exclusivamente ao VDC por um barramento de 16 bits (32K Words) — o VCE não acessa a VRAM diretamente!'
          },
          {
            nodeId: 'pce-vce',
            tag: '5. VCE: HuC6260 (Codificador de Cores)',
            iconType: 'image',
            text: 'Recebe o fluxo de pixels de 9 bits direto do VDC, aplica as 32 paletas (até 482 cores na tela) e fornece o clock de sincronismo.'
          }
        ],
        insight:
          'Seg. Copetti & Archaic Pixels: A VRAM de 64 KB é conectada exclusivamente ao VDC (em 16 bits). O VCE não lê a VRAM: ele recebe os pixels em 9 bits direto do VDC e as paletas de cores direto da CPU!',
        speechSimple:
          '"Pessoal, começamos pelo PC Engine de 1988, o primeiro videogame da história a usar CD-ROM. Aqui no Passo 0 vemos as 5 peças do console base: o cérebro HuC6280 (que já traz paginador de memória, som de 6 canais, timer e porta de controles dentro dele), a memória de 8 KB, e o trio de vídeo: o chip VDC ligado à sua memória VRAM de 16 bits e o chip VCE que pinta até 482 cores na tela."',
        speechTech:
          '"Começamos pelo PC Engine base segundo Copetti e Archaic Pixels: temos a CPU HuC6280 a 7.16 MHz (integrando núcleo 65C02, MMU de 21 bits com 8 MPRs, 6ch PSG, Timer, IRQ e I/O), os 8 KB de Work RAM, e o subsistema gráfico onde o VDC (HuC6270) acessa com exclusividade os 64 KB de VRAM em 16 bits e envia um stream digital de 9 bits ao VCE (HuC6260)."',
        activeNodes: ['pce-cpu', 'pce-wram', 'pce-vdc', 'pce-vram', 'pce-vce'],
        activeBuses: [],
        packets: []
      },
      {
        step: 1,
        shortTitle: 'System Card',
        title: 'Slot de Cartucho (38 pinos): System Card → CPU HuC6280',
        summary:
          'Como o console original não sabia ler CDs de fábrica, inserimos a System Card na entrada de cartucho para fornecer o sistema de boot (BIOS) e expandir a memória RAM até a CPU.',
        simpleAnalogy:
          'Como o videogame nasceu sem saber o que é um CD, colocamos um "cartão-tradutor" (System Card) na entrada de jogos. Ele ensina o aparelho a usar o CD e aumenta a mesa de trabalho (RAM).',
        flowSteps: [
          {
            nodeId: 'pce-syscard',
            tag: '1. System Card (BIOS do CD-ROM²)',
            iconType: 'code',
            text: 'Entra no slot HuCard de 38 pinos e entrega as rotinas de BIOS para controlar o leitor óptico e o ADPCM.'
          },
          {
            nodeId: 'pce-syscard',
            tag: '2. System Card (Expansão de RAM)',
            iconType: 'code',
            text: 'Adiciona bancos extras de RAM no próprio cartão: +192 KB (Super System Card 3.0) ou +2 MB DRAM (Arcade Card).'
          },
          {
            nodeId: 'pce-cpu',
            tag: '3. CPU HuC6280 + MMU (8× MPR)',
            iconType: 'code',
            text: 'Recebe a BIOS pelo barramento de 21 bits e mapeia os novos bancos de RAM nas janelas de 8 KB da MMU.'
          }
        ],
        insight:
          'Seg. Copetti: Os CDs do PC Engine não têm trava de região! A verificação acontecia apenas na pinagem do cartão HuCard (invertida entre o PC Engine japonês e o TurboGrafx-16 americano).',
        speechSimple:
          '"Como o videogame original não sabia ler CDs, colocamos um cartão chamado System Card na entrada normal de jogos. Vejam a linha amarela completa levando o sistema do CD e até 2 Megabytes de memória extra direto para a CPU!"',
        speechTech:
          '"Como o PC Engine base não tinha BIOS de CD, inserimos a System Card no slot de 38 pinos: ela fornece as rotinas de controle do CD-ROM² para a CPU HuC6280 e expande a RAM mapeada na MMU em +192 KB (Super System Card) ou +2 MB (Arcade Card)."',
        activeNodes: ['pce-syscard', 'pce-cpu'],
        activeBuses: ['bus-pce-hucard'],
        packets: [
          {
            pathId: 'path-pce-hucard',
            color: '#f59e0b',
            type: 'code',
            label: 'BIOS + RAM Extra',
            badgeX: 355,
            badgeY: 112
          }
        ]
      },
      {
        step: 2,
        shortTitle: 'Leitura CD 1x',
        title: 'Leitura do CD em 1x (150 KB/s): Leitor SCSI → IFU-30 CD-RAM → CPU',
        summary:
          'Os 3 componentes trabalham em sequência: o leitor óptico lê o disco a 150 KB/s pelo controlador SCSI, abastece os 64 KB de memória RAM da base acoplada (IFU-30) e entrega os dados da fase para a CPU.',
        simpleAnalogy:
          'O CD guarda 650 MB, mas o laser 1x lê devagar. Por isso, ele copia primeiro os dados da fase atual para uma bancada de 64 KB dentro da base acoplada antes de a CPU usar.',
        flowSteps: [
          {
            nodeId: 'pce-drive',
            tag: '1. Leitor CD-ROM² (1x — Controlador SCSI)',
            iconType: 'disc',
            text: 'Lê os setores do disco a 150 KB/s e envia pelo barramento SCSI-1 até a base acoplada (Interface Unit IFU-30).'
          },
          {
            nodeId: 'pce-cdram',
            tag: '2. CD-ROM² Work RAM (64 KB + 2 KB BRAM)',
            iconType: 'code',
            text: 'Armazena o código e os gráficos da fase nos 64 KB de DRAM (256 KB no Super CD-ROM²) + 2 KB de BRAM para saves.'
          },
          {
            nodeId: 'pce-cpu',
            tag: '3. CPU HuC6280 + MMU',
            iconType: 'code',
            text: 'Acessa os 64 KB da base pela porta traseira de expansão (mapeados nos bancos $80–$87 da MMU) para executar o jogo.'
          }
        ],
        insight:
          'Diferente dos cartuchos (onde a leitura é instantânea nos chips), no CD é obrigatório copiar a fase para a memória RAM antes de jogar — criando as telas de Loading.',
        speechSimple:
          '"Vejam os 3 blocos ativos: o laser lê o CD a 150 KB por segundo, guarda os arquivos da fase na memória de 64 KB da base acoplada e envia pelo barramento azul direto até a CPU!"',
        speechTech:
          '"Para carregar uma fase, o leitor 1x transfere dados a 150 KB/s via controlador SCSI para os 64 KB de Work RAM da Interface Unit (256 KB no Super CD-ROM²), e a CPU HuC6280 pagina esses bancos pela porta de expansão traseira."',
        activeNodes: ['pce-drive', 'pce-cdram', 'pce-cpu'],
        activeBuses: ['bus-pce-scsi', 'bus-pce-exp'],
        packets: [
          {
            pathId: 'path-pce-scsi',
            color: '#f97316',
            type: 'disc',
            label: '150 KB/s (SCSI)',
            badgeX: 700,
            badgeY: 205
          },
          {
            pathId: 'path-pce-exp',
            color: '#38bdf8',
            type: 'code',
            label: 'Dados p/ a CPU',
            badgeX: 355,
            badgeY: 262
          }
        ]
      },
      {
        step: 3,
        shortTitle: 'Vídeo Dual-Chip',
        title: 'Pipeline Gráfico Fiel (Copetti): CD-RAM → CPU → VDC ↔ VRAM (16-bit) e VDC → VCE',
        summary:
          'Os 5 blocos atuam na topologia exata do hardware: os gráficos saem da CD-RAM para a CPU, que alimenta o VDC (tiles/sprites) e o VCE (paletas). O VDC grava na VRAM exclusiva de 16 bits e envia o fluxo de pixels de 9 bits direto para o VCE!',
        simpleAnalogy:
          'A CPU pega os desenhos na bancada do CD e entrega ao 1º artista (VDC). O VDC guarda e lê os desenhos no seu caderno exclusivo de 16 bits (VRAM) e manda o desenho pronto direto para o 2º artista (VCE) pintar com 482 cores!',
        flowSteps: [
          {
            nodeId: 'pce-cdram',
            tag: '1. CD-ROM² Work RAM (64 KB)',
            iconType: 'code',
            text: 'Fornece os gráficos brutos (tiles 8×8 de cenário e sprites 16×16) que foram carregados do CD-ROM.'
          },
          {
            nodeId: 'pce-cpu',
            tag: '2. CPU HuC6280 (Instruções TAI/TIA)',
            iconType: 'code',
            text: 'Transfere os gráficos em rajada para o VDC (e atualiza as 32 paletas no VCE durante o intervalo V-Blank).'
          },
          {
            nodeId: 'pce-vdc',
            tag: '3. VDC: HuC6270 (Desenhista + DMA SATB)',
            iconType: 'image',
            text: 'Grava os tiles e sprites na VRAM via barramento de 16 bits e usa DMA interno para atualizar a tabela de 64 sprites (SATB).'
          },
          {
            nodeId: 'pce-vram',
            tag: '4. VRAM Exclusiva do VDC (64 KB 16-bit)',
            iconType: 'image',
            text: 'Conectada exclusivamente ao VDC (VDC ↔ VRAM em words de 16 bits), devolvendo duas linhas de bitplanes por leitura.'
          },
          {
            nodeId: 'pce-vce',
            tag: '5. VCE: HuC6260 (Pintor — Recebe 9-bit do VDC)',
            iconType: 'image',
            text: 'Recebe o stream digital de 9 bits diretamente do VDC (sem tocar na VRAM!), aplica até 482 cores e gera o vídeo da TV.'
          }
        ],
        insight:
          'Detalhe crucial do diagrama de Copetti & Archaic Pixels: O VCE NÃO lê a VRAM! A VRAM é exclusiva do VDC (VDC ↔ VRAM). O VDC monta a linha e envia um barramento digital de 9 bits direto para o VCE colorir.',
        speechSimple:
          '"Olhem a precisão deste caminho nos 5 componentes: os gráficos saem da memória do CD, passam pela CPU e entram no chip VDC. Reparem que o VDC guarda e lê os desenhos na sua memória VRAM exclusiva de 16 bits, e depois uma linha roxa sai direto do VDC para o chip VCE pintar 482 cores na TV!"',
        speechTech:
          '"Seguindo fielmente o diagrama de Copetti e Archaic Pixels: a CPU HuC6280 busca os tiles na CD-RAM e alimenta o VDC (HuC6270) e as paletas do VCE. A VRAM de 64 KB opera num barramento dedicado de 16 bits exclusivo do VDC (VDC ↔ VRAM), enquanto o VDC envia o pixel stream de 9 bits diretamente para o VCE (HuC6260) converter em RGB/Composto."',
        activeNodes: ['pce-cdram', 'pce-cpu', 'pce-vdc', 'pce-vram', 'pce-vce'],
        activeBuses: ['bus-pce-exp', 'bus-pce-cpu-vdc', 'bus-pce-vdc', 'bus-pce-vce'],
        packets: [
          {
            pathId: 'path-pce-exp',
            color: '#10b981',
            type: 'image',
            label: '1. Gráficos do CD',
            badgeX: 365,
            badgeY: 262
          },
          {
            pathId: 'path-pce-cpu-vdc',
            color: '#38bdf8',
            type: 'image',
            label: '2. CPU -> VDC/VCE',
            badgeX: 255,
            badgeY: 298
          },
          {
            pathId: 'path-pce-vdc',
            color: '#38bdf8',
            type: 'image',
            label: '3. VDC <-> VRAM 16b',
            badgeX: 95,
            badgeY: 390
          },
          {
            pathId: 'path-pce-vce',
            color: '#a855f7',
            type: 'image',
            label: '4. VDC -> VCE (9-bit)',
            badgeX: 262,
            badgeY: 440
          }
        ]
      },
      {
        step: 4,
        shortTitle: 'Áudio Triplo',
        title: 'Mixagem Tripla: Leitor de CD (CD-DA) + CPU (6ch PSG) → Mixer & ADPCM (OKI MSM5205)',
        summary:
          'Os 3 componentes sonoros se encontram no mixer da IFU-30: o leitor manda música Red Book CD-DA direto do disco, a CPU envia seus 6 canais Waveform PSG e o chip OKI MSM5205 soma as vozes dubladas dos 64 KB ADPCM.',
        simpleAnalogy:
          'É uma banda com 3 músicos: o CD toca a música gravada em estúdio, a CPU manda os efeitos de tiro/pulo e o chip ADPCM fala as vozes dos personagens usando sua própria memória de 64 KB!',
        flowSteps: [
          {
            nodeId: 'pce-drive',
            tag: '1. Leitor CD-ROM² (Música Red Book CD-DA)',
            iconType: 'disc',
            text: 'Lê as faixas de áudio estéreo de 16 bits / 44.1 kHz direto do CD sem gastar 1 byte de memória RAM.'
          },
          {
            nodeId: 'pce-cpu',
            tag: '2. CPU HuC6280 (6 Canais Waveform PSG)',
            iconType: 'audio',
            text: 'Gera 6 canais de ondas programáveis (32 amostras de 5 bits por canal, com suporte a DDA, LFO e ruído).'
          },
          {
            nodeId: 'pce-adpcm',
            tag: '3. Áudio ADPCM (OKI MSM5205 + 64 KB DRAM)',
            iconType: 'audio',
            text: 'Decodifica vozes dubladas em 4-bit ADPCM (até 32 kHz) nos seus 64 KB exclusivos e mixa com o CD-DA e o PSG.'
          }
        ],
        insight:
          'Separar 64 KB de DRAM exclusivos para o chip OKI MSM5205 permitia tocar falas dubladas a qualquer momento sem roubar espaço dos gráficos na Work RAM.',
        speechSimple:
          '"Para fechar o PC Engine, vejam as linhas de som: o leitor manda a música de estúdio direto do CD e a CPU manda os 6 canais de efeitos sonoros para se juntarem às vozes dubladas nos 64 KB do módulo ADPCM!"',
        speechTech:
          '"O subsistema de áudio combina 3 fontes em paralelo: streaming Red Book CD-DA vindo do leitor óptico, os 6 canais Waveform PSG (com modo DDA e LFO) integrados na CPU HuC6280 e as vozes no decodificador OKI MSM5205 com 64 KB de DRAM dedicada."',
        activeNodes: ['pce-drive', 'pce-adpcm', 'pce-cpu'],
        activeBuses: ['bus-pce-audio', 'bus-pce-cpu-audio'],
        packets: [
          {
            pathId: 'path-pce-audio',
            color: '#10b981',
            type: 'audio',
            label: 'Música CD-DA',
            badgeX: 765,
            badgeY: 382
          },
          {
            pathId: 'path-pce-cpu-audio',
            color: '#ec4899',
            type: 'audio',
            label: 'PSG + Vozes 64KB',
            badgeX: 355,
            badgeY: 382
          }
        ]
      }
    ],
    components: [
      {
        id: 'pce-cpu',
        title: 'CPU HuC6280 + MMU + PSG',
        spec: '8-bit 65C02 @ 1.79 / 7.16 MHz',
        subSpec: 'MMU 8× MPR (21b) + 6ch PSG + Timer/IRQ/IO',
        category: 'cpu',
        simpleRole: 'O cérebro completo do console: comanda o jogo, troca páginas de memória (MMU), lê os controles e gera 6 canais de som.',
        metrics: [
          { label: 'Clock Duplo', value: '1.79 MHz ou 7.16 MHz' },
          { label: 'Barramentos', value: '8-bit Dados / 21-bit Físico MMU' },
          { label: 'Paginação MMU', value: '8× Regs MPR de 8 KB (Até 2 MB)' },
          { label: 'Integrados no Chip', value: '6ch PSG + Timer 7b + IRQ + I/O' }
        ],
        detail:
          'Seg. Copetti & Archaic Pixels: Projetado pela Hudson Soft e fabricado pela Epson. Integra no mesmo chip o núcleo 65C02 aprimorado (com instruções de transferência em bloco TAI, TIA, TDD, TIN, TII), a MMU de 8 registradores MPR (convertendo endereços lógicos de 16 bits em 21 bits físicos), o gerador de som PSG de 6 canais, um Timer de 7 bits, controlador de interrupções (IRQ1, IRQ2, TIQ) e porta I/O de 8 bits para os controles.'
      },
      {
        id: 'pce-wram',
        title: 'Work RAM Base',
        spec: '8 KB SRAM Interna ($F8)',
        subSpec: 'Memória Original do Console Base',
        category: 'ram',
        simpleRole: 'A pequena mesa de trabalho original do videogame (8 KB), usada para guardar a pilha e as variáveis da partida.',
        metrics: [
          { label: 'Capacidade', value: '8 KB SRAM (32 KB no SuperGrafx)' },
          { label: 'Página Física', value: 'Banco $F8 na MMU (Zero-Page/Stack)' },
          { label: 'Acesso', value: 'Zero Wait-States (Sem espera)' },
          { label: 'No CD-ROM²', value: 'Expandida p/ +64 KB / +256 KB' }
        ],
        detail:
          'Memória SRAM interna do PC Engine original mapeada no banco físico $F8 (onde ficam a Zero Page e a Stack do 65C02). Como 8 KB eram insuficientes para armazenar fases lidas de um CD-ROM, a unidade CD-ROM² e as System Cards adicionaram novos bancos de RAM paginados pela MMU.'
      },
      {
        id: 'pce-vdc',
        title: 'VDC: HuC6270 (Vídeo)',
        spec: 'Barramento VRAM 16-bit Exclusivo',
        subSpec: 'Tiles 8×8 + 64 Sprites + DMA Interno',
        category: 'gpu',
        simpleRole: 'O "desenhista" de 16 bits: monta os blocos do cenário, controla os 64 personagens na tela e envia os pixels prontos para o VCE.',
        metrics: [
          { label: 'Bus VRAM', value: '16-bit Dados / 15-bit Addr (Exclusivo)' },
          { label: 'Cenário', value: '1 Camada de Tiles 8×8 (BAT)' },
          { label: 'Sprites', value: '64 na tela (16 por linha, até 32×64)' },
          { label: 'DMA Interno', value: 'VRAM → SATB e VRAM → VRAM' }
        ],
        detail:
          'Seg. Copetti & Archaic Pixels: Embora a CPU seja de 8 bits, o VDC acessa seus 64 KB de VRAM por um barramento exclusivo de 16 bits, além de possuir DMA interno para copiar a tabela de atributos de 64 sprites (SATB) e blocos de VRAM. Envia um fluxo digital de 9 bits diretamente para o chip VCE.'
      },
      {
        id: 'pce-vram',
        title: 'VRAM Dedicada (Exclusiva VDC)',
        spec: '64 KB SRAM (32K Words × 16-bit)',
        subSpec: 'Ligada exclusivamente ao chip VDC',
        category: 'ram',
        simpleRole: 'O caderno de desenho exclusivo do chip VDC, lido em palavras de 16 bits para dobrar a velocidade dos gráficos.',
        metrics: [
          { label: 'Capacidade', value: '64 KB (32.768 Words de 16 bits)' },
          { label: 'Formato Planar', value: '4 Bitplanes (16 cores por tile/sprite)' },
          { label: 'Tabela BAT', value: 'Background Attribute Table (32×32 a 128×64)' },
          { label: 'Conexão Física', value: 'Exclusiva do VDC (VCE não acessa)' }
        ],
        detail:
          'Seg. Copetti: Conectada única e exclusivamente ao VDC (HuC6270) por um barramento dedicado de 16 bits. Cada leitura de 16 bits traz duas linhas de planos de bits de uma só vez. O chip VCE não tem ligação com a VRAM.'
      },
      {
        id: 'pce-vce',
        title: 'VCE: HuC6260 (Cores & Clock)',
        spec: '32 Paletas × 16 Cores (RGB 9-bit)',
        subSpec: 'Recebe 9-bit do VDC • Até 482 Cores',
        category: 'gpu',
        simpleRole: 'O "pintor" e maestro de tempo: recebe o desenho de 9 bits do VDC, aplica até 482 cores e manda o sinal para a TV.',
        metrics: [
          { label: 'Paletas Internas', value: '32 Paletas (16 BG + 16 Sprites)' },
          { label: 'Cores Simultâneas', value: 'Até 482 cores na tela (de 512)' },
          { label: 'Entrada Digital', value: 'Stream de 9 bits vindo do VDC' },
          { label: 'Clock de Vídeo', value: '5.37 / 7.16 / 10.74 MHz (Dot Clock)' }
        ],
        detail:
          'Seg. Copetti & Archaic Pixels: Conectado à CPU (para receber as 32 paletas na sua Color Table RAM interna) e ao VDC (de quem recebe o pixel de 9 bits: 4 bits de cor + 4 bits de paleta + 1 bit BG/Sprite). Também gera os sinais de sincronismo HSYNC/VSYNC e o Dot Clock para o VDC.'
      },
      {
        id: 'pce-syscard',
        title: 'System Card (Slot HuCard 38p)',
        spec: 'BIOS ROM + Expansão de RAM',
        subSpec: '+192 KB (Super) ou +2 MB (Arcade)',
        category: 'storage',
        simpleRole: 'Cartão colocado na entrada de jogos que ensina o console a usar o CD e adiciona memória RAM extra.',
        metrics: [
          { label: 'Conector', value: 'Slot HuCard (38 pinos)' },
          { label: 'System Card 1.0–2.1', value: '256 KB BIOS ROM do CD-ROM²' },
          { label: 'Super System Card 3.0', value: 'BIOS + 192 KB SRAM (Total 256 KB)' },
          { label: 'Arcade Card Pro/Duo', value: 'BIOS + 2 MB DRAM c/ registradores' }
        ],
        detail:
          'Inserida no slot de cartucho de 38 pinos. Fornece o sistema operacional (BIOS) do CD-ROM² e expande a memória RAM paginada pela MMU (ou integrada no PC Engine Duo).'
      },
      {
        id: 'pce-cdram',
        title: 'CD-ROM² Work RAM & BRAM',
        spec: '64 KB DRAM + 2 KB Save BRAM',
        subSpec: 'Interface Unit (IFU-30) • Bancos $80–$87',
        category: 'ram',
        simpleRole: 'Bancada de 64 KB na base do CD onde ficam os arquivos da fase atual, mais 2 KB com bateria para salvar o progresso.',
        metrics: [
          { label: 'RAM da IFU-30', value: '64 KB DRAM (256 KB no Super CD)' },
          { label: 'Save Memory', value: '2 KB BRAM mantida por capacitor/bateria' },
          { label: 'Mapeamento MMU', value: '8 Páginas de 8 KB (Bancos $80–$87)' },
          { label: 'Controlador CD', value: 'Ponte SCSI-1 + Subchannel Decoder' }
        ],
        detail:
          'Localizada na base Interface Unit (IFU-30). Recebe o código e os gráficos lidos do CD-ROM via controlador SCSI antes de serem processados pela CPU e enviados ao VDC.'
      },
      {
        id: 'pce-adpcm',
        title: 'Áudio ADPCM (OKI MSM5205) + Mixer',
        spec: '64 KB ADPCM DRAM + Fader CD-DA',
        subSpec: 'Vozes 4-bit ADPCM (1.6–32 kHz) + CD-DA',
        category: 'audio',
        simpleRole: 'Chip de som com 64 KB exclusivos só para falar as vozes dos personagens e misturar com a música do CD.',
        metrics: [
          { label: 'Memória de Voz', value: '64 KB DRAM Exclusivos p/ ADPCM' },
          { label: 'Decodificador', value: 'OKI MSM5205 (4-bit → 12-bit PCM)' },
          { label: 'Taxa de Amostragem', value: 'Variável de 1.6 kHz até 32.08 kHz' },
          { label: 'Saída Estéreo', value: 'Mixa ADPCM + CD-DA + 6ch PSG' }
        ],
        detail:
          'Seg. Copetti: Dedica 64 KB exclusivos de DRAM para amostras de voz (ADPCM) alimentadas no decodificador OKI MSM5205, deixando a memória principal livre para o código e os cenários do jogo.'
      },
      {
        id: 'pce-drive',
        title: 'Leitor CD-ROM² (1x SCSI)',
        spec: '150 KB/s • Barramento SCSI-1',
        subSpec: '650 MB (Dados Mode 1 + Áudio CD-DA)',
        category: 'cd',
        simpleRole: 'O primeiro leitor de CD dos videogames: lê até 650 MB de fases, animações e músicas de estúdio.',
        metrics: [
          { label: 'Velocidade', value: '1x CLV (150 KB por segundo)' },
          { label: 'Protocolo', value: 'Barramento SCSI-1 na IFU-30' },
          { label: 'Capacidade', value: 'Até 650 MB (Dados + Red Book Audio)' },
          { label: 'Trava Regional', value: 'Nenhuma no CD (apenas no HuCard)' }
        ],
        detail:
          'Primeira unidade de CD-ROM para videogames domésticos (lançada em dezembro de 1988 no Japão). Lê trilhas de dados ISO Mode 1 a 150 KB/s e faixas de música Red Book CD-DA.'
      }
    ]
  },

  megacd: {
    id: 'megacd',
    shortName: 'Mega Drive + Mega-CD',
    name: 'Sega Mega Drive + Mega-CD (1991)',
    subtitle: 'Dual Motorola 68000 (7.67 MHz + 12.5 MHz) • Gate Array ASIC & Word RAM • CDC LC8951 & Ricoh PCM',
    year: '1991',
    sources: [
      { label: 'Copetti — Mega Drive / Genesis (PT-BR)', url: 'https://www.copetti.org/pt-br/writings/consoles/mega-drive-genesis/' },
      { label: 'Plutiedev — Mega Drive & Mega-CD Dev', url: 'https://plutiedev.com/' },
      { label: 'RetroReversing — Mega Drive / Mega-CD', url: 'https://www.retroreversing.com/megadrive' }
    ],
    simulationSteps: [
      {
        step: 0,
        shortTitle: 'Visão Geral',
        title: 'Mega Drive Base: Os 4 Componentes do Console Original (68000, Árbitro/RAM, VDP+PSG e Z80+YM2612)',
        summary:
          'No console base atuam 4 blocos: o Motorola 68000 (7.67 MHz), os 64 KB de Work RAM com o Árbitro de Barramento e I/O, o VDP (que também abriga o chip de som SN76489 PSG) e o Zilog Z80 (3.58 MHz) comandando o sintetizador FM Yamaha YM2612.',
        simpleAnalogy:
          'São dois funcionários trabalhando juntos: o chefe (68000) cuida do jogo na sua mesa de 64 KB, o desenhista (VDP) monta a imagem e um assistente (Z80) cuida só da música FM/PSG, coordenados por um guarda de trânsito (Árbitro).',
        flowSteps: [
          {
            nodeId: 'mcd-maincpu',
            tag: '1. Main-CPU: Motorola 68000 (7.67 MHz)',
            iconType: 'code',
            text: 'CPU híbrida 16/32-bit (registradores de 32 bits, ALU e bus de 16 bits, endereçamento de 24 bits p/ 16 MB).'
          },
          {
            nodeId: 'mcd-arbiter',
            tag: '2. 64 KB Work RAM + Árbitro de Bus & I/O',
            iconType: 'code',
            text: 'Guarda o estado do jogo e coordena o barramento entre o 68000 (`$A11100` BusReq), o Z80 (janela de 32 KB) e o DMA do VDP.'
          },
          {
            nodeId: 'mcd-vdp',
            tag: '3. VDP (Modo V + DMA + PSG Integrado)',
            iconType: 'image',
            text: 'Desenha 4 planos gráficos e 80 sprites (64 KB VRAM, 128 B CRAM e 80 B VSRAM) e integra fisicamente o chip de som SN76489 PSG.'
          },
          {
            nodeId: 'mcd-z80',
            tag: '4. Zilog Z80 (8 KB RAM) + Yamaha YM2612',
            iconType: 'audio',
            text: 'CPU de 8 bits (3.58 MHz) que comanda os 6 canais FM do YM2612 (canal 6 toca PCM de 8 bits) e os 4 canais do PSG.'
          }
        ],
        insight:
          'Seg. Copetti & Plutiedev: O 68000 precisa pedir o barramento (`$A11100` BusReq) para escrever nos 8 KB do Z80, e o Z80 usa uma janela bancada de 32 KB (`$8000–$FFFF`) para ler amostras PCM direto da memória do 68000!',
        speechSimple:
          '"No Mega Drive base vemos 4 peças trabalhando juntas: o Motorola 68000 cuida do jogo, a memória de 64 KB tem um Árbitro de Trânsito para evitar colisões, o chip VDP monta a imagem na TV (e guarda o gerador PSG lá dentro), e o Z80 comanda o sintetizador FM Yamaha YM2612!"',
        speechTech:
          '"Na arquitetura base analisada por Copetti e Plutiedev, temos 4 blocos: o Motorola 68000 a 7.67 MHz, os 64 KB de Work RAM com o Árbitro de Barramento e chip I/O, o VDP no Modo V (integrando o PSG SN76489) e o Zilog Z80 a 3.58 MHz com 8 KB próprios comandando o Yamaha YM2612."',
        activeNodes: ['mcd-maincpu', 'mcd-arbiter', 'mcd-vdp', 'mcd-z80'],
        activeBuses: [],
        packets: []
      },
      {
        step: 1,
        shortTitle: 'Sub-CPU 12.5 MHz',
        title: 'Mega-CD em Ação: Leitor 1x & CDC (LC8951) → 2º Motorola 68000 (12.5 MHz) → 512 KB PRG-RAM',
        summary:
          'Os 3 blocos da direita entram em ação: o leitor óptico lê o CD a 150 KB/s passando pelo controlador CDC Sanyo LC8951 (16 KB cache), entrega à Sub-CPU Motorola 68000 (12.5 MHz + 128 KB BIOS + 8 KB BRAM) e abastece os 512 KB de PRG-RAM.',
        simpleAnalogy:
          'O Mega-CD traz praticamente um segundo videogame inteiro lá dentro: o leitor de CD e seu controlador CDC entregam os arquivos para um segundo "chefe" 63% mais rápido, que trabalha numa mesa de 512 KB (8 vezes maior que a do Mega Drive)!',
        flowSteps: [
          {
            nodeId: 'mcd-drive',
            tag: '1. CD-ROM (1x CLV) + CDC Sanyo LC8951 (16 KB)',
            iconType: 'disc',
            text: 'Lê setores a 150 KB/s; o controlador CDC LC8951 (16 KB buffer) corrige erros e faz DMA p/ PRG-RAM, Word RAM ou PCM.'
          },
          {
            nodeId: 'mcd-subcpu',
            tag: '2. Sub-CPU: 2º 68000 (12.5 MHz + BIOS/BRAM)',
            iconType: 'code',
            text: 'Segundo Motorola 68000 (63% mais rápido que a base), acompanhado de 128 KB de Sub-BIOS ROM e 8 KB de BRAM p/ saves.'
          },
          {
            nodeId: 'mcd-prgram',
            tag: '3. Program RAM (512 KB PRG-RAM)',
            iconType: 'code',
            text: 'Memória exclusiva da Sub-CPU (8× maior que a RAM do Mega Drive) onde rodam o código do Mega-CD, FMV e descompressão.'
          }
        ],
        insight:
          'Seg. Plutiedev & RetroReversing: Além dos 512 KB de PRG-RAM, o controlador CDC Sanyo LC8951 pode transferir setores do CD via DMA diretamente para a PRG-RAM, para a Word RAM ou para os 64 KB do chip de som PCM!',
        speechSimple:
          '"Ao encaixar o Mega-CD, esses 3 blocos da direita entram em ação: vejam a linha laranja subindo do leitor de CD e seu controlador CDC a 150 KB/s direto para o segundo processador 68000 (12.5 MHz), e descendo pela linha verde para guardar tudo nos 512 KB de memória!"',
        speechTech:
          '"No módulo Mega-CD atuam 3 componentes: o leitor 1x CLV com o controlador CDC Sanyo LC8951 (16 KB cache) transfere dados a 150 KB/s para a Sub-CPU Motorola 68000 a 12.5 MHz (com 128 KB BIOS e 8 KB BRAM), abastecendo os 512 KB de Program RAM."',
        activeNodes: ['mcd-drive', 'mcd-subcpu', 'mcd-prgram'],
        activeBuses: ['bus-mcd-cd', 'bus-mcd-prg'],
        packets: [
          {
            pathId: 'path-mcd-cd',
            color: '#f97316',
            type: 'disc',
            label: '150 KB/s (CDC DMA)',
            badgeX: 885,
            badgeY: 132
          },
          {
            pathId: 'path-mcd-prg',
            color: '#10b981',
            type: 'code',
            label: '512 KB PRG-RAM',
            badgeX: 700,
            badgeY: 216
          }
        ]
      },
      {
        step: 2,
        shortTitle: 'ASIC & Word RAM',
        title: 'Ponte Gate Array & Word RAM: Sub-CPU ↔ ASIC (Rotação + Comm Ports $A12010) ↔ Word RAM ↔ Main-CPU',
        summary:
          'Aqui 4 componentes trabalham em conjunto: o Main-CPU e a Sub-CPU trocam comandos pelos 16 registradores do Gate Array (`$A12010–$A1202E` + `IRQ2`), o ASIC aplica rotação/escala nos gráficos e a Word RAM (256 KB) faz o Bank Swap para o Mega Drive!',
        simpleAnalogy:
          'Como os dois processadores não podem mexer na mesma mesa juntos, eles conversam por um interfone de 16 portas (Comm Ports no Gate Array) e usam uma bancada giratória (Word RAM): enquanto o ASIC gira a imagem no Lado A, o Mega Drive lê o Lado B pronto!',
        flowSteps: [
          {
            nodeId: 'mcd-subcpu',
            tag: '1. Sub-CPU: 2º 68000 (12.5 MHz)',
            iconType: 'code',
            text: 'Envia parâmetros de rotação/zoom para o ASIC e sinaliza status nos registradores `$FF8020–$FF802E`.'
          },
          {
            nodeId: 'mcd-asic',
            tag: '2. Gate Array / ASIC (Rotação + Comm Ports)',
            iconType: 'image',
            text: 'Contém as 16 portas de comunicação (`$A12010–$A1202E` + `IRQ2`) e o motor gráfico que gira bitmaps e já converte em Tiles 8×8.'
          },
          {
            nodeId: 'mcd-wordram',
            tag: '3. Word RAM (256 KB — Modo 2M ou 1M/1M)',
            iconType: 'image',
            text: 'Opera como 1 bloco de 256 KB (Modo 2M) ou 2 bancos de 128 KB (Modo 1M/1M) que alternam instantaneamente (Bank Swap).'
          },
          {
            nodeId: 'mcd-maincpu',
            tag: '4. Main-CPU: Motorola 68000 (7.67 MHz)',
            iconType: 'image',
            text: 'Dispara interrupções `IRQ2` (`$A12000`) para a Sub-CPU e recebe na janela `$600000` o banco da Word RAM já convertido em tiles!'
          }
        ],
        insight:
          'Seg. Plutiedev (Using the Sub-CPU): As duas CPUs 68000 sincronizam tarefas usando 8 portas de comando (`$A12010–$A1201E`), 8 portas de status (`$A12020–$A1202E`) e a interrupção `IRQ2` dentro do Gate Array ASIC, enquanto trocam gráficos pesados via Bank Swap na Word RAM!',
        speechSimple:
          '"Vejam os 4 blocos conectados na ponte central: os dois processadores conversam pelas portas de comando do chip Gate Array ASIC, o ASIC gira a imagem e fatia em blocos 8×8, a memória Word RAM gira a bancada (Bank Swap) e entrega o desenho pronto para o Mega Drive!"',
        speechTech:
          '"Neste passo operam 4 componentes segundo Plutiedev: Main-CPU e Sub-CPU sincronizam comandos via 16 registradores de comunicação (`$A12010–$A1202E`) e `IRQ2` no Gate Array ASIC. O ASIC aplica transformações afins e converte bitmaps em tiles 8×8 na Word RAM (256 KB), que faz Bank Swap para a janela `$600000` do Main-CPU."',
        activeNodes: ['mcd-subcpu', 'mcd-asic', 'mcd-wordram', 'mcd-maincpu'],
        activeBuses: ['bus-mcd-sub-asic', 'bus-mcd-asic-word', 'bus-mcd-main-word'],
        packets: [
          {
            pathId: 'path-mcd-sub-asic',
            color: '#a855f7',
            type: 'code',
            label: '1. Comm Ports + ASIC',
            badgeX: 580,
            badgeY: 112
          },
          {
            pathId: 'path-mcd-asic-word',
            color: '#a855f7',
            type: 'image',
            label: '2. Rotação -> Tiles 8x8',
            badgeX: 461,
            badgeY: 220
          },
          {
            pathId: 'path-mcd-main-word',
            color: '#ec4899',
            type: 'image',
            label: '3. Bank Swap ($600000)',
            badgeX: 335,
            badgeY: 312
          }
        ]
      },
      {
        step: 3,
        shortTitle: 'VDP & 3 Memórias',
        title: 'Transferência DMA para a TV: Word RAM → Main-CPU & Árbitro → VDP (VRAM, CRAM e VSRAM)',
        summary:
          'Aqui 4 blocos trabalham juntos: os tiles saem da Word RAM, o 68000 programa os 5 registradores de DMA, o Árbitro pausa o 68000 (e o Z80) e o DMA do VDP puxa os gráficos para suas 3 memórias internas (64 KB VRAM, 128 B CRAM e 80 B VSRAM).',
        simpleAnalogy:
          'A imagem sai da bancada giratória (Word RAM), o chefe (68000) aciona o trem expresso (DMA) enquanto o guarda (Árbitro) segura o trânsito, e os desenhos entram nas 3 gavetas do vídeo (VDP): 64 KB de desenhos, 64 cores e rolagem da tela.',
        flowSteps: [
          {
            nodeId: 'mcd-wordram',
            tag: '1. Word RAM (256 KB — Janela $600000)',
            iconType: 'image',
            text: 'Fornece os blocos gráficos (tiles 8×8) já descompactados ou rotacionados pelo Mega-CD.'
          },
          {
            nodeId: 'mcd-maincpu',
            tag: '2. Main-CPU: Motorola 68000 (Setup DMA)',
            iconType: 'code',
            text: 'Programa origem e tamanho nos registradores `$9300–$9700` do VDP durante o intervalo vertical (V-Blank).'
          },
          {
            nodeId: 'mcd-arbiter',
            tag: '3. Árbitro de Bus (Pausa 68000 e Z80 no DMA)',
            iconType: 'code',
            text: 'Seg. Plutiedev: Pausa o Z80 (`$A11100`) e o 68000 durante o DMA para evitar corrupção gráfica no barramento.'
          },
          {
            nodeId: 'mcd-vdp',
            tag: '4. VDP: 64 KB VRAM + 128 B CRAM + 80 B VSRAM',
            iconType: 'image',
            text: 'Copia até 205 bytes/linha no V-Blank para os 4 planos na VRAM, aplica 64 cores na CRAM (183 tons c/ Sombra/Brilho) e scroll na VSRAM.'
          }
        ],
        insight:
          'Seg. Copetti & Plutiedev: Durante o DMA para o VDP, o 68000 fica pausado e o Z80 também deve ser pausado (`FastPauseZ80`) para não colidir no barramento principal!',
        speechSimple:
          '"Aqui vemos o caminho final da imagem passando por 4 blocos: ela sai da Word RAM até o 68000, o Árbitro segura o trânsito das CPUs e a linha azul (DMA) leva tudo direto ao chip VDP, preenchendo suas 3 memórias internas: 64 KB de desenhos, 64 cores e rolagem da tela!"',
        speechTech:
          '"O fluxo gráfico final envolve 4 componentes segundo Copetti e Plutiedev: a Word RAM entrega os tiles em `$600000`, o 68000 configura o DMA do VDP, o Árbitro pausa o 68000 e o Z80 para evitar contenção de bus, e o VDP preenche os 64 KB de VRAM, 128 B de CRAM (64 cores) e 80 B de VSRAM."',
        activeNodes: ['mcd-wordram', 'mcd-maincpu', 'mcd-arbiter', 'mcd-vdp'],
        activeBuses: ['bus-mcd-main-word', 'bus-mcd-vdp'],
        packets: [
          {
            pathId: 'path-mcd-main-word',
            color: '#ec4899',
            type: 'image',
            label: '1. Lê Tiles Word RAM',
            badgeX: 335,
            badgeY: 312
          },
          {
            pathId: 'path-mcd-vdp',
            color: '#38bdf8',
            type: 'image',
            label: '2. DMA -> VRAM/CRAM',
            badgeX: 255,
            badgeY: 312
          }
        ]
      },
      {
        step: 4,
        shortTitle: 'Som FM + PCM',
        title: 'Orquestra Completa (5 Blocos): Árbitro ↔ Z80 (YM2612 + PSG) e Sub-CPU + CD → Ricoh PCM',
        summary:
          'Neste passo 5 blocos trabalham juntos: no Mega Drive, o Árbitro coordena o Z80 para tocar o Yamaha YM2612 (6ch FM) e o PSG; no Mega-CD, a Sub-CPU abastece os 64 KB do chip Ricoh RF5C164 (8ch PCM) e o leitor envia música CD-DA!',
        simpleAnalogy:
          'Cinco peças formam uma orquestra completa: na esquerda, o Árbitro e o maestro Z80 tocam o som clássico do Mega Drive; na direita, a Sub-CPU alimenta o chip Ricoh de 8 canais gravados (PCM) e o leitor toca a música do CD!',
        flowSteps: [
          {
            nodeId: 'mcd-arbiter',
            tag: '1. 64 KB RAM + Árbitro (`$A11100` / Bank 32 KB)',
            iconType: 'code',
            text: 'Gerencia o acesso do 68000 aos 8 KB do Z80 e permite ao Z80 ler samples na janela bancada de 32 KB (`$8000–$FFFF`).'
          },
          {
            nodeId: 'mcd-z80',
            tag: '2. Zilog Z80 (8 KB) → YM2612 (6ch FM) + PSG (4ch)',
            iconType: 'audio',
            text: 'Rege no barramento Z80 o sintetizador FM Yamaha YM2612 (`$4000`) e o gerador SN76489 PSG (integrado no VDP).'
          },
          {
            nodeId: 'mcd-subcpu',
            tag: '3. Sub-CPU 68000 (12.5 MHz → Controle PCM)',
            iconType: 'code',
            text: 'Carrega as amostras digitais de áudio nos 64 KB de Wave RAM e dispara as notas dos 8 canais do chip Ricoh.'
          },
          {
            nodeId: 'mcd-drive',
            tag: '4. CD-ROM (1x — Streaming Red Book CD-DA)',
            iconType: 'disc',
            text: 'Envia a trilha sonora estéreo direto do CD (e nos loops, o chip PCM cobria o tempo de busca do laser 1x!).'
          },
          {
            nodeId: 'mcd-pcm',
            tag: '5. Áudio Mega-CD: Ricoh RF5C164 (8ch PCM + 64 KB)',
            iconType: 'audio',
            text: 'Reproduz 8 canais de samples digitais (até 32 kHz) nos seus 64 KB de Wave RAM e mixa com o áudio CD-DA e o som base.'
          }
        ],
        insight:
          'Seg. Copetti (Bônus Som do Mega-CD): Como o leitor 1x demorava para reposicionar o laser ao repetir uma faixa do CD, Sonic CD usava a Sub-CPU e o chip Ricoh PCM para tocar um preenchimento e esconder o silêncio!',
        speechSimple:
          '"Olhem os 5 componentes de som funcionando ao mesmo tempo: na esquerda, a linha amarela liga o Árbitro ao chip Z80 para tocar o som FM do Mega Drive; na direita, a Sub-CPU alimenta os 64 KB de amostras do chip Ricoh PCM enquanto o leitor de CD manda a música de estúdio!"',
        speechTech:
          '"Os 5 blocos ativos somam 18 canais mais CD-DA: na base, o Árbitro sincroniza o Z80 (8 KB RAM + janela de 32 KB), que comanda o YM2612 (6ch FM) e o SN76489 (4ch PSG); no Mega-CD, a Sub-CPU 68000 alimenta o Ricoh RF5C164 (8ch PCM com 64 KB Wave RAM), mixado ao streaming CD-DA vindo do leitor 1x."',
        activeNodes: ['mcd-arbiter', 'mcd-z80', 'mcd-subcpu', 'mcd-drive', 'mcd-pcm'],
        activeBuses: ['bus-mcd-z80', 'bus-mcd-sub-pcm', 'bus-mcd-pcm'],
        packets: [
          {
            pathId: 'path-mcd-z80',
            color: '#f59e0b',
            type: 'audio',
            label: 'Árbitro <-> Z80 FM',
            badgeX: 115,
            badgeY: 428
          },
          {
            pathId: 'path-mcd-sub-pcm',
            color: '#ec4899',
            type: 'audio',
            label: 'Sub-CPU -> 64KB PCM',
            badgeX: 700,
            badgeY: 358
          },
          {
            pathId: 'path-mcd-pcm',
            color: '#10b981',
            type: 'audio',
            label: 'CD-DA + 8ch PCM',
            badgeX: 885,
            badgeY: 344
          }
        ]
      }
    ],
    components: [
      {
        id: 'mcd-maincpu',
        title: 'Main-CPU: Motorola 68000',
        spec: '~7.67 MHz • Bus 16-bit',
        subSpec: 'Regs 32-bit • ALU 16-bit • Addr 24-bit',
        category: 'cpu',
        simpleRole: 'O processador principal do Mega Drive: controla os comandos do jogador, a física e a partida.',
        metrics: [
          { label: 'Clock', value: '7.67 MHz (NTSC) / 7.60 MHz (PAL)' },
          { label: 'Interno', value: 'Regs 32-bit / ALU 16-bit' },
          { label: 'Barramento', value: 'Dados 16-bit / Addr 24-bit (16 MB)' },
          { label: 'Segurança / I/O', value: 'Chip I/O 315-5309 + TMSS' }
        ],
        detail:
          'Seg. Copetti & RetroReversing: Processador híbrido 16/32 bits da Motorola. Possui registradores de 32 bits com conjunto de instruções ortogonal, enquanto sua ALU e seu barramento externo de dados operam em 16 bits (endereçando até 16 MB em 24 bits).'
      },
      {
        id: 'mcd-arbiter',
        title: '64 KB RAM + Árbitro de Bus & I/O',
        spec: 'Work RAM 68k + Bus Arbiter + I/O',
        subSpec: 'BusReq ($A11100) + Bank 32KB Z80',
        category: 'ram',
        simpleRole: 'A memória de 64 KB do Mega Drive junto com o "guarda de trânsito" que impede colisões entre o 68000, o Z80 e o DMA.',
        metrics: [
          { label: 'Work RAM', value: '64 KB DRAM ($FF0000–$FFFFFF)' },
          { label: 'Z80 BusReq', value: 'Registradores $A11100 / $A11200' },
          { label: 'Janela do Z80', value: '32 KB Bank ($8000–$FFFF no Z80)' },
          { label: 'Portas I/O', value: 'Chip 315-5309 ($A10001–$A1001F)' }
        ],
        detail:
          'Seg. Copetti & Plutiedev: Coordena o compartilhamento do barramento principal. O 68000 solicita o bus do Z80 (`$A11100`) para escrever nos 8 KB do Z80, enquanto o Z80 pode ler qualquer banco de 32 KB do barramento do 68000 (pausando o 68000 brevemente a cada byte lido). Durante o DMA do VDP, pausa o 68000.'
      },
      {
        id: 'mcd-vdp',
        title: 'VDP (Modo V + DMA + PSG)',
        spec: '64KB VRAM + 128B CRAM + 80B VSRAM',
        subSpec: 'Tiles 8×8 • 4 Planos • Integra SN76489 PSG',
        category: 'gpu',
        simpleRole: 'O chip de vídeo do Mega Drive: monta 4 camadas de cenário/personagens, pinta até 64 cores (183 tons) e ainda abriga o chip de som PSG.',
        metrics: [
          { label: 'VRAM (Desenhos)', value: '64 KB (Planos A, B, W e 80 Sprites)' },
          { label: 'CRAM (Cores)', value: '128 B (64 de 512 cores / 183 S&H)' },
          { label: 'VSRAM (Scroll)', value: '80 B (20 seções de rolagem vertical)' },
          { label: 'Áudio Embutido', value: 'Integra o chip SN76489 PSG (4ch)' }
        ],
        detail:
          'Seg. Copetti & Plutiedev: Opera a ~13.4 MHz renderizando 2 planos de fundo roláveis (Plane A e Plane B), 1 plano fixo (Window) e até 80 sprites (20 por linha), com unidade de DMA de 3 modos (68k→VDP, VRAM Fill e VRAM Copy) e o gerador de som SN76489 PSG integrado na mesma pastilha.'
      },
      {
        id: 'mcd-z80',
        title: 'Zilog Z80 (8 KB) + Yamaha YM2612',
        spec: '~3.58 MHz • Bus de Áudio Dedicado',
        subSpec: 'YM2612 (6ch FM / PCM) + SN76489 (4ch PSG)',
        category: 'audio',
        simpleRole: 'O processador auxiliar dedicado à música: trabalha sozinho regendo o sintetizador FM Yamaha YM2612 e o PSG.',
        metrics: [
          { label: 'CPU de Áudio', value: 'Zilog Z80 @ 3.58 MHz (ALU 4-bit)' },
          { label: 'RAM do Z80', value: '8 KB SRAM ($A00000 no 68k)' },
          { label: 'Sintetizador FM', value: 'Yamaha YM2612 (6 Canais × 4 Op.)' },
          { label: 'Canal 6 DAC + PSG', value: 'Ch6 8-bit PCM + 4ch SN76489 PSG' }
        ],
        detail:
          'Seg. Copetti & Plutiedev: O Yamaha YM2612 reside fisicamente no barramento do Z80 (`$4000–$4003` no Z80 / `$A04000` no 68k). O Z80 executa o driver musical (como o GEMS) nos seus 8 KB de RAM, disparando notas FM, amostras PCM de 8 bits no Canal 6 do YM2612 e efeitos nos 4 canais do PSG.'
      },
      {
        id: 'mcd-asic',
        title: 'Gate Array / ASIC (315-5477)',
        spec: 'Rotação/Escala + 16 Comm Ports',
        subSpec: 'Regs $A12000–$A1202E + IRQ2 + Tiles 8×8',
        category: 'gpu',
        simpleRole: 'Chip especial do Mega-CD que gira imagens em 3D (estilo Mode 7), converte em blocos pro VDP e contém as 16 portas de conversa entre as CPUs.',
        metrics: [
          { label: 'Chip Custom', value: 'Sega Gate Array ASIC (315-5477)' },
          { label: 'Comm Ports', value: '8 Cmd ($A12010) + 8 Status ($A12020)' },
          { label: 'Efeitos Gráficos', value: 'Rotação, Escala e Perspectiva Afim' },
          { label: 'Saída Formatada', value: 'Converte Stamp Map → Tiles 8×8 VDP' }
        ],
        detail:
          'Seg. Plutiedev & Copetti: O Gate Array (ASIC) do Mega-CD cumpre duas funções vitais: (1) fornece os registradores de controle (`$A12000`), interrupção `IRQ2` e as 16 portas de 16 bits (`$A12010–$A1202E`) para comunicação entre os dois 68000; e (2) realiza rotação e escala por hardware na Word RAM já entregando o resultado fatiado em tiles 8×8 para o VDP.'
      },
      {
        id: 'mcd-wordram',
        title: 'Word RAM Compartilhada',
        spec: '256 KB DRAM Dual-Bank ($600000)',
        subSpec: 'Modo 2M (256KB) ou 1M/1M (2× 128KB Swap)',
        category: 'ram',
        simpleRole: 'As duas bancadas giratórias de 128 KB onde o Mega-CD deixa os gráficos prontos e o Mega Drive pega instantaneamente sem fila.',
        metrics: [
          { label: 'Capacidade', value: '256 KB DRAM (Mapeada em $600000)' },
          { label: 'Modo 2M', value: '1 Bloco único de 256 KB (1 CPU por vez)' },
          { label: 'Modo 1M / 1M', value: '2 Bancos de 128 KB (Bank Swap)' },
          { label: 'Controle', value: 'Reg. $A12002 (CdMemCtrl)' }
        ],
        detail:
          'Seg. Plutiedev: Ponte de memória entre o Mega-CD e o Mega Drive controlada pelo registrador `$A12002`. No modo 1M/1M, a Sub-CPU/ASIC renderiza em um banco de 128 KB enquanto o Main-CPU envia o outro banco de 128 KB via DMA para o VDP.'
      },
      {
        id: 'mcd-subcpu',
        title: 'Sub-CPU: 2º 68000 + BIOS/BRAM',
        spec: '12.5 MHz CISC + 128KB BIOS + 8KB BRAM',
        subSpec: '63% mais rápido • Controla CDC, ASIC e PCM',
        category: 'cpu',
        simpleRole: 'O segundo cérebro completo que vive dentro do Mega-CD: é 63% mais rápido que o do Mega Drive e traz BIOS e memória de Save!',
        metrics: [
          { label: 'Clock', value: '12.5 MHz (+63% mais rápido que a base)' },
          { label: 'Sub-BIOS ROM', value: '128 KB Boot ROM ($400000)' },
          { label: 'Backup RAM', value: '8 KB BRAM Interna p/ Saves' },
          { label: 'Interrupções', value: 'Recebe IRQ2 do Main-CPU ($A12000)' }
        ],
        detail:
          'Seg. Plutiedev & Copetti: Segundo processador Motorola 68000 completo operando a 12.5 MHz. Possui acesso exclusivo aos 512 KB de PRG-RAM, à BIOS de 128 KB, aos 8 KB de BRAM para salvar jogos, ao controlador de CD (CDC LC8951) e ao chip de áudio Ricoh PCM.'
      },
      {
        id: 'mcd-prgram',
        title: 'Program RAM (PRG-RAM)',
        spec: '512 KB DRAM Exclusiva (4× 128 KB)',
        subSpec: 'Memória da Sub-CPU de 12.5 MHz',
        category: 'ram',
        simpleRole: 'A mesa de trabalho gigante de 512 KB exclusiva do Mega-CD (8 vezes maior que a do Mega Drive).',
        metrics: [
          { label: 'Capacidade', value: '512 KB DRAM (8× maior que a base)' },
          { label: 'Janela Main-CPU', value: '128 KB paginados em $420000' },
          { label: 'Acesso CDC DMA', value: 'Recebe setores direto do chip LC8951' },
          { label: 'Uso Principal', value: 'Código Sub-CPU, Buffer FMV e Áudio' }
        ],
        detail:
          'Seg. Plutiedev: Memória principal da Sub-CPU de 12.5 MHz. Quando a Sub-CPU está em BusReq, o Main-CPU também pode acessar a PRG-RAM através de uma janela bancada de 128 KB no endereço `$420000`.'
      },
      {
        id: 'mcd-drive',
        title: 'CD-ROM (1x) + CDC Sanyo LC8951',
        spec: '150 KB/s + CDC 16 KB Cache Buffer',
        subSpec: 'DMA p/ PRG-RAM, Word RAM ou PCM + CD-DA',
        category: 'cd',
        simpleRole: 'O leitor óptico de 650 MB acompanhado do chip controlador CDC Sanyo LC8951 que distribui os dados sem pesar na CPU.',
        metrics: [
          { label: 'Velocidade', value: '1x CLV (150 KB por segundo)' },
          { label: 'Controlador CDC', value: 'Sanyo LC8951 + 16 KB Buffer SRAM' },
          { label: 'Destinos DMA CDC', value: 'PRG-RAM, Word RAM ou PCM Wave RAM' },
          { label: 'Áudio Óptico', value: 'Streaming Red Book CD-DA Estéreo' }
        ],
        detail:
          'Seg. Copetti & RetroReversing: A unidade óptica de 1x é gerenciada pelo controlador Sanyo LC8951 (CDC) com 16 KB de cache para correção de erros EDC/ECC, capaz de transferir setores por DMA diretamente para a PRG-RAM, Word RAM ou PCM RAM.'
      },
      {
        id: 'mcd-pcm',
        title: 'Áudio Mega-CD: Ricoh RF5C164',
        spec: '8 Canais PCM + 64 KB Wave RAM',
        subSpec: 'Controlado pela Sub-CPU + Mixagem CD-DA',
        category: 'audio',
        simpleRole: 'Chip de som digital do Mega-CD com 8 canais e 64 KB próprios para tocar instrumentos gravados, vozes e cobrir loops do CD.',
        metrics: [
          { label: 'Chip de Som', value: 'Ricoh RF5C164 (8 Canais PCM 8-bit)' },
          { label: 'Wave RAM', value: '64 KB SRAM Dedicada (Bancos de 4 KB)' },
          { label: 'Taxa de Amostragem', value: 'Até 32.5 kHz c/ Panning Estéreo' },
          { label: 'Total do Sistema', value: '18 Canais (8 PCM + 6 FM + 4 PSG) + CD' }
        ],
        detail:
          'Seg. Copetti: Alimentado pela Sub-CPU de 12.5 MHz (ou via DMA do CDC LC8951), adiciona 8 canais de samples digitais com 64 KB próprios. Em Sonic CD, era usado para tocar trechos de preenchimento enquanto o laser 1x voltava ao início da faixa de música!'
      }
    ]
  },

  ps1: {
    id: 'ps1',
    shortName: 'Sony PlayStation',
    name: 'Sony PlayStation — SCPH-1000 (1994)',
    subtitle: 'SoC CXD8530BQ (R3000A + GTE + MDEC + 1KB SRAM) • Main Bus 32b (7x DMA) • BIU Sub Bus (BIOS/SIO/Timers)',
    year: '1994',
    sources: [
      { label: 'Copetti — PlayStation (PT-BR)', url: 'https://www.copetti.org/pt-br/writings/consoles/playstation/' },
      { label: 'RetroReversing — PS1 Architecture', url: 'https://www.retroreversing.com/ps1' },
      { label: 'Nocash PSX-SPX Specifications', url: 'https://problemkaputt.de/psx-spx.htm' }
    ],
    simulationSteps: [
      {
        step: 0,
        shortTitle: 'Visão Geral',
        title: 'Arquitetura Completa: Os 4 Pilares Centrais da Placa-Mãe do PlayStation',
        summary:
          'No Passo 0 vemos os 4 pilares da arquitetura segundo Copetti, RetroReversing e Nocash PSX-SPX: o SoC Sony CXD8530BQ (R3000A + CP0 + GTE + MDEC + 4KB I-Cache + 1KB Scratchpad), os 2 MB de EDO DRAM, o Main Bus de 32 bits com 7 canais de DMA e a Ponte BIU (com 512 KB BIOS, 3 Timers e SIO0/PIO).',
        simpleAnalogy:
          'A Sony organizou a casa em 4 partes: um Super-Prédio (SoC) onde moram o Cérebro, o Engenheiro 3D, o Projetor de Cinema e um Bloco de Notas; uma Mesa Grande de 2 MB; uma Avenida Expressa de 7 pistas (DMA) e um Pedágio (Ponte BIU com BIOS e Controles).',
        flowSteps: [
          {
            nodeId: 'ps1-cpu',
            tag: '1. SoC Sony CXD8530BQ (33.8688 MHz)',
            iconType: 'code',
            text: 'Integra na mesma pastilha o núcleo MIPS R3000A (com CP0), COP2 GTE (3D), MDEC (FMV), 4 KB I-Cache e 1 KB Scratchpad SRAM.'
          },
          {
            nodeId: 'ps1-ram',
            tag: '2. Main RAM: 2 MB EDO DRAM',
            iconType: 'code',
            text: 'Memória principal de baixa latência (4× 512 KB) onde ficam os 64 KB do Kernel (PlayStation OS), o código do jogo e as Ordering Tables.'
          },
          {
            nodeId: 'ps1-dma',
            tag: '3. Main Bus (32-bit @ 132 MB/s) & 7 Canais DMA',
            iconType: 'code',
            text: 'Controlador com 7 canais (Ch0 MDEC In, Ch1 MDEC Out, Ch2 GPU, Ch3 CD, Ch4 SPU, Ch5 PIO e Ch6 OTC) que assume posse exclusiva do bus.'
          },
          {
            nodeId: 'ps1-biu',
            tag: '4. Ponte BIU & Sub Bus (BIOS 512KB + Timers + SIO0)',
            iconType: 'code',
            text: 'Isola o Sub Bus de 16/8 bits: abriga a BIOS ROM de 512 KB (`0xBFC00000`), 3 Root Counters (Timers 0–2), portas SIO0 (Controles/Memory Card 128 KB), CD e SPU.'
          }
        ],
        insight:
          'Seg. Copetti & PSX-SPX: No boot em `0xBFC00000`, a CPU lê a BIOS de 512 KB pelo Sub Bus (8-bit) e copia 64 KB do Kernel (PlayStation OS) para os 2 MB de EDO DRAM para rodar em 32 bits sem lentidão!',
        speechSimple:
          '"Chegamos ao PlayStation de 1994! Aqui vemos os 4 blocos centrais: no alto à esquerda está o super-chip da Sony que junta o processador, o calculador 3D, o projetor de vídeos e um bloquinho de notas de 1 KB; ao lado estão os 2 MB de memória principal; no meio passa a avenida expressa de 7 canais DMA; e abaixo fica a ponte BIU com a BIOS de 512 KB, os Timers e as portas de Controle e Memory Card!"',
        speechTech:
          '"Na visão geral do PS1 segundo Copetti, RetroReversing e Nocash PSX-SPX, destacam-se 4 blocos: o SoC Sony CXD8530BQ a 33.8688 MHz (R3000A, CP0, GTE, MDEC, 4 KB I-Cache e 1 KB Scratchpad), os 2 MB de EDO DRAM, o Main Bus de 32 bits gerenciado por 7 canais de DMA (Ch0 a Ch6) e a ponte BIU que conecta a BIOS de 512 KB, os 3 Root Counters e o barramento serial SIO0."',
        activeNodes: ['ps1-cpu', 'ps1-ram', 'ps1-dma', 'ps1-biu'],
        activeBuses: [],
        packets: []
      },
      {
        step: 1,
        shortTitle: 'CD 2x & Sub Bus',
        title: 'Subsistema de CD-ROM (2x — 300 KB/s: DSP + 68HC05 + CXD1815Q + 32 KB) → Ponte BIU',
        summary:
          'O subsistema de CD funciona como um computador independente (DSP + Sub-CPU Motorola 68HC05 + Controlador CXD1815Q + 32 KB SRAM): valida o Wobble Groove (SCEx) do disco preto, lê setores a 300 KB/s e entrega à ponte BIU no Sub Bus.',
        simpleAnalogy:
          'Para que o leitor de CD não atrapalhe a avenida expressa de 32 bits, ele trabalha numa "rua marginal" (Sub Bus) com seu próprio computador interno, confere se o disco preto é original e deixa os dados prontos no pedágio (ponte BIU).',
        flowSteps: [
          {
            nodeId: 'ps1-cd',
            tag: '1. Subsistema CD: DSP + Sub-CPU Motorola 68HC05',
            iconType: 'disc',
            text: 'O microcontrolador 68HC05 (16 KB ROM + 512 B RAM) comanda o DSP do laser e valida a frequência Wobble Groove (SCEA/SCEE/SCEI) e subcanais LibCrypt.'
          },
          {
            nodeId: 'ps1-cd',
            tag: '2. Controlador CXD1815Q (2x — 300 KB/s) + 32 KB SRAM',
            iconType: 'disc',
            text: 'Lê os setores do CD no dobro da velocidade (300 KB/s), corrige erros e armazena no buffer local de 32 KB SRAM.'
          },
          {
            nodeId: 'ps1-biu',
            tag: '3. Ponte BIU & Sub Bus (16/8-bit)',
            iconType: 'code',
            text: 'Recebe a fila de dados e interrupções do controlador de CD no Sub Bus sem bloquear o Main Bus de 32 bits.'
          }
        ],
        insight:
          'Seg. Copetti & PSX-SPX: O bloco de CD é um computador separado vivendo dentro do PS1 (composto por DSP, Sub-CPU 68HC05, Controlador CXD1815Q e 32 KB SRAM) que aplica a trava anti-pirataria independentemente da CPU principal!',
        speechSimple:
          '"Vejam os blocos ativos lá embaixo: o leitor de CD do PlayStation tem um computador próprio com 4 partes internas que confere a ondulação secreta nos famosos CDs pretos, lê os dados a 300 KB por segundo para sua memória de 32 KB e entrega na ponte BIU!"',
        speechTech:
          '"No Sub Bus atuam o Subsistema de CD-ROM 2x e a Ponte BIU: a Sub-CPU Motorola 68HC05 (16 KB ROM) controla o DSP óptico e valida o Wobble Groove (SCEx), enquanto o decodificador CXD1815Q armazena setores a 300 KB/s nos 32 KB de SRAM e aciona a BIU."',
        activeNodes: ['ps1-cd', 'ps1-biu'],
        activeBuses: ['bus-ps1-cd-sub'],
        packets: [
          {
            pathId: 'path-ps1-cd-sub',
            color: '#f97316',
            type: 'disc',
            label: '300 KB/s (CD 2x)',
            badgeX: 605,
            badgeY: 398
          }
        ]
      },
      {
        step: 2,
        shortTitle: 'DMA Assume o Bus',
        title: 'Caminho Completo do Loading: Os 5 Componentes Ativos no DMA Canal 3',
        summary:
          'Aqui 5 componentes funcionam ao mesmo tempo: os dados saem dos 32 KB do CD, atravessam a ponte BIU, o DMA Canal 3 assume a avenida principal a 132 MB/s para abastecer os 2 MB de EDO RAM e a CPU continua trabalhando na Scratchpad de 1 KB!',
        simpleAnalogy:
          'Enquanto o trem expresso (DMA Ch3) leva a carga do CD, passa pelo pedágio (BIU) e fecha a avenida principal para encher a mesa de 2 MB (RAM), o Cérebro (CPU) não fica parado: ele continua fazendo contas no seu bloquinho de bolso de 1 KB (Scratchpad)!',
        flowSteps: [
          {
            nodeId: 'ps1-cd',
            tag: '1. Subsistema CD-ROM (Buffer 32 KB SRAM)',
            iconType: 'disc',
            text: 'Entrega o lote de setores da fase, texturas e modelos 3D que já estavam prontos no buffer de 32 KB do controlador CXD1815Q.'
          },
          {
            nodeId: 'ps1-biu',
            tag: '2. Ponte BIU (Sub Bus → Main Bus)',
            iconType: 'code',
            text: 'Abre a ponte permitindo que os dados cruzem do Sub Bus (16/8-bit) para o Main Bus (32-bit).'
          },
          {
            nodeId: 'ps1-dma',
            tag: '3. Main Bus & DMA (Canal 3 Assume o Bus)',
            iconType: 'code',
            text: 'O DMA Ch3 interdita a avenida principal para copiar os dados em rajadas ultrarrápidas de até 132 MB/s (33.87 MHz × 32 bits).'
          },
          {
            nodeId: 'ps1-ram',
            tag: '4. Main RAM: 2 MB EDO DRAM',
            iconType: 'code',
            text: 'Recebe diretamente do DMA todos os arquivos da fase, objetos 3D e texturas sem passar pela CPU.'
          },
          {
            nodeId: 'ps1-cpu',
            tag: '5. SoC Sony (CPU na Scratchpad 1 KB @ 0x1F800000)',
            iconType: 'code',
            text: 'Impedida de usar a RAM durante o DMA, a CPU continua rodando código no I-Cache (4 KB) e operando dados na Scratchpad (1 KB)!'
          }
        ],
        insight:
          'Seg. Copetti ("Taking over the CPU") & PSX-SPX: Como a Scratchpad de 1 KB (`0x1F800000`) fica dentro do chip CXD8530BQ, a CPU pode calcular matrizes e física nela com zero espera enquanto o DMA ocupa o Main Bus!',
        speechSimple:
          '"Olhem os 5 componentes trabalhando juntos neste passo: 1º, o leitor de CD libera os dados; 2º, eles cruzam a ponte BIU; 3º, o DMA Canal 3 fecha a avenida principal a 132 MB/s; 4º, os dados enchem a memória principal de 2 MB; e 5º, como a avenida está fechada, a CPU continua trabalhando lá dentro do seu bloquinho de notas de 1 KB (Scratchpad)!"',
        speechTech:
          '"Aqui vemos os 5 blocos descritos por Copetti em Taking over the CPU: os setores saem do buffer de 32 KB do CD (1), atravessam a ponte BIU (2) e o DMA Canal 3 assume posse exclusiva do Main Bus a 132 MB/s (3) para gravar nos 2 MB de EDO DRAM (4), enquanto a CPU continua executando dentro do I-Cache (4 KB) e da Scratchpad de 1 KB em `0x1F800000` (5)!"',
        activeNodes: ['ps1-cd', 'ps1-biu', 'ps1-dma', 'ps1-ram', 'ps1-cpu'],
        activeBuses: ['bus-ps1-cd-sub', 'bus-ps1-biu-dma', 'bus-ps1-dma-ram'],
        packets: [
          {
            pathId: 'path-ps1-cd-sub',
            color: '#f97316',
            type: 'disc',
            label: '1. Setores CD 2x',
            badgeX: 605,
            badgeY: 398
          },
          {
            pathId: 'path-ps1-biu-dma',
            color: '#f59e0b',
            type: 'code',
            label: '2. Pedido DMA Ch3',
            badgeX: 405,
            badgeY: 350
          },
          {
            pathId: 'path-ps1-dma-ram',
            color: '#10b981',
            type: 'code',
            label: '3. 132 MB/s -> RAM',
            badgeX: 500,
            badgeY: 220
          }
        ]
      },
      {
        step: 3,
        shortTitle: 'Vídeo FMV (MDEC)',
        title: 'Cinema Completo (Copetti & PSX-SPX): EDO RAM ↔ DMA (Ch0, Ch1 e Ch2) ↔ MDEC → GPU (1 MB VRAM)',
        summary:
          'Segundo Copetti e Nocash PSX-SPX, o vídeo FMV percorre 4 blocos e 3 canais de DMA: a CPU desfaz o Huffman na EDO RAM, o DMA Ch0 leva os blocos ao MDEC, o DMA Ch1 devolve as tiras RGB prontas à RAM e o DMA Ch2 transfere para o Framebuffer de 24 bits na VRAM da GPU!',
        simpleAnalogy:
          'O filme passa por 4 estações: sai da mesa de 2 MB (RAM), pega o trem de ida (DMA 0) até o "projetor de cinema" (MDEC) que abre a imagem em 16,7 milhões de cores, volta pelo trem (DMA 1) e segue pelo trem de vídeo (DMA 2) direto para a tela da GPU!',
        flowSteps: [
          {
            nodeId: 'ps1-ram',
            tag: '1. Main RAM: 2 MB EDO (Frame STR + Huffman)',
            iconType: 'video',
            text: 'Recebe o quadro STR do CD (via DMA Ch3); a CPU descompacta a camada Huffman em blocos RLE na RAM.'
          },
          {
            nodeId: 'ps1-dma',
            tag: '2. Main Bus & DMA (Ch0 MDEC.In & Ch1 MDEC.Out)',
            iconType: 'video',
            text: 'O DMA Canal 0 envia os macroblocos comprimidos ao MDEC e o DMA Canal 1 devolve tiras de 16×240 pixels RGB para a RAM.'
          },
          {
            nodeId: 'ps1-cpu',
            tag: '3. SoC Sony: Descompressor MDEC (IDCT + YCbCr→RGB)',
            iconType: 'video',
            text: 'Aplica transformada inversa de cosseno (IDCT) e conversão de cor em 9.000 macroblocos/s (30 fps em 24-bit True Color).'
          },
          {
            nodeId: 'ps1-gpu',
            tag: '4. Sony GPU + 1 MB VRAM (DMA Ch2 → Framebuffer 24-bit)',
            iconType: 'video',
            text: 'O DMA Canal 2 copia as tiras decodificadas para o Framebuffer na VRAM (1 MB), e o Video Encoder (DAC) exibe o filme na TV!'
          }
        ],
        insight:
          'Seg. Copetti & Nocash PSX-SPX: O pipeline de FMV usa 3 canais de DMA em cadeia (DMA0 RAM→MDEC, DMA1 MDEC→RAM em tiras de 16×240 e DMA2 RAM→GPU VRAM), permitindo exibir vídeos em 24 bits (16,7 milhões de cores) enquanto o resto da VRAM guarda texturas de 16 bits!',
        speechSimple:
          '"Vejam os 4 componentes do cinema em tela cheia: 1º, o quadro do filme sai da memória de 2 MB; 2º, viaja pelo DMA Canal 0 até o chip MDEC dentro do processador; 3º, o MDEC abre a imagem em 16,7 milhões de cores a 30 quadros por segundo e devolve pelo DMA Canal 1; e 4º, o DMA Canal 2 leva o quadro pronto para o 1 MB de VRAM da GPU mostrar na TV!"',
        speechTech:
          '"Conforme detalhado por Copetti e Nocash PSX-SPX, o pipeline FMV aciona 4 blocos: a CPU desfaz o Huffman na EDO DRAM (1), o DMA Ch0 alimenta o MDEC no SoC (2), o MDEC executa IDCT e conversão YCbCr→RGB 24-bit a 9.000 macroblocos/s devolvendo via DMA Ch1 (3), e o DMA Ch2 transfere as tiras para o Framebuffer de 1 MB da GPU (4)."',
        activeNodes: ['ps1-ram', 'ps1-dma', 'ps1-cpu', 'ps1-gpu'],
        activeBuses: ['bus-ps1-ram-dma', 'bus-ps1-dma-cpu', 'bus-ps1-dma-gpu'],
        packets: [
          {
            pathId: 'path-ps1-ram-dma',
            color: '#10b981',
            type: 'video',
            label: '1. DMA Ch0 (STR/RLE)',
            badgeX: 500,
            badgeY: 220
          },
          {
            pathId: 'path-ps1-dma-cpu',
            color: '#ec4899',
            type: 'video',
            label: '2. MDEC IDCT + Ch1',
            badgeX: 205,
            badgeY: 261
          },
          {
            pathId: 'path-ps1-dma-gpu',
            color: '#38bdf8',
            type: 'video',
            label: '3. DMA Ch2 -> VRAM 24b',
            badgeX: 800,
            badgeY: 232
          }
        ]
      },
      {
        step: 4,
        shortTitle: 'Pipeline 3D & SPU',
        title: 'Gráficos 3D e Áudio Final: Os 5 Componentes Ativos em Paralelo (GTE, OTC/RAM, DMA, GPU e SPU)',
        summary:
          'No passo final 5 componentes trabalham juntos: o DMA Ch6 (OTC) limpa a Ordering Table na RAM, o GTE projeta os vértices 3D, o DMA Ch2 envia a lista encadeada para a GPU desenhar no seu 1 MB de VRAM (Dual-Port/SGRAM) e o DMA Ch4 abastece a SPU de 24 canais!',
        simpleAnalogy:
          'É o gran finale com 5 peças trabalhando juntas: o Engenheiro 3D (GTE) calcula os objetos, organiza do mais longe ao mais perto na Mesa (RAM), o Trem Expresso (DMA) leva os desenhos para a Placa de Vídeo (GPU) mostrar na TV e leva os sons para o Estúdio de Áudio (SPU)!',
        flowSteps: [
          {
            nodeId: 'ps1-cpu',
            tag: '1. SoC Sony (CPU + Coprocessador COP2: GTE)',
            iconType: 'image',
            text: 'O GTE projeta até 1,5 milhão de vértices 3D/s em ponto fixo (66 MIPS), calculando perspectiva, iluminação e coordenada Z.'
          },
          {
            nodeId: 'ps1-ram',
            tag: '2. Main RAM: 2 MB EDO (Ordering Table + DMA Ch6 OTC)',
            iconType: 'code',
            text: 'O DMA Canal 6 (OTC) limpa a tabela em hardware e a RAM encadeia os polígonos de trás para frente (substituindo o Z-Buffer).'
          },
          {
            nodeId: 'ps1-dma',
            tag: '3. Main Bus & DMA (Ch2 Linked-List GPU & Ch4 SPU)',
            iconType: 'code',
            text: 'O DMA Canal 2 percorre sozinho a lista encadeada (Ordering Table) enviando pacotes à GPU, e o DMA Canal 4 transfere áudio à SPU.'
          },
          {
            nodeId: 'ps1-gpu',
            tag: '4. Sony GPU + 1 MB VRAM (1024×512 + Video Encoder)',
            iconType: 'image',
            text: 'Rasteriza polígonos (360k flat / 180k texturizados/s) com Page-Flipping e 2 KB Tex Cache; sem sub-pixel e c/ mapeamento afim.'
          },
          {
            nodeId: 'ps1-spu',
            tag: '5. SPU (24 Canais ADPCM + 512 KB DRAM + CD-XA)',
            iconType: 'audio',
            text: 'Toca 24 vozes a 44.1 kHz (com Pitch Modulation, FM, ADSR e Reverb) nos seus 512 KB e mixa áudio XA-ADPCM direto do CD!'
          }
        ],
        insight:
          'Seg. Copetti & PSX-SPX: O PS1 tem um canal de DMA exclusivo (Canal 6 — OTC) cuja única função é limpar a Ordering Table de trás para frente na RAM! Depois, o DMA Canal 2 no modo Linked-List caminha pelos ponteiros da tabela enviando os polígonos à GPU sem usar a CPU.',
        speechSimple:
          '"Para fechar com chave de ouro, vejam todas as 5 peças trabalhando juntas: 1º, o motor GTE calcula o 3D; 2º, a memória RAM organiza os objetos do mais distante ao mais próximo numa lista limpa pelo DMA 6; 3º, o DMA dispara os gráficos pela linha azul e o som pela linha roxa; 4º, a placa de vídeo GPU desenha tudo no seu 1 MB de memória; e 5º, o chip SPU toca 24 canais de som com qualidade de CD!"',
        speechTech:
          '"Neste último passo atuam 5 subsistemas segundo Copetti e PSX-SPX: (1) o GTE calcula as matrizes 3D em ponto fixo; (2) a EDO DRAM armazena a Ordering Table inicializada pelo DMA Ch6 (OTC); (3) o DMA Ch2 (em Linked-List mode) e o DMA Ch4 transferem os pacotes gráficos e sonoros; (4) a GPU rasteriza os polígonos e texturas CLUT no seu 1 MB de VRAM (1024×512); e (5) a SPU processa 24 canais ADPCM nos seus 512 KB de DRAM."',
        activeNodes: ['ps1-cpu', 'ps1-ram', 'ps1-dma', 'ps1-gpu', 'ps1-spu'],
        activeBuses: ['bus-ps1-cpu-dma', 'bus-ps1-ram-dma', 'bus-ps1-dma-gpu', 'bus-ps1-dma-spu'],
        packets: [
          {
            pathId: 'path-ps1-ram-dma',
            color: '#10b981',
            type: 'image',
            label: '1. Ordering Table (Ch6/Ch2)',
            badgeX: 500,
            badgeY: 220
          },
          {
            pathId: 'path-ps1-dma-gpu',
            color: '#38bdf8',
            type: 'image',
            label: '2. DMA Ch2 -> GPU 3D',
            badgeX: 800,
            badgeY: 232
          },
          {
            pathId: 'path-ps1-dma-spu',
            color: '#a855f7',
            type: 'audio',
            label: '3. DMA Ch4 -> SPU',
            badgeX: 315,
            badgeY: 398
          }
        ]
      }
    ],
    components: [
      {
        id: 'ps1-cpu',
        title: 'SoC Sony CXD8530BQ',
        spec: '33.8688 MHz • CW33300 (R3000A)',
        subSpec: 'CPU + CP0 + GTE (COP2) + MDEC + 1KB SRAM',
        category: 'cpu',
        simpleRole: 'O super-chip principal: reúne na mesma peça o Cérebro (CPU), o Calculador 3D (GTE), o Projetor de Filmes (MDEC), 4 KB de Cache e 1 KB de bloco de notas.',
        metrics: [
          { label: 'Núcleo RISC', value: 'LSI CW33300 (MIPS R3000A + CP0)' },
          { label: 'Motor 3D (GTE)', value: 'COP2 @ 66 MIPS (1,5M vértices/s)' },
          { label: 'Vídeo (MDEC)', value: 'IDCT + YCbCr→RGB (9.000 blocos/s)' },
          { label: 'Memória Interna', value: '4 KB I-Cache + 1 KB Scratchpad SRAM' }
        ],
        detail:
          'Seg. Copetti, RetroReversing & PSX-SPX: Chip customizado pela LSI Logic que integra na mesma pastilha o núcleo MIPS R3000A de 32 bits (33.8688 MHz), o coprocessador de sistema CP0 (exceções/cache), o motor geométrico GTE (COP2 em ponto fixo), o descompressor de vídeo MDEC, 4 KB de Instruction Cache e 1 KB de Scratchpad Data SRAM (`0x1F800000`, livre durante transferências DMA).'
      },
      {
        id: 'ps1-dma',
        title: 'Main Bus & DMA (7 Canais: Ch0–Ch6)',
        spec: '32-bit @ 132 MB/s (Assíncrono)',
        subSpec: 'Ch0/1 MDEC • Ch2 GPU • Ch3 CD • Ch4 SPU • Ch5 PIO • Ch6 OTC',
        category: 'storage',
        simpleRole: 'A avenida expressa de 7 pistas que transporta dados a 132 MB/s entre o CD, a memória, o vídeo, o som e limpa a lista 3D.',
        metrics: [
          { label: 'Largura / Taxa', value: '32 bits @ 132 MB/s (33.87 MHz)' },
          { label: 'Canais 0 a 3', value: 'Ch0/1: MDEC • Ch2: GPU • Ch3: CD' },
          { label: 'Canais 4 a 6', value: 'Ch4: SPU • Ch5: PIO • Ch6: OTC (3D)' },
          { label: 'Modos de Operação', value: 'Burst, Slice e Linked-List (Ch2)' }
        ],
        detail:
          'Seg. Copetti & Nocash PSX-SPX: Possui 7 canais dedicados (`0x1F801080–0x1F8010F4`): Ch0 (MDEC In), Ch1 (MDEC Out), Ch2 (GPU Linked-List + VRAM), Ch3 (CD-ROM), Ch4 (SPU), Ch5 (Porta Paralela PIO) e Ch6 (OTC — Ordering Table Clear, que inicializa a tabela de ordenação 3D na RAM por hardware). Ao operar, assume o Main Bus impedindo a CPU de acessar a EDO DRAM.'
      },
      {
        id: 'ps1-ram',
        title: 'Main RAM: 2 MB EDO DRAM',
        spec: '4× 512 KB Chips EDO (32-bit Bus)',
        subSpec: '64 KB Kernel OS + Jogo + Ordering Tables',
        category: 'ram',
        simpleRole: 'A mesa principal de trabalho de 2 Megabytes onde ficam o sistema operacional (64 KB), a fase atual e a fila de distância dos polígonos.',
        metrics: [
          { label: 'Capacidade', value: '2 MB EDO DRAM (Mapeada em 0x00000000)' },
          { label: 'PlayStation OS', value: '64 KB reservados p/ o Kernel da BIOS' },
          { label: 'Ordering Table', value: 'Lista encadeada Z-Sort (limpa pelo Ch6)' },
          { label: 'Acesso DMA', value: '1 Ciclo por Word (132 MB/s pico)' }
        ],
        detail:
          'Seg. Copetti: A Sony escolheu chips EDO (Extended Data Out) DRAM de menor latência no Main Bus de 32 bits. Armazena os 64 KB do Kernel copiados da BIOS durante o boot, o executável do jogo, os buffers de vídeo FMV e as Ordering Tables.'
      },
      {
        id: 'ps1-biu',
        title: 'Ponte BIU, BIOS, Timers & SIO0',
        spec: 'Main Bus 32b ↔ Sub Bus 16/8b',
        subSpec: 'BIOS 512KB + 3 Root Counters + SIO0/SIO1/PIO',
        category: 'storage',
        simpleRole: 'O "pedágio inteligente" que liga o barramento rápido às peças de apoio: a BIOS de 512 KB, os 3 relógios (Timers) e as portas de Controle e Memory Card.',
        metrics: [
          { label: 'BIOS ROM', value: '512 KB ROM (8-bit @ 0xBFC00000)' },
          { label: '3 Root Counters', value: 'Timer 0 (Dot), Timer 1 (HBlank), Timer 2 (Sys/8)' },
          { label: 'Portas Frontais', value: 'SIO0 Serial (2× Controles + 2× MemCard 128KB)' },
          { label: 'Portas Traseiras', value: 'SIO1 (Link Cable) + PIO (Paralela 8-bit)' }
        ],
        detail:
          'Seg. Copetti & Nocash PSX-SPX: A Bus Interface Unit (BIU) isola o Sub Bus de 16/8 bits e gerencia o acesso à BIOS ROM de 512 KB (que contém o boot, a Shell e o Kernel), aos 3 contadores de tempo (Root Counters 0, 1 e 2), à interface serial SIO0 (que conversa com os Controles e os Memory Cards EEPROM de 128 KB a 250 kHz), à porta serial SIO1 e à paralela PIO.'
      },
      {
        id: 'ps1-gpu',
        title: 'Sony GPU + 1 MB VRAM + RGB DAC',
        spec: 'Grade 1024×512 (Dual-Port VRAM / SGRAM)',
        subSpec: '2KB Tex Cache • Page-Flipping • Sem Z-Buffer',
        category: 'gpu',
        simpleRole: 'A placa de vídeo que desenha os polígonos 3D em um grande quadro de 1 MB (com dois buffers de tela, texturas e paletas CLUT) e envia para a TV.',
        metrics: [
          { label: 'VRAM (1 MB)', value: 'Dual-Ported VRAM (2× 16b) → SGRAM (32b)' },
          { label: 'Cache Interno', value: '2 KB Texture Cache + 64B Command FIFO' },
          { label: 'Desempenho 3D', value: '360k Flat / 180k Polígonos Texturizados/s' },
          { label: 'Saída de Vídeo', value: '256×224 a 640×480 (16-bit ou 24-bit RGB)' }
        ],
        detail:
          'Seg. Copetti & PSX-SPX: Enxerga seu 1 MB de memória como uma grade 2D de 1024×512 pixels (16 bpp) onde convivem dois Framebuffers (Page-Flipping), Texture Pages (4/8/15-bit) e tabelas de cores CLUT (além de bitmaps de 24 bpp para FMV). Nos primeiros SCPH-1000 usava Dual-Ported VRAM (permitindo à GPU desenhar enquanto o Video Encoder enviava a imagem à TV), substituída depois por SGRAM de 32 bits.'
      },
      {
        id: 'ps1-spu',
        title: 'SPU (24 Canais ADPCM + 512 KB DRAM)',
        spec: '16-bit @ 44.1 kHz + Reverb Digital',
        subSpec: '508 KB Úteis • Pitch/FM/ADSR • CD-XA Direto',
        category: 'audio',
        simpleRole: 'O estúdio de som com 24 vozes simultâneas em qualidade de CD, modulação FM, eco digital (reverb) e ligação direta com o leitor de CD.',
        metrics: [
          { label: 'Polifonia', value: '24 Canais ADPCM (16-bit @ 44.1 kHz)' },
          { label: 'Sound RAM', value: '512 KB DRAM (508 KB livres + buffer CD/Reverb)' },
          { label: 'Síntese & DSP', value: 'Pitch Mod, Modulação FM, ADSR e Reverb' },
          { label: 'Streaming Direto', value: 'Recebe CD-DA e XA-ADPCM direto do CD' }
        ],
        detail:
          'Seg. Copetti & PSX-SPX: Chip Sony CXD2922Q com 512 KB de DRAM própria (acessível via DMA Ch4). Além de reproduzir 24 canais ADPCM com envelope ADSR e reverberação digital, permite que vozes modulem a frequência de outras (como sintetizador FM) e mistura diretamente o áudio CD-DA e XA-ADPCM vindos do controlador de CD.'
      },
      {
        id: 'ps1-cd',
        title: 'Subsistema CD-ROM 2x (4 Chips Internos)',
        spec: 'DSP + 68HC05 + Controlador CXD1815Q + 32KB',
        subSpec: '300 KB/s (640 MB) • Áudio XA • Wobble SCEx & LibCrypt',
        category: 'cd',
        simpleRole: 'Um computador independente dentro do leitor (com DSP, CPU 68HC05, Controlador e 32 KB RAM) que lê a 300 KB/s e confere a trava dos discos pretos.',
        metrics: [
          { label: 'Sub-CPU do CD', value: 'Motorola MC68HC05 (16 KB ROM + 512 B RAM)' },
          { label: 'Controlador / Buffer', value: 'CXD1815Q Decoder + 32 KB SRAM + DSP' },
          { label: 'Velocidade / Mídia', value: '2x CLV (300 KB/s) • Até 640 MB + CD-XA' },
          { label: 'Anti-Pirataria', value: 'Wobble Groove (SCEA/E/I) + Subcanais LibCrypt' }
        ],
        detail:
          'Seg. Copetti & PSX-SPX: Conforme o diagrama oficial do Subsistema de CD, é composto por 4 blocos internos: (1) DSP óptico (controla motor/laser e sinal RF), (2) Sub-CPU Motorola 68HC05 (16 KB ROM + 512 B RAM, que checa a frequência Wobble Groove SCEx na TOC e subcanais), (3) Controlador de CD CXD1815Q (com DMA próprio p/ RAM e SPU) e (4) 32 KB de SRAM para buffer de setores.'
      }
    ]
  }
};

// ============================================================================
// DICIONÁRIO VISUAL SEM COMPLICAÇÃO (PARA QUEM NÃO É DA ÁREA ENTENDER FÁCIL)
// ============================================================================
const SIMPLE_GLOSSARY = [
  {
    term: 'CPU (Processador)',
    everyday: 'O "Cérebro" ou Chefe da Cozinha',
    desc: 'É quem toma as decisões do jogo: lê qual botão você apertou no controle, calcula se o personagem acertou o inimigo e dá ordens para os outros chips.'
  },
  {
    term: 'CD-ROM (1x ou 2x)',
    everyday: 'Um Depósito Gigante, porém Distante',
    desc: 'Guarda até 650 MB (centenas de vezes mais que uma fita!), mas o laser precisa se mover fisicamente. 1x lê 150 KB por segundo; 2x (no PS1) lê o dobro: 300 KB por segundo.'
  },
  {
    term: 'Memória RAM',
    everyday: 'A Mesa de Trabalho Rápida',
    desc: 'Como o CD é lento, o videogame copia os desenhos e sons da fase atual do CD para cima dessa "mesa" (RAM). Quanto maior a mesa, menos telas de "Loading" o jogo precisa!'
  },
  {
    term: 'VRAM + GPU / VDP',
    everyday: 'O Desenhista e seu Quadro de Pintura',
    desc: 'É o chip artista e a memória exclusiva onde ele monta a imagem que vai aparecer na TV 60 vezes por segundo.'
  },
  {
    term: 'Barramento (Bus) & DMA',
    everyday: 'As Avenidas e o Trem Expresso',
    desc: 'O Barramento é a estrada que liga os chips. O DMA é um "trem expresso" que leva cargas pesadas direto do CD ou da memória para o vídeo sem ocupar o Cérebro (CPU).'
  }
];

const CATEGORY_STYLES = {
  cpu: {
    badge: 'CPU',
    bg: '#172554',
    border: '#3b82f6',
    text: '#93c5fd',
    lightBg: '#eff6ff',
    lightBorder: '#2563eb',
    lightText: '#1d4ed8',
    label: 'Processadores / Coprocessadores'
  },
  ram: {
    badge: 'RAM',
    bg: '#064e3b',
    border: '#10b981',
    text: '#6ee7b7',
    lightBg: '#ecfdf5',
    lightBorder: '#059669',
    lightText: '#047857',
    label: 'Memória RAM / VRAM'
  },
  gpu: {
    badge: 'VÍDEO',
    bg: '#3b0764',
    border: '#a855f7',
    text: '#d8b4fe',
    lightBg: '#faf5ff',
    lightBorder: '#7c3aed',
    lightText: '#6d28d9',
    label: 'Chips Gráficos (VDC / VDP / GPU)'
  },
  audio: {
    badge: 'ÁUDIO',
    bg: '#500724',
    border: '#ec4899',
    text: '#f9a8d4',
    lightBg: '#fdf2f8',
    lightBorder: '#db2777',
    lightText: '#be185d',
    label: 'Subsistema de Som (PSG / FM / SPU)'
  },
  cd: {
    badge: 'CD-ROM',
    bg: '#431407',
    border: '#f97316',
    text: '#fdba74',
    lightBg: '#fff7ed',
    lightBorder: '#ea580c',
    lightText: '#c2410c',
    label: 'Unidade Óptica CD-ROM'
  },
  storage: {
    badge: 'BUS / DMA',
    bg: '#422006',
    border: '#f59e0b',
    text: '#fde047',
    lightBg: '#fefce8',
    lightBorder: '#d97706',
    lightText: '#b45309',
    label: 'Barramentos / DMA / System Card'
  }
};

export default function ArquiteturaConsolesCDROM() {
  const [activeTab, setActiveTab] = useState('ps1');
  const [lightMode, setLightMode] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);
  const [easyMode, setEasyMode] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [simStep, setSimStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [benchPayloadKB, setBenchPayloadKB] = useState(1536);

  const svgRef = useRef(null);
  const currentArch = ARCHITECTURE_DATA[activeTab] || ARCHITECTURE_DATA.ps1;
  const currentSimData = currentArch.simulationSteps[simStep] || currentArch.simulationSteps[0];

  // Auto-play timer
  useEffect(() => {
    if (!isAutoPlaying || activeTab === 'compare' || activeTab === 'script') return;
    const timer = setInterval(() => {
      setSimStep((prev) => (prev + 1) % currentArch.simulationSteps.length);
    }, 5200);
    return () => clearInterval(timer);
  }, [isAutoPlaying, activeTab, currentArch]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setSimStep(0);
    setIsAutoPlaying(false);
    setSelectedNodeId(null);
  }, []);

  const nextStep = useCallback(() => {
    if (activeTab === 'compare' || activeTab === 'script') return;
    setIsAutoPlaying(false);
    setSelectedNodeId(null);
    setSimStep((prev) => (prev + 1) % currentArch.simulationSteps.length);
  }, [activeTab, currentArch]);

  const prevStep = useCallback(() => {
    if (activeTab === 'compare' || activeTab === 'script') return;
    setIsAutoPlaying(false);
    setSelectedNodeId(null);
    setSimStep((prev) => (prev - 1 + currentArch.simulationSteps.length) % currentArch.simulationSteps.length);
  }, [activeTab, currentArch]);

  // Atalhos de Teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsAutoPlaying((prev) => !prev);
      } else if (e.key === '1') {
        handleTabChange('pce');
      } else if (e.key === '2') {
        handleTabChange('megacd');
      } else if (e.key === '3') {
        handleTabChange('ps1');
      } else if (e.key === '4') {
        handleTabChange('compare');
      } else if (e.key === '5') {
        handleTabChange('script');
      } else if (e.key.toLowerCase() === 'p') {
        setPresentationMode((prev) => !prev);
      } else if (e.key.toLowerCase() === 'n') {
        setShowSpeakerNotes((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSelectedNodeId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextStep, prevStep, handleTabChange]);

  const isNodeActive = (id) => {
    if (selectedNodeId === id) return true;
    return currentSimData?.activeNodes?.includes(id);
  };

  const isBusActive = (busId) => {
    return currentSimData?.activeBuses?.includes(busId);
  };

  const selectedComponent = selectedNodeId
    ? currentArch.components?.find((c) => c.id === selectedNodeId)
    : null;

  // Exportar SVG
  const exportSVG = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgRef.current);
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `arquitetura-${activeTab}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Exportar PNG Alta Resolução
  const exportPNG = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgRef.current);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2000;
      canvas.height = 1140;
      const context = canvas.getContext('2d');
      context.fillStyle = lightMode ? '#ffffff' : '#090d16';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const png = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = png;
      downloadLink.download = `diagrama-${activeTab}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobURL);
    };
    image.src = blobURL;
  };

  // ============================================================================
  // RENDERIZADOR UNIFICADO DE BARRAMENTO POR CAMINHO COMPLETO (<path>)
  // Garante que 100% do caminho fique colorido, com seta direcional e fluxo exato!
  // ============================================================================
  const renderBusPath = (busId, d, baseColor, width = 4.5) => {
    const active = isBusActive(busId);
    return (
      <g key={`${busId}-${d}`}>
        {/* Brilho externo em todo o percurso quando ativo */}
        {active && (
          <path
            d={d}
            fill="none"
            stroke="#facc15"
            strokeWidth={width + 6}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.24"
          />
        )}
        {/* Trilha Base colorida de ponta a ponta */}
        <path
          d={d}
          fill="none"
          stroke={active ? baseColor : lightMode ? '#cbd5e1' : '#334155'}
          strokeWidth={width}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={active ? 0.98 : 0.42}
          markerEnd={active ? 'url(#flowArrowActive)' : undefined}
        />
        {/* Corrente Animada seguindo exatamente a direção do fluxo (Início -> Fim) */}
        {active && (
          <path
            d={d}
            fill="none"
            stroke="#fef08a"
            strokeWidth={Math.max(2.5, width - 1.5)}
            strokeDasharray="8 6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-bus-flow"
          />
        )}
      </g>
    );
  };

  // ============================================================================
  // ÍCONES VETORIAIS MINIATURA PARA OS PACOTES ANIMADOS (IMAGEM, VÍDEO, SOM, CD, DADOS)
  // ============================================================================
  const renderMiniSvgIcon = (type) => {
    if (type === 'image') {
      return (
        <g stroke="#ffffff" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x="-5.5" y="-4.5" width="11" height="9" rx="1.5" fill="#090d1644" />
          <circle cx="-2.2" cy="-1.6" r="1.1" fill="#ffffff" stroke="none" />
          <polyline points="-4.5,3.5 -1,0 1.5,2.5 3,1 5,3.5" />
        </g>
      );
    }
    if (type === 'video') {
      return (
        <g stroke="#ffffff" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x="-5.5" y="-4.5" width="11" height="9" rx="1.5" fill="#090d1644" />
          <polygon points="-1.5,-2.2 -1.5,2.2 2.8,0" fill="#ffffff" stroke="none" />
        </g>
      );
    }
    if (type === 'audio') {
      return (
        <g stroke="#ffffff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M -2 3.5 L -2 -3.5 L 4 -4.5 L 4 2.5" />
          <circle cx="-3.3" cy="3.5" r="1.6" fill="#ffffff" stroke="none" />
          <circle cx="2.7" cy="2.5" r="1.6" fill="#ffffff" stroke="none" />
        </g>
      );
    }
    if (type === 'disc') {
      return (
        <g stroke="#ffffff" strokeWidth="1.4" fill="none">
          <circle cx="0" cy="0" r="5.2" fill="#090d1644" />
          <circle cx="0" cy="0" r="1.6" fill="#ffffff" stroke="none" />
        </g>
      );
    }
    return (
      <g fill="#ffffff" stroke="none">
        <polygon points="0.8,-5 -4.2,0.8 -0.5,0.8 -1.2,5 4.2,-0.8 0.5,-0.8" />
      </g>
    );
  };

  // Renderizador de Bloco de Hardware no SVG
  const renderHardwareNode = (id, x, y, w, h, title, spec, subSpec, category) => {
    const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.cpu;
    const active = isNodeActive(id);
    const isSelected = selectedNodeId === id;
    const isHovered = hoveredNodeId === id;

    const shouldDim = simStep > 0 && !active && !isSelected && !isHovered;

    const fill = lightMode ? style.lightBg : style.bg;
    const stroke = isSelected || isHovered
      ? '#38bdf8'
      : active
        ? '#facc15'
        : lightMode
          ? style.lightBorder
          : style.border;
    const titleColor = lightMode ? '#0f172a' : '#f8fafc';
    const specColor = lightMode ? style.lightText : style.text;
    const subColor = lightMode ? '#475569' : '#cbd5e1';

    return (
      <g
        key={id}
        onClick={() => setSelectedNodeId(id === selectedNodeId ? null : id)}
        onMouseEnter={() => setHoveredNodeId(id)}
        onMouseLeave={() => setHoveredNodeId(null)}
        style={{
          cursor: 'pointer',
          opacity: shouldDim ? 0.38 : 1,
          transition: 'opacity 0.3s ease, transform 0.2s ease'
        }}
      >
        {/* Halo pulsante quando ativo na simulação, selecionado ou com mouse em cima */}
        {(active || isSelected || isHovered) && (
          <rect
            x={x - 4}
            y={y - 4}
            width={w + 8}
            height={h + 8}
            rx={14}
            fill="none"
            stroke={isSelected || isHovered ? '#38bdf8' : '#facc15'}
            strokeWidth="2.5"
            strokeDasharray="6 4"
            className="animate-pulse-ring"
          />
        )}

        {/* Corpo do Chip */}
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx={11}
          fill={fill}
          stroke={stroke}
          strokeWidth={active || isSelected || isHovered ? '3' : '1.8'}
          filter="url(#dropShadow)"
        />

        {/* Barra de Categoria no Topo */}
        <rect x={x} y={y} width={w} height={6} rx={3} fill={stroke} />

        {/* Etiqueta da Categoria no Canto Superior Direito */}
        <rect
          x={x + w - 54}
          y={y + 10}
          width={46}
          height={15}
          rx={4}
          fill={lightMode ? '#ffffffcc' : '#090d16aa'}
        />
        <text
          x={x + w - 31}
          y={y + 20.5}
          textAnchor="middle"
          fill={specColor}
          fontSize="8.5"
          fontWeight="800"
          fontFamily="Inter, system-ui, sans-serif"
        >
          {style.badge}
        </text>

        {/* Nome Principal do Chip */}
        <text
          x={x + 12}
          y={y + 25}
          textAnchor="start"
          fill={titleColor}
          fontSize="13"
          fontWeight="800"
          fontFamily="Inter, system-ui, sans-serif"
        >
          {title}
        </text>

        {/* Especificação Chave */}
        <text
          x={x + 12}
          y={y + 44}
          textAnchor="start"
          fill={specColor}
          fontSize="11.5"
          fontWeight="700"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        >
          {spec}
        </text>

        {/* Função Resumida */}
        {subSpec && (
          <text
            x={x + 12}
            y={y + 60}
            textAnchor="start"
            fill={subColor}
            fontSize="10.5"
            fontWeight="500"
            fontFamily="Inter, system-ui, sans-serif"
          >
            {subSpec}
          </text>
        )}
      </g>
    );
  };

  // Renderizador de Pacotes Animados com Símbolo Visual
  const renderAnimatedPackets = () => {
    const packets = currentSimData?.packets || [];
    return packets.map((pkt, idx) => (
      <g key={`${pkt.pathId}-${idx}`}>
        {/* Pacote Principal Viajando com o Símbolo Dentro */}
        <g>
          <animateMotion dur="2s" repeatCount="indefinite">
            <mpath href={`#${pkt.pathId}`} />
          </animateMotion>
          <circle
            r="10.5"
            fill={pkt.color}
            stroke="#ffffff"
            strokeWidth="1.5"
            filter="url(#glowEffect)"
          />
          {renderMiniSvgIcon(pkt.type)}
        </g>

        {/* Segundo Pacote Defasado para Sensação Contínua de Fluxo */}
        <circle r="5.5" fill={pkt.color} opacity="0.85" filter="url(#glowEffect)">
          <animateMotion dur="2s" repeatCount="indefinite" begin="1s">
            <mpath href={`#${pkt.pathId}`} />
          </animateMotion>
        </circle>

        {/* Etiqueta Flutuante no Próprio Diagrama com o Símbolo à Esquerda */}
        {pkt.badgeX && pkt.badgeY && (
          <g transform={`translate(${pkt.badgeX}, ${pkt.badgeY})`}>
            <rect
              x="-76"
              y="-14"
              width="152"
              height="26"
              rx="13"
              fill={lightMode ? '#0f172a' : '#090d16'}
              stroke={pkt.color}
              strokeWidth="2"
              filter="url(#dropShadow)"
            />
            <g transform="translate(-59, -1)">
              <circle cx="0" cy="0" r="8.5" fill={pkt.color} />
              {renderMiniSvgIcon(pkt.type)}
            </g>
            <text
              x="9"
              y="3"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="10"
              fontWeight="800"
              fontFamily="Inter, system-ui, sans-serif"
            >
              {pkt.label}
            </text>
          </g>
        )}
      </g>
    ));
  };

  // Ícone nos cartões de cada componente ativo do painel direito
  const renderStepTypeBadge = (iconType, index) => {
    if (iconType === 'image') {
      return (
        <span
          className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shrink-0 mt-0.5"
          title="Etapa de Imagem / Vídeo Gráfico"
        >
          <ImageIcon className="w-3.5 h-3.5" />
        </span>
      );
    }
    if (iconType === 'video') {
      return (
        <span
          className="w-6 h-6 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-400 flex items-center justify-center shrink-0 mt-0.5"
          title="Etapa de Filme / Vídeo FMV"
        >
          <Film className="w-3.5 h-3.5" />
        </span>
      );
    }
    if (iconType === 'audio') {
      return (
        <span
          className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5"
          title="Etapa de Som / Música"
        >
          <Music className="w-3.5 h-3.5" />
        </span>
      );
    }
    if (iconType === 'disc') {
      return (
        <span
          className="w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center shrink-0 mt-0.5"
          title="Etapa de Leitura do CD-ROM"
        >
          <Disc className="w-3.5 h-3.5" />
        </span>
      );
    }
    return (
      <span className="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
        {index + 1}
      </span>
    );
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        lightMode ? 'bg-slate-100 text-slate-900' : 'bg-[#060911] text-slate-100'
      } font-sans pb-8`}
    >
      {/* =====================================================================
          BARRA SUPERIOR COMPACTA E LIMPA (TUDO EM UMA ÚNICA LINHA)
         ===================================================================== */}
      <header
        className={`border-b ${
          lightMode ? 'bg-white/95 border-slate-200 shadow-xs' : 'bg-[#0b101d]/95 border-slate-800/80'
        } sticky top-0 z-30 backdrop-blur-md`}
      >
        <div className="max-w-[1440px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Identidade + Abas dos Consoles */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5 pr-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
                <Disc className="w-5 h-5 animate-spin" style={{ animationDuration: '10s' }} />
              </div>
              <div>
                <h1 className="text-sm md:text-base font-extrabold tracking-tight leading-none">
                  Arquitetura CD-ROM
                </h1>
                <span className="text-[10px] font-semibold text-emerald-400">
                  Copetti &amp; RetroReversing
                </span>
              </div>
            </div>

            {/* Seletor de Consoles + Roteiro Fácil */}
            <nav className="flex items-center gap-1 p-1 rounded-xl bg-slate-800/40 border border-slate-700/40 overflow-x-auto">
              {[
                { id: 'pce', label: 'PC Engine CD (1988)', icon: Disc },
                { id: 'megacd', label: 'Mega-CD (1991)', icon: Layers },
                { id: 'ps1', label: 'PlayStation (1994)', icon: Cpu },
                { id: 'compare', label: 'Comparativo & Loading', icon: Gauge },
                { id: 'script', label: 'Roteiro Fácil (Para Todos)', icon: MessageSquareHeart }
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      active
                        ? tab.id === 'script'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-blue-600 text-white shadow-sm'
                        : lightMode
                          ? 'text-slate-600 hover:bg-slate-200/70'
                          : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Botões Utilitários Discretos */}
          <div className="flex items-center gap-1.5">
            {activeTab !== 'compare' && activeTab !== 'script' && (
              <>
                <button
                  onClick={() => setEasyMode(!easyMode)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    easyMode
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : lightMode
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                        : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                  title="Alternar Analogia Simples"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{easyMode ? 'Modo Fácil: ON' : 'Modo Fácil: OFF'}</span>
                </button>

                <button
                  onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    showSpeakerNotes
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : lightMode
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                        : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                  title="Mostrar/Ocultar Fala de Apresentação no Painel (Tecla N)"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Fala</span>
                </button>

                <button
                  onClick={() => setPresentationMode(!presentationMode)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    presentationMode
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : lightMode
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                        : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                  title="Expandir Diagrama (Tecla P)"
                >
                  {presentationMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{presentationMode ? 'Ver Painel' : 'Expandir'}</span>
                </button>
              </>
            )}

            <button
              onClick={() => setLightMode(!lightMode)}
              className={`p-1.5 rounded-lg border transition ${
                lightMode
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                  : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-amber-300'
              }`}
              title={lightMode ? 'Modo Escuro' : 'Modo Claro (ABNT)'}
            >
              {lightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {activeTab !== 'compare' && activeTab !== 'script' && (
              <div className="hidden md:flex items-center gap-1 pl-1 border-l border-slate-700/50">
                <button
                  onClick={exportPNG}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    lightMode
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                      : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                  title="Exportar imagem PNG em alta resolução"
                >
                  <Download className="w-3.5 h-3.5" />
                  PNG
                </button>
                <button
                  onClick={exportSVG}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    lightMode
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                      : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                  title="Exportar diagrama vetorial SVG"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  SVG
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* =====================================================================
          ÁREA PRINCIPAL: DIAGRAMA EM DESTAQUE + PAINEL COMPLETO DE INSTRUÇÕES
         ===================================================================== */}
      <main className="max-w-[1440px] mx-auto px-4 mt-3">
        {activeTab !== 'compare' && activeTab !== 'script' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* COLUNA ESQUERDA: LINHA DO TEMPO DE PASSOS + DIAGRAMA ANIMADO */}
            <div className={presentationMode ? 'lg:col-span-12 space-y-3' : 'lg:col-span-8 space-y-3'}>
              {/* BARRA UNIFICADA DE PASSOS DA SIMULAÇÃO */}
              <div
                className={`p-2.5 rounded-2xl border flex flex-wrap items-center justify-between gap-2 ${
                  lightMode ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0c1221] border-slate-800'
                }`}
              >
                {/* Passos Clicáveis */}
                <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                  {currentArch.simulationSteps.map((s, idx) => {
                    const isCurrent = simStep === idx;
                    return (
                      <button
                        key={s.step}
                        onClick={() => {
                          setIsAutoPlaying(false);
                          setSelectedNodeId(null);
                          setSimStep(idx);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                          isCurrent
                            ? 'bg-amber-400 text-slate-950 shadow-sm'
                            : lightMode
                              ? 'text-slate-600 hover:bg-slate-100'
                              : 'text-slate-400 hover:bg-slate-800/70'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-black ${
                            isCurrent
                              ? 'bg-slate-950 text-amber-400'
                              : lightMode
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {idx}
                        </span>
                        <span>{s.shortTitle}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Controles de Reprodução */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <button
                    onClick={prevStep}
                    className={`p-1.5 rounded-lg border transition ${
                      lightMode
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                        : 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-200'
                    }`}
                    title="Passo Anterior (Seta ←)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      isAutoPlaying
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                    title="Reproduzir Automaticamente (Espaço)"
                  >
                    {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isAutoPlaying ? 'Pausar' : 'Animar'}</span>
                  </button>

                  <button
                    onClick={nextStep}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition"
                    title="Próximo Passo (Seta →)"
                  >
                    <span>Próximo</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setSimStep(0);
                      setSelectedNodeId(null);
                    }}
                    className={`p-1.5 rounded-lg border transition ${
                      lightMode
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600'
                        : 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-400'
                    }`}
                    title="Reiniciar"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* =================================================================
                  CANVAS SVG INTERATIVO COM BARRAMENTOS UNIFICADOS E SETAS DE DIREÇÃO
                 ================================================================= */}
              <div
                className={`rounded-2xl border overflow-hidden shadow-xl relative ${
                  lightMode ? 'bg-white border-slate-300' : 'bg-[#080c15] border-slate-800/90'
                }`}
              >
                <svg
                  ref={svgRef}
                  viewBox="0 0 1000 560"
                  className="w-full h-auto select-none block"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
                      <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodOpacity={lightMode ? '0.1' : '0.45'} />
                    </filter>
                    <filter id="glowEffect" x="-40%" y="-40%" width="180%" height="180%">
                      <feGaussianBlur stdDeviation="3.5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    {/* Seta direcional automática na ponta de todo barramento ativo */}
                    <marker
                      id="flowArrowActive"
                      viewBox="0 0 10 10"
                      refX="7"
                      refY="5"
                      markerWidth="5"
                      markerHeight="5"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#facc15" />
                    </marker>
                    <pattern id="techGrid" width="28" height="28" patternUnits="userSpaceOnUse">
                      <path
                        d="M 28 0 L 0 0 0 28"
                        fill="none"
                        stroke={lightMode ? '#f1f5f9' : '#111827'}
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>

                  {/* Fundo e Grade */}
                  <rect width="1000" height="560" fill={lightMode ? '#ffffff' : '#080c15'} />
                  <rect width="1000" height="560" fill="url(#techGrid)" />

                  {/* Cabeçalho Limpo dentro do SVG */}
                  <g transform="translate(25, 26)">
                    <text
                      x="0"
                      y="0"
                      fill={lightMode ? '#0f172a' : '#f8fafc'}
                      fontSize="15.5"
                      fontWeight="800"
                      fontFamily="Inter, system-ui, sans-serif"
                    >
                      {currentArch.name}
                    </text>
                    <text
                      x="0"
                      y="17"
                      fill={lightMode ? '#64748b' : '#94a3b8'}
                      fontSize="11"
                      fontWeight="600"
                      fontFamily="Inter, system-ui, sans-serif"
                    >
                      {currentArch.subtitle}
                    </text>
                  </g>

                  {/* ==========================================================
                      1. DIAGRAMA: NEC PC ENGINE + CD-ROM² (1988)
                     ========================================================== */}
                  {activeTab === 'pce' && (
                    <g>
                      <defs>
                        {/* Todos os caminhos começam na borda de origem e terminam na borda de destino */}
                        <path id="path-pce-hucard" d="M 425 137 L 365 137 L 365 156 L 290 156" />
                        <path id="path-pce-scsi" d="M 735 237 L 665 237" />
                        <path id="path-pce-exp" d="M 425 237 L 365 237 L 365 156 L 290 156" />
                        <path id="path-pce-cpu-vdc" d="M 290 175 L 322 175 L 322 338 L 290 338" />
                        <path id="path-pce-vdc" d="M 170 380 L 170 400" />
                        {/* Seg. Copetti & Archaic Pixels: VDC envia stream digital de 9 bits DIRETO ao VCE (sem passar pela VRAM!) */}
                        <path id="path-pce-vce" d="M 290 362 L 314 362 L 314 512 L 290 512" />
                        <path id="path-pce-audio" d="M 845 276 L 845 351 L 665 351" />
                        <path id="path-pce-cpu-audio" d="M 290 156 L 365 156 L 365 351 L 425 351" />
                      </defs>

                      {/* Molduras dos 3 Módulos Físicos */}
                      <rect
                        x="25"
                        y="60"
                        width="310"
                        height="485"
                        rx="14"
                        fill={lightMode ? '#f8fafc' : '#0c1322'}
                        stroke="#3b82f6"
                        strokeWidth="1.8"
                        strokeDasharray="6 4"
                      />
                      <text x="40" y="82" fill="#3b82f6" fontSize="11" fontWeight="800">
                        CONSOLE BASE: PC ENGINE (1987)
                      </text>

                      <rect
                        x="395"
                        y="60"
                        width="295"
                        height="485"
                        rx="14"
                        fill={lightMode ? '#f8fafc' : '#0c1322'}
                        stroke="#f59e0b"
                        strokeWidth="1.8"
                        strokeDasharray="6 4"
                      />
                      <text x="410" y="82" fill="#f59e0b" fontSize="11" fontWeight="800">
                        INTERFACE UNIT (IFU-30) + SYSTEM CARD
                      </text>

                      <rect
                        x="715"
                        y="60"
                        width="260"
                        height="485"
                        rx="14"
                        fill={lightMode ? '#f8fafc' : '#0c1322'}
                        stroke="#f97316"
                        strokeWidth="1.8"
                        strokeDasharray="6 4"
                      />
                      <text x="730" y="82" fill="#f97316" fontSize="11" fontWeight="800">
                        LEITOR ÓPTICO CD-ROM² (1988)
                      </text>

                      {/* Estrutura Base do Barramento Central (21-bit MMU / 8-bit Dados) */}
                      <line
                        x1="365"
                        y1="98"
                        x2="365"
                        y2="515"
                        stroke={lightMode ? '#cbd5e1' : '#334155'}
                        strokeWidth="6"
                        strokeLinecap="round"
                        opacity="0.45"
                      />
                      {/* Ligação CPU <-> Work RAM Base */}
                      <line
                        x1="170"
                        y1="197"
                        x2="170"
                        y2="220"
                        stroke={lightMode ? '#cbd5e1' : '#334155'}
                        strokeWidth="4"
                        opacity="0.45"
                      />
                      <text
                        x="352"
                        y="310"
                        transform="rotate(-90 352 310)"
                        textAnchor="middle"
                        fill={lightMode ? '#475569' : '#94a3b8'}
                        fontSize="10"
                        fontWeight="800"
                      >
                        BARRAMENTO 21-BIT MMU / 8-BIT DADOS
                      </text>

                      {/* Barramentos Completos Direcionados (100% coloridos de ponta a ponta quando ativos) */}
                      {renderBusPath('bus-pce-hucard', 'M 425 137 L 365 137 L 365 156 L 290 156', '#f59e0b', 5)}
                      {renderBusPath('bus-pce-scsi', 'M 735 237 L 665 237', '#f97316', 5)}
                      {renderBusPath('bus-pce-exp', 'M 425 237 L 365 237 L 365 156 L 290 156', '#38bdf8', 5)}
                      {renderBusPath('bus-pce-cpu-vdc', 'M 290 175 L 322 175 L 322 338 L 290 338', '#38bdf8', 4.5)}
                      {renderBusPath('bus-pce-vdc', 'M 170 380 L 170 400', '#38bdf8', 5)}
                      {renderBusPath('bus-pce-vce', 'M 290 362 L 314 362 L 314 512 L 290 512', '#a855f7', 5)}
                      {renderBusPath('bus-pce-audio', 'M 845 276 L 845 351 L 665 351', '#10b981', 4.5)}
                      {renderBusPath('bus-pce-cpu-audio', 'M 290 156 L 365 156 L 365 351 L 425 351', '#ec4899', 4.5)}

                      {/* Blocos PC Engine Base */}
                      {renderHardwareNode(
                        'pce-cpu',
                        50,
                        115,
                        240,
                        82,
                        'CPU HuC6280 + MMU + PSG',
                        '65C02 @ 7.16 MHz + 8× MPR (21b)',
                        '6ch PSG + Timer 7b + IRQ + Porta I/O',
                        'cpu'
                      )}
                      {renderHardwareNode(
                        'pce-wram',
                        50,
                        220,
                        240,
                        68,
                        'Work RAM Base ($F8)',
                        '8 KB SRAM Interna',
                        'Zero-Page / Stack + Variáveis',
                        'ram'
                      )}
                      {renderHardwareNode(
                        'pce-vdc',
                        50,
                        310,
                        240,
                        70,
                        'VDC: HuC6270 (Vídeo)',
                        'Bus VRAM 16-bit Exclusivo + DMA',
                        'Tiles 8×8 (BAT) e 64 Sprites (SATB)',
                        'gpu'
                      )}
                      {renderHardwareNode(
                        'pce-vram',
                        50,
                        400,
                        240,
                        62,
                        'VRAM Exclusiva do VDC',
                        '64 KB (32K Words × 16-bit)',
                        'Ligada só ao VDC (Planar 4-bit)',
                        'ram'
                      )}
                      {renderHardwareNode(
                        'pce-vce',
                        50,
                        482,
                        240,
                        60,
                        'VCE: HuC6260 (Cores & Sync)',
                        'Recebe 9-bit do VDC • 32 Paletas',
                        'Até 482 cores (de 512) -> Saída TV',
                        'gpu'
                      )}

                      {/* Blocos Interface Unit + System Card */}
                      {renderHardwareNode(
                        'pce-syscard',
                        425,
                        98,
                        240,
                        78,
                        'System Card (Slot 38p)',
                        'BIOS ROM + Upgrade RAM',
                        '+192 KB (Super) ou +2 MB (Arcade)',
                        'storage'
                      )}
                      {renderHardwareNode(
                        'pce-cdram',
                        425,
                        198,
                        240,
                        78,
                        'CD-ROM² Work RAM & BRAM',
                        '64 KB DRAM + 2 KB Save BRAM',
                        'Bancos MMU $80–$87 + Ponte SCSI',
                        'ram'
                      )}
                      {renderHardwareNode(
                        'pce-adpcm',
                        425,
                        310,
                        240,
                        82,
                        'Áudio ADPCM + Mixer',
                        '64 KB ADPCM + OKI MSM5205',
                        'Mixa Vozes (32kHz) + CD-DA + PSG',
                        'audio'
                      )}

                      {/* Bloco Leitor Óptico */}
                      {renderHardwareNode(
                        'pce-drive',
                        735,
                        190,
                        220,
                        86,
                        'Leitor CD-ROM² (1x SCSI)',
                        '150 KB/s • Barramento SCSI-1',
                        '650 MB (Mode 1 + Áudio CD-DA)',
                        'cd'
                      )}

                      {renderAnimatedPackets()}
                    </g>
                  )}

                  {/* ==========================================================
                      2. DIAGRAMA: SEGA MEGA DRIVE + MEGA-CD (1991)
                     ========================================================== */}
                  {activeTab === 'megacd' && (
                    <g>
                      <defs>
                        {/* Todos os caminhos <path> são idênticos às trilhas de barramento! */}
                        <path id="path-mcd-cd" d="M 885 215 L 885 150 L 795 150" />
                        <path id="path-mcd-prg" d="M 700 187 L 700 245" />
                        <path id="path-mcd-sub-asic" d="M 605 150 L 550 150" />
                        <path id="path-mcd-asic-word" d="M 461 194 L 461 245" />
                        <path id="path-mcd-main-word" d="M 372 285 L 335 285 L 335 150 L 305 150" />
                        <path id="path-mcd-vdp" d="M 305 170 L 318 170 L 318 368 L 305 368" />
                        <path id="path-mcd-z80" d="M 40 256 L 28 256 L 28 481 L 40 481" />
                        <path id="path-mcd-sub-pcm" d="M 700 331 L 700 385" />
                        <path id="path-mcd-pcm" d="M 885 303 L 885 385" />
                      </defs>

                      {/* Molduras Mega Drive vs Ponte Word RAM vs Mega-CD */}
                      <rect
                        x="20"
                        y="60"
                        width="305"
                        height="485"
                        rx="14"
                        fill={lightMode ? '#f8fafc' : '#0c1322'}
                        stroke="#3b82f6"
                        strokeWidth="1.8"
                        strokeDasharray="6 4"
                      />
                      <text x="35" y="82" fill="#3b82f6" fontSize="11" fontWeight="800">
                        CONSOLE BASE: MEGA DRIVE (1988)
                      </text>

                      <rect
                        x="350"
                        y="60"
                        width="220"
                        height="485"
                        rx="14"
                        fill={lightMode ? '#faf5ff' : '#140d24'}
                        stroke="#a855f7"
                        strokeWidth="1.8"
                      />
                      <text x="460" y="82" textAnchor="middle" fill="#c084fc" fontSize="11" fontWeight="800">
                        GATE ARRAY ASIC &amp; WORD RAM
                      </text>

                      <rect
                        x="590"
                        y="60"
                        width="390"
                        height="485"
                        rx="14"
                        fill={lightMode ? '#f8fafc' : '#0c1322'}
                        stroke="#10b981"
                        strokeWidth="1.8"
                        strokeDasharray="6 4"
                      />
                      <text x="605" y="82" fill="#10b981" fontSize="11" fontWeight="800">
                        EXPANSÃO SEGA MEGA-CD (1991 — SUB-CPU 12.5 MHz)
                      </text>

                      {/* Ligação estrutural Main-CPU <-> Árbitro */}
                      <line
                        x1="165"
                        y1="187"
                        x2="165"
                        y2="215"
                        stroke={lightMode ? '#cbd5e1' : '#334155'}
                        strokeWidth="4.5"
                        opacity="0.45"
                      />

                      {/* Barramentos Completos Direcionados (Mesmo formato e direção dos pacotes!) */}
                      {renderBusPath('bus-mcd-cd', 'M 885 215 L 885 150 L 795 150', '#f97316', 5)}
                      {renderBusPath('bus-mcd-prg', 'M 700 187 L 700 245', '#10b981', 5)}
                      {renderBusPath('bus-mcd-sub-asic', 'M 605 150 L 550 150', '#a855f7', 5)}
                      {renderBusPath('bus-mcd-asic-word', 'M 461 194 L 461 245', '#a855f7', 5)}
                      {renderBusPath('bus-mcd-main-word', 'M 372 285 L 335 285 L 335 150 L 305 150', '#ec4899', 5)}
                      {renderBusPath('bus-mcd-vdp', 'M 305 170 L 318 170 L 318 368 L 305 368', '#38bdf8', 5)}
                      {renderBusPath('bus-mcd-z80', 'M 40 256 L 28 256 L 28 481 L 40 481', '#f59e0b', 4.5)}
                      {renderBusPath('bus-mcd-sub-pcm', 'M 700 331 L 700 385', '#ec4899', 5)}
                      {renderBusPath('bus-mcd-pcm', 'M 885 303 L 885 385', '#10b981', 5)}

                      {/* Blocos Mega Drive Base */}
                      {renderHardwareNode(
                        'mcd-maincpu',
                        40,
                        105,
                        265,
                        82,
                        'Main-CPU: Motorola 68000',
                        '~7.67 MHz • Bus 16-bit',
                        'Regs 32b • ALU 16b • Addr 24b (16 MB)',
                        'cpu'
                      )}
                      {renderHardwareNode(
                        'mcd-arbiter',
                        40,
                        215,
                        265,
                        82,
                        '64 KB RAM + Árbitro & I/O',
                        'BusReq ($A11100) + Bank 32KB Z80',
                        'Chip I/O 315-5309 + TMSS • Pausa DMA',
                        'ram'
                      )}
                      {renderHardwareNode(
                        'mcd-vdp',
                        40,
                        325,
                        265,
                        86,
                        'VDP (Modo V + DMA + PSG)',
                        '64KB VRAM + 128B CRAM + 80B VSRAM',
                        '4 Planos • 64 Cores + SN76489 PSG',
                        'gpu'
                      )}
                      {renderHardwareNode(
                        'mcd-z80',
                        40,
                        440,
                        265,
                        82,
                        'Zilog Z80 (8 KB) + YM2612',
                        '~3.58 MHz • Bus de Áudio Dedicado',
                        'Yamaha YM2612 (6ch FM / PCM) + PSG',
                        'audio'
                      )}

                      {/* Blocos Ponte Gate Array ASIC & Word RAM */}
                      {renderHardwareNode(
                        'mcd-asic',
                        372,
                        110,
                        178,
                        84,
                        'Gate Array / ASIC',
                        'Rotação/Escala + Comm Ports',
                        '$A12010–2E + IRQ2 + Tiles 8×8',
                        'gpu'
                      )}
                      {renderHardwareNode(
                        'mcd-wordram',
                        372,
                        245,
                        178,
                        95,
                        'Word RAM (256 KB)',
                        'Modo 2M ou 1M/1M ($600000)',
                        'Bank Swap Sub ↔ Main',
                        'ram'
                      )}

                      {/* Blocos Expansão Mega-CD */}
                      {renderHardwareNode(
                        'mcd-subcpu',
                        605,
                        105,
                        190,
                        82,
                        'Sub-CPU: 2º 68000',
                        '12.5 MHz + 128KB BIOS',
                        '+8KB BRAM • Controla CDC/PCM',
                        'cpu'
                      )}
                      {renderHardwareNode(
                        'mcd-prgram',
                        605,
                        245,
                        190,
                        86,
                        'Program RAM (512 KB)',
                        '512 KB DRAM (4× 128 KB)',
                        'Execução Sub-CPU + DMA CDC',
                        'ram'
                      )}
                      {renderHardwareNode(
                        'mcd-drive',
                        810,
                        215,
                        155,
                        88,
                        'CD 1x + CDC LC8951',
                        '150 KB/s + 16KB Cache',
                        'DMA CDC + Áudio CD-DA',
                        'cd'
                      )}
                      {renderHardwareNode(
                        'mcd-pcm',
                        605,
                        385,
                        360,
                        86,
                        'Áudio Mega-CD: Ricoh RF5C164 (8ch PCM)',
                        '64 KB PCM Wave RAM (Sub-CPU) + Mixagem CD-DA',
                        'Truque Sonic CD: cobre seek do laser 1x no loop',
                        'audio'
                      )}

                      {renderAnimatedPackets()}
                    </g>
                  )}

                  {/* ==========================================================
                      3. DIAGRAMA: SONY PLAYSTATION (1994)
                     ========================================================== */}
                  {activeTab === 'ps1' && (
                    <g>
                      <defs>
                        <path id="path-ps1-cd-sub" d="M 650 420 L 560 420" />
                        <path id="path-ps1-biu-dma" d="M 455 375 L 455 326" />
                        <path id="path-ps1-dma-ram" d="M 500 276 L 500 164" />
                        <path id="path-ps1-ram-dma" d="M 500 164 L 500 276" />
                        <path id="path-ps1-dma-cpu" d="M 200 276 L 200 247" />
                        <path id="path-ps1-cpu-dma" d="M 200 247 L 200 276" />
                        <path id="path-ps1-dma-gpu" d="M 800 276 L 800 187" />
                        <path id="path-ps1-dma-spu" d="M 455 326 L 455 375 M 355 420 L 275 420" />
                      </defs>

                      {/* BLOCO 1: SoC SONY CXD8530BQ */}
                      <g
                        onClick={() => setSelectedNodeId('ps1-cpu' === selectedNodeId ? null : 'ps1-cpu')}
                        onMouseEnter={() => setHoveredNodeId('ps1-cpu')}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        style={{
                          cursor: 'pointer',
                          opacity:
                            simStep > 0 &&
                            !isNodeActive('ps1-cpu') &&
                            selectedNodeId !== 'ps1-cpu' &&
                            hoveredNodeId !== 'ps1-cpu'
                              ? 0.38
                              : 1,
                          transition: 'opacity 0.3s ease'
                        }}
                      >
                        {(isNodeActive('ps1-cpu') || selectedNodeId === 'ps1-cpu' || hoveredNodeId === 'ps1-cpu') && (
                          <rect
                            x="26"
                            y="58"
                            width="343"
                            height="193"
                            rx="16"
                            fill="none"
                            stroke={selectedNodeId === 'ps1-cpu' || hoveredNodeId === 'ps1-cpu' ? '#38bdf8' : '#facc15'}
                            strokeWidth="2.5"
                            strokeDasharray="6 4"
                            className="animate-pulse-ring"
                          />
                        )}
                        <rect
                          x="30"
                          y="62"
                          width="335"
                          height="185"
                          rx="14"
                          fill={lightMode ? '#eff6ff' : '#0d182e'}
                          stroke={
                            selectedNodeId === 'ps1-cpu' || hoveredNodeId === 'ps1-cpu'
                              ? '#38bdf8'
                              : isNodeActive('ps1-cpu')
                                ? '#facc15'
                                : '#3b82f6'
                          }
                          strokeWidth={isNodeActive('ps1-cpu') || hoveredNodeId === 'ps1-cpu' ? '3' : '2'}
                          filter="url(#dropShadow)"
                        />
                        <text x="45" y="84" fill="#60a5fa" fontSize="11.5" fontWeight="800">
                          SoC SONY CXD8530BQ (CW33300 @ 33.8688 MHz)
                        </text>

                        <rect x="45" y="95" width="145" height="62" rx="8" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5" />
                        <text x="117" y="115" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800">
                          MIPS R3000A Core
                        </text>
                        <text x="117" y="131" textAnchor="middle" fill="#93c5fd" fontSize="9.5" fontWeight="700">
                          32-bit RISC (MIPS I)
                        </text>
                        <text x="117" y="146" textAnchor="middle" fill="#cbd5e1" fontSize="9">
                          + CP0 (Exceções/Cache)
                        </text>

                        <rect x="200" y="95" width="150" height="62" rx="8" fill="#312e81" stroke="#6366f1" strokeWidth="1.5" />
                        <text x="275" y="115" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800">
                          COP2: GTE (3D)
                        </text>
                        <text x="275" y="131" textAnchor="middle" fill="#a5b4fc" fontSize="9.5" fontWeight="700">
                          66 MIPS Ponto Fixo
                        </text>
                        <text x="275" y="146" textAnchor="middle" fill="#cbd5e1" fontSize="9">
                          1.5M Vértices/s + Z-Sort
                        </text>

                        <rect x="45" y="168" width="145" height="64" rx="8" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
                        <text x="117" y="188" textAnchor="middle" fill="#fff" fontSize="10.5" fontWeight="800">
                          4KB I-Cache + 1KB SRAM
                        </text>
                        <text x="117" y="204" textAnchor="middle" fill="#6ee7b7" fontSize="9.5" fontWeight="700">
                          Scratchpad (0x1F800000)
                        </text>
                        <text x="117" y="219" textAnchor="middle" fill="#fde68a" fontSize="8.5" fontWeight="700">
                          Livre durante DMA!
                        </text>

                        <rect x="200" y="168" width="150" height="64" rx="8" fill="#500724" stroke="#ec4899" strokeWidth="1.5" />
                        <text x="275" y="188" textAnchor="middle" fill="#fff" fontSize="10.5" fontWeight="800">
                          MDEC (Vídeo FMV)
                        </text>
                        <text x="275" y="204" textAnchor="middle" fill="#f9a8d4" fontSize="9.5" fontWeight="700">
                          IDCT + YCbCr→RGB 24b
                        </text>
                        <text x="275" y="219" textAnchor="middle" fill="#cbd5e1" fontSize="8.5">
                          9.000 Blocos/s (30 fps)
                        </text>
                      </g>

                      {/* BLOCO 2: MAIN RAM (2 MB EDO DRAM) */}
                      {renderHardwareNode(
                        'ps1-ram',
                        395,
                        72,
                        215,
                        92,
                        'Main RAM: 2 MB EDO',
                        '4× 512 KB Chips EDO DRAM',
                        '64KB Kernel + Ordering Table',
                        'ram'
                      )}

                      {/* BLOCO 3: GPU + 1 MB VRAM */}
                      {renderHardwareNode(
                        'ps1-gpu',
                        640,
                        72,
                        330,
                        115,
                        'Sony GPU + 1 MB VRAM + RGB DAC',
                        '1024×512 (Dual-Port VRAM / SGRAM) • 2KB Cache',
                        'Page-Flipping + CLUT • Sem Sub-pixel / Z-Buffer',
                        'gpu'
                      )}

                      {/* Trilhas Estruturais Base do PS1 (Cinza quando inativas) */}
                      <line x1="200" y1="247" x2="200" y2="276" stroke={lightMode ? '#cbd5e1' : '#334155'} strokeWidth="5" opacity="0.4" />
                      <line x1="500" y1="164" x2="500" y2="276" stroke={lightMode ? '#cbd5e1' : '#334155'} strokeWidth="5" opacity="0.4" />
                      <line x1="800" y1="187" x2="800" y2="276" stroke={lightMode ? '#cbd5e1' : '#334155'} strokeWidth="5" opacity="0.4" />
                      <line x1="455" y1="326" x2="455" y2="375" stroke={lightMode ? '#cbd5e1' : '#334155'} strokeWidth="5" opacity="0.4" />
                      <line x1="275" y1="420" x2="355" y2="420" stroke={lightMode ? '#cbd5e1' : '#334155'} strokeWidth="4.5" opacity="0.4" />
                      <line x1="560" y1="420" x2="650" y2="420" stroke={lightMode ? '#cbd5e1' : '#334155'} strokeWidth="4.5" opacity="0.4" />

                      {/* Barramentos Ativos com Direção Exata e Setas */}
                      {renderBusPath('bus-ps1-cd-sub', 'M 650 420 L 560 420', '#f97316', 5)}
                      {renderBusPath('bus-ps1-biu-dma', 'M 455 375 L 455 326', '#f59e0b', 5)}
                      {renderBusPath('bus-ps1-dma-ram', 'M 500 276 L 500 164', '#10b981', 5)}
                      {renderBusPath('bus-ps1-ram-dma', 'M 500 164 L 500 276', '#10b981', 5)}
                      {renderBusPath('bus-ps1-dma-cpu', 'M 200 276 L 200 247', '#ec4899', 5)}
                      {renderBusPath('bus-ps1-cpu-dma', 'M 200 247 L 200 276', '#38bdf8', 5)}
                      {renderBusPath('bus-ps1-dma-gpu', 'M 800 276 L 800 187', '#38bdf8', 5)}
                      {renderBusPath('bus-ps1-dma-spu', 'M 455 326 L 455 375 M 355 420 L 275 420', '#a855f7', 5)}

                      {/* MAIN BUS (32-BIT @ 132 MB/s + DMA CONTROLLER) COM HOVER E SELEÇÃO SINCRONIZADOS */}
                      <g
                        onClick={() => setSelectedNodeId('ps1-dma' === selectedNodeId ? null : 'ps1-dma')}
                        onMouseEnter={() => setHoveredNodeId('ps1-dma')}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        style={{
                          cursor: 'pointer',
                          opacity:
                            simStep > 0 &&
                            !isNodeActive('ps1-dma') &&
                            selectedNodeId !== 'ps1-dma' &&
                            hoveredNodeId !== 'ps1-dma'
                              ? 0.45
                              : 1,
                          transition: 'opacity 0.3s ease'
                        }}
                      >
                        {(isNodeActive('ps1-dma') || selectedNodeId === 'ps1-dma' || hoveredNodeId === 'ps1-dma') && (
                          <rect
                            x="26"
                            y="272"
                            width="948"
                            height="58"
                            rx="14"
                            fill="none"
                            stroke={selectedNodeId === 'ps1-dma' || hoveredNodeId === 'ps1-dma' ? '#38bdf8' : '#facc15'}
                            strokeWidth="2.5"
                            strokeDasharray="6 4"
                            className="animate-pulse-ring"
                          />
                        )}
                        <rect
                          x="30"
                          y="276"
                          width="940"
                          height="50"
                          rx="11"
                          fill={lightMode ? '#fefce8' : '#182235'}
                          stroke={
                            selectedNodeId === 'ps1-dma' || hoveredNodeId === 'ps1-dma'
                              ? '#38bdf8'
                              : isNodeActive('ps1-dma')
                                ? '#facc15'
                                : '#f59e0b'
                          }
                          strokeWidth="3"
                          filter="url(#dropShadow)"
                        />
                        <text
                          x="500"
                          y="297"
                          textAnchor="middle"
                          fill={lightMode ? '#92400e' : '#facc15'}
                          fontSize="12.5"
                          fontWeight="800"
                        >
                          MAIN BUS (32-BIT • 132 MB/s) &amp; CONTROLADOR DE DMA (7 CANAIS: Ch0 A Ch6 — ASSUME O BUS)
                        </text>
                        <text
                          x="500"
                          y="314"
                          textAnchor="middle"
                          fill={lightMode ? '#b45309' : '#cbd5e1'}
                          fontSize="10"
                          fontWeight="600"
                        >
                          Ch0: MDEC In • Ch1: MDEC Out • Ch2: GPU (Linked-List/VRAM) • Ch3: CD-ROM • Ch4: SPU • Ch5: PIO • Ch6: OTC
                        </text>
                      </g>

                      {/* BUS INTERFACE UNIT (BIU) E SUB BUS */}
                      {renderHardwareNode(
                        'ps1-biu',
                        355,
                        375,
                        205,
                        86,
                        'Ponte BIU, BIOS & SIO0',
                        'BIOS 512KB + 3 Root Counters',
                        'SIO0 (Controles + MemCard 128KB)',
                        'storage'
                      )}

                      {/* BLOCO SPU */}
                      {renderHardwareNode(
                        'ps1-spu',
                        30,
                        375,
                        245,
                        92,
                        'SPU (24 Canais ADPCM)',
                        '16-bit @ 44.1 kHz + 512 KB DRAM',
                        'Pitch/FM/ADSR • Reverb • CD-XA',
                        'audio'
                      )}

                      {/* BLOCO SUBSISTEMA CD-ROM 2X */}
                      {renderHardwareNode(
                        'ps1-cd',
                        650,
                        375,
                        320,
                        92,
                        'Subsistema CD-ROM (2x — 4 Chips)',
                        'DSP + 68HC05 + CXD1815Q + 32 KB SRAM',
                        '300 KB/s • Áudio XA • Wobble SCEx/LibCrypt',
                        'cd'
                      )}

                      {/* Via Direta de Áudio CD-DA / XA para a SPU */}
                      <path
                        d="M 810 467 L 810 518 L 150 518 L 150 467"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.2"
                        strokeDasharray="6 4"
                      />
                      <text x="480" y="511" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="700">
                        STREAMING DIRETO DO CONTROLADOR DE CD (CXD1815Q): ÁUDIO XA-ADPCM / CD-DA → SPU (SEM GASTAR CPU/RAM)
                      </text>

                      {renderAnimatedPackets()}
                    </g>
                  )}

                  {/* Rodapé Discreto */}
                  <text
                    x="25"
                    y="547"
                    fill={lightMode ? '#64748b' : '#64748b'}
                    fontSize="10"
                    fontWeight="600"
                    fontFamily="Inter, sans-serif"
                  >
                    Passe o mouse sobre qualquer bloco (ou sobre a barra de DMA) para destacar sua instrução ao lado
                  </text>
                </svg>
              </div>

              {/* BARRA DE LEGENDA DE CORES E SÍMBOLOS ABAIXO DO DIAGRAMA */}
              <div
                className={`px-3.5 py-2 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs ${
                  lightMode ? 'bg-white border-slate-200' : 'bg-[#0c1221] border-slate-800/80'
                }`}
              >
                <div className="flex flex-wrap items-center gap-3">
                  {Object.entries(CATEGORY_STYLES).map(([key, st]) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.border }} />
                      <span className={`text-[11px] font-semibold ${lightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                        {st.badge}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {currentArch.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <BookOpen className="w-3 h-3" />
                      {src.label}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* =================================================================
                COLUNA DIREITA: PAINEL COM TODAS AS INSTRUÇÕES DOS COMPONENTES ATIVOS
               ================================================================= */}
            {!presentationMode && (
              <div className="lg:col-span-4 space-y-3">
                {/* Seletor de Modo do Painel Lateral (Explicação do Passo vs Chip Selecionado) */}
                <div
                  className={`p-1 rounded-xl border grid grid-cols-2 gap-1 ${
                    lightMode ? 'bg-slate-200/70 border-slate-300' : 'bg-[#0c1221] border-slate-800'
                  }`}
                >
                  <button
                    onClick={() => setSelectedNodeId(null)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      !selectedComponent
                        ? 'bg-blue-600 text-white shadow-xs'
                        : lightMode
                          ? 'text-slate-600 hover:bg-white/60'
                          : 'text-slate-400 hover:bg-slate-800/60'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Passo {simStep} da Animação
                  </button>
                  <button
                    onClick={() => {
                      if (!selectedNodeId && currentArch.components?.length) {
                        setSelectedNodeId(currentArch.components[0].id);
                      }
                    }}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      selectedComponent
                        ? 'bg-blue-600 text-white shadow-xs'
                        : lightMode
                          ? 'text-slate-600 hover:bg-white/60'
                          : 'text-slate-400 hover:bg-slate-800/60'
                    }`}
                  >
                    <Info className="w-3.5 h-3.5" />
                    {selectedComponent ? 'Chip Selecionado' : 'Inspecionar Chips'}
                  </button>
                </div>

                {/* CONTEÚDO DO PAINEL: OU EXPLICA O PASSO ATUAL, OU DETALHA O CHIP CLICADO */}
                {!selectedComponent ? (
                  <div
                    className={`p-4 rounded-2xl border space-y-3.5 ${
                      lightMode ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0c1221] border-slate-800'
                    }`}
                  >
                    {/* Cabeçalho do Passo */}
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Passo {simStep} de {currentArch.simulationSteps.length - 1}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          {currentSimData.activeNodes.length} Componentes Ativos
                        </span>
                      </div>
                      <h2 className="text-base font-extrabold mt-2 leading-snug">{currentSimData.title}</h2>
                      <p className={`text-xs mt-1.5 leading-relaxed ${lightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                        {currentSimData.summary}
                      </p>
                    </div>

                    {/* TODAS AS INSTRUÇÕES DOS COMPONENTES ATIVOS NESTE PASSO */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                          Instruções de Todos os Componentes ({currentSimData.flowSteps.length} Etapas)
                        </span>
                        <span className="text-[10px] text-slate-400">Passe o mouse ou clique</span>
                      </div>
                      {currentSimData.flowSteps.map((item, idx) => {
                        const isItemHovered = Boolean(item.nodeId && hoveredNodeId === item.nodeId);
                        return (
                          <div
                            key={idx}
                            onClick={() => item.nodeId && setSelectedNodeId(item.nodeId)}
                            onMouseEnter={() => item.nodeId && setHoveredNodeId(item.nodeId)}
                            onMouseLeave={() => setHoveredNodeId(null)}
                            className={`p-2.5 rounded-xl border-2 flex items-start gap-2.5 cursor-pointer transition-all ${
                              isItemHovered
                                ? 'border-sky-400 bg-sky-500/15 shadow-md scale-[1.01]'
                                : lightMode
                                  ? 'bg-slate-50 hover:bg-blue-50/60 border-slate-200'
                                  : 'bg-slate-900/70 hover:bg-slate-800/90 border-slate-800/90'
                            }`}
                          >
                            {renderStepTypeBadge(item.iconType, idx)}
                            <div className="text-xs leading-relaxed flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className={`font-extrabold ${isItemHovered ? 'text-sky-300' : 'text-blue-400'}`}>
                                  {item.tag}
                                </span>
                                {isItemHovered && (
                                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-sky-500 text-slate-950">
                                    Em foco
                                  </span>
                                )}
                              </div>
                              <div className={lightMode ? 'text-slate-700 mt-0.5' : 'text-slate-300 mt-0.5'}>
                                {item.text}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* CAIXA DE ANALOGIA SIMPLES */}
                    {easyMode && currentSimData.simpleAnalogy && (
                      <div
                        className={`p-3 rounded-xl border-l-4 border-emerald-500 ${
                          lightMode ? 'bg-emerald-50 text-slate-800' : 'bg-emerald-950/35 text-emerald-100'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 mb-1">
                          <MessageSquareHeart className="w-3.5 h-3.5" />
                          Comparação do Dia a Dia
                        </div>
                        <p className="text-xs leading-relaxed font-medium">{currentSimData.simpleAnalogy}</p>
                      </div>
                    )}

                    {/* ROTEIRO DE FALA PARA APRESENTAR */}
                    {showSpeakerNotes && (
                      <div
                        className={`p-3 rounded-xl border-l-4 border-indigo-500 ${
                          lightMode ? 'bg-indigo-50 text-indigo-950' : 'bg-indigo-950/40 text-indigo-100'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5 mb-1">
                          <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-indigo-400">
                            <Mic className="w-3.5 h-3.5" />
                            {easyMode ? 'Sugestão de Fala (Simples)' : 'Sugestão de Fala (Equilibrada)'}
                          </span>
                          <button
                            onClick={() => handleTabChange('script')}
                            className="text-[10px] font-bold text-indigo-400 hover:underline"
                          >
                            Roteiro Completo →
                          </button>
                        </div>
                        <p className="text-xs italic leading-relaxed">
                          {easyMode ? currentSimData.speechSimple : currentSimData.speechTech}
                        </p>
                      </div>
                    )}

                    {/* Insight Técnico Direto */}
                    <div
                      className={`p-3 rounded-xl border-l-4 border-amber-400 ${
                        lightMode ? 'bg-amber-50/80 text-slate-800' : 'bg-amber-500/10 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-400 mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Por que isso importa? (Copetti)
                      </div>
                      <p className="text-xs leading-relaxed">{currentSimData.insight}</p>
                    </div>
                  </div>
                ) : (
                  /* MODO B: INSPETOR DO CHIP SELECIONADO */
                  <div
                    className={`p-4 rounded-2xl border space-y-3.5 ${
                      lightMode ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0c1221] border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: `${CATEGORY_STYLES[selectedComponent.category]?.border}25`,
                            color: CATEGORY_STYLES[selectedComponent.category]?.border
                          }}
                        >
                          {CATEGORY_STYLES[selectedComponent.category]?.label}
                        </span>
                        <h3 className="text-base font-extrabold mt-1.5">{selectedComponent.title}</h3>
                        <p className="text-xs font-mono font-bold text-amber-400 mt-0.5">{selectedComponent.spec}</p>
                      </div>
                      <button
                        onClick={() => setSelectedNodeId(null)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                          lightMode
                            ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                        }`}
                      >
                        ← Voltar
                      </button>
                    </div>

                    {/* Papel Simples do Chip */}
                    {selectedComponent.simpleRole && (
                      <div
                        className={`p-3 rounded-xl border-l-4 border-emerald-500 ${
                          lightMode ? 'bg-emerald-50 text-slate-800' : 'bg-emerald-950/35 text-emerald-100'
                        }`}
                      >
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 mb-0.5">
                          O que esta peça faz (Sem Complicação)
                        </div>
                        <p className="text-xs leading-relaxed font-medium">{selectedComponent.simpleRole}</p>
                      </div>
                    )}

                    {/* Grade de Especificações Técnicas Rápidas */}
                    {selectedComponent.metrics && (
                      <div className="grid grid-cols-2 gap-2">
                        {selectedComponent.metrics.map((m, idx) => (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-xl border ${
                              lightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/70 border-slate-800'
                            }`}
                          >
                            <div className="text-[10px] font-bold uppercase text-slate-400">{m.label}</div>
                            <div className="text-xs font-extrabold mt-0.5 text-blue-400">{m.value}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Explicação Direta */}
                    <div
                      className={`p-3 rounded-xl border ${
                        lightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                        Como Funciona na Prática
                      </div>
                      <p className={`text-xs leading-relaxed ${lightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                        {selectedComponent.detail}
                      </p>
                    </div>

                    {/* Seletor Rápido de Outros Chips do Console */}
                    <div>
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                        Outros Componentes deste Console
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {currentArch.components.map((comp) => (
                          <button
                            key={comp.id}
                            onClick={() => setSelectedNodeId(comp.id)}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                              selectedNodeId === comp.id
                                ? 'bg-blue-600 text-white border-blue-500'
                                : lightMode
                                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                                  : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700 text-slate-300'
                            }`}
                          >
                            {comp.title.split(':')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : activeTab === 'compare' ? (
          /* =====================================================================
             ABA 4: COMPARATIVO VISUAL & SIMULADOR DE TEMPO DE LOADING (XIP vs DMA)
             ===================================================================== */
          <div className="space-y-5">
            {/* Simulador Interativo: Cartucho XIP vs CD-ROM DMA */}
            <div
              className={`p-5 rounded-2xl border ${
                lightMode ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0c1221] border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                    Experimento Interativo
                  </span>
                  <h2 className="text-base md:text-lg font-extrabold mt-1">
                    Por que os jogos em CD precisavam de telas de &ldquo;Loading&rdquo;? (Fita de Cartucho vs. CD-ROM)
                  </h2>
                  <p className={`text-xs mt-0.5 ${lightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                    No cartucho, os fios da fita se ligam direto ao cérebro do videogame (leitura instantânea). No CD-ROM, o laser precisa viajar pelo disco e copiar toda a fase para a &ldquo;mesa de trabalho&rdquo; (memória RAM) antes do jogo começar.
                  </p>
                </div>

                <div
                  className={`p-3 rounded-xl border flex items-center gap-3 ${
                    lightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <label className="text-xs font-bold whitespace-nowrap">Tamanho da Fase:</label>
                  <input
                    type="range"
                    min="64"
                    max="2048"
                    step="64"
                    value={benchPayloadKB}
                    onChange={(e) => setBenchPayloadKB(Number(e.target.value))}
                    className="w-36 accent-blue-500 cursor-pointer"
                  />
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-blue-600 text-white whitespace-nowrap">
                    {benchPayloadKB} KB ({(benchPayloadKB / 1024).toFixed(2)} MB)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {[
                  {
                    name: 'Cartucho ROM (Mega Drive)',
                    speed: 'Acesso Direto nos Chips',
                    seek: '100 ns (Sem motor mecânico)',
                    time: '< 0.05 s (Instantâneo)',
                    ramRole: '64 KB só para variáveis',
                    barWidth: '4%',
                    color: 'bg-emerald-500'
                  },
                  {
                    name: 'PC Engine CD-ROM² (1x)',
                    speed: '150 KB/s via Porta Expansão',
                    seek: '~600 ms (Viagem do laser)',
                    time: `${(0.6 + benchPayloadKB / 150).toFixed(1)} segundos`,
                    ramRole: '64 KB CD-RAM + System Card',
                    barWidth: `${Math.min(100, ((0.6 + benchPayloadKB / 150) / 15) * 100)}%`,
                    color: 'bg-orange-500'
                  },
                  {
                    name: 'Sega Mega-CD (1x)',
                    speed: '150 KB/s → Sub-CPU 12.5 MHz',
                    seek: '~500 ms (Viagem do laser)',
                    time: `${(0.5 + benchPayloadKB / 150).toFixed(1)} segundos`,
                    ramRole: '512 KB PRG-RAM + 256 KB Word',
                    barWidth: `${Math.min(100, ((0.5 + benchPayloadKB / 150) / 15) * 100)}%`,
                    color: 'bg-purple-500'
                  },
                  {
                    name: 'Sony PlayStation (2x)',
                    speed: '300 KB/s → DMA Ch3 (132 MB/s)',
                    seek: '~300 ms (Viagem do laser)',
                    time: `${(0.3 + benchPayloadKB / 300).toFixed(1)} segundos`,
                    ramRole: '2 MB EDO DRAM + 1 MB VRAM',
                    barWidth: `${Math.min(100, ((0.3 + benchPayloadKB / 300) / 15) * 100)}%`,
                    color: 'bg-blue-500'
                  }
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border ${
                      lightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/70 border-slate-800'
                    }`}
                  >
                    <div className="text-xs font-extrabold">{item.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.speed}</div>
                    <div className="text-xl font-black text-amber-400 mt-2">{item.time}</div>
                    <div className="w-full h-2 rounded-full bg-slate-700/60 overflow-hidden my-2">
                      <div className={`h-full ${item.color} transition-all duration-300`} style={{ width: item.barWidth }} />
                    </div>
                    <div className="text-[11px] space-y-0.5 text-slate-400">
                      <div>Busca Mecânica: {item.seek}</div>
                      <div className="font-semibold text-blue-400">Destinos: {item.ramRole}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quadro Comparativo Completo (Copetti, RetroReversing, Archaic Pixels, Plutiedev & PSX-SPX) */}
            <div
              className={`p-5 rounded-2xl border overflow-x-auto ${
                lightMode ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0c1221] border-slate-800'
              }`}
            >
              <h3 className="text-base font-extrabold mb-3">
                Comparativo Arquitetural Completo (Copetti, RetroReversing, Archaic Pixels, Plutiedev &amp; PSX-SPX)
              </h3>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b ${lightMode ? 'border-slate-300 bg-slate-100' : 'border-slate-800 bg-slate-900'}`}>
                    <th className="p-3 font-extrabold">Subsistema</th>
                    <th className="p-3 font-extrabold text-orange-400">NEC PC Engine CD-ROM² (1988)</th>
                    <th className="p-3 font-extrabold text-purple-400">Sega Mega Drive + Mega-CD (1991)</th>
                    <th className="p-3 font-extrabold text-blue-400">Sony PlayStation (1994)</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${lightMode ? 'divide-slate-200' : 'divide-slate-800/80'}`}>
                  <tr>
                    <td className="p-3 font-bold">CPU Principal</td>
                    <td className="p-3">HuC6280 (65C02 8-bit @ 7.16 MHz) + MMU 21-bit (8× MPR) + Timer/IRQ/IO</td>
                    <td className="p-3">Motorola 68000 @ ~7.67 MHz (Regs 32b, ALU/Bus 16b, Addr 24b p/ 16 MB)</td>
                    <td className="p-3">SoC CXD8530BQ (MIPS R3000A @ 33.8688 MHz, 32-bit RISC + CP0)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Coprocessadores</td>
                    <td className="p-3">Sem coprocessador externo (HuC6280 integra PSG, Timer, MMU e Block Move)</td>
                    <td className="p-3">Sub-CPU 68000 @ 12.5 MHz + Zilog Z80 (3.58 MHz) + Gate Array ASIC + CDC LC8951</td>
                    <td className="p-3">COP2 GTE (66 MIPS 3D) + MDEC (IDCT FMV) no SoC + MC68HC05 no CD-ROM</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Memória RAM &amp; Saves</td>
                    <td className="p-3">8 KB Base + 64 KB CD-RAM + 2 KB BRAM + 64 KB ADPCM + System Card (+192KB/+2MB)</td>
                    <td className="p-3">64 KB Base + 8 KB Z80 + 512 KB PRG-RAM + 256 KB Word RAM + 8 KB BRAM</td>
                    <td className="p-3">2 MB EDO DRAM + 4 KB I-Cache + 1 KB Scratchpad + Memory Card 128 KB (SIO0)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Vídeo &amp; Barramento VRAM</td>
                    <td className="p-3">VDC (HuC6270) ↔ 64 KB VRAM (16-bit exclusivo) → Stream 9-bit p/ VCE (482 cores)</td>
                    <td className="p-3">VDP: 64 KB VRAM + 128 B CRAM (64/183 cores) + 80 B VSRAM + ASIC Rotação/Tiles</td>
                    <td className="p-3">Sony GPU • 1 MB Dual-Port VRAM / SGRAM (1024×512) + 2 KB Tex Cache • Sem Z-Buffer</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Barramentos &amp; DMA</td>
                    <td className="p-3">Bus 8-bit / 21-bit MMU + SCSI-1 (CD) + DMA interno no VDC (VRAM→SATB)</td>
                    <td className="p-3">Árbitro BusReq ($A11100) + Bank 32KB Z80 + 16 Comm Ports ($A12010) + Bank Swap</td>
                    <td className="p-3">Main Bus 32b (132 MB/s, 7 Canais DMA Ch0–Ch6) + Ponte BIU Sub Bus (BIOS/Timers/SIO)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Áudio &amp; CD-ROM</td>
                    <td className="p-3">6ch Waveform PSG + OKI MSM5205 ADPCM (64 KB) + CD 1x (150 KB/s, sem trava no CD)</td>
                    <td className="p-3">YM2612 (6ch FM) + SN76489 (4ch PSG no VDP) + Ricoh RF5C164 (8ch PCM) + CD 1x</td>
                    <td className="p-3">SPU 24ch ADPCM (512 KB) + CD 2x (300 KB/s, CXD1815Q + 32 KB, Wobble SCEx/LibCrypt)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Cartões das Fontes Técnicas Pesquisadas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[
                {
                  title: 'PC Engine & Archaic Pixels',
                  author: 'Rodrigo Copetti & Archaic Pixels',
                  desc: 'HuC6280 (MMU 21b, PSG, Timer, IRQ), barramento exclusivo VDC ↔ VRAM (16-bit) e stream 9-bit p/ VCE.',
                  url: 'https://classic.copetti.org/writings/consoles/pc-engine/'
                },
                {
                  title: 'Mega Drive, Mega-CD & Plutiedev',
                  author: 'Rodrigo Copetti, Plutiedev & RetroReversing',
                  desc: 'Dual 68000, BusReq Z80 e janela de 32 KB, Gate Array Comm Ports ($A12010), Word RAM, CDC LC8951 e Ricoh PCM.',
                  url: 'https://www.copetti.org/pt-br/writings/consoles/mega-drive-genesis/'
                },
                {
                  title: 'PlayStation (PS1) Architecture',
                  author: 'Rodrigo Copetti & RetroReversing',
                  desc: 'SoC CXD8530BQ (R3000A, GTE, MDEC, 1KB Scratchpad), Dual-Port VRAM, Ordering Table e Subsistema CD 68HC05.',
                  url: 'https://www.copetti.org/pt-br/writings/consoles/playstation/'
                },
                {
                  title: 'Nocash PSX-SPX Specifications',
                  author: 'Martin Korth (problemkaputt.de)',
                  desc: 'Documentação completa dos 7 canais DMA (Ch0–Ch6 OTC), cadeia FMV (DMA0/1/2), BIU, 3 Timers, SIO0 e CXD1815Q.',
                  url: 'https://problemkaputt.de/psx-spx.htm'
                }
              ].map((ref, idx) => (
                <a
                  key={idx}
                  href={ref.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`p-4 rounded-xl border transition group flex flex-col justify-between ${
                    lightMode
                      ? 'bg-white hover:border-blue-400 border-slate-200 shadow-xs'
                      : 'bg-[#0c1221] hover:border-blue-500/60 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-blue-400">
                      <span>{ref.author}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                    </div>
                    <h4 className="text-xs font-extrabold mt-1 group-hover:text-blue-400 transition">{ref.title}</h4>
                    <p className={`text-[11px] mt-1 leading-relaxed ${lightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                      {ref.desc}
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 truncate mt-3">{ref.url}</div>
                </a>
              ))}
            </div>
          </div>
        ) : (
          /* =====================================================================
             ABA 5: ROTEIRO NÃO TÃO TÉCNICO (FÁCIL PARA QUALQUER PESSOA ENTENDER)
             ===================================================================== */
          <div className="space-y-5">
            {/* Cabeçalho do Guia de Apresentação */}
            <div
              className={`p-5 rounded-2xl border ${
                lightMode ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0c1221] border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                    Roteiro Acessível para Todos
                  </span>
                  <h2 className="text-lg font-extrabold mt-1">
                    Roteiro de Apresentação Simples (Para quem não conhece termos técnicos)
                  </h2>
                  <p className={`text-xs mt-1 ${lightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                    Use este guia para apresentar o simulador para qualquer pessoa. Ele usa comparações simples do dia a dia (mesa de trabalho, depósito, bancada giratória e avenida expressa).
                  </p>
                </div>
                <button
                  onClick={() => handleTabChange('pce')}
                  className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition"
                >
                  <Play className="w-3.5 h-3.5" />
                  Começar Apresentação no PC Engine
                </button>
              </div>

              {/* Dicionário Rápido de 1 Minuto */}
              <div className="mt-4 pt-4 border-t border-slate-800/60">
                <div className="text-xs font-extrabold uppercase tracking-wider text-amber-400 mb-2.5">
                  Quebra-Gelo Inicial: Como explicar as 5 peças de um videogame em 30 segundos
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
                  {SIMPLE_GLOSSARY.map((g, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border ${
                        lightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/70 border-slate-800'
                      }`}
                    >
                      <div className="text-xs font-extrabold text-blue-400">{g.term}</div>
                      <div className="text-[11px] font-bold text-emerald-400 mt-0.5">&ldquo;{g.everyday}&rdquo;</div>
                      <p className={`text-[11px] mt-1 leading-relaxed ${lightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                        {g.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Roteiro Passo a Passo dos 3 Consoles */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {[
                {
                  id: 'pce',
                  badge: 'Parte 1 • 1988',
                  title: 'NEC PC Engine CD-ROM²',
                  tagline: 'O pioneiro: Um pequeno console de 8 bits que ganhou uma "maleta" de CD e um cartão-tradutor.',
                  color: 'border-orange-500/50',
                  btnColor: 'bg-orange-600 hover:bg-orange-500',
                  introSpeech:
                    '"Para começar, vamos voltar para 1988 com o PC Engine, o primeiro videogame da história a usar CD-ROM. Antes dele, os jogos vinham em fitas que cabiam pouca coisa, mas eram lidas na hora. Quando colocaram um CD de 650 Megabytes nele, surgiu um desafio: o console só tinha 8 KB de memória interna — uma mesinha minúscula!"',
                  steps: ARCHITECTURE_DATA.pce.simulationSteps
                },
                {
                  id: 'megacd',
                  badge: 'Parte 2 • 1991',
                  title: 'Sega Mega Drive + Mega-CD',
                  tagline: 'Força em dupla: Dois processadores 68000 trocando desenhos por uma "bancada giratória".',
                  color: 'border-purple-500/50',
                  btnColor: 'bg-purple-600 hover:bg-purple-500',
                  introSpeech:
                    '"Três anos depois, em 1991, a Sega lançou o Mega-CD para o Mega Drive. Em vez de adicionar só um leitor de discos, a Sega colocou praticamente um segundo videogame inteiro dentro do aparelho! Agora temos dois chefes trabalhando ao mesmo tempo."',
                  steps: ARCHITECTURE_DATA.megacd.simulationSteps
                },
                {
                  id: 'ps1',
                  badge: 'Parte 3 • 1994',
                  title: 'Sony PlayStation (PS1)',
                  tagline: 'Nascido para o CD e o 3D: Tudo integrado no mesmo chip e uma avenida expressa de 132 MB/s.',
                  color: 'border-blue-500/50',
                  btnColor: 'bg-blue-600 hover:bg-blue-500',
                  introSpeech:
                    '"Finalmente chegamos a 1994 com o PlayStation 1. Nos dois anteriores, o CD era um acessório vendido separado. Já o PlayStation foi desenhado desde o primeiro dia para o CD e para os gráficos 3D, juntando todas as peças principais dentro de um único super-chip!"',
                  steps: ARCHITECTURE_DATA.ps1.simulationSteps
                }
              ].map((consoleScript) => (
                <div
                  key={consoleScript.id}
                  className={`p-4 rounded-2xl border-2 ${consoleScript.color} flex flex-col justify-between ${
                    lightMode ? 'bg-white shadow-xs' : 'bg-[#0c1221]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                        {consoleScript.badge}
                      </span>
                      <button
                        onClick={() => handleTabChange(consoleScript.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold text-white ${consoleScript.btnColor} transition flex items-center gap-1`}
                      >
                        Ir para o Diagrama <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold">{consoleScript.title}</h3>
                      <p className="text-xs text-emerald-400 font-semibold mt-0.5">{consoleScript.tagline}</p>
                    </div>

                    <div
                      className={`p-3 rounded-xl border text-xs italic leading-relaxed ${
                        lightMode ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900/80 border-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="font-extrabold not-italic text-indigo-400 block mb-1">
                        Abertura sugerida:
                      </span>
                      {consoleScript.introSpeech}
                    </div>

                    <div className="space-y-2">
                      {consoleScript.steps.map((st, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl border text-xs ${
                            lightMode ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-900/50 border-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-extrabold text-amber-400">
                              Passo {idx}: {st.shortTitle}
                            </span>
                            <button
                              onClick={() => {
                                handleTabChange(consoleScript.id);
                                setSimStep(idx);
                              }}
                              className="text-[10px] font-bold text-blue-400 hover:underline"
                            >
                              Ver Animação #{idx}
                            </button>
                          </div>
                          <p className={`text-[11px] leading-relaxed ${lightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                            {st.speechSimple}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
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
  Gauge,
  BookOpen,
  Maximize2,
  Minimize2,
  Sparkles,
  ExternalLink,
  MessageSquareHeart,
  HelpCircle,
  Image as ImageIcon,
  Music,
  Film
} from 'lucide-react';

// ============================================================================
// BASE DE DADOS COMPLETA DE ARQUITETURA (PC ENGINE CD-ROM², MEGA-CD E PS1)
// Todos os barramentos usam caminhos <path> direcionados do início ao fim!
// ============================================================================

const ARCHITECTURE_DATA = {
  pce: {
    id: 'pce',
    shortName: 'PC Engine CD-ROM²',
    name: 'NEC PC Engine + CD-ROM² (1988)',
    subtitle: 'Hudson Soft HuC6280 (CPU 65C02 + PSG + MMU 21-bit) • VDC (HuC6270) ↔ 64 KB VRAM → Video Encoder (VCE)',
    year: '1988',
    sources: [
      { label: 'Arquitetura — PC Engine', url: 'https://classic.copetti.org/writings/consoles/pc-engine/' },
      { label: 'Archaic Pixels — PCE Tech Wiki', url: 'https://www.archaicpixels.com/Main_Page' },
      { label: 'RetroReversing — PC Engine', url: 'https://www.retroreversing.com/pc-engine/' }
    ],
    simulationSteps: [
      {
        step: 0,
        shortTitle: 'Visão Geral',
        title: 'Console Base: Os 5 Blocos do PC Engine Original (HuC6280, 8 KB RAM, VDC, 64 KB VRAM e Video Encoder)',
        summary:
          'O PC Engine base reúne 5 blocos: o chip Hudson Soft HuC6280 (núcleo 65C02 + gerador de som PSG de 6 canais + MMU de 21 bits + leitura do controle), 8 KB de RAM, o Video Display Controller (VDC) ligado aos 64 KB de VRAM e o Video Encoder (VCE) com amplificador de áudio.',
        simpleAnalogy:
          'Imagine um trabalhador rápido que só consegue colocar 8 folhas na mesa por vez (64 KB), mas tem um fichário inteligente (MMU) que troca essas folhas de um arquivo de 2 MB, além de dois artistas dedicados (VDC e VCE) para desenhar e enviar a imagem e o som para a TV.',
        flowSteps: [
          {
            nodeId: 'pce-cpu',
            tag: '1. Hudson Soft HuC6280 (CPU 65C02 + PSG + MMU)',
            iconType: 'code',
            text: 'Integra na mesma pastilha a CPU baseada no 65C02 (7.16 MHz), o Programmable Sound Generator (6 canais PSG), a MMU de 21 bits (8× MPR), Timer e leitura do controle.'
          },
          {
            nodeId: 'pce-wram',
            tag: '2. Work RAM Base (8 KB SRAM)',
            iconType: 'code',
            text: 'Ligada diretamente à CPU HuC6280 (página $F8 da MMU); guarda a Zero-Page, a Pilha (Stack) e as variáveis da partida.'
          },
          {
            nodeId: 'pce-vdc',
            tag: '3. Video Display Controller (VDC — HuC6270)',
            iconType: 'image',
            text: 'Controlador de exibição de vídeo: monta o plano de fundo (Tiles 8×8) e até 64 Sprites (com DMA próprio para a SATB) lendo palavras de 16 bits.'
          },
          {
            nodeId: 'pce-vram',
            tag: '4. VRAM Dedicada (64 KB — Barramento 16-bit)',
            iconType: 'image',
            text: 'Ligada exclusivamente ao Video Display Controller (VDC) por um barramento de 16 bits (32K Words) — o Video Encoder não acessa a VRAM!'
          },
          {
            nodeId: 'pce-vce',
            tag: '5. Video Encoder (VCE — HuC6260) + Audio Amplifier',
            iconType: 'image',
            text: 'Recebe os pixels digitais de 9 bits vindos do VDC e o áudio do PSG amplificado, aplica as 32 paletas (até 482 cores na tela) e envia vídeo e som para a TV.'
          }
        ],
        insight:
          'A VRAM de 64 KB é conectada exclusivamente ao Video Display Controller (VDC) em 16 bits. O Video Encoder (VCE) não lê a VRAM: ele recebe os pixels diretamente do VDC e junta com o som amplificado do PSG para enviar à TV!',
        activeNodes: ['pce-cpu', 'pce-wram', 'pce-vdc', 'pce-vram', 'pce-vce'],
        activeBuses: [],
        packets: []
      },
      {
        step: 1,
        shortTitle: 'System Card',
        title: 'Boot do CD: HuCard (System Card ROM + RAM) → CPU HuC6280 ↔ 8 KB RAM ($F8)',
        summary:
          'Como o console original lia jogos em cartões HuCard (Mask ROM), o cartão System Card entra nesse mesmo slot para entregar a BIOS do CD-ROM² e memória RAM extra à CPU HuC6280, que inicializa a Zero-Page e a Pilha (Stack) nos 8 KB de RAM base ($F8).',
        simpleAnalogy:
          'Colocamos um "cartão-tradutor" (System Card) na entrada HuCard que ensina a CPU a usar o CD e traz mais memória, enquanto a CPU anota as variáveis vitais e a pilha de chamadas no seu bloco de notas interno de 8 KB.',
        flowSteps: [
          {
            nodeId: 'pce-syscard',
            tag: '1. Slot HuCard: System Card (Mask ROM BIOS + RAM)',
            iconType: 'code',
            text: 'Entra no slot HuCard de 38 pinos, entrega a BIOS do CD-ROM² e adiciona +192 KB (Super System Card) ou +2 MB (Arcade Card).'
          },
          {
            nodeId: 'pce-cpu',
            tag: '2. Hudson Soft HuC6280 (CPU 65C02 + MMU)',
            iconType: 'code',
            text: 'Lê a BIOS do HuCard pelo barramento de 21 bits e configura os 8 registradores MPR da MMU (mapeando a página $F8 no MPR1).'
          },
          {
            nodeId: 'pce-wram',
            tag: '3. Work RAM Base (8 KB SRAM — Página $F8)',
            iconType: 'code',
            text: 'Aloja obrigatoriamente a Zero-Page ($2000), a Pilha de Hardware (Stack $2100) do núcleo 65C02 e os ponteiros do sistema.'
          }
        ],
        insight:
          'Toda CPU baseada no 65C02 depende da Zero-Page e da Pilha (Stack) para chamar sub-rotinas (JSR/RTS). No PC Engine, elas ficam fixas na página física $F8 (os 8 KB de RAM do console base)!',
        activeNodes: ['pce-syscard', 'pce-cpu', 'pce-wram'],
        activeBuses: ['bus-pce-hucard', 'bus-pce-wram'],
        packets: [
          {
            pathId: 'path-pce-hucard',
            color: '#f59e0b',
            type: 'code',
            label: '1. BIOS + RAM Extra',
            badgeX: 355,
            badgeY: 112
          },
          {
            pathId: 'path-pce-wram',
            color: '#10b981',
            type: 'code',
            label: '2. Zero-Page & Stack ($F8)',
            badgeX: 170,
            badgeY: 208
          }
        ]
      },
      {
        step: 2,
        shortTitle: 'Leitura CD 1x',
        title: 'Expansion Port & Leitura 1x: Leitor SCSI → 64 KB CD-RAM → CPU HuC6280 ↔ 8 KB RAM ($F8)',
        summary:
          'Pela Expansion Port (que expõe as linhas de CPU, VDC, PSG e Video Out), o leitor 1x abastece os 64 KB de CD-RAM com os arquivos pesados da fase, enquanto a CPU HuC6280 executa o jogo usando os 8 KB de RAM base ($F8) para física, controles e pilha!',
        simpleAnalogy:
          'A CD-RAM de 64 KB conectada na porta de expansão é o depósito onde ficam os arquivos grandes lidos do CD, enquanto a RAM base de 8 KB é a mesa rápida da CPU onde ficam os controles, a pontuação e a pilha da partida!',
        flowSteps: [
          {
            nodeId: 'pce-drive',
            tag: '1. Leitor CD-ROM² (1x — Controlador SCSI)',
            iconType: 'disc',
            text: 'Lê os setores do disco a 150 KB/s e envia pelo barramento SCSI-1 até a base acoplada na Expansion Port (Interface Unit IFU-30).'
          },
          {
            nodeId: 'pce-cdram',
            tag: '2. CD-ROM² Work RAM (64 KB + 2 KB BRAM)',
            iconType: 'code',
            text: 'Guarda os arquivos grandes carregados do CD (código da fase, tiles e sprites) nos bancos $80–$87 da MMU.'
          },
          {
            nodeId: 'pce-cpu',
            tag: '3. Hudson Soft HuC6280 (CPU 65C02 + MMU)',
            iconType: 'code',
            text: 'Acessa os dados da fase pela Expansion Port nos bancos $80–$87 e processa a lógica da partida a 7.16 MHz.'
          },
          {
            nodeId: 'pce-wram',
            tag: '4. Work RAM Base (8 KB SRAM — Página $F8)',
            iconType: 'code',
            text: 'Trabalha continuamente junto com a CPU guardando a Zero-Page, a Stack, posição X/Y dos objetos, vidas e leitura do controle!'
          }
        ],
        insight:
          'Por que existem duas memórias RAM de trabalho? Os 64 KB da unidade CD-ROM² recebem os arquivos pesados vindos do disco, mas os 8 KB de RAM interna ($F8) continuam indispensáveis para a Zero-Page, a Pilha (Stack) e o estado em tempo real da partida!',
        activeNodes: ['pce-drive', 'pce-cdram', 'pce-cpu', 'pce-wram'],
        activeBuses: ['bus-pce-scsi', 'bus-pce-exp', 'bus-pce-wram'],
        packets: [
          {
            pathId: 'path-pce-scsi',
            color: '#f97316',
            type: 'disc',
            label: '1. 150 KB/s (SCSI)',
            badgeX: 700,
            badgeY: 205
          },
          {
            pathId: 'path-pce-exp',
            color: '#38bdf8',
            type: 'code',
            label: '2. Fase (64 KB CD-RAM)',
            badgeX: 355,
            badgeY: 262
          },
          {
            pathId: 'path-pce-wram',
            color: '#10b981',
            type: 'code',
            label: '3. Variáveis & Stack (8 KB)',
            badgeX: 170,
            badgeY: 208
          }
        ]
      },
      {
        step: 3,
        shortTitle: 'Vídeo Dual-Chip',
        title: 'Pipeline Gráfico: CD-RAM → CPU HuC6280 → VDC ↔ 64 KB VRAM (16-bit) → Video Encoder (VCE)',
        summary:
          'Os 5 blocos atuam na topologia exata do hardware: os gráficos saem da CD-RAM para a CPU HuC6280, que alimenta o Video Display Controller (VDC). O VDC grava e lê nos 64 KB de VRAM exclusiva de 16 bits e envia o fluxo de pixels direto para o Video Encoder (VCE) exibir na TV!',
        simpleAnalogy:
          'A CPU pega os desenhos na bancada do CD e entrega ao 1º artista (VDC). O VDC guarda e lê os desenhos no seu caderno exclusivo de 16 bits (64 KB VRAM) e manda o desenho pronto direto para o 2º artista (Video Encoder) colorir na TV!',
        flowSteps: [
          {
            nodeId: 'pce-cdram',
            tag: '1. CD-ROM² Work RAM (64 KB)',
            iconType: 'code',
            text: 'Fornece os gráficos brutos (tiles 8×8 de cenário e sprites 16×16) que foram carregados do CD-ROM.'
          },
          {
            nodeId: 'pce-cpu',
            tag: '2. CPU HuC6280 (Instruções em Bloco TAI/TIA)',
            iconType: 'code',
            text: 'Transfere os gráficos em rajada para o Video Display Controller (VDC) e configura as 32 paletas de cores no Video Encoder (VCE).'
          },
          {
            nodeId: 'pce-vdc',
            tag: '3. Video Display Controller (VDC — HuC6270)',
            iconType: 'image',
            text: 'Grava os tiles e sprites na VRAM via barramento de 16 bits e usa DMA interno para atualizar a tabela de 64 sprites (SATB).'
          },
          {
            nodeId: 'pce-vram',
            tag: '4. VRAM Exclusiva do VDC (64 KB — 16-bit)',
            iconType: 'image',
            text: 'Conectada única e exclusivamente ao VDC em palavras de 16 bits, devolvendo duas linhas de bitplanes por leitura.'
          },
          {
            nodeId: 'pce-vce',
            tag: '5. Video Encoder (VCE — HuC6260)',
            iconType: 'image',
            text: 'Recebe o fluxo de pixels de 9 bits diretamente do VDC (sem tocar na VRAM!), aplica até 482 cores e gera o sinal para a TV.'
          }
        ],
        insight:
          'Detalhe fundamental da arquitetura: o Video Encoder (VCE) não lê a VRAM! Os 64 KB de VRAM pertencem exclusivamente ao Video Display Controller (VDC), que monta a imagem e a envia diretamente ao Video Encoder.',
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
            label: '2. CPU → VDC/VCE',
            badgeX: 255,
            badgeY: 298
          },
          {
            pathId: 'path-pce-vdc',
            color: '#38bdf8',
            type: 'image',
            label: '3. VDC ↔ VRAM 16b',
            badgeX: 95,
            badgeY: 390
          },
          {
            pathId: 'path-pce-vce',
            color: '#a855f7',
            type: 'image',
            label: '4. VDC → VCE (9-bit)',
            badgeX: 262,
            badgeY: 440
          }
        ]
      },
      {
        step: 4,
        shortTitle: 'Áudio Triplo',
        title: 'Mixagem Tripla: Leitor de CD (CD-DA) + HuC6280 (PSG → Audio Amplifier) + ADPCM (OKI MSM5205)',
        summary:
          'As 3 fontes sonoras se unem: dentro do HuC6280, o Programmable Sound Generator (6 canais PSG) passa pelo Audio Amplifier; na unidade de CD (conectada via linha PSG da Expansion Port), o leitor envia música CD-DA e o chip OKI MSM5205 soma as vozes dos 64 KB ADPCM.',
        simpleAnalogy:
          'É uma banda com 3 músicos: o CD toca a música gravada em estúdio, o gerador PSG dentro do processador manda os efeitos sonoros pelo amplificador e o chip ADPCM fala as vozes dos personagens usando sua própria memória de 64 KB!',
        flowSteps: [
          {
            nodeId: 'pce-drive',
            tag: '1. Leitor CD-ROM² (Música Red Book CD-DA)',
            iconType: 'disc',
            text: 'Lê as faixas de áudio estéreo de 16 bits / 44.1 kHz direto do CD sem gastar 1 byte de memória RAM.'
          },
          {
            nodeId: 'pce-cpu',
            tag: '2. HuC6280: Programmable Sound Generator (6ch PSG)',
            iconType: 'audio',
            text: 'Integrado dentro do próprio chip HuC6280: gera 6 canais de ondas programáveis (32 amostras de 5 bits) enviados ao Audio Amplifier e à Expansion Port.'
          },
          {
            nodeId: 'pce-adpcm',
            tag: '3. Áudio ADPCM (OKI MSM5205 + 64 KB DRAM)',
            iconType: 'audio',
            text: 'Decodifica vozes dubladas em 4-bit ADPCM (até 32 kHz) nos seus 64 KB exclusivos e mixa com o áudio CD-DA e o som PSG.'
          }
        ],
        insight:
          'Separar 64 KB de DRAM exclusivos para o chip OKI MSM5205 na base CD-ROM² permitia tocar falas dubladas a qualquer momento sem ocupar a memória principal nem interromper os 6 canais do Programmable Sound Generator (PSG).',
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
        title: 'Hudson Soft HuC6280 (CPU + PSG)',
        spec: '65C02-based CPU @ 7.16 MHz + PSG',
        subSpec: 'MMU 8× MPR (21b) + 6ch PSG + Timer/IRQ/IO',
        category: 'cpu',
        simpleRole: 'O chip principal da Hudson Soft: reúne no mesmo invólucro a CPU baseada no 65C02, o gerador de som PSG de 6 canais, o paginador de memória (MMU) e a leitura do controle.',
        metrics: [
          { label: 'Clock Duplo', value: '1.79 MHz ou 7.16 MHz' },
          { label: 'Barramentos', value: '8-bit Dados / 21-bit Físico MMU' },
          { label: 'Paginação MMU', value: '8× Registradores MPR de 8 KB (2 MB)' },
          { label: 'Integrados no Chip', value: '65C02 + 6ch PSG + Timer + I/O' }
        ],
        detail:
          'Projetado pela Hudson Soft (fabricado pela Epson), o HuC6280 integra em uma única pastilha a CPU baseada no 65C02 (com instruções de transferência em bloco TAI, TIA, TDD, TIN e TII), o Programmable Sound Generator (PSG de 6 canais conectado ao Audio Amplifier), a MMU de 8 registradores MPR (convertendo endereços lógicos de 16 bits em 21 bits físicos), Timer de 7 bits, controlador de interrupções e entrada para o controle.'
      },
      {
        id: 'pce-wram',
        title: 'Work RAM Base (8 KB RAM)',
        spec: '8 KB SRAM Interna ($F8)',
        subSpec: 'Memória Original do Console Base',
        category: 'ram',
        simpleRole: 'A memória rápida de 8 KB ligada diretamente à CPU HuC6280, usada para guardar a pilha de execução e as variáveis da partida.',
        metrics: [
          { label: 'Capacidade', value: '8 KB SRAM (32 KB no SuperGrafx)' },
          { label: 'Página Física', value: 'Banco $F8 na MMU (Zero-Page/Stack)' },
          { label: 'Acesso', value: 'Zero Wait-States (Sem espera)' },
          { label: 'No CD-ROM²', value: 'Expandida com +64 KB / +256 KB' }
        ],
        detail:
          'Memória SRAM interna do PC Engine original mapeada no banco físico $F8 (onde residem a Zero-Page e a Stack do 65C02). Como 8 KB eram insuficientes para armazenar fases inteiras vindas de um CD-ROM, a unidade CD-ROM² (via Expansion Port) e as System Cards (via slot HuCard) adicionaram novos bancos de RAM paginados pela MMU.'
      },
      {
        id: 'pce-vdc',
        title: 'Video Display Controller (VDC)',
        spec: 'HuC6270 • Barramento VRAM 16-bit',
        subSpec: 'Tiles 8×8 + 64 Sprites + DMA Interno',
        category: 'gpu',
        simpleRole: 'O controlador de exibição de vídeo: monta os blocos do cenário, controla os 64 sprites na tela usando a VRAM de 16 bits e envia a imagem pronta para o Video Encoder.',
        metrics: [
          { label: 'Barramento VRAM', value: '16-bit Dados / 15-bit Endereço' },
          { label: 'Cenário', value: '1 Camada de Tiles 8×8 (BAT)' },
          { label: 'Sprites', value: '64 na tela (16 por linha, até 32×64)' },
          { label: 'DMA Interno', value: 'VRAM → SATB e VRAM → VRAM' }
        ],
        detail:
          'Embora a CPU HuC6280 seja de 8 bits, o Video Display Controller (HuC6270) possui portas de dados de 16 bits e acessa seus 64 KB de VRAM por um barramento exclusivo de 16 bits. Conta com DMA interno para atualizar a tabela de 64 sprites (SATB) e envia os pixels digitais de 9 bits diretamente para o Video Encoder (VCE).'
      },
      {
        id: 'pce-vram',
        title: '64 KB VRAM (Exclusiva do VDC)',
        spec: '64 KB SRAM (32K Words × 16-bit)',
        subSpec: 'Ligada exclusivamente ao VDC',
        category: 'ram',
        simpleRole: 'O caderno de desenho de 64 KB exclusivo do chip VDC, lido em palavras de 16 bits para dobrar a velocidade dos gráficos.',
        metrics: [
          { label: 'Capacidade', value: '64 KB (32.768 Words de 16 bits)' },
          { label: 'Formato Planar', value: '4 Bitplanes (16 cores por tile/sprite)' },
          { label: 'Tabela BAT', value: 'Background Attribute Table (32×32 a 128×64)' },
          { label: 'Conexão Física', value: 'Exclusiva do VDC (VCE não acessa)' }
        ],
        detail:
          'Conectada única e exclusivamente ao Video Display Controller (VDC) por um barramento dedicado de 16 bits. Cada leitura de 16 bits busca duas linhas de planos de bits simultaneamente. O Video Encoder (VCE) não possui ligação física com a VRAM.'
      },
      {
        id: 'pce-vce',
        title: 'Video Encoder (VCE) + Audio Amp',
        spec: 'HuC6260 • 32 Paletas RGB 9-bit',
        subSpec: 'Recebe VDC + Audio Amp → TV e Som',
        category: 'gpu',
        simpleRole: 'Recebe o desenho digital vindo do VDC e o áudio do amplificador, aplica até 482 cores simultâneas e envia o sinal de vídeo e som para a TV.',
        metrics: [
          { label: 'Paletas Internas', value: '32 Paletas (16 BG + 16 Sprites)' },
          { label: 'Cores Simultâneas', value: 'Até 482 cores na tela (de 512)' },
          { label: 'Entradas', value: 'Pixels 9-bit do VDC + Audio Amplifier' },
          { label: 'Clock de Vídeo', value: '5.37 / 7.16 / 10.74 MHz (Dot Clock)' }
        ],
        detail:
          'O Video Encoder (HuC6260) recebe o fluxo de pixels de 9 bits vindo do Video Display Controller (4 bits de cor + 4 bits de paleta + 1 bit indicando Background ou Sprite), converte em cores da sua tabela interna de 32 paletas e combina com o sinal vindo do Audio Amplifier para alimentar a televisão e os alto-falantes.'
      },
      {
        id: 'pce-syscard',
        title: 'HuCard: System Card (Slot 38p)',
        spec: 'Mask ROM BIOS + Expansão de RAM',
        subSpec: '+192 KB (Super) ou +2 MB (Arcade)',
        category: 'storage',
        simpleRole: 'Cartão inserido na entrada HuCard que fornece a BIOS do CD-ROM² e adiciona memória RAM extra ao sistema.',
        metrics: [
          { label: 'Conector', value: 'Slot HuCard (38 pinos)' },
          { label: 'System Card 1.0–2.1', value: '256 KB Mask ROM (BIOS do CD-ROM²)' },
          { label: 'Super System Card 3.0', value: 'BIOS + 192 KB SRAM (Total 256 KB)' },
          { label: 'Arcade Card Pro/Duo', value: 'BIOS + 2 MB DRAM com registradores' }
        ],
        detail:
          'No console original, o slot HuCard lê cartões com Mask ROM diretamente ligados à CPU. Para usar o CD-ROM², insere-se nesse slot a System Card, que fornece o sistema operacional (BIOS) do leitor óptico e expande a memória RAM paginada pela MMU (integrada de fábrica nos modelos PC Engine Duo).'
      },
      {
        id: 'pce-cdram',
        title: 'CD-ROM² Work RAM & BRAM',
        spec: '64 KB DRAM + 2 KB Save BRAM',
        subSpec: 'Expansion Port (IFU-30) • Bancos $80–$87',
        category: 'ram',
        simpleRole: 'Bancada de 64 KB na unidade de CD (conectada via Expansion Port) onde ficam os arquivos da fase atual, mais 2 KB para salvar o progresso.',
        metrics: [
          { label: 'RAM da IFU-30', value: '64 KB DRAM (256 KB no Super CD-ROM²)' },
          { label: 'Save Memory', value: '2 KB BRAM mantida por capacitor/bateria' },
          { label: 'Mapeamento MMU', value: '8 Páginas de 8 KB (Bancos $80–$87)' },
          { label: 'Barramento', value: 'Expansion Port (CPU, VDC, PSG, Video Out)' }
        ],
        detail:
          'Localizada na Interface Unit (IFU-30) acoplada à Expansion Port traseira do console. Recebe o código e os gráficos lidos do CD-ROM via controlador SCSI antes de serem processados pela CPU HuC6280 e enviados ao VDC.'
      },
      {
        id: 'pce-adpcm',
        title: 'Áudio ADPCM (OKI MSM5205) + Mixer',
        spec: '64 KB ADPCM DRAM + Fader CD-DA',
        subSpec: 'Vozes 4-bit ADPCM (1.6–32 kHz) + CD-DA',
        category: 'audio',
        simpleRole: 'Chip de som na base do CD com 64 KB exclusivos para reproduzir vozes dubladas e misturá-las com a música do CD e o som PSG.',
        metrics: [
          { label: 'Memória de Voz', value: '64 KB DRAM Exclusivos para ADPCM' },
          { label: 'Decodificador', value: 'OKI MSM5205 (4-bit → 12-bit PCM)' },
          { label: 'Taxa de Amostragem', value: 'Variável de 1.6 kHz até 32.08 kHz' },
          { label: 'Saída Estéreo', value: 'Mixa ADPCM + CD-DA + 6ch PSG' }
        ],
        detail:
          'Dedica 64 KB exclusivos de DRAM para amostras de voz comprimidas (ADPCM) reproduzidas pelo decodificador OKI MSM5205, deixando a memória principal totalmente livre para o código e os cenários do jogo.'
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
    subtitle: 'Dual Motorola 68000 (7.67 MHz + 12.5 MHz) • VDP Package (VDP + PSG) • Z80 + YM2612 • ASIC & Word RAM',
    year: '1991',
    sources: [
      { label: 'Arquitetura — Mega Drive / Genesis', url: 'https://www.copetti.org/pt-br/writings/consoles/mega-drive-genesis/' },
      { label: 'Plutiedev — Mega Drive & Mega-CD Dev', url: 'https://plutiedev.com/' },
      { label: 'RetroReversing — Mega Drive / Mega-CD', url: 'https://www.retroreversing.com/megadrive' }
    ],
    simulationSteps: [
      {
        step: 0,
        shortTitle: 'Visão Geral',
        title: 'Mega Drive Base: Os 4 Blocos no Barramento de 16 bits e 8 bits (68000, Bus Arbiter/RAM, VDP Package e Z80+YM2612)',
        summary:
          'No console base atuam 4 conjuntos: o Motorola 68000 (7.67 MHz) com 64 KB de RAM no barramento de 16 bits, o Bus Arbiter e I/O Controller, o VDP Package (que reúne o Video Display Processor ligado aos 64 KB de VRAM e o chip TI SN76489 PSG) e o barramento de 8 bits com o Zilog Z80 (8 KB RAM) e o sintetizador Yamaha YM2612 FM ligados ao Audio Mixer.',
        simpleAnalogy:
          'São dois funcionários trabalhando juntos: o chefe (68000) cuida do jogo na sua avenida de 16 bits com 64 KB de RAM, o desenhista (VDP Package) monta a imagem, e um assistente (Z80) trabalha na sua rua de 8 bits cuidando da música FM e PSG, coordenados pelo guarda de trânsito (Bus Arbiter).',
        flowSteps: [
          {
            nodeId: 'mcd-maincpu',
            tag: '1. Motorola 68000 CPU (7.67 MHz — Barramento 16-bit)',
            iconType: 'code',
            text: 'CPU principal de 16/32 bits conectada ao barramento de 16 bits junto ao slot de Cartucho (Game Cartridge) e à porta de expansão (Accessory Port).'
          },
          {
            nodeId: 'mcd-arbiter',
            tag: '2. 64 KB RAM + Bus Arbiter & I/O Controller',
            iconType: 'code',
            text: 'Guarda o estado do jogo nos 64 KB de RAM, lê os controles pelo I/O Controller e arbitra o acesso entre o barramento de 16 bits (68000) e o de 8 bits (Z80).'
          },
          {
            nodeId: 'mcd-vdp',
            tag: '3. VDP Package: Video Display Processor + TI SN76489 PSG',
            iconType: 'image',
            text: 'Pacote integrado que abriga o Video Display Processor (conectado aos 64 KB de VRAM via barramento de 8 bits, além de CRAM e VSRAM internas) e o gerador de som TI SN76489 PSG.'
          },
          {
            nodeId: 'mcd-z80',
            tag: '4. Barramento 8-bit: Zilog Z80 + 8 KB RAM + Yamaha YM2612 FM',
            iconType: 'audio',
            text: 'CPU Z80 (3.58 MHz) com 8 KB de RAM que comanda o sintetizador Yamaha YM2612 FM; seu som se une ao PSG no Audio Mixer rumo ao Video Encoder (TV) e saída de fone!'
          }
        ],
        insight:
          'O VDP Package integra na mesma pastilha o Video Display Processor (ligado aos 64 KB de VRAM por um barramento de 8 bits) e o chip de som TI SN76489 PSG, cujo áudio é somado ao Yamaha YM2612 FM no Audio Mixer!',
        activeNodes: ['mcd-maincpu', 'mcd-arbiter', 'mcd-vdp', 'mcd-z80'],
        activeBuses: [],
        packets: []
      },
      {
        step: 1,
        shortTitle: 'Sub-CPU 12.5 MHz',
        title: 'Mega-CD na Accessory Port: Leitor 1x & CDC (LC8951) → 2º Motorola 68000 (12.5 MHz) → 512 KB PRG-RAM',
        summary:
          'Acoplado à Accessory Port do barramento de 16 bits, o Mega-CD aciona seus 3 blocos principais: o leitor óptico lê o CD a 150 KB/s passando pelo controlador CDC Sanyo LC8951 (16 KB de cache), entrega à Sub-CPU Motorola 68000 (12.5 MHz + 128 KB BIOS + 8 KB BRAM) e abastece os 512 KB de PRG-RAM.',
        simpleAnalogy:
          'Pela porta de expansão lateral (Accessory Port), o Mega-CD adiciona praticamente um segundo videogame inteiro: o leitor de CD entrega os arquivos para um segundo processador 68000 63% mais rápido, que trabalha numa mesa de 512 KB (8 vezes maior que a RAM do Mega Drive)!',
        flowSteps: [
          {
            nodeId: 'mcd-drive',
            tag: '1. CD-ROM (1x CLV) + CDC Sanyo LC8951 (16 KB)',
            iconType: 'disc',
            text: 'Lê setores a 150 KB/s; o controlador CDC LC8951 (com 16 KB de buffer) corrige erros e faz DMA direto para a PRG-RAM, Word RAM ou PCM.'
          },
          {
            nodeId: 'mcd-subcpu',
            tag: '2. Sub-CPU: 2º Motorola 68000 (12.5 MHz + BIOS/BRAM)',
            iconType: 'code',
            text: 'Segundo Motorola 68000 (63% mais rápido que o do console base), acompanhado de 128 KB de Sub-BIOS ROM e 8 KB de BRAM interna para saves.'
          },
          {
            nodeId: 'mcd-prgram',
            tag: '3. Program RAM (512 KB PRG-RAM)',
            iconType: 'code',
            text: 'Memória exclusiva da Sub-CPU (8× maior que os 64 KB do Mega Drive) onde rodam o código do Mega-CD, vídeos FMV e descompressão de dados.'
          }
        ],
        insight:
          'Além dos 512 KB de Program RAM da Sub-CPU, o controlador CDC Sanyo LC8951 pode transferir setores lidos do CD via DMA diretamente para a PRG-RAM, para a Word RAM ou para os 64 KB do chip de áudio PCM!',
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
          'Aqui 4 componentes trabalham em conjunto: a Main-CPU e a Sub-CPU trocam comandos pelos 16 registradores do Gate Array (`$A12010–$A1202E` + `IRQ2`), o ASIC aplica rotação e escala nos gráficos e a Word RAM (256 KB) faz o Bank Swap para o barramento de 16 bits do Mega Drive!',
        simpleAnalogy:
          'Como os dois processadores 68000 não podem mexer na mesma memória ao mesmo tempo, eles conversam por um interfone de 16 portas (Comm Ports no Gate Array) e usam uma bancada giratória (Word RAM): enquanto o ASIC gira a imagem no Lado A, o Mega Drive lê o Lado B pronto!',
        flowSteps: [
          {
            nodeId: 'mcd-subcpu',
            tag: '1. Sub-CPU: 2º Motorola 68000 (12.5 MHz)',
            iconType: 'code',
            text: 'Envia parâmetros de rotação e zoom para o ASIC e sinaliza o status nos registradores de comunicação (`$FF8020–$FF802E`).'
          },
          {
            nodeId: 'mcd-asic',
            tag: '2. Gate Array / ASIC (Rotação + Comm Ports)',
            iconType: 'image',
            text: 'Contém as 16 portas de comunicação (`$A12010–$A1202E` + `IRQ2`) e o motor gráfico que gira bitmaps e já os converte em Tiles 8×8.'
          },
          {
            nodeId: 'mcd-wordram',
            tag: '3. Word RAM (256 KB — Modo 2M ou 1M/1M)',
            iconType: 'image',
            text: 'Opera como 1 bloco de 256 KB (Modo 2M) ou 2 bancos de 128 KB (Modo 1M/1M) que alternam instantaneamente entre as CPUs (Bank Swap).'
          },
          {
            nodeId: 'mcd-maincpu',
            tag: '4. Main-CPU: Motorola 68000 (7.67 MHz)',
            iconType: 'image',
            text: 'Pela Accessory Port no barramento de 16 bits, dispara interrupções `IRQ2` (`$A12000`) e recebe na janela `$600000` o banco da Word RAM já convertido em tiles!'
          }
        ],
        insight:
          'As duas CPUs 68000 sincronizam tarefas usando 8 portas de comando (`$A12010–$A1201E`), 8 portas de status (`$A12020–$A1202E`) e a interrupção `IRQ2` dentro do Gate Array ASIC, enquanto trocam gráficos pesados via Bank Swap na Word RAM!',
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
            label: '2. Rotação → Tiles 8×8',
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
        title: 'Transferência DMA para a TV: Word RAM → Main-CPU & Bus Arbiter → VDP Package (64 KB VRAM, CRAM e VSRAM)',
        summary:
          'Aqui 4 blocos trabalham juntos: os tiles saem da Word RAM pelo barramento de 16 bits, o 68000 programa os registradores de DMA, o Bus Arbiter pausa o 68000 (e o Z80) e o DMA do VDP transfere os gráficos para os 64 KB de VRAM (em 8 bits), 128 B de CRAM e 80 B de VSRAM rumo ao Video Encoder!',
        simpleAnalogy:
          'A imagem sai da bancada giratória (Word RAM), o chefe (68000) aciona o trem expresso (DMA) enquanto o guarda (Bus Arbiter) segura o trânsito, e os desenhos entram nas 3 memórias do VDP: 64 KB de desenhos (VRAM), 64 cores (CRAM) e rolagem da tela (VSRAM).',
        flowSteps: [
          {
            nodeId: 'mcd-wordram',
            tag: '1. Word RAM (256 KB — Janela $600000)',
            iconType: 'image',
            text: 'Entrega no barramento de 16 bits os blocos gráficos (tiles 8×8) já descompactados ou rotacionados pelo Mega-CD.'
          },
          {
            nodeId: 'mcd-maincpu',
            tag: '2. Main-CPU: Motorola 68000 (Configuração do DMA)',
            iconType: 'code',
            text: 'Programa o endereço de origem e o tamanho nos registradores `$9300–$9700` do VDP durante o intervalo vertical (V-Blank).'
          },
          {
            nodeId: 'mcd-arbiter',
            tag: '3. Bus Arbiter (Pausa 68000 e Z80 durante o DMA)',
            iconType: 'code',
            text: 'Pausa o Z80 (`$A11100` BusReq) e o 68000 durante a transferência DMA para evitar colisões no barramento de 16 bits.'
          },
          {
            nodeId: 'mcd-vdp',
            tag: '4. VDP Package: 64 KB VRAM (8-bit) + 128 B CRAM + 80 B VSRAM',
            iconType: 'image',
            text: 'Grava os tiles nos 64 KB de VRAM (conectada ao VDP por um barramento de 8 bits), aplica 64 cores na CRAM, rolagem na VSRAM e envia ao Video Encoder.'
          }
        ],
        insight:
          'Durante o DMA para o VDP, o Motorola 68000 fica pausado pelo Bus Arbiter, e o Z80 também deve ser pausado (`$A11100`) para que nenhuma leitura do barramento de 8 bits colida com o barramento principal de 16 bits!',
        activeNodes: ['mcd-wordram', 'mcd-maincpu', 'mcd-arbiter', 'mcd-vdp'],
        activeBuses: ['bus-mcd-main-word', 'bus-mcd-main-ram', 'bus-mcd-vdp'],
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
            pathId: 'path-mcd-main-ram',
            color: '#10b981',
            type: 'code',
            label: '2. Bus Arbiter Pausa Bus',
            badgeX: 165,
            badgeY: 201
          },
          {
            pathId: 'path-mcd-vdp',
            color: '#38bdf8',
            type: 'image',
            label: '3. DMA → VRAM/CRAM',
            badgeX: 255,
            badgeY: 312
          }
        ]
      },
      {
        step: 4,
        shortTitle: 'Som FM + PCM',
        title: 'Orquestra Completa (5 Blocos): Bus Arbiter ↔ Z80 (YM2612 FM + PSG → Audio Mixer) e Sub-CPU + CD → Ricoh PCM',
        summary:
          'Neste passo 5 blocos trabalham juntos: no Mega Drive, o Bus Arbiter coordena o Z80 (8 KB RAM) no barramento de 8 bits para comandar o Yamaha YM2612 FM (6 canais) e o TI SN76489 PSG (no VDP Package) rumo ao Audio Mixer; no Mega-CD, a Sub-CPU abastece os 64 KB do chip Ricoh RF5C164 (8 canais PCM) junto ao áudio CD-DA!',
        simpleAnalogy:
          'Cinco peças formam uma orquestra completa: na esquerda, o Bus Arbiter e o maestro Z80 misturam o sintetizador FM e o PSG no Audio Mixer; na direita, a Sub-CPU alimenta o chip Ricoh de 8 canais gravados (PCM) e o leitor toca a música do CD!',
        flowSteps: [
          {
            nodeId: 'mcd-arbiter',
            tag: '1. 64 KB RAM + Bus Arbiter (`$A11100` / Janela 32 KB)',
            iconType: 'code',
            text: 'Gerencia a ponte entre o barramento de 16 bits e o de 8 bits: permite ao 68000 acessar os 8 KB do Z80 e ao Z80 ler amostras numa janela paginada de 32 KB.'
          },
          {
            nodeId: 'mcd-z80',
            tag: '2. Zilog Z80 (8 KB RAM) → Yamaha YM2612 FM + PSG → Audio Mixer',
            iconType: 'audio',
            text: 'No barramento de 8 bits, o Z80 comanda os 6 canais FM do Yamaha YM2612 e os 4 canais do TI SN76489 PSG (no VDP Package), somados no Audio Mixer.'
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
            text: 'Envia a trilha sonora estéreo direto do CD (e nos loops musicais, o chip PCM cobria o tempo de busca do laser 1x!).'
          },
          {
            nodeId: 'mcd-pcm',
            tag: '5. Áudio Mega-CD: Ricoh RF5C164 (8ch PCM + 64 KB)',
            iconType: 'audio',
            text: 'Reproduz 8 canais de samples digitais (até 32 kHz) nos seus 64 KB de Wave RAM e mixa com o áudio CD-DA e o Audio Mixer do console.'
          }
        ],
        insight:
          'Como o leitor 1x demorava para reposicionar o laser ao repetir uma faixa de áudio do CD, jogos como Sonic CD usavam a Sub-CPU e o chip Ricoh PCM para tocar um trecho de preenchimento e esconder o silêncio da busca mecânica!',
        activeNodes: ['mcd-arbiter', 'mcd-z80', 'mcd-subcpu', 'mcd-drive', 'mcd-pcm'],
        activeBuses: ['bus-mcd-z80', 'bus-mcd-sub-pcm', 'bus-mcd-pcm'],
        packets: [
          {
            pathId: 'path-mcd-z80',
            color: '#f59e0b',
            type: 'audio',
            label: 'Arbiter ↔ Z80 FM',
            badgeX: 115,
            badgeY: 428
          },
          {
            pathId: 'path-mcd-sub-pcm',
            color: '#ec4899',
            type: 'audio',
            label: 'Sub-CPU → 64KB PCM',
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
        title: 'Motorola 68000 CPU (Main-CPU)',
        spec: '~7.67 MHz • Barramento 16-bit',
        subSpec: 'Regs 32-bit • ALU 16-bit • Endereçamento 24-bit',
        category: 'cpu',
        simpleRole: 'O processador principal do Mega Drive conectado ao barramento de 16 bits: controla os comandos do jogador, a física e a partida.',
        metrics: [
          { label: 'Clock', value: '7.67 MHz (NTSC) / 7.60 MHz (PAL)' },
          { label: 'Arquitetura Interna', value: 'Registradores 32-bit / ALU 16-bit' },
          { label: 'Barramento Principal', value: 'Dados 16-bit / Endereços 24-bit (16 MB)' },
          { label: 'Conexões 16-bit', value: 'Cartridge, Accessory Port, RAM e VDP' }
        ],
        detail:
          'Processador híbrido 16/32 bits da Motorola. Possui registradores internos de 32 bits com conjunto de instruções ortogonal, enquanto sua ULA (ALU) e seu barramento externo de dados operam em 16 bits (conectando os 64 KB de RAM, o slot de Cartucho, a Accessory Port, o Bus Arbiter, o I/O Controller e o VDP Package).'
      },
      {
        id: 'mcd-arbiter',
        title: '64 KB RAM + Bus Arbiter & I/O',
        spec: '64 KB RAM (16-bit) + Bus Arbiter + I/O',
        subSpec: 'Ponte 16-bit ↔ 8-bit ($A11100) + Controles',
        category: 'ram',
        simpleRole: 'Reúne os 64 KB de RAM do barramento de 16 bits, o I/O Controller (que lê os controles) e o Bus Arbiter (que coordena a ponte com o barramento de 8 bits do Z80 e o DMA).',
        metrics: [
          { label: 'Work RAM', value: '64 KB DRAM no Bus de 16 bits ($FF0000)' },
          { label: 'Bus Arbiter', value: 'Coordena 68000 (16-bit) ↔ Z80 (8-bit)' },
          { label: 'Janela do Z80', value: '32 KB Paginados ($8000–$FFFF no Z80)' },
          { label: 'I/O Controller', value: 'Portas dos Controles e Periféricos' }
        ],
        detail:
          'O Bus Arbiter e o I/O Controller fazem a ponte entre o barramento principal de 16 bits (do Motorola 68000) e o barramento secundário de 8 bits (do Zilog Z80), além de realizar a leitura dos controles. O 68000 solicita o barramento (`$A11100` BusReq) para escrever nos 8 KB de RAM do Z80, enquanto o Z80 pode ler qualquer banco de 32 KB do barramento de 16 bits.'
      },
      {
        id: 'mcd-vdp',
        title: 'VDP Package (VDP + 64KB VRAM + PSG)',
        spec: '64KB VRAM (8-bit) + 128B CRAM + 80B VSRAM',
        subSpec: 'Video Display Processor + TI SN76489 PSG',
        category: 'gpu',
        simpleRole: 'O pacote de vídeo do Mega Drive: contém o Video Display Processor (ligado aos 64 KB de VRAM por um barramento de 8 bits) e integra o chip de som TI SN76489 PSG.',
        metrics: [
          { label: 'VRAM Dedicada', value: '64 KB via Bus de 8 bits (Planos A, B, W, Sprites)' },
          { label: 'CRAM (Paletas)', value: '128 B internos (64 de 512 cores / 183 tons)' },
          { label: 'VSRAM (Scroll)', value: '80 B internos (20 seções de rolagem vertical)' },
          { label: 'Som no Pacote', value: 'TI SN76489 PSG → Audio Mixer' }
        ],
        detail:
          'O VDP Package abriga o Video Display Processor (conectado aos 64 KB de VRAM por um barramento dedicado de 8 bits e ao Video Encoder para enviar a imagem à TV) e o gerador de som programável TI SN76489 PSG (cujo áudio vai para o Audio Mixer). Renderiza 2 planos roláveis (A e B), 1 plano Window e até 80 sprites, com DMA de 3 modos.'
      },
      {
        id: 'mcd-z80',
        title: 'Zilog Z80 + 8 KB RAM + YM2612 FM',
        spec: 'Bus 8-bit @ 3.58 MHz + Audio Mixer',
        subSpec: 'Yamaha YM2612 FM + PSG → Audio Mixer',
        category: 'audio',
        simpleRole: 'O subsistema de áudio de 8 bits: o processador Z80 com seus 8 KB de RAM comanda o sintetizador Yamaha YM2612 FM, que se junta ao PSG no Audio Mixer para sair na TV e nos fones.',
        metrics: [
          { label: 'CPU de Áudio', value: 'Zilog Z80 @ 3.58 MHz (Barramento 8-bit)' },
          { label: 'RAM Dedicada', value: '8 KB RAM exclusiva no barramento do Z80' },
          { label: 'Sintetizador FM', value: 'Yamaha YM2612 (6 Canais FM / Ch6 PCM)' },
          { label: 'Saída de Áudio', value: 'Audio Mixer (YM2612 + PSG) → TV e Fones' }
        ],
        detail:
          'No barramento dedicado de 8 bits residem o Zilog Z80, seus 8 KB de RAM e o sintetizador Yamaha YM2612 FM (interligados ao barramento principal através do Bus Arbiter e do I/O Controller). O áudio do Yamaha YM2612 FM e o áudio do TI SN76489 PSG (vindo do VDP Package) entram no Audio Mixer, que alimenta o Video Encoder (TV/Alto-falantes) e a saída estéreo de fones de ouvido.'
      },
      {
        id: 'mcd-asic',
        title: 'Gate Array / ASIC (315-5477)',
        spec: 'Rotação/Escala + 16 Comm Ports',
        subSpec: 'Regs $A12000–$A1202E + IRQ2 + Tiles 8×8',
        category: 'gpu',
        simpleRole: 'Chip especial do Mega-CD que gira imagens em perspectiva, converte em blocos 8×8 para o VDP e contém as 16 portas de comunicação entre as duas CPUs.',
        metrics: [
          { label: 'Chip Customizado', value: 'Sega Gate Array ASIC (315-5477)' },
          { label: 'Comm Ports', value: '8 Comando ($A12010) + 8 Status ($A12020)' },
          { label: 'Efeitos Gráficos', value: 'Rotação, Escala e Perspectiva Afim' },
          { label: 'Saída Formatada', value: 'Converte Stamp Map → Tiles 8×8 VDP' }
        ],
        detail:
          'O Gate Array (ASIC) do Mega-CD cumpre duas funções vitais: (1) fornece os registradores de controle (`$A12000`), interrupção `IRQ2` e as 16 portas de 16 bits (`$A12010–$A1202E`) para comunicação entre os dois processadores 68000; e (2) realiza rotação e escala por hardware na Word RAM já entregando o resultado fatiado em tiles 8×8 para o VDP.'
      },
      {
        id: 'mcd-wordram',
        title: 'Word RAM Compartilhada',
        spec: '256 KB DRAM Dual-Bank ($600000)',
        subSpec: 'Modo 2M (256KB) ou 1M/1M (2× 128KB Swap)',
        category: 'ram',
        simpleRole: 'As duas bancadas giratórias de 128 KB onde o Mega-CD deixa os gráficos prontos e o Mega Drive lê instantaneamente pela Accessory Port.',
        metrics: [
          { label: 'Capacidade', value: '256 KB DRAM (Mapeada em $600000)' },
          { label: 'Modo 2M', value: '1 Bloco único de 256 KB (1 CPU por vez)' },
          { label: 'Modo 1M / 1M', value: '2 Bancos de 128 KB (Bank Swap)' },
          { label: 'Controle', value: 'Registrador $A12002 (CdMemCtrl)' }
        ],
        detail:
          'Ponte de memória entre o Mega-CD e o Mega Drive controlada pelo registrador `$A12002`. No modo 1M/1M, a Sub-CPU e o ASIC renderizam em um banco de 128 KB enquanto a Main-CPU envia o outro banco de 128 KB via DMA para o VDP.'
      },
      {
        id: 'mcd-subcpu',
        title: 'Sub-CPU: 2º 68000 + BIOS/BRAM',
        spec: '12.5 MHz CISC + 128KB BIOS + 8KB BRAM',
        subSpec: '63% mais rápido • Controla CDC, ASIC e PCM',
        category: 'cpu',
        simpleRole: 'O segundo processador 68000 que vive dentro do Mega-CD: é 63% mais rápido que o do Mega Drive e traz BIOS e memória de Save!',
        metrics: [
          { label: 'Clock', value: '12.5 MHz (+63% mais rápido que a base)' },
          { label: 'Sub-BIOS ROM', value: '128 KB Boot ROM ($400000)' },
          { label: 'Backup RAM', value: '8 KB BRAM Interna para Saves' },
          { label: 'Interrupções', value: 'Recebe IRQ2 da Main-CPU ($A12000)' }
        ],
        detail:
          'Segundo processador Motorola 68000 completo operando a 12.5 MHz. Possui acesso direto aos 512 KB de PRG-RAM, à BIOS de 128 KB, aos 8 KB de BRAM para salvar jogos, ao controlador de CD (CDC LC8951) e ao chip de áudio Ricoh PCM.'
      },
      {
        id: 'mcd-prgram',
        title: 'Program RAM (PRG-RAM)',
        spec: '512 KB DRAM Exclusiva (4× 128 KB)',
        subSpec: 'Memória da Sub-CPU de 12.5 MHz',
        category: 'ram',
        simpleRole: 'A mesa de trabalho de 512 KB exclusiva do Mega-CD (8 vezes maior que a RAM do Mega Drive).',
        metrics: [
          { label: 'Capacidade', value: '512 KB DRAM (8× maior que a base)' },
          { label: 'Janela Main-CPU', value: '128 KB paginados em $420000' },
          { label: 'Acesso CDC DMA', value: 'Recebe setores direto do chip LC8951' },
          { label: 'Uso Principal', value: 'Código Sub-CPU, Buffer FMV e Áudio' }
        ],
        detail:
          'Memória principal da Sub-CPU de 12.5 MHz. Quando a Sub-CPU está em BusReq, a Main-CPU também pode acessar a PRG-RAM através de uma janela paginada de 128 KB no endereço `$420000`.'
      },
      {
        id: 'mcd-drive',
        title: 'CD-ROM (1x) + CDC Sanyo LC8951',
        spec: '150 KB/s + CDC 16 KB Cache Buffer',
        subSpec: 'DMA para PRG-RAM, Word RAM ou PCM + CD-DA',
        category: 'cd',
        simpleRole: 'O leitor óptico de 650 MB acompanhado do chip controlador CDC Sanyo LC8951 que distribui os dados por DMA sem sobrecarregar a CPU.',
        metrics: [
          { label: 'Velocidade', value: '1x CLV (150 KB por segundo)' },
          { label: 'Controlador CDC', value: 'Sanyo LC8951 + 16 KB Buffer SRAM' },
          { label: 'Destinos DMA CDC', value: 'PRG-RAM, Word RAM ou PCM Wave RAM' },
          { label: 'Áudio Óptico', value: 'Streaming Red Book CD-DA Estéreo' }
        ],
        detail:
          'A unidade óptica de 1x é gerenciada pelo controlador Sanyo LC8951 (CDC) com 16 KB de cache para correção de erros EDC/ECC, capaz de transferir setores por DMA diretamente para a PRG-RAM, Word RAM ou PCM RAM.'
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
          { label: 'Taxa de Amostragem', value: 'Até 32.5 kHz com Panning Estéreo' },
          { label: 'Total do Sistema', value: '18 Canais (8 PCM + 6 FM + 4 PSG) + CD' }
        ],
        detail:
          'Alimentado pela Sub-CPU de 12.5 MHz (ou via DMA do CDC LC8951), adiciona 8 canais de samples digitais com 64 KB próprios. Em jogos como Sonic CD, era usado para tocar trechos de preenchimento enquanto o laser 1x voltava ao início da faixa de música!'
      }
    ]
  },

  ps1: {
    id: 'ps1',
    shortName: 'Sony PlayStation',
    name: 'Sony PlayStation — SCPH-1000 (1994)',
    subtitle: 'Sony CPU SoC (CW33300 + GTE + CP0 + MDEC + DRAM Contr. + Serial Interface) • Main Bus 32b • BIU & Sub Bus',
    year: '1994',
    sources: [
      { label: 'Arquitetura — PlayStation', url: 'https://www.copetti.org/pt-br/writings/consoles/playstation/' },
      { label: 'RetroReversing — PS1 Architecture', url: 'https://www.retroreversing.com/ps1' },
      { label: 'Nocash PSX-SPX Specifications', url: 'https://problemkaputt.de/psx-spx.htm' }
    ],
    simulationSteps: [
      {
        step: 0,
        shortTitle: 'Visão Geral',
        title: 'Arquitetura Completa: Sony CPU SoC, 2 MB EDO DRAM (DBus 32-bit), Main Bus 32-bit e Bus Interface Unit (Sub Bus)',
        summary:
          'No Passo 0 vemos os 4 pilares da placa-mãe: o Sony CPU SoC (integrando CoreWare CW33300 CPU, GTE, System Control Coprocessor, Motion Decoder, DRAM Controller e Serial Interface para Controles/Memory Cards), os 2 MB de EDO DRAM ligados ao DRAM Controller via DBus de 32 bits, o Main Bus de 32 bits (7 canais DMA) e a Bus Interface Unit (BIU) isolando o Sub Bus (512 KB BIOS ROM, Parallel Connector, SPU e CD Subsystem).',
        simpleAnalogy:
          'A Sony organizou a placa em 4 partes: um Super-Prédio (Sony CPU SoC) que reúne o Cérebro, o Engenheiro 3D, o Projetor de Cinema, o Controlador da Memória e a Interface dos Controles/Memory Cards; uma Mesa Grande de 2 MB (EDO DRAM); uma Avenida Expressa de 32 bits (Main Bus) e um Pedágio (Bus Interface Unit) que liga o Vídeo e a rua marginal (Sub Bus).',
        flowSteps: [
          {
            nodeId: 'ps1-cpu',
            tag: '1. Sony CPU SoC (CW33300 + GTE + CP0 + MDEC + DRAM Contr. + Serial)',
            iconType: 'code',
            text: 'Integra na mesma pastilha a CPU CoreWare CW33300 (33.8688 MHz), GTE (3D), System Control Coprocessor (CP0), Motion Decoder (MDEC), DRAM Controller e a Serial Interface (ligada ao Serial Connector, 2 Controles e 2 Memory Cards).'
          },
          {
            nodeId: 'ps1-ram',
            tag: '2. 2 MB EDO DRAM (Ligada ao DRAM Contr. via DBus 32-bit)',
            iconType: 'code',
            text: 'Conectada ao DRAM Controller do SoC por um barramento dedicado de 32 bits (DBus 32-bit); guarda os 64 KB do Kernel, o código do jogo e as Ordering Tables.'
          },
          {
            nodeId: 'ps1-dma',
            tag: '3. Main Bus (32-bit @ 132 MB/s) & 7 Canais DMA',
            iconType: 'code',
            text: 'Interliga CW33300 CPU, DRAM Controller, Motion Decoder e Bus Interface Unit com 7 canais DMA (Ch0/1 MDEC, Ch2 GPU, Ch3 CD, Ch4 SPU, Ch5 PIO e Ch6 OTC).'
          },
          {
            nodeId: 'ps1-biu',
            tag: '4. Bus Interface Unit (BIU) & Sub Bus (BIOS 512 KB + PIO)',
            iconType: 'code',
            text: 'Conecta o Main Bus 32-bit à Sony GPU (no Video Subsystem) e ao Sub Bus de 16/8 bits: 512 KB BIOS ROM (8-bit), Parallel Connector (16-bit), SPU (16-bit) e CD-ROM Controller (8-bit).'
          }
        ],
        insight:
          'No diagrama da arquitetura do PlayStation, a Serial Interface (que lê os 2 Controles, os 2 Memory Cards e o Serial Connector) e o DRAM Controller (ligado aos 2 MB de EDO DRAM via DBus 32-bit) ficam dentro do próprio Sony CPU SoC, enquanto a BIOS de 512 KB (8-bit) e o Parallel Connector (16-bit) ficam no Sub Bus abaixo da Bus Interface Unit!',
        activeNodes: ['ps1-cpu', 'ps1-ram', 'ps1-dma', 'ps1-biu'],
        activeBuses: [],
        packets: []
      },
      {
        step: 1,
        shortTitle: 'CD 2x & Sub Bus',
        title: 'CD Subsystem (CD-ROM Controller + 32 KB SRAM + Sub-CPU + DSP) → Sub Bus (8-bit) → Bus Interface Unit',
        summary:
          'O CD Subsystem funciona como um computador dedicado conectado em 8 bits ao Sub Bus: o DSP e a Sub-CPU (8-bit) controlam o leitor óptico e validam o disco preto, enquanto o CD-ROM Controller armazena os setores lidos a 300 KB/s (2x) nos seus 32 KB de SRAM (8-bit) e avisa a Bus Interface Unit.',
        simpleAnalogy:
          'Para que o leitor de CD não trave a avenida principal de 32 bits, ele trabalha no Sub Bus com seu próprio computador interno (CD-ROM Controller, Sub-CPU, DSP e 32 KB SRAM), confere se o disco é original e deixa os dados prontos na Bus Interface Unit.',
        flowSteps: [
          {
            nodeId: 'ps1-cd',
            tag: '1. CD Subsystem: DSP + Sub-CPU (8-bit — Motorola 68HC05)',
            iconType: 'disc',
            text: 'A Sub-CPU de 8 bits (16 KB ROM + 512 B RAM) e o DSP controlam o foco/rotação do laser no CD e validam a ondulação física Wobble Groove (SCEx) e subcanais LibCrypt.'
          },
          {
            nodeId: 'ps1-cd',
            tag: '2. CD-ROM Controller + 32 KB SRAM (Barramento 8-bit)',
            iconType: 'disc',
            text: 'O CD-ROM Controller recebe o fluxo de dados a 300 KB/s (2x), corrige erros e armazena os setores nos 32 KB de SRAM dedicados (8-bit).'
          },
          {
            nodeId: 'ps1-biu',
            tag: '3. Sub Bus (8-bit) → Bus Interface Unit (BIU)',
            iconType: 'code',
            text: 'O CD-ROM Controller comunica-se em 8 bits pelo Sub Bus com a Bus Interface Unit sem bloquear o Main Bus de 32 bits.'
          }
        ],
        insight:
          'O CD Subsystem reúne 4 blocos internos (CD-ROM Controller, 32 KB SRAM em 8-bit, Sub-CPU em 8-bit e DSP ligados ao disco) que executam toda a leitura óptica e a verificação anti-pirataria de forma autônoma!',
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
        title: 'Caminho Completo do Loading: CD Subsystem → BIU → Main Bus (DMA Ch3) → DRAM Contr. (DBus 32-bit) → 2 MB EDO DRAM',
        summary:
          'Aqui os 5 componentes funcionam juntos: os setores saem dos 32 KB SRAM do CD-ROM Controller (8-bit), atravessam a Bus Interface Unit, o DMA Canal 3 assume o Main Bus de 32 bits a 132 MB/s passando pelo DRAM Controller (DBus 32-bit) até os 2 MB de EDO DRAM, enquanto a CPU CW33300 opera na Scratchpad de 1 KB!',
        simpleAnalogy:
          'Enquanto o trem expresso (DMA Ch3) busca a carga no CD Subsystem, passa pelo pedágio (BIU) e usa o Main Bus e o DRAM Controller para encher a mesa de 2 MB (EDO DRAM), a CPU CW33300 continua trabalhando no seu bloquinho interno de 1 KB (Scratchpad)!',
        flowSteps: [
          {
            nodeId: 'ps1-cd',
            tag: '1. CD Subsystem (CD-ROM Controller + 32 KB SRAM)',
            iconType: 'disc',
            text: 'Entrega pelo barramento de 8 bits o lote de setores da fase, texturas e modelos 3D armazenados nos 32 KB de SRAM.'
          },
          {
            nodeId: 'ps1-biu',
            tag: '2. Bus Interface Unit (Sub Bus → Main Bus 32-bit)',
            iconType: 'code',
            text: 'Abre a ponte permitindo que os dados cruzem do Sub Bus para o Main Bus de 32 bits.'
          },
          {
            nodeId: 'ps1-dma',
            tag: '3. Main Bus 32-bit & DMA (Canal 3 Assume o Barramento)',
            iconType: 'code',
            text: 'O DMA Ch3 assume o Main Bus de 32 bits para transferir os dados em rajadas de até 132 MB/s até o DRAM Controller.'
          },
          {
            nodeId: 'ps1-ram',
            tag: '4. 2 MB EDO DRAM (via DRAM Contr. & DBus 32-bit)',
            iconType: 'code',
            text: 'Recebe através do DRAM Controller (DBus 32-bit) todos os arquivos da fase, objetos 3D e texturas sem sobrecarregar a CPU.'
          },
          {
            nodeId: 'ps1-cpu',
            tag: '5. Sony CPU SoC (CW33300 na Scratchpad 1 KB + Serial Interface)',
            iconType: 'code',
            text: 'Enquanto o Main Bus está ocupado, a CPU CW33300 continua rodando no I-Cache (4 KB) e na Scratchpad (1 KB) e lendo os Controles pela Serial Interface!'
          }
        ],
        insight:
          'Como a Scratchpad de 1 KB (`0x1F800000`), o I-Cache de 4 KB e a Serial Interface (Controles) ficam dentro do Sony CPU SoC, o processador CW33300 pode continuar calculando a física e lendo os botões com zero tempo de espera enquanto o DMA ocupa o Main Bus!',
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
            label: '2. BIU → Main Bus',
            badgeX: 405,
            badgeY: 350
          },
          {
            pathId: 'path-ps1-dma-ram',
            color: '#10b981',
            type: 'code',
            label: '3. DBus 32b → EDO RAM',
            badgeX: 500,
            badgeY: 220
          }
        ]
      },
      {
        step: 3,
        shortTitle: 'Pipeline 3D (GTE)',
        title: 'Gráficos 3D: Sony CPU SoC (CW33300 + GTE) ↔ 2 MB EDO DRAM ↔ Main Bus / BIU → Video Subsystem (Sony GPU ↔ 1 MB VRAM → RGB Encoder)',
        summary:
          'Com a fase na memória, os 4 subsistemas 3D entram em sequência: o DMA Ch6 (OTC) limpa a Ordering Table nos 2 MB de EDO DRAM, o Geometry Transformation Engine (GTE) calcula os vértices 3D, a RAM encadeia os polígonos (Z-Sort) e o DMA Ch2 envia a lista (via Main Bus / BIU) para a Sony GPU desenhar no seu 1 MB de VRAM (16-bit) rumo ao RGB Encoder (16-bit)!',
        simpleAnalogy:
          'O Engenheiro 3D (GTE) calcula a posição dos objetos, organiza do mais longe ao mais perto numa fila na Mesa de 2 MB (Ordering Table limpa pelo DMA 6) e o Trem Expresso (DMA 2) leva a fila inteira para a Sony GPU desenhar no seu 1 MB de VRAM e o RGB Encoder mostrar na TV!',
        flowSteps: [
          {
            nodeId: 'ps1-cpu',
            tag: '1. Sony CPU SoC (CW33300 CPU + Geometry Transformation Engine)',
            iconType: 'image',
            text: 'Ligado diretamente à CPU CW33300, o GTE projeta até 1,5 milhão de vértices 3D/s em ponto fixo (66 MIPS), calculando perspectiva, iluminação e profundidade Z.'
          },
          {
            nodeId: 'ps1-ram',
            tag: '2. 2 MB EDO DRAM (Ordering Table + DMA Ch6 OTC)',
            iconType: 'code',
            text: 'O DMA Canal 6 (OTC) limpa a tabela em hardware via DBus 32-bit e a RAM encadeia os polígonos de trás para frente (substituindo o Z-Buffer).'
          },
          {
            nodeId: 'ps1-dma',
            tag: '3. Main Bus 32-bit & DMA (Ch6 OTC & Ch2 Linked-List GPU)',
            iconType: 'image',
            text: 'O DMA Canal 2 no modo Linked-List percorre sozinho os ponteiros da Ordering Table enviando os pacotes gráficos para a Sony GPU.'
          },
          {
            nodeId: 'ps1-gpu',
            tag: '4. Video Subsystem: Sony GPU ↔ 1 MB VRAM (16-bit) → RGB Encoder (16-bit)',
            iconType: 'image',
            text: 'A Sony GPU rasteriza os polígonos no 1 MB de VRAM (via barramento de 16 bits), que envia os quadros em 16 bits para o RGB Encoder exibir na TV!'
          }
        ],
        insight:
          'O PlayStation possui um canal de DMA exclusivo (Canal 6 — OTC) cuja única função é limpar a Ordering Table de trás para frente na EDO DRAM! Em seguida, o DMA Canal 2 em modo Linked-List percorre a tabela sozinho alimentando a Sony GPU.',
        activeNodes: ['ps1-cpu', 'ps1-ram', 'ps1-dma', 'ps1-gpu'],
        activeBuses: ['bus-ps1-cpu-dma', 'bus-ps1-ram-dma', 'bus-ps1-dma-gpu'],
        packets: [
          {
            pathId: 'path-ps1-cpu-dma',
            color: '#38bdf8',
            type: 'image',
            label: '1. Vértices GTE (3D)',
            badgeX: 205,
            badgeY: 261
          },
          {
            pathId: 'path-ps1-ram-dma',
            color: '#10b981',
            type: 'image',
            label: '2. Ordering Table (Ch6/Ch2)',
            badgeX: 500,
            badgeY: 220
          },
          {
            pathId: 'path-ps1-dma-gpu',
            color: '#a855f7',
            type: 'image',
            label: '3. Linked-List → Sony GPU',
            badgeX: 800,
            badgeY: 232
          }
        ]
      },
      {
        step: 4,
        shortTitle: 'Vídeo FMV (MDEC)',
        title: 'Cinema FMV: 2 MB EDO DRAM ↔ Main Bus (DMA Ch0, Ch1 e Ch2) ↔ Motion Decoder (MDEC) → Video Subsystem (1 MB VRAM → RGB Encoder)',
        summary:
          'O vídeo FMV percorre 4 blocos e 3 canais de DMA no Main Bus de 32 bits: a CPU CW33300 desfaz o Huffman na EDO DRAM, o DMA Ch0 leva os blocos ao Motion Decoder (MDEC) dentro do SoC, o DMA Ch1 devolve as tiras RGB prontas à RAM e o DMA Ch2 transfere para o 1 MB de VRAM da Sony GPU rumo ao RGB Encoder!',
        simpleAnalogy:
          'O filme passa por 4 estações: sai da mesa de 2 MB (EDO DRAM), pega o trem de ida (DMA 0) até o Motion Decoder (MDEC) que abre a imagem em 16,7 milhões de cores, volta pelo trem (DMA 1) e segue pelo trem de vídeo (DMA 2) direto para o 1 MB de VRAM e o RGB Encoder!',
        flowSteps: [
          {
            nodeId: 'ps1-ram',
            tag: '1. 2 MB EDO DRAM (Quadro STR + Descompressão Huffman)',
            iconType: 'video',
            text: 'Recebe o quadro STR vindo do CD (via DMA Ch3); a CPU CW33300 descompacta a camada Huffman em blocos RLE na RAM.'
          },
          {
            nodeId: 'ps1-dma',
            tag: '2. Main Bus 32-bit & DMA (Ch0 MDEC In & Ch1 MDEC Out)',
            iconType: 'video',
            text: 'Pelo Main Bus de 32 bits, o DMA Canal 0 envia os macroblocos ao Motion Decoder e o DMA Canal 1 devolve tiras de 16×240 pixels RGB para a RAM.'
          },
          {
            nodeId: 'ps1-cpu',
            tag: '3. Sony CPU SoC: Motion Decoder (MDEC — IDCT + YCbCr→RGB)',
            iconType: 'video',
            text: 'Conectado ao Main Bus de 32 bits dentro do SoC, aplica IDCT e conversão de cor em 9.000 macroblocos/s (30 fps em 24-bit True Color).'
          },
          {
            nodeId: 'ps1-gpu',
            tag: '4. Video Subsystem: Sony GPU ↔ 1 MB VRAM → RGB Encoder',
            iconType: 'video',
            text: 'O DMA Canal 2 copia as tiras decodificadas para o Framebuffer no 1 MB de VRAM, que envia os dados em 16 bits ao RGB Encoder para exibir na TV!'
          }
        ],
        insight:
          'O pipeline de vídeo FMV encadeia 3 canais de DMA (DMA0 RAM→MDEC, DMA1 MDEC→RAM em tiras de 16×240 e DMA2 RAM→VRAM), permitindo exibir filmes em 24 bits (16,7 milhões de cores) enquanto o restante do 1 MB de VRAM guarda texturas de 16 bits!',
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
            label: '3. DMA Ch2 → 1MB VRAM',
            badgeX: 800,
            badgeY: 232
          }
        ]
      },
      {
        step: 5,
        shortTitle: 'Áudio SPU & CD-XA',
        title: 'Audio Subsystem Completo: 2 MB EDO DRAM → DMA Ch4 → BIU (Sub Bus 16-bit) → Sony SPU (512 KB DRAM) + CD-ROM Controller Direto',
        summary:
          'No passo final 5 componentes atuam juntos: os efeitos saem dos 2 MB de EDO DRAM pelo DMA Ch4, atravessam a Bus Interface Unit e o Sub Bus (16-bit) até a Sony Sound Processing Unit (ligada aos seus 512 KB de DRAM em 16-bit), enquanto o CD-ROM Controller envia áudio CD-DA / XA-ADPCM por uma linha direta para a SPU!',
        simpleAnalogy:
          'O Audio Subsystem (Sony SPU + 512 KB DRAM) recebe som por dois caminhos ao mesmo tempo: os efeitos de tiro e passos vêm da Mesa Principal (EDO DRAM) pelo trem DMA 4 passando pela BIU, enquanto a música e as falas vêm por uma ligação direta do CD-ROM Controller!',
        flowSteps: [
          {
            nodeId: 'ps1-ram',
            tag: '1. 2 MB EDO DRAM (Bancos de Efeitos ADPCM)',
            iconType: 'audio',
            text: 'Fornece pelo DBus de 32 bits os pacotes de amostras sonoras (efeitos e instrumentos ADPCM) que serão transferidos para a memória da SPU.'
          },
          {
            nodeId: 'ps1-dma',
            tag: '2. Main Bus 32-bit & DMA (Canal 4 — SPU Transfer)',
            iconType: 'audio',
            text: 'O DMA Canal 4 copia os bancos de áudio da EDO DRAM em direção à Bus Interface Unit sem ocupar a CPU CW33300.'
          },
          {
            nodeId: 'ps1-biu',
            tag: '3. Bus Interface Unit → Sub Bus (16-bit para a SPU)',
            iconType: 'code',
            text: 'Encaminha as transferências do DMA Ch4 pelo Sub Bus em 16 bits até a Sony Sound Processing Unit.'
          },
          {
            nodeId: 'ps1-cd',
            tag: '4. CD-ROM Controller (Ligação Direta para a Sony SPU)',
            iconType: 'disc',
            text: 'O CD-ROM Controller possui uma via direta exclusiva para a Sony Sound Processing Unit, enviando músicas CD-DA e áudio XA-ADPCM sem gastar RAM!'
          },
          {
            nodeId: 'ps1-spu',
            tag: '5. Audio Subsystem: Sony SPU ↔ 512 KB DRAM (16-bit)',
            iconType: 'audio',
            text: 'Acessa seus 512 KB de DRAM em 16 bits para mixar 24 canais ADPCM a 44.1 kHz (com Pitch, FM, ADSR e Reverb) junto com o som direto do CD-ROM Controller!'
          }
        ],
        insight:
          'Graças à conexão direta entre o CD-ROM Controller e a Sony Sound Processing Unit (SPU), o PlayStation reproduz músicas e diálogos comprimidos em XA-ADPCM diretamente do disco enquanto os 512 KB de DRAM (16-bit) da SPU ficam 100% livres para os 24 canais de efeitos sonoros!',
        activeNodes: ['ps1-ram', 'ps1-dma', 'ps1-biu', 'ps1-cd', 'ps1-spu'],
        activeBuses: ['bus-ps1-ram-dma', 'bus-ps1-dma-spu', 'bus-ps1-cd-spu'],
        packets: [
          {
            pathId: 'path-ps1-ram-dma',
            color: '#10b981',
            type: 'audio',
            label: '1. Samples da RAM',
            badgeX: 500,
            badgeY: 220
          },
          {
            pathId: 'path-ps1-dma-spu',
            color: '#a855f7',
            type: 'audio',
            label: '2. DMA Ch4 → SPU (16b)',
            badgeX: 310,
            badgeY: 398
          },
          {
            pathId: 'path-ps1-cd-spu',
            color: '#10b981',
            type: 'audio',
            label: '3. CD Controller → SPU',
            badgeX: 480,
            badgeY: 518
          }
        ]
      }
    ],
    components: [
      {
        id: 'ps1-cpu',
        title: 'Sony CPU SoC (CXD8530BQ)',
        spec: 'CoreWare CW33300 @ 33.8688 MHz',
        subSpec: 'GTE + CP0 + Motion Decoder + DRAM Contr. + Serial',
        category: 'cpu',
        simpleRole: 'O super-chip principal da Sony: reúne na mesma pastilha a CPU CW33300, o Geometry Transformation Engine (GTE), o System Control Coprocessor, o Motion Decoder, o DRAM Controller e a Serial Interface (Controles e Memory Cards).',
        metrics: [
          { label: 'CPU + Sistema', value: 'CoreWare CW33300 (R3000A) + System Control (CP0)' },
          { label: 'Motor 3D & Vídeo', value: 'Geometry Transformation Engine + Motion Decoder' },
          { label: 'Controlador RAM', value: 'DRAM Contr. interno (DBus 32-bit para EDO DRAM)' },
          { label: 'Serial Interface', value: '2× Controles + 2× Memory Cards + Serial Connector' }
        ],
        detail:
          'Conforme a arquitetura oficial da Sony, o Sony CPU SoC integra 6 blocos internos: (1) a CPU RISC CoreWare CW33300 de 32 bits a 33.8688 MHz (com 4 KB de I-Cache e 1 KB de Scratchpad SRAM), (2) o Geometry Transformation Engine (GTE — 66 MIPS para cálculos 3D), (3) o System Control Coprocessor (CP0), (4) o Motion Decoder (MDEC no Main Bus de 32 bits), (5) o DRAM Controller (que acessa os 2 MB de EDO DRAM via DBus de 32 bits) e (6) a Serial Interface (que conecta o Serial Connector traseiro e os 2 Controles e 2 Memory Cards frontais).'
      },
      {
        id: 'ps1-dma',
        title: 'Main Bus (32-bit) & 7 Canais DMA',
        spec: '32-bit @ 132 MB/s (Ch0 a Ch6)',
        subSpec: 'Liga CW33300, DRAM Contr., MDEC e BIU',
        category: 'storage',
        simpleRole: 'O barramento principal de 32 bits dentro do SoC até a Bus Interface Unit, gerenciado por 7 canais de DMA que transportam dados a 132 MB/s.',
        metrics: [
          { label: 'Largura / Taxa', value: 'Main Bus 32-bit @ 132 MB/s (33.87 MHz)' },
          { label: 'Canais 0 a 3', value: 'Ch0/1: MDEC • Ch2: GPU • Ch3: CD-ROM' },
          { label: 'Canais 4 a 6', value: 'Ch4: SPU • Ch5: PIO • Ch6: OTC (Limpa 3D)' },
          { label: 'Modos de Operação', value: 'Burst, Slice e Linked-List (Ch2)' }
        ],
        detail:
          'O Main Bus de 32 bits interliga a CPU CoreWare CW33300, o DRAM Controller, o Motion Decoder e a Bus Interface Unit. Conta com 7 canais de DMA (`0x1F801080–0x1F8010F4`): Ch0 (MDEC In), Ch1 (MDEC Out), Ch2 (GPU Linked-List + VRAM), Ch3 (CD-ROM), Ch4 (SPU), Ch5 (Parallel Connector PIO) e Ch6 (OTC — Ordering Table Clear, que inicializa a tabela de ordenação 3D na RAM por hardware).'
      },
      {
        id: 'ps1-ram',
        title: '2 MB EDO DRAM (DBus 32-bit)',
        spec: '2 MB EDO DRAM ↔ DRAM Contr. (32-bit)',
        subSpec: '64 KB Kernel OS + Jogo + Ordering Tables',
        category: 'ram',
        simpleRole: 'A memória principal de 2 MB ligada diretamente ao DRAM Controller do Sony CPU SoC por um barramento dedicado de 32 bits (DBus 32-bit).',
        metrics: [
          { label: 'Capacidade', value: '2 MB EDO DRAM (Mapeada em 0x00000000)' },
          { label: 'Barramento Dedicado', value: 'DBus 32-bit ligado ao DRAM Contr. (no SoC)' },
          { label: 'PlayStation OS', value: '64 KB reservados para o Kernel da BIOS' },
          { label: 'Ordering Table', value: 'Lista encadeada Z-Sort (limpa pelo DMA Ch6)' }
        ],
        detail:
          'Os 2 MB de EDO (Extended Data Out) DRAM conectam-se diretamente ao bloco DRAM Controller dentro do Sony CPU SoC através do DBus de 32 bits. Armazenam os 64 KB do Kernel copiados da BIOS durante o boot, o executável do jogo, os buffers de vídeo FMV e as Ordering Tables 3D.'
      },
      {
        id: 'ps1-biu',
        title: 'Bus Interface Unit (BIU) & Sub Bus',
        spec: 'Ponte Main Bus 32b ↔ GPU & Sub Bus',
        subSpec: '512 KB BIOS (8b) + Parallel (16b) + Timers',
        category: 'storage',
        simpleRole: 'A ponte central que liga o Main Bus de 32 bits à Sony GPU e ao Sub Bus (onde ficam a BIOS ROM de 512 KB em 8 bits, o Parallel Connector em 16 bits, a SPU em 16 bits e o CD-ROM Controller em 8 bits).',
        metrics: [
          { label: 'BIOS ROM', value: '512 KB BIOS ROM no Sub Bus (8-bit)' },
          { label: 'Expansão Traseira', value: 'Parallel Connector no Sub Bus (16-bit)' },
          { label: 'Ponte de Vídeo', value: 'Liga o Main Bus 32-bit à Sony GPU' },
          { label: 'Áudio e CD no Sub Bus', value: 'Sony SPU (16-bit) e CD Controller (8-bit)' }
        ],
        detail:
          'A Bus Interface Unit (BIU) conecta o Main Bus de 32 bits do Sony CPU SoC à Sony GPU (no Video Subsystem) e ao Sub Bus. No Sub Bus residem a BIOS ROM de 512 KB (8-bit), o Parallel Connector (16-bit), a Sony Sound Processing Unit (16-bit) e o CD-ROM Controller (8-bit).'
      },
      {
        id: 'ps1-gpu',
        title: 'Video Subsystem: Sony GPU + 1 MB VRAM',
        spec: 'Sony GPU ↔ 1 MB VRAM (16b) → RGB Encoder',
        subSpec: 'Grade 1024×512 • 2KB Cache • Sem Z-Buffer',
        category: 'gpu',
        simpleRole: 'O subsistema de vídeo: a Sony GPU recebe os comandos pela Bus Interface Unit, desenha os polígonos no 1 MB de VRAM (em 16 bits) e o RGB Encoder (em 16 bits) envia o sinal para a TV.',
        metrics: [
          { label: 'Barramento VRAM', value: 'Sony GPU ↔ 1 MB VRAM (16-bit)' },
          { label: 'Saída para a TV', value: '1 MB VRAM → RGB Encoder (16-bit) → TV' },
          { label: 'Desempenho 3D', value: '360k Flat / 180k Polígonos Texturizados/s' },
          { label: 'Cache Interno', value: '2 KB Texture Cache + CLUT + Page-Flipping' }
        ],
        detail:
          'No Video Subsystem, a Sony GPU é alimentada pela Bus Interface Unit e se comunica em 16 bits com 1 MB de VRAM (organizada como uma grade 2D de 1024×512 pixels para dois Framebuffers, Texture Pages e paletas CLUT). Do 1 MB de VRAM, a imagem sai por um barramento de 16 bits para o RGB Encoder rumo à televisão.'
      },
      {
        id: 'ps1-spu',
        title: 'Audio Subsystem: Sony SPU + 512 KB DRAM',
        spec: 'Sub Bus (16-bit) • SPU ↔ 512 KB DRAM (16-bit)',
        subSpec: '24 Canais ADPCM @ 44.1 kHz + Reverb + CD Direto',
        category: 'audio',
        simpleRole: 'O subsistema de áudio: a Sony Sound Processing Unit (SPU) conversa em 16 bits com o Sub Bus e com seus 512 KB de DRAM, além de receber áudio direto do CD-ROM Controller.',
        metrics: [
          { label: 'Polifonia', value: '24 Canais ADPCM (16-bit @ 44.1 kHz)' },
          { label: 'Memória Dedicada', value: '512 KB DRAM ligada à SPU em 16-bit' },
          { label: 'Conexão Sub Bus', value: 'Barramento de 16 bits + DMA Canal 4' },
          { label: 'Entrada Direta CD', value: 'Recebe CD-DA e XA-ADPCM do CD Controller' }
        ],
        detail:
          'No Audio Subsystem, a Sony Sound Processing Unit (SPU) está conectada em 16 bits ao Sub Bus e possui um barramento dedicado de 16 bits para seus 512 KB de DRAM. Reproduz 24 canais ADPCM com Pitch Modulation, FM, envelope ADSR e Reverb digital, misturando diretamente o áudio vindo do CD-ROM Controller para os alto-falantes.'
      },
      {
        id: 'ps1-cd',
        title: 'CD Subsystem (Controller + SRAM + Sub-CPU + DSP)',
        spec: '8-bit Sub Bus • 32 KB SRAM + Sub-CPU + DSP',
        subSpec: 'Leitura 2x (300 KB/s) + Via Direta para a SPU',
        category: 'cd',
        simpleRole: 'O subsistema de CD completo: reúne o CD-ROM Controller (ligado em 8 bits ao Sub Bus e direto à SPU), 32 KB de SRAM (8-bit), Sub-CPU (8-bit) e DSP ligados ao disco óptico.',
        metrics: [
          { label: 'Controlador & RAM', value: 'CD-ROM Controller ↔ 32 KB SRAM (8-bit)' },
          { label: 'Controle do Disco', value: 'Sub-CPU (8-bit MC68HC05) + DSP Óptico' },
          { label: 'Velocidade / Bus', value: '2x CLV (300 KB/s) • Sub Bus de 8 bits' },
          { label: 'Áudio e Proteção', value: 'Via direta para SPU + Wobble Groove SCEx' }
        ],
        detail:
          'O CD Subsystem é composto por 4 blocos interligados: (1) o CD-ROM Controller (conectado em 8 bits ao Sub Bus e por uma linha direta de áudio à Sony SPU), (2) os 32 KB de SRAM (conectados em 8 bits ao controlador para buffer de setores), (3) a Sub-CPU de 8 bits (Motorola 68HC05, ligada em 8 bits ao controlador e ao DSP para validar a trava Wobble Groove SCEx) e (4) o DSP óptico que lê o disco.'
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
    desc: 'Guarda até 650 MB (centenas de vezes mais que um cartucho!), mas o laser precisa se mover fisicamente. 1x lê 150 KB por segundo; 2x (no PS1) lê o dobro: 300 KB por segundo.'
  },
  {
    term: 'Memória RAM',
    everyday: 'A Mesa de Trabalho Rápida',
    desc: 'Como o CD é lento, o videogame copia os desenhos e sons da fase atual do CD para cima dessa "mesa" (RAM). Quanto maior a mesa, menos telas de "Loading" o jogo precisa!'
  },
  {
    term: 'VRAM + GPU / VDP / VDC',
    everyday: 'O Desenhista e seu Quadro de Pintura',
    desc: 'É o chip gráfico e a memória exclusiva onde ele monta a imagem antes de o codificador de vídeo (Video Encoder / RGB Encoder) enviá-la para a TV.'
  },
  {
    term: 'Barramento (Bus) & DMA',
    everyday: 'As Avenidas e o Trem Expresso',
    desc: 'O Barramento é a estrada de fios (8 bits, 16 bits ou 32 bits) que liga os chips. O DMA é um "trem expresso" que leva cargas pesadas direto do CD ou da memória para o vídeo sem ocupar a CPU.'
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
    if (!isAutoPlaying || activeTab === 'compare') return;
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
    if (activeTab === 'compare') return;
    setIsAutoPlaying(false);
    setSelectedNodeId(null);
    setSimStep((prev) => (prev + 1) % currentArch.simulationSteps.length);
  }, [activeTab, currentArch]);

  const prevStep = useCallback(() => {
    if (activeTab === 'compare') return;
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
      } else if (e.key.toLowerCase() === 'p') {
        setPresentationMode((prev) => !prev);
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
        {/* Corrente Animada seguindo exatamente a direção do fluxo (Início → Fim) */}
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

  // Renderizador de Bloco de Hardware no SVG (com ajuste automático e clipPath anti-transbordo)
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

    // Largura dinâmica do selo de categoria no canto superior direito
    const badgeW = Math.max(38, Math.round(style.badge.length * 4.8 + 10));
    const availTitleW = Math.max(80, w - badgeW - 24);
    const availBodyW = Math.max(100, w - 22);

    const titleFontSize = w < 200 ? 11.4 : 12.4;
    const specFontSize = w < 200 ? 10.2 : 11;
    const subFontSize = w < 200 ? 9.5 : 10.2;

    const estTitleW = title.length * (titleFontSize * 0.56);
    const estSpecW = spec.length * (specFontSize * 0.55);
    const estSubW = subSpec ? subSpec.length * (subFontSize * 0.52) : 0;

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
        <defs>
          <clipPath id={`clip-node-${id}`}>
            <rect x={x + 4} y={y + 4} width={w - 8} height={h - 6} rx={8} />
          </clipPath>
        </defs>

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

        {/* Conteúdo interno protegido por clipPath e dimensionamento adaptativo */}
        <g clipPath={`url(#clip-node-${id})`}>
          {/* Etiqueta da Categoria no Canto Superior Direito */}
          <rect
            x={x + w - badgeW - 8}
            y={y + 9}
            width={badgeW}
            height={14}
            rx={4}
            fill={lightMode ? '#ffffffcc' : '#090d16bb'}
          />
          <text
            x={x + w - 8 - badgeW / 2}
            y={y + 18.8}
            textAnchor="middle"
            fill={specColor}
            fontSize="7.8"
            fontWeight="800"
            fontFamily="Inter, system-ui, sans-serif"
          >
            {style.badge}
          </text>

          {/* Nome Principal do Chip */}
          <text
            x={x + 11}
            y={y + 24}
            textAnchor="start"
            fill={titleColor}
            fontSize={titleFontSize}
            fontWeight="800"
            fontFamily="Inter, system-ui, sans-serif"
            textLength={estTitleW > availTitleW ? availTitleW : undefined}
            lengthAdjust={estTitleW > availTitleW ? 'spacingAndGlyphs' : undefined}
          >
            {title}
          </text>

          {/* Especificação Chave */}
          <text
            x={x + 11}
            y={y + 43}
            textAnchor="start"
            fill={specColor}
            fontSize={specFontSize}
            fontWeight="700"
            fontFamily="Inter, system-ui, sans-serif"
            textLength={estSpecW > availBodyW ? availBodyW : undefined}
            lengthAdjust={estSpecW > availBodyW ? 'spacingAndGlyphs' : undefined}
          >
            {spec}
          </text>

          {/* Função Resumida */}
          {subSpec && (
            <text
              x={x + 11}
              y={y + 59}
              textAnchor="start"
              fill={subColor}
              fontSize={subFontSize}
              fontWeight="500"
              fontFamily="Inter, system-ui, sans-serif"
              textLength={estSubW > availBodyW ? availBodyW : undefined}
              lengthAdjust={estSubW > availBodyW ? 'spacingAndGlyphs' : undefined}
            >
              {subSpec}
            </text>
          )}
        </g>
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
                  Simulador Interativo de Hardware
                </span>
              </div>
            </div>

            {/* Seletor de Consoles e Comparativo */}
            <nav className="flex items-center gap-1 p-1 rounded-xl bg-slate-800/40 border border-slate-700/40 overflow-x-auto">
              {[
                { id: 'pce', label: 'PC Engine CD (1988)', icon: Disc },
                { id: 'megacd', label: 'Mega-CD (1991)', icon: Layers },
                { id: 'ps1', label: 'PlayStation (1994)', icon: Cpu },
                { id: 'compare', label: 'Comparativo & Loading', icon: Gauge }
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      active
                        ? 'bg-blue-600 text-white shadow-sm'
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
            {activeTab !== 'compare' && (
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

            {activeTab !== 'compare' && (
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
        {activeTab !== 'compare' ? (
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
                  viewBox="0 0 1000 572"
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
                  <rect width="1000" height="572" fill={lightMode ? '#ffffff' : '#080c15'} />
                  <rect width="1000" height="572" fill="url(#techGrid)" />

                  {/* Cabeçalho Limpo dentro do SVG */}
                  <g transform="translate(25, 25)">
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
                        <path id="path-pce-wram" d="M 170 197 L 170 220" />
                        <path id="path-pce-scsi" d="M 735 237 L 665 237" />
                        <path id="path-pce-exp" d="M 425 237 L 365 237 L 365 156 L 290 156" />
                        <path id="path-pce-cpu-vdc" d="M 290 175 L 322 175 L 322 338 L 290 338" />
                        <path id="path-pce-vdc" d="M 170 380 L 170 400" />
                        {/* VDC envia fluxo digital de 9 bits diretamente ao Video Encoder (VCE) */}
                        <path id="path-pce-vce" d="M 290 362 L 314 362 L 314 508 L 290 508" />
                        <path id="path-pce-audio" d="M 845 276 L 845 351 L 665 351" />
                        <path id="path-pce-cpu-audio" d="M 290 156 L 365 156 L 365 351 L 425 351" />
                      </defs>

                      {/* Molduras dos 3 Módulos Físicos */}
                      <rect
                        x="25"
                        y="58"
                        width="310"
                        height="484"
                        rx="14"
                        fill={lightMode ? '#f8fafc' : '#0c1322'}
                        stroke="#3b82f6"
                        strokeWidth="1.8"
                        strokeDasharray="6 4"
                      />
                      <text x="40" y="80" fill="#3b82f6" fontSize="11" fontWeight="800">
                        CONSOLE BASE: PC ENGINE (HuC6280 + VDC + VCE)
                      </text>

                      <rect
                        x="395"
                        y="58"
                        width="295"
                        height="484"
                        rx="14"
                        fill={lightMode ? '#f8fafc' : '#0c1322'}
                        stroke="#f59e0b"
                        strokeWidth="1.8"
                        strokeDasharray="6 4"
                      />
                      <text x="410" y="80" fill="#f59e0b" fontSize="11" fontWeight="800">
                        EXPANSION PORT (IFU-30) + SLOT HUCARD
                      </text>

                      <rect
                        x="715"
                        y="58"
                        width="260"
                        height="484"
                        rx="14"
                        fill={lightMode ? '#f8fafc' : '#0c1322'}
                        stroke="#f97316"
                        strokeWidth="1.8"
                        strokeDasharray="6 4"
                      />
                      <text x="730" y="80" fill="#f97316" fontSize="11" fontWeight="800">
                        LEITOR ÓPTICO CD-ROM² (1988)
                      </text>

                      {/* Estrutura Base do Barramento Central (Expansion Port: CPU / VDC / PSG / Video Out) */}
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
                      <text
                        x="352"
                        y="310"
                        transform="rotate(-90 352 310)"
                        textAnchor="middle"
                        fill={lightMode ? '#475569' : '#94a3b8'}
                        fontSize="10"
                        fontWeight="800"
                      >
                        EXPANSION PORT (CPU 21-BIT / VDC / PSG / VIDEO OUT)
                      </text>

                      {/* Barramentos Completos Direcionados (100% coloridos de ponta a ponta quando ativos) */}
                      {renderBusPath('bus-pce-hucard', 'M 425 137 L 365 137 L 365 156 L 290 156', '#f59e0b', 5)}
                      {renderBusPath('bus-pce-wram', 'M 170 197 L 170 220', '#10b981', 5)}
                      {renderBusPath('bus-pce-scsi', 'M 735 237 L 665 237', '#f97316', 5)}
                      {renderBusPath('bus-pce-exp', 'M 425 237 L 365 237 L 365 156 L 290 156', '#38bdf8', 5)}
                      {renderBusPath('bus-pce-cpu-vdc', 'M 290 175 L 322 175 L 322 338 L 290 338', '#38bdf8', 4.5)}
                      {renderBusPath('bus-pce-vdc', 'M 170 380 L 170 400', '#38bdf8', 5)}
                      {renderBusPath('bus-pce-vce', 'M 290 362 L 314 362 L 314 508 L 290 508', '#a855f7', 5)}
                      {renderBusPath('bus-pce-audio', 'M 845 276 L 845 351 L 665 351', '#10b981', 4.5)}
                      {renderBusPath('bus-pce-cpu-audio', 'M 290 156 L 365 156 L 365 351 L 425 351', '#ec4899', 4.5)}

                      {/* Blocos PC Engine Base */}
                      {renderHardwareNode(
                        'pce-cpu',
                        50,
                        115,
                        240,
                        82,
                        'Hudson Soft HuC6280',
                        '65C02-based CPU + PSG + MMU 21b',
                        '6ch PSG → Audio Amp • Timer • Controle',
                        'cpu'
                      )}
                      {renderHardwareNode(
                        'pce-wram',
                        50,
                        220,
                        240,
                        68,
                        '8 KB RAM Base ($F8)',
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
                        'Video Display Controller',
                        'VDC (HuC6270) • Bus VRAM 16-bit',
                        'Tiles 8×8 (BAT) e 64 Sprites (SATB)',
                        'gpu'
                      )}
                      {renderHardwareNode(
                        'pce-vram',
                        50,
                        400,
                        240,
                        62,
                        '64 KB VRAM (Exclusiva VDC)',
                        '64 KB (32K Words × 16-bit)',
                        'Ligada só ao VDC (Planar 4-bit)',
                        'ram'
                      )}
                      {renderHardwareNode(
                        'pce-vce',
                        50,
                        478,
                        240,
                        60,
                        'Video Encoder + Audio Amp',
                        'VCE (HuC6260) • 9-bit do VDC + PSG',
                        'Até 482 cores (de 512) → TV e Som',
                        'gpu'
                      )}

                      {/* Blocos Interface Unit + System Card */}
                      {renderHardwareNode(
                        'pce-syscard',
                        425,
                        98,
                        240,
                        78,
                        'HuCard: System Card (38p)',
                        'Mask ROM BIOS + Expansão RAM',
                        '+192 KB (Super) ou +2 MB (Arcade)',
                        'storage'
                      )}
                      {renderHardwareNode(
                        'pce-cdram',
                        425,
                        198,
                        240,
                        78,
                        'CD-ROM² Work RAM',
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
                        'Mixa Vozes (32 kHz) + CD-DA + PSG',
                        'audio'
                      )}

                      {/* Bloco Leitor Óptico */}
                      {renderHardwareNode(
                        'pce-drive',
                        735,
                        190,
                        220,
                        86,
                        'Leitor CD-ROM² (1x)',
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
                        <path id="path-mcd-cd" d="M 883 215 L 883 146 L 782 146" />
                        <path id="path-mcd-prg" d="M 683 187 L 683 245" />
                        <path id="path-mcd-sub-asic" d="M 584 146 L 544 146" />
                        <path id="path-mcd-asic-word" d="M 444 194 L 444 245" />
                        <path id="path-mcd-main-word" d="M 344 288 L 324 288 L 324 146 L 300 146" />
                        <path id="path-mcd-main-ram" d="M 167 187 L 167 215" />
                        <path id="path-mcd-vdp" d="M 300 170 L 313 170 L 313 368 L 300 368" />
                        <path id="path-mcd-z80" d="M 35 256 L 23 256 L 23 481 L 35 481" />
                        <path id="path-mcd-sub-pcm" d="M 683 331 L 683 385" />
                        <path id="path-mcd-pcm" d="M 883 303 L 883 385" />
                      </defs>

                      {/* Molduras Mega Drive vs Ponte Word RAM vs Mega-CD */}
                      <rect
                        x="18"
                        y="58"
                        width="300"
                        height="484"
                        rx="14"
                        fill={lightMode ? '#f8fafc' : '#0c1322'}
                        stroke="#3b82f6"
                        strokeWidth="1.8"
                        strokeDasharray="6 4"
                      />
                      <text x="33" y="80" fill="#3b82f6" fontSize="11" fontWeight="800">
                        MEGA DRIVE BASE (BUS 16-BIT &amp; 8-BIT Z80)
                      </text>

                      <rect
                        x="332"
                        y="58"
                        width="224"
                        height="484"
                        rx="14"
                        fill={lightMode ? '#faf5ff' : '#140d24'}
                        stroke="#a855f7"
                        strokeWidth="1.8"
                      />
                      <text x="444" y="80" textAnchor="middle" fill="#c084fc" fontSize="11" fontWeight="800">
                        ACCESSORY PORT: ASIC &amp; WORD RAM
                      </text>

                      <rect
                        x="570"
                        y="58"
                        width="412"
                        height="484"
                        rx="14"
                        fill={lightMode ? '#f8fafc' : '#0c1322'}
                        stroke="#10b981"
                        strokeWidth="1.8"
                        strokeDasharray="6 4"
                      />
                      <text x="585" y="80" fill="#10b981" fontSize="11" fontWeight="800">
                        EXPANSÃO SEGA MEGA-CD (1991 — SUB-CPU 12.5 MHz)
                      </text>

                      {/* Barramentos Completos Direcionados (Mesmo formato e direção dos pacotes!) */}
                      {renderBusPath('bus-mcd-cd', 'M 883 215 L 883 146 L 782 146', '#f97316', 5)}
                      {renderBusPath('bus-mcd-prg', 'M 683 187 L 683 245', '#10b981', 5)}
                      {renderBusPath('bus-mcd-sub-asic', 'M 584 146 L 544 146', '#a855f7', 5)}
                      {renderBusPath('bus-mcd-asic-word', 'M 444 194 L 444 245', '#a855f7', 5)}
                      {renderBusPath('bus-mcd-main-word', 'M 344 288 L 324 288 L 324 146 L 300 146', '#ec4899', 5)}
                      {renderBusPath('bus-mcd-main-ram', 'M 167 187 L 167 215', '#10b981', 5)}
                      {renderBusPath('bus-mcd-vdp', 'M 300 170 L 313 170 L 313 368 L 300 368', '#38bdf8', 5)}
                      {renderBusPath('bus-mcd-z80', 'M 35 256 L 23 256 L 23 481 L 35 481', '#f59e0b', 4.5)}
                      {renderBusPath('bus-mcd-sub-pcm', 'M 683 331 L 683 385', '#ec4899', 5)}
                      {renderBusPath('bus-mcd-pcm', 'M 883 303 L 883 385', '#10b981', 5)}

                      {/* Blocos Mega Drive Base */}
                      {renderHardwareNode(
                        'mcd-maincpu',
                        35,
                        105,
                        265,
                        82,
                        'Motorola 68000 CPU',
                        '~7.67 MHz • Barramento 16-bit',
                        'Regs 32b • ALU 16b • Endereços 24b',
                        'cpu'
                      )}
                      {renderHardwareNode(
                        'mcd-arbiter',
                        35,
                        215,
                        265,
                        82,
                        '64 KB RAM + Bus Arbiter & I/O',
                        'Bus 16-bit ↔ 8-bit ($A11100)',
                        'I/O Controller (Controles) • Pausa DMA',
                        'ram'
                      )}
                      {renderHardwareNode(
                        'mcd-vdp',
                        35,
                        325,
                        265,
                        86,
                        'VDP Package (VDP + PSG)',
                        '64KB VRAM (8-bit) + CRAM + VSRAM',
                        'Video Display Processor + TI SN76489',
                        'gpu'
                      )}
                      {renderHardwareNode(
                        'mcd-z80',
                        35,
                        440,
                        265,
                        82,
                        'Zilog Z80 (8 KB RAM) + YM2612',
                        'Barramento 8-bit @ 3.58 MHz',
                        'YM2612 FM + PSG → Audio Mixer',
                        'audio'
                      )}

                      {/* Blocos Ponte Gate Array ASIC & Word RAM (Alargados para 200px) */}
                      {renderHardwareNode(
                        'mcd-asic',
                        344,
                        110,
                        200,
                        84,
                        'Gate Array / ASIC',
                        'Rotação + 16 Comm Ports',
                        '$A12010–2E • IRQ2 • Tiles 8×8',
                        'gpu'
                      )}
                      {renderHardwareNode(
                        'mcd-wordram',
                        344,
                        245,
                        200,
                        92,
                        'Word RAM (256 KB)',
                        'Modo 2M ou 1M/1M ($600000)',
                        'Bank Swap: Sub ↔ Main-CPU',
                        'ram'
                      )}

                      {/* Blocos Expansão Mega-CD (Alargados e sem texto cortado) */}
                      {renderHardwareNode(
                        'mcd-subcpu',
                        584,
                        105,
                        198,
                        82,
                        'Sub-CPU: 2º 68000',
                        '12.5 MHz + 128 KB BIOS',
                        '+8 KB BRAM • Controla CDC/PCM',
                        'cpu'
                      )}
                      {renderHardwareNode(
                        'mcd-prgram',
                        584,
                        245,
                        198,
                        86,
                        'Program RAM (512 KB)',
                        '512 KB DRAM (4× 128 KB)',
                        'Execução Sub-CPU + DMA CDC',
                        'ram'
                      )}
                      {renderHardwareNode(
                        'mcd-drive',
                        796,
                        215,
                        174,
                        88,
                        'CD 1x + CDC',
                        '150 KB/s • LC8951 (16KB)',
                        'DMA CDC + Áudio CD-DA',
                        'cd'
                      )}
                      {renderHardwareNode(
                        'mcd-pcm',
                        584,
                        385,
                        386,
                        86,
                        'Áudio Mega-CD: Ricoh RF5C164 (8ch PCM)',
                        '64 KB PCM Wave RAM (Sub-CPU) + Mixagem CD-DA',
                        'Truque Sonic CD: cobre busca do laser 1x no loop',
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
                        <path id="path-ps1-cd-sub" d="M 645 420 L 580 420" />
                        <path id="path-ps1-biu-dma" d="M 460 375 L 460 326" />
                        <path id="path-ps1-dma-ram" d="M 500 276 L 500 164" />
                        <path id="path-ps1-ram-dma" d="M 500 164 L 500 276" />
                        <path id="path-ps1-dma-cpu" d="M 200 276 L 200 247" />
                        <path id="path-ps1-cpu-dma" d="M 200 247 L 200 276" />
                        <path id="path-ps1-dma-gpu" d="M 800 276 L 800 187" />
                        <path id="path-ps1-dma-spu" d="M 460 326 L 460 375 M 340 420 L 280 420" />
                        <path id="path-ps1-cd-spu" d="M 808 467 L 808 518 L 155 518 L 155 467" />
                      </defs>

                      {/* BLOCO 1: SONY CPU SoC (CXD8530BQ) */}
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
                          SONY CPU SoC (CW33300 @ 33.8688 MHz)
                        </text>

                        <rect x="45" y="95" width="145" height="62" rx="8" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5" />
                        <text x="117" y="114" textAnchor="middle" fill="#fff" fontSize="10.5" fontWeight="800">
                          CoreWare CW33300 CPU
                        </text>
                        <text x="117" y="129" textAnchor="middle" fill="#93c5fd" fontSize="9" fontWeight="700">
                          + System Control (CP0)
                        </text>
                        <text x="117" y="144" textAnchor="middle" fill="#cbd5e1" fontSize="8.5">
                          4KB I-Cache + 1KB SRAM
                        </text>

                        <rect x="200" y="95" width="150" height="62" rx="8" fill="#312e81" stroke="#6366f1" strokeWidth="1.5" />
                        <text x="275" y="114" textAnchor="middle" fill="#fff" fontSize="10.5" fontWeight="800">
                          Geometry Engine (GTE)
                        </text>
                        <text x="275" y="129" textAnchor="middle" fill="#a5b4fc" fontSize="9.5" fontWeight="700">
                          66 MIPS Ponto Fixo
                        </text>
                        <text x="275" y="144" textAnchor="middle" fill="#cbd5e1" fontSize="8.5">
                          1.5M Vértices/s + Z-Sort
                        </text>

                        <rect x="45" y="168" width="145" height="64" rx="8" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
                        <text x="117" y="187" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="800">
                          DRAM Contr. &amp; Serial
                        </text>
                        <text x="117" y="203" textAnchor="middle" fill="#6ee7b7" fontSize="9" fontWeight="700">
                          DBus 32-bit (2MB EDO)
                        </text>
                        <text x="117" y="218" textAnchor="middle" fill="#fde68a" fontSize="8.3" fontWeight="700">
                          Controles + Memory Cards
                        </text>

                        <rect x="200" y="168" width="150" height="64" rx="8" fill="#500724" stroke="#ec4899" strokeWidth="1.5" />
                        <text x="275" y="187" textAnchor="middle" fill="#fff" fontSize="10.5" fontWeight="800">
                          Motion Decoder (MDEC)
                        </text>
                        <text x="275" y="203" textAnchor="middle" fill="#f9a8d4" fontSize="9.5" fontWeight="700">
                          IDCT + YCbCr→RGB 24b
                        </text>
                        <text x="275" y="218" textAnchor="middle" fill="#cbd5e1" fontSize="8.5">
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
                        '2 MB EDO DRAM',
                        'DBus 32-bit ↔ DRAM Contr.',
                        '64 KB Kernel + Ordering Table',
                        'ram'
                      )}

                      {/* BLOCO 3: VIDEO SUBSYSTEM (SONY GPU + 1 MB VRAM + RGB ENCODER) */}
                      {renderHardwareNode(
                        'ps1-gpu',
                        640,
                        72,
                        330,
                        115,
                        'Video Subsystem: Sony GPU + VRAM',
                        'Sony GPU ↔ 1 MB VRAM (16b) → RGB Encoder',
                        'Grade 1024×512 • 2 KB Cache • Sem Z-Buffer',
                        'gpu'
                      )}

                      {/* Trilhas Estruturais Base do PS1 (Cinza quando inativas) */}
                      <line x1="200" y1="247" x2="200" y2="276" stroke={lightMode ? '#cbd5e1' : '#334155'} strokeWidth="5" opacity="0.4" />
                      <line x1="500" y1="164" x2="500" y2="276" stroke={lightMode ? '#cbd5e1' : '#334155'} strokeWidth="5" opacity="0.4" />
                      <line x1="800" y1="187" x2="800" y2="276" stroke={lightMode ? '#cbd5e1' : '#334155'} strokeWidth="5" opacity="0.4" />
                      <line x1="460" y1="326" x2="460" y2="375" stroke={lightMode ? '#cbd5e1' : '#334155'} strokeWidth="5" opacity="0.4" />
                      <line x1="280" y1="420" x2="340" y2="420" stroke={lightMode ? '#cbd5e1' : '#334155'} strokeWidth="4.5" opacity="0.4" />
                      <line x1="580" y1="420" x2="645" y2="420" stroke={lightMode ? '#cbd5e1' : '#334155'} strokeWidth="4.5" opacity="0.4" />

                      {/* Barramentos Ativos com Direção Exata e Setas */}
                      {renderBusPath('bus-ps1-cd-sub', 'M 645 420 L 580 420', '#f97316', 5)}
                      {renderBusPath('bus-ps1-biu-dma', 'M 460 375 L 460 326', '#f59e0b', 5)}
                      {renderBusPath('bus-ps1-dma-ram', 'M 500 276 L 500 164', '#10b981', 5)}
                      {renderBusPath('bus-ps1-ram-dma', 'M 500 164 L 500 276', '#10b981', 5)}
                      {renderBusPath('bus-ps1-dma-cpu', 'M 200 276 L 200 247', '#ec4899', 5)}
                      {renderBusPath('bus-ps1-cpu-dma', 'M 200 247 L 200 276', '#38bdf8', 5)}
                      {renderBusPath('bus-ps1-dma-gpu', 'M 800 276 L 800 187', '#38bdf8', 5)}
                      {renderBusPath('bus-ps1-dma-spu', 'M 460 326 L 460 375 M 340 420 L 280 420', '#a855f7', 5)}
                      {renderBusPath('bus-ps1-cd-spu', 'M 808 467 L 808 518 L 155 518 L 155 467', '#10b981', 4.5)}

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
                        340,
                        375,
                        240,
                        92,
                        'Bus Interface Unit (BIU)',
                        '512 KB BIOS (8b) + Parallel (16b)',
                        'Liga Main Bus 32b à GPU, SPU e CD',
                        'storage'
                      )}

                      {/* BLOCO AUDIO SUBSYSTEM (SONY SPU + 512 KB DRAM) */}
                      {renderHardwareNode(
                        'ps1-spu',
                        30,
                        375,
                        250,
                        92,
                        'Audio Subsystem: Sony SPU',
                        'Sub Bus (16b) ↔ 512 KB DRAM (16b)',
                        '24 Canais ADPCM @ 44.1 kHz + Reverb',
                        'audio'
                      )}

                      {/* BLOCO CD SUBSYSTEM (CD-ROM CONTROLLER + 32 KB SRAM + SUB-CPU + DSP) */}
                      {renderHardwareNode(
                        'ps1-cd',
                        645,
                        375,
                        325,
                        92,
                        'CD Subsystem (2x — 300 KB/s)',
                        'CD-ROM Controller + 32 KB SRAM (8-bit)',
                        'Sub-CPU (8-bit) + DSP + Via Direta SPU',
                        'cd'
                      )}

                      <text x="480" y="510" textAnchor="middle" fill="#10b981" fontSize="9.8" fontWeight="700">
                        LIGAÇÃO DIRETA DO CD-ROM CONTROLLER PARA A SONY SPU: ÁUDIO CD-DA / XA-ADPCM (SEM GASTAR CPU/RAM)
                      </text>

                      {renderAnimatedPackets()}
                    </g>
                  )}

                  {/* Rodapé Discreto abaixo das molduras (sem colidir com as bordas tracejadas) */}
                  <text
                    x="25"
                    y="560"
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

                    {/* Insight Técnico Direto */}
                    <div
                      className={`p-3 rounded-xl border-l-4 border-amber-400 ${
                        lightMode ? 'bg-amber-50/80 text-slate-800' : 'bg-amber-500/10 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-400 mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Por que isso importa na arquitetura?
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
        ) : (
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
                    Por que os jogos em CD precisavam de telas de &ldquo;Loading&rdquo;? (Cartucho ROM vs. CD-ROM)
                  </h2>
                  <p className={`text-xs mt-0.5 ${lightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                    No cartucho, os pinos da ROM se ligam diretamente ao barramento da CPU (leitura instantânea). No CD-ROM, o leitor óptico precisa deslocar o laser fisicamente e copiar toda a fase para a memória RAM antes de o jogo começar.
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
                    speed: '150 KB/s via Expansion Port',
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

            {/* Quadro Comparativo Completo */}
            <div
              className={`p-5 rounded-2xl border overflow-x-auto ${
                lightMode ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0c1221] border-slate-800'
              }`}
            >
              <h3 className="text-base font-extrabold mb-3">
                Comparativo Arquitetural Completo (PC Engine CD-ROM², Mega-CD e PlayStation)
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
                    <td className="p-3">Hudson Soft HuC6280 (65C02 8-bit @ 7.16 MHz) + MMU 21-bit (8× MPR) + PSG + Timer/IO</td>
                    <td className="p-3">Motorola 68000 @ ~7.67 MHz (Regs 32b, ALU/Bus 16b, Endereçamento 24b para 16 MB)</td>
                    <td className="p-3">Sony CPU SoC (CoreWare CW33300 @ 33.8688 MHz, 32-bit RISC + System Control CP0)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Coprocessadores</td>
                    <td className="p-3">Sem coprocessador externo (HuC6280 integra PSG, Timer, MMU e transferência em bloco)</td>
                    <td className="p-3">Sub-CPU 68000 @ 12.5 MHz + Zilog Z80 (3.58 MHz) + Gate Array ASIC + CDC LC8951</td>
                    <td className="p-3">Geometry Transformation Engine (GTE) + Motion Decoder (MDEC) no SoC + Sub-CPU no CD</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Memória RAM &amp; Saves</td>
                    <td className="p-3">8 KB Base + 64 KB CD-RAM + 2 KB BRAM + 64 KB ADPCM + System Card (+192 KB / +2 MB)</td>
                    <td className="p-3">64 KB Base (16b) + 8 KB Z80 (8b) + 512 KB PRG-RAM + 256 KB Word RAM + 8 KB BRAM</td>
                    <td className="p-3">2 MB EDO DRAM (DBus 32b) + 4 KB I-Cache + 1 KB Scratchpad + Memory Card 128 KB (Serial)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Vídeo &amp; Barramento VRAM</td>
                    <td className="p-3">Video Display Controller (VDC) ↔ 64 KB VRAM (16-bit) → Video Encoder (VCE — 482 cores)</td>
                    <td className="p-3">VDP Package: VDP ↔ 64 KB VRAM (8-bit) + 128 B CRAM + 80 B VSRAM → Video Encoder</td>
                    <td className="p-3">Video Subsystem: Sony GPU ↔ 1 MB VRAM (16-bit) → RGB Encoder (16-bit) • Sem Z-Buffer</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Barramentos &amp; DMA</td>
                    <td className="p-3">Expansion Port (CPU/VDC/PSG/Video) + SCSI-1 (CD) + DMA interno no VDC (VRAM→SATB)</td>
                    <td className="p-3">Bus 16-bit + Bus Arbiter + Bus 8-bit Z80 + 16 Comm Ports ($A12010) + Bank Swap</td>
                    <td className="p-3">Main Bus 32b (7 Canais DMA) + DBus 32b (DRAM Contr.) + Bus Interface Unit (Sub Bus 16/8b)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Áudio &amp; CD-ROM</td>
                    <td className="p-3">PSG (6ch no HuC6280 → Audio Amplifier) + OKI MSM5205 ADPCM (64 KB) + CD-ROM² 1x</td>
                    <td className="p-3">YM2612 FM (6ch) + TI SN76489 PSG (no VDP) → Audio Mixer + Ricoh PCM (8ch) + CD 1x</td>
                    <td className="p-3">Sony SPU ↔ 512 KB DRAM (16-bit, 24ch ADPCM) + CD Subsystem (8-bit, 32 KB SRAM, DSP, Sub-CPU)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Guia Rápido Visual das 5 Peças Fundamentais */}
            <div
              className={`p-5 rounded-2xl border ${
                lightMode ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0c1221] border-slate-800'
              }`}
            >
              <div className="text-xs font-extrabold uppercase tracking-wider text-amber-400 mb-2.5">
                Dicionário Visual: Como funcionam as 5 peças principais de um videogame
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

            {/* Cartões das Fontes Técnicas Pesquisadas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[
                {
                  title: 'PC Engine & Archaic Pixels',
                  author: 'Documentação Técnica PC Engine',
                  desc: 'Hudson Soft HuC6280 (CPU 65C02 + PSG + MMU 21b), Video Display Controller ↔ 64 KB VRAM (16-bit) e Video Encoder.',
                  url: 'https://classic.copetti.org/writings/consoles/pc-engine/'
                },
                {
                  title: 'Mega Drive, Mega-CD & Plutiedev',
                  author: 'Documentação Técnica Sega 16-bit',
                  desc: 'Barramento 16-bit (68000) e 8-bit (Z80 + YM2612), Bus Arbiter, VDP Package (64 KB VRAM 8-bit + PSG), ASIC e Word RAM.',
                  url: 'https://www.copetti.org/pt-br/writings/consoles/mega-drive-genesis/'
                },
                {
                  title: 'PlayStation (PS1) Architecture',
                  author: 'Documentação Técnica PlayStation',
                  desc: 'Sony CPU SoC (CW33300, GTE, CP0, MDEC, DRAM Contr. e Serial Interface), Bus Interface Unit, Video, Audio e CD Subsystems.',
                  url: 'https://www.copetti.org/pt-br/writings/consoles/playstation/'
                },
                {
                  title: 'Nocash PSX-SPX Specifications',
                  author: 'Martin Korth (problemkaputt.de)',
                  desc: 'Especificações de registradores dos 7 canais DMA (Ch0–Ch6 OTC), cadeia FMV (DMA0/1/2), BIU, SPU e controlador de CD.',
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
        )}
      </main>
    </div>
  );
}
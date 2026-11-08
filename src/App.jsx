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
  ExternalLink
} from 'lucide-react';

// ============================================================================
// BASE DE DADOS TÉCNICA (RODRIGO COPETTI & RETROREVERSING)
// Organizada em tópicos visuais curtos e diretos para leitura fácil
// ============================================================================

const ARCHITECTURE_DATA = {
  pce: {
    id: 'pce',
    shortName: 'PC Engine CD-ROM²',
    name: 'NEC PC Engine + CD-ROM² (1988)',
    subtitle: 'HuC6280 (8-bit + MMU 21-bit) • Vídeo Dual-Chip (VDC + VCE) • Expansão CD-ROM²',
    year: '1988',
    sources: [
      { label: 'Copetti — PC Engine', url: 'https://classic.copetti.org/writings/consoles/pc-engine/' }
    ],
    simulationSteps: [
      {
        step: 0,
        shortTitle: 'Visão Geral',
        title: 'Console Base: CPU 8-bit com MMU de 21-bit',
        summary:
          'O PC Engine usa o chip HuC6280 (65C02 modificado a 7.16 MHz). Para superar o limite de 64 KB dos processadores de 8 bits, ele traz uma MMU interna que expande o endereçamento para 2 MB.',
        flowSteps: [
          { tag: 'CPU 8-bit', text: 'HuC6280 opera a 1.79 MHz ou 7.16 MHz com instruções TAM e TMA.' },
          { tag: 'MMU (8× MPR)', text: '8 registradores paginam blocos de 8 KB em um barramento físico de 21 bits (2 MB).' },
          { tag: 'RAM Base', text: 'Apenas 8 KB de Work RAM interna no console original (1 página MPR).' }
        ],
        insight:
          'Por ter apenas 8 KB de RAM interna, o PC Engine sozinho não conseguia armazenar dados vindos de um CD — por isso a expansão precisou adicionar novos bancos de RAM.',
        speech:
          '"Pessoal, começamos pelo PC Engine de 1987 com o módulo CD-ROM² de 1988. O coração dele é o HuC6280 de 8 bits a 7.16 MHz. Como uma CPU de 8 bits comum só enxerga 64 KB, a Hudson incluiu uma MMU com 8 registradores MPR que expandem o barramento para 21 bits (até 2 MB em páginas de 8 KB)."',
        activeNodes: ['pce-cpu', 'pce-wram', 'pce-vdc', 'pce-vce'],
        activeBuses: [],
        packets: []
      },
      {
        step: 1,
        shortTitle: 'System Card',
        title: 'Slot HuCard (38 pinos): BIOS e Expansão de RAM',
        summary:
          'Como o console original não sabia ler CDs, um cartão especial (System Card) é inserido no slot de cartucho para fornecer a BIOS de boot e memória RAM extra.',
        flowSteps: [
          { tag: 'Slot 38 pinos', text: 'A System Card é inserida onde normalmente entraria um jogo HuCard.' },
          { tag: 'BIOS do CD', text: 'Mapeia no barramento de 21 bits as rotinas de controle do leitor óptico.' },
          { tag: 'Upgrade de RAM', text: 'Super System Card soma +192 KB RAM; Arcade Card soma +2 MB DRAM.' }
        ],
        insight:
          'Seg. Copetti: Os CDs do PC Engine não têm trava física de região; a verificação acontecia no próprio slot HuCard através da System Card!',
        speech:
          '"Como o PC Engine original foi projetado apenas para cartões HuCard, ele não tinha BIOS de CD. Por isso inserimos a System Card no slot de 38 pinos: ela fornece o sistema operacional do CD e expande a memória RAM em 192 KB (Super System Card) ou até 2 MB (Arcade Card)."',
        activeNodes: ['pce-syscard', 'pce-cpu'],
        activeBuses: ['bus-pce-hucard'],
        packets: [
          { pathId: 'path-pce-hucard', color: '#f59e0b', label: 'BIOS + RAM Extra', badgeX: 365, badgeY: 105 }
        ]
      },
      {
        step: 2,
        shortTitle: 'Leitura CD 1x',
        title: 'Leitura Óptica 1x (150 KB/s) via Porta de Expansão',
        summary:
          'O leitor CD-ROM² lê os setores a 150 KB/s (SCSI-1) e armazena código e gráficos nos 64 KB de DRAM da Interface Unit antes de enviá-los à CPU.',
        flowSteps: [
          { tag: 'Laser 1x CLV', text: 'Transfere dados a 150 KB/s pelo barramento SCSI até a Interface Unit (IFU-30).' },
          { tag: '64 KB CD-RAM', text: 'Armazena os arquivos da fase + 2 KB de BRAM para salvar o progresso.' },
          { tag: 'Porta Traseira', text: 'O barramento de expansão conecta a unidade de CD diretamente à MMU da CPU.' }
        ],
        insight:
          'Diferente dos cartuchos (onde a CPU lê o jogo instantaneamente da ROM), no CD é obrigatório copiar os dados para a RAM antes de executar.',
        speech:
          '"Para carregar uma fase, a CPU envia comandos pela porta traseira até a Interface Unit. O leitor 1x lê o CD a 150 KB/s e abastece os 64 KB de RAM da unidade de CD, além de contar com 2 KB de memória BRAM para saves."',
        activeNodes: ['pce-drive', 'pce-cdram', 'pce-cpu'],
        activeBuses: ['bus-pce-scsi', 'bus-pce-exp'],
        packets: [
          { pathId: 'path-pce-scsi', color: '#f97316', label: '150 KB/s (SCSI)', badgeX: 700, badgeY: 205 },
          { pathId: 'path-pce-exp', color: '#38bdf8', label: 'Bus 8-bit Expansão', badgeX: 365, badgeY: 235 }
        ]
      },
      {
        step: 3,
        shortTitle: 'Vídeo Dual-Chip',
        title: 'Pipeline Gráfico: HuC6270 (VDC) + HuC6260 (VCE)',
        summary:
          'O vídeo é dividido em dois chips: o VDC monta a cena em uma VRAM de 16 bits (64 KB) e envia os pixels em 9 bits para o VCE colorir e gerar o sinal da TV.',
        flowSteps: [
          { tag: 'CPU 8b → VRAM 16b', text: 'A CPU escreve em pares de registradores para alimentar a VRAM de 16 bits.' },
          { tag: 'VDC (HuC6270)', text: 'Desenha Tiles 8×8 e 64 Sprites (SATB via DMA interno) e gera stream de 9 bits.' },
          { tag: 'VCE (HuC6260)', text: 'Aplica 32 paletas de 16 cores (até 482 cores na tela) e gera o sinal de vídeo.' }
        ],
        insight:
          'Embora a CPU seja de 8 bits, o VDC acessa a VRAM em palavras de 16 bits! Isso dobrava a largura de banda gráfica e permitia gráficos com nível de 16 bits.',
        speech:
          '"Vejam o segredo gráfico apontado por Copetti: embora a CPU seja de 8 bits, o chip de vídeo VDC (HuC6270) organiza seus 64 KB de VRAM em palavras de 16 bits! Ele monta os tiles e sprites e manda um fluxo digital de 9 bits para o segundo chip, o VCE (HuC6260), que aplica até 482 cores simultâneas na TV."',
        activeNodes: ['pce-cdram', 'pce-cpu', 'pce-vdc', 'pce-vram', 'pce-vce'],
        activeBuses: ['bus-pce-exp', 'bus-pce-vdc', 'bus-pce-vce'],
        packets: [
          { pathId: 'path-pce-vdc', color: '#38bdf8', label: 'Words 16-bit VRAM', badgeX: 175, badgeY: 315 },
          { pathId: 'path-pce-vce', color: '#a855f7', label: 'Stream 9-bit Cor', badgeX: 175, badgeY: 472 }
        ]
      },
      {
        step: 4,
        shortTitle: 'Áudio Triplo',
        title: 'Mixagem Tripla: Waveform PSG + ADPCM + CD-DA',
        summary:
          'A unidade CD-ROM² combina o sintetizador interno da CPU com um chip dedicado a vozes (ADPCM com 64 KB próprios) e música de CD (CD-DA).',
        flowSteps: [
          { tag: 'Waveform PSG', text: '6 canais de ondas programáveis (5-bit) integrados dentro da própria CPU.' },
          { tag: '64 KB ADPCM', text: 'Memória exclusiva para vozes/efeitos decodificados pelo chip OKI MSM5205.' },
          { tag: 'CD-DA Estéreo', text: 'Trilha sonora lida direto do disco óptico sem consumir memória RAM.' }
        ],
        insight:
          'Separar 64 KB exclusivos para o áudio ADPCM evitava que as falas dos personagens roubassem espaço dos gráficos na RAM principal.',
        speech:
          '"Para fechar o PC Engine: o áudio mistura 3 fontes ao mesmo tempo! Os 6 canais Waveform PSG dentro da CPU, 64 KB de RAM exclusivos na unidade de CD para vozes em ADPCM, e música com qualidade de CD tocando direto do laser!"',
        activeNodes: ['pce-drive', 'pce-adpcm', 'pce-cpu'],
        activeBuses: ['bus-pce-audio'],
        packets: [
          { pathId: 'path-pce-audio', color: '#10b981', label: 'CD-DA + ADPCM 64KB', badgeX: 735, badgeY: 360 }
        ]
      }
    ],
    components: [
      {
        id: 'pce-cpu',
        title: 'CPU HuC6280 + MMU',
        spec: '8-bit 65C02 @ 7.16 MHz',
        subSpec: 'MMU 8× MPR (21-bit) + 6ch PSG',
        category: 'cpu',
        metrics: [
          { label: 'Clock', value: '1.79 / 7.16 MHz' },
          { label: 'Barramento', value: '8-bit Dados / 21-bit Addr' },
          { label: 'Paginação MMU', value: '8× Bancos MPR de 8 KB' },
          { label: 'Áudio Interno', value: '6 Canais Waveform PSG' }
        ],
        detail:
          'Seg. Copetti: Baseado no WDC 65C02, adiciona instruções de bloco (TII, TDD) e 8 registradores MPR (Mapping Registers) controlados por TAM/TMA que convertem endereços lógicos de 16 bits em endereços físicos de 21 bits (até 2 MB).'
      },
      {
        id: 'pce-wram',
        title: 'Work RAM Base',
        spec: '8 KB SRAM Interna',
        subSpec: '1 Página MPR no Console',
        category: 'ram',
        metrics: [
          { label: 'Capacidade', value: '8 KB SRAM' },
          { label: 'Mapeamento', value: '1 Página MPR ($F8)' },
          { label: 'Acesso', value: 'Zero Wait-State (CPU)' },
          { label: 'Limitação', value: 'Exige RAM extra p/ CD' }
        ],
        detail:
          'Memória de trabalho original do console base. Como 8 KB bastavam para jogos em cartão ROM mas eram insuficientes para dados de CD, o módulo CD-ROM² precisou adicionar RAM externa.'
      },
      {
        id: 'pce-vdc',
        title: 'VDC: HuC6270 (Vídeo)',
        spec: 'Barramento VRAM 16-bit',
        subSpec: 'Tiles 8×8 + 64 Sprites (DMA)',
        category: 'gpu',
        metrics: [
          { label: 'Acesso VRAM', value: 'Palavras de 16 bits' },
          { label: 'Background', value: '1 Camada Tiles 8×8 (4 bpp)' },
          { label: 'Sprites', value: '64 na SATB (16 por linha)' },
          { label: 'Saída Digital', value: 'Stream 9-bit p/ o VCE' }
        ],
        detail:
          'Seg. Copetti: Embora a CPU seja de 8 bits, o VDC organiza a VRAM em palavras de 16 bits. Possui DMA interno para atualizar a tabela de sprites (SATB) durante o V-Blank e envia pixels codificados em 9 bits para o VCE.'
      },
      {
        id: 'pce-vram',
        title: 'VRAM Dedicada',
        spec: '64 KB SRAM (16-bit Words)',
        subSpec: 'Tiles Planar 4-bit + Sprites',
        category: 'ram',
        metrics: [
          { label: 'Capacidade', value: '64 KB (32K Words × 16-bit)' },
          { label: 'Formato Tile', value: '4 Bitplanes (CH0–CH3)' },
          { label: 'Sprites', value: '16×16 até 32×64 pixels' },
          { label: 'Ligação', value: 'Exclusiva do chip VDC' }
        ],
        detail:
          'Acessada exclusivamente pelo VDC em palavras de 16 bits. Armazena duas linhas de planos de bits simultaneamente em cada endereço, acelerando a leitura de gráficos.'
      },
      {
        id: 'pce-vce',
        title: 'VCE: HuC6260 (Cores)',
        spec: '32 Paletas × 16 Cores',
        subSpec: 'Até 482 Cores de 512 (RGB 9-bit)',
        category: 'gpu',
        metrics: [
          { label: 'Paletas', value: '16 Background + 16 Sprites' },
          { label: 'Cores Simultâneas', value: 'Até 482 cores na tela' },
          { label: 'Espaço de Cor', value: 'RGB 9-bit (512 cores)' },
          { label: 'Saída Analógica', value: 'RF / Composto / RGB' }
        ],
        detail:
          'Seg. Copetti: Recebe o número da paleta e o índice de cor em 9 bits vindos do VDC, consulta sua tabela interna de cores e converte em sinal analógico para a TV.'
      },
      {
        id: 'pce-syscard',
        title: 'System Card (HuCard)',
        spec: 'BIOS ROM + Expansão RAM',
        subSpec: '+192 KB (Super) ou +2 MB (Arcade)',
        category: 'storage',
        metrics: [
          { label: 'Conector', value: 'Slot HuCard (38 pinos)' },
          { label: 'System Card 1–2', value: 'BIOS CD-ROM²' },
          { label: 'Super System Card', value: 'BIOS + 192 KB SRAM' },
          { label: 'Arcade Card', value: 'BIOS + 2 MB DRAM' }
        ],
        detail:
          'Inserida no slot de cartucho do PC Engine. Fornece as rotinas de inicialização do leitor de CD e expande drasticamente a RAM mapeada na MMU de 21 bits.'
      },
      {
        id: 'pce-cdram',
        title: 'CD-ROM² Work RAM',
        spec: '64 KB DRAM + 2 KB BRAM',
        subSpec: 'Buffer de Código e Dados do CD',
        category: 'ram',
        metrics: [
          { label: 'RAM Geral', value: '64 KB DRAM na IFU-30' },
          { label: 'Save Memory', value: '2 KB BRAM com bateria' },
          { label: 'Mapeamento', value: 'Páginas de 8 KB na MMU' },
          { label: 'Taxa de Entrada', value: '150 KB/s vindos do CD' }
        ],
        detail:
          'Localizada na Interface Unit (IFU-30). Recebe o código executável e os gráficos lidos do CD-ROM² antes de serem processados pela CPU.'
      },
      {
        id: 'pce-adpcm',
        title: 'Áudio ADPCM + Mixer',
        spec: '64 KB ADPCM + OKI MSM5205',
        subSpec: 'Vozes Digitais + Mixagem CD-DA',
        category: 'audio',
        metrics: [
          { label: 'Buffer ADPCM', value: '64 KB DRAM Exclusiva' },
          { label: 'Decodificador', value: 'OKI MSM5205 (4-bit → 12-bit)' },
          { label: 'Taxa de Amostragem', value: 'Até 32 kHz' },
          { label: 'Saída Final', value: 'Mixagem ADPCM + CD-DA' }
        ],
        detail:
          'Seg. Copetti: A expansão dedica 64 KB de RAM exclusivamente para samples de voz ADPCM, liberando a RAM geral de 64 KB para a lógica e os gráficos do jogo.'
      },
      {
        id: 'pce-drive',
        title: 'Leitor CD-ROM² (1x)',
        spec: '150 KB/s • Barramento SCSI',
        subSpec: '650 MB (Mode 1 + Áudio CD-DA)',
        category: 'cd',
        metrics: [
          { label: 'Velocidade', value: '1x CLV (150 KB/s)' },
          { label: 'Interface', value: 'Controlador SCSI-1' },
          { label: 'Capacidade', value: '~650 MB por disco' },
          { label: 'Trava de Região', value: 'Sem trava física no CD' }
        ],
        detail:
          'Primeira unidade de CD-ROM para videogames domésticos (1988). Lê trilhas de dados (Mode 1) e música Red Book (CD-DA).'
      }
    ]
  },

  megacd: {
    id: 'megacd',
    shortName: 'Mega Drive + Mega-CD',
    name: 'Sega Mega Drive + Mega-CD (1991)',
    subtitle: 'Dual Motorola 68000 (7.67 MHz + 12.5 MHz) • Word RAM Bank Swap • ASIC Gráfico & VDP',
    year: '1991',
    sources: [
      { label: 'Copetti — Mega Drive / Genesis (PT-BR)', url: 'https://www.copetti.org/pt-br/writings/consoles/mega-drive-genesis/' }
    ],
    simulationSteps: [
      {
        step: 0,
        shortTitle: 'Visão Geral',
        title: 'Mega Drive Base: 68000 + Z80 + Árbitro de Barramento',
        summary:
          'O Mega Drive combina duas CPUs: o Motorola 68000 (~7.67 MHz) para lógica/gráficos e o Zilog Z80 (~3.58 MHz) dedicado ao áudio, coordenados por um Árbitro de Barramento.',
        flowSteps: [
          { tag: 'Motorola 68000', text: 'Registradores 32-bit, ALU 16-bit, Bus de dados 16-bit e endereços 24-bit (16 MB).' },
          { tag: 'Zilog Z80', text: 'CPU de 8 bits (ALU 4-bit) com 8 KB de RAM que comanda os chips de som em paralelo.' },
          { tag: 'Bus Arbiter', text: 'Pausa temporariamente uma CPU quando a outra precisa acessar o mesmo barramento.' }
        ],
        insight:
          'Seg. Copetti: O 68000 e o Z80 não podem acessar a memória um do outro ao mesmo tempo; o Árbitro de Barramento evita colisões gerenciando a prioridade.',
        speech:
          '"Na arquitetura da Sega analisada por Rodrigo Copetti, o Mega Drive usa dois processadores: o Motorola 68000 a 7.67 MHz (ALU e barramento de 16 bits, endereçamento de 24 bits) e o Z80 a 3.58 MHz para o som. Um Árbitro de Barramento pausa uma CPU quando a outra precisa acessar a memória compartilhada."',
        activeNodes: ['mcd-maincpu', 'mcd-z80', 'mcd-arbiter', 'mcd-vdp'],
        activeBuses: [],
        packets: []
      },
      {
        step: 1,
        shortTitle: 'Sub-CPU 12.5 MHz',
        title: 'Mega-CD: Leitura 1x (150 KB/s) e 2º Motorola 68000',
        summary:
          'O módulo Mega-CD adiciona um segundo Motorola 68000 rodando a 12.5 MHz com 512 KB de PRG-RAM própria, descomprimindo dados do CD sem travar o Mega Drive.',
        flowSteps: [
          { tag: 'Laser 1x CLV', text: 'Lê setores do CD a 150 KB/s passando por um cache local de 16 KB.' },
          { tag: 'Sub-CPU 12.5 MHz', text: 'Segundo 68000 (63% mais rápido que o principal) dedicado ao Mega-CD.' },
          { tag: '512 KB PRG-RAM', text: 'Armazena o código da Sub-CPU, buffers de vídeo FMV e tabelas de jogo.' }
        ],
        insight:
          'Com duas CPUs 68000 reais rodando em paralelo, o Mega-CD podia descompactar vídeos e calcular efeitos enquanto o Mega Drive mantinha o jogo a 60 fps.',
        speech:
          '"Ao conectar o Mega-CD na lateral do console, ganhamos um segundo Motorola 68000 rodando a 12.5 MHz! O leitor de 1x carrega os dados a 150 KB/s direto nos 512 KB de Program RAM exclusivos dessa Sub-CPU."',
        activeNodes: ['mcd-drive', 'mcd-subcpu', 'mcd-prgram'],
        activeBuses: ['bus-mcd-cd', 'bus-mcd-prg'],
        packets: [
          { pathId: 'path-mcd-cd', color: '#f97316', label: '150 KB/s CD', badgeX: 845, badgeY: 165 },
          { pathId: 'path-mcd-prg', color: '#10b981', label: '512 KB PRG-RAM', badgeX: 700, badgeY: 222 }
        ]
      },
      {
        step: 2,
        shortTitle: 'ASIC & Word RAM',
        title: 'Rotação/Escala no ASIC e Bank Swap na Word RAM (256 KB)',
        summary:
          'O chip ASIC do Mega-CD aplica rotação e escala nos gráficos dentro da Word RAM (256 KB) e alterna a posse da memória (Bank Swap) para entregá-los ao Mega Drive.',
        flowSteps: [
          { tag: 'ASIC Gráfico', text: 'Faz rotação/escala por hardware (estilo Mode 7) e converte Bitmaps em Tiles 8×8.' },
          { tag: 'Word RAM 256 KB', text: 'Opera em modo 2M (bloco único de 256 KB) ou 1M/1M (2 bancos de 128 KB).' },
          { tag: 'Bank Swap', text: 'Enquanto a Sub-CPU desenha no Banco A, o Mega Drive lê o Banco B sem fila de espera!' }
        ],
        insight:
          'Os dois 68000 não têm ligação direta! Toda troca pesada de gráficos entre o Mega-CD e o Mega Drive acontece alternando os bancos da Word RAM.',
        speech:
          '"Como o VDP do Mega Drive não fazia rotação e escala por hardware, o Mega-CD trouxe um chip ASIC gráfico junto à Word RAM de 256 KB. O ASIC rotaciona a imagem, converte em tiles de 8x8 e faz o Bank Swap, entregando o banco pronto para o 68000 do Mega Drive!"',
        activeNodes: ['mcd-subcpu', 'mcd-asic', 'mcd-wordram', 'mcd-maincpu'],
        activeBuses: ['bus-mcd-sub-word', 'bus-mcd-main-word'],
        packets: [
          { pathId: 'path-mcd-sub-word', color: '#a855f7', label: 'ASIC Rotação/Tiles', badgeX: 485, badgeY: 225 },
          { pathId: 'path-mcd-main-word', color: '#ec4899', label: 'Bank Swap 16-bit', badgeX: 330, badgeY: 210 }
        ]
      },
      {
        step: 3,
        shortTitle: 'VDP & 3 Memórias',
        title: 'DMA do VDP (~13 MHz): VRAM (64 KB), CRAM (128 B) e VSRAM (80 B)',
        summary:
          'O 68000 principal aciona o DMA dedicado do VDP para puxar os tiles da Word RAM e preencher as três memórias internas de vídeo.',
        flowSteps: [
          { tag: '64 KB VRAM', text: 'Guarda os tiles 8×8 dos 4 planos (Plano A, Plano B, Window e até 80 Sprites).' },
          { tag: '128 B CRAM', text: 'Armazena 4 paletas de 16 cores (64 cores na tela de um total de 512 RGB 9-bit).' },
          { tag: '80 B VSRAM', text: 'Memória exclusiva de rolagem vertical (Vertical Scroll) por coluna de 2 tiles.' }
        ],
        insight:
          'Seg. Copetti: Com os modos Shadow & Highlight do VDP, o Mega Drive conseguia ampliar suas 64 cores para até 183 tonalidades na tela.',
        speech:
          '"Agora entra a arquitetura interna do VDP detalhada por Copetti: ele possui três memórias separadas — 64 KB de VRAM para os 4 planos de tiles e sprites, 128 Bytes de CRAM para 64 cores simultâneas, e 80 Bytes de VSRAM para scroll vertical. O DMA do VDP puxa tudo direto da Word RAM!"',
        activeNodes: ['mcd-wordram', 'mcd-maincpu', 'mcd-vdp'],
        activeBuses: ['bus-mcd-main-word', 'bus-mcd-vdp'],
        packets: [
          { pathId: 'path-mcd-vdp', color: '#38bdf8', label: 'DMA -> 64KB VRAM', badgeX: 165, badgeY: 315 }
        ]
      },
      {
        step: 4,
        shortTitle: 'Som FM + PCM',
        title: 'Áudio: Yamaha YM2612 (FM) + SN76489 + Ricoh 8ch PCM + CD-DA',
        summary:
          'O Z80 controla a síntese FM (YM2612) e o PSG no Mega Drive, somando-se aos 8 canais PCM (Ricoh RF5C164) e ao áudio CD-DA do Mega-CD.',
        flowSteps: [
          { tag: 'YM2612 + PSG', text: '6 canais FM (4 operadores/canal) + 4 canais PSG comandados pelo Z80 (8 KB RAM).' },
          { tag: 'Ricoh 8ch PCM', text: 'Chip RF5C164 no Mega-CD com 64 KB de Wave RAM para samples e instrumentos.' },
          { tag: 'Truque no CD-DA', text: 'Jogos como Sonic CD usavam o PCM para disfarçar o tempo de busca do laser 1x no loop!' }
        ],
        insight:
          'Copetti destaca que o leitor 1x demorava para reposicionar o laser ao repetir uma música CD-DA; os engenheiros usavam o chip PCM para tocar um trecho de preenchimento sem silêncio!',
        speech:
          '"No som, o Z80 comanda o clássico Yamaha YM2612 de 6 canais FM e o PSG SN76489, enquanto o Mega-CD adiciona 8 canais PCM (Ricoh) e áudio CD-DA. Como curiosidade citada por Copetti, Sonic CD usava o chip PCM para cobrir o atraso do laser 1x quando a música do CD voltava ao início!"',
        activeNodes: ['mcd-z80', 'mcd-arbiter', 'mcd-pcm', 'mcd-drive'],
        activeBuses: ['bus-mcd-z80', 'bus-mcd-pcm'],
        packets: [
          { pathId: 'path-mcd-z80', color: '#f59e0b', label: 'Z80 -> YM2612 FM', badgeX: 165, badgeY: 440 },
          { pathId: 'path-mcd-pcm', color: '#10b981', label: '8ch PCM + CD-DA', badgeX: 885, badgeY: 350 }
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
        metrics: [
          { label: 'Clock', value: '7.67 MHz (NTSC)' },
          { label: 'Interno', value: 'Regs 32-bit / ALU 16-bit' },
          { label: 'Barramento', value: 'Dados 16-bit / Addr 24-bit' },
          { label: 'Mapa Físico', value: '16 MB (ROM, RAM, VDP, Exp)' }
        ],
        detail:
          'Seg. Copetti: Processador híbrido 16/32 bits da Motorola. Embora seus registradores D0-D7 e A0-A7 sejam de 32 bits, sua ALU e seu barramento externo de dados operam em 16 bits, endereçando até 16 MB.'
      },
      {
        id: 'mcd-arbiter',
        title: '64 KB RAM + Árbitro de Bus',
        spec: 'Work RAM 68k + Bus Arbiter',
        subSpec: 'Coordena acesso 68000 ↔ Z80',
        category: 'ram',
        metrics: [
          { label: 'Work RAM', value: '64 KB DRAM (68000)' },
          { label: 'Controle', value: 'Árbitro de Barramento' },
          { label: 'Função', value: 'Evita colisão 68000 / Z80' },
          { label: 'Mecanismo', value: 'Bus Request / Bus Grant' }
        ],
        detail:
          'Seg. Copetti: Como o 68000 e o Z80 não podem ler/escrever no barramento um do outro simultaneamente, o Árbitro de Barramento pausa uma CPU enquanto a outra acessa a memória compartilhada.'
      },
      {
        id: 'mcd-vdp',
        title: 'VDP (Modo V + DMA)',
        spec: '64KB VRAM + 128B CRAM + 80B VSRAM',
        subSpec: 'Tiles 8×8 • 4 Planos • 64 Cores',
        category: 'gpu',
        metrics: [
          { label: 'VRAM Principal', value: '64 KB (Tiles, Planos A/B/W, Sprites)' },
          { label: 'CRAM (Cores)', value: '128 Bytes (64 de 512 cores)' },
          { label: 'VSRAM (Scroll)', value: '80 Bytes (Scroll Vertical)' },
          { label: 'Unidade DMA', value: 'Cópia 68k→VDP, Fill e Copy' }
        ],
        detail:
          'Seg. Copetti: Opera no Modo V (~13.4 MHz), renderizando até 320×224 pixels com 2 planos de background com paralaxe, 1 plano Window e até 80 sprites (20 por linha), além dos modos Shadow/Highlight.'
      },
      {
        id: 'mcd-z80',
        title: 'Zilog Z80 + 8 KB RAM',
        spec: '~3.58 MHz • ALU 4-bit',
        subSpec: 'Comanda YM2612 (FM) + SN76489',
        category: 'audio',
        metrics: [
          { label: 'Clock', value: '3.58 MHz' },
          { label: 'Arquitetura', value: 'Regs 8-bit / ALU 4-bit' },
          { label: 'Sound RAM', value: '8 KB Dedicados' },
          { label: 'Chips de Som', value: 'YM2612 (6ch FM) + PSG (4ch)' }
        ],
        detail:
          'Seg. Copetti: Roda o driver de som de forma autônoma a partir de seus 8 KB de RAM, disparando notas no sintetizador FM Yamaha YM2612 e no PSG sem ocupar o Motorola 68000 principal.'
      },
      {
        id: 'mcd-asic',
        title: 'ASIC Gráfico (Mega-CD)',
        spec: 'Rotação e Escala Afim',
        subSpec: 'Converte Bitmap → Tiles 8×8 VDP',
        category: 'gpu',
        metrics: [
          { label: 'Chip', value: 'Sega Custom ASIC (315-5548)' },
          { label: 'Efeitos', value: 'Rotação, Escala e Perspectiva' },
          { label: 'Conversão', value: 'Bitmap → Tiles 8×8 (4-bit)' },
          { label: 'Memória Alvo', value: 'Opera sobre a Word RAM' }
        ],
        detail:
          'Supre a ausência de rotação/escala no VDP original do Mega Drive. Calcula transformações na Word RAM e já entrega o resultado formatado em tiles de 8×8 prontos para o DMA do VDP.'
      },
      {
        id: 'mcd-wordram',
        title: 'Word RAM Compartilhada',
        spec: '256 KB Dual-Bank',
        subSpec: 'Modo 2M (256KB) ou 1M/1M (2× 128KB)',
        category: 'ram',
        metrics: [
          { label: 'Capacidade', value: '256 KB DRAM' },
          { label: 'Modo 2M', value: '1 Bloco único de 256 KB' },
          { label: 'Modo 1M / 1M', value: '2 Bancos de 128 KB (Swap)' },
          { label: 'Função', value: 'Ponte Sub-CPU ↔ Main-CPU' }
        ],
        detail:
          'Única via de transferência gráfica pesada entre o Mega-CD e o Mega Drive. No modo 1M/1M, um processador renderiza em um banco de 128 KB enquanto o outro lê o segundo banco sem contenção.'
      },
      {
        id: 'mcd-subcpu',
        title: 'Sub-CPU: 2º Motorola 68000',
        spec: '12.5 MHz CISC (Mega-CD)',
        subSpec: '63% mais rápido que a CPU Base',
        category: 'cpu',
        metrics: [
          { label: 'Clock', value: '12.5 MHz' },
          { label: 'Ganho de Clock', value: '+63% sobre o Mega Drive' },
          { label: 'RAM Exclusiva', value: '512 KB Program RAM' },
          { label: 'Funções', value: 'File System CD, FMV e ASIC' }
        ],
        detail:
          'Segundo processador Motorola 68000 completo localizado dentro do Mega-CD. Executa a lógica pesada, descompressão de vídeo e cálculos matemáticos em paralelo ao console base.'
      },
      {
        id: 'mcd-prgram',
        title: 'Program RAM (PRG-RAM)',
        spec: '512 KB DRAM Exclusiva',
        subSpec: 'Memória de Execução da Sub-CPU',
        category: 'ram',
        metrics: [
          { label: 'Capacidade', value: '512 KB DRAM (4 Mbit)' },
          { label: 'Proprietário', value: 'Sub-CPU 68000 (12.5 MHz)' },
          { label: 'Proteção', value: 'Write-Protection por blocos' },
          { label: 'Uso', value: 'Código do jogo, FMV e Áudio' }
        ],
        detail:
          'Memória principal do módulo Mega-CD. É8 vezes maior que a Work RAM de 64 KB do Mega Drive original, permitindo armazenar fases inteiras carregadas do CD.'
      },
      {
        id: 'mcd-drive',
        title: 'Leitor CD-ROM (1x CLV)',
        spec: '150 KB/s + 16 KB Cache',
        subSpec: 'ISO 9660 + Áudio CD-DA',
        category: 'cd',
        metrics: [
          { label: 'Velocidade', value: '1x CLV (150 KB/s)' },
          { label: 'Buffer Local', value: '16 KB Cache' },
          { label: 'Capacidade', value: '500 MB – 650 MB' },
          { label: 'Áudio Óptico', value: 'Red Book CD-DA Estéreo' }
        ],
        detail:
          'Seg. Copetti: Leitor óptico de 1x controlado pela Sub-CPU. Em loops de música CD-DA, jogos como Sonic CD usavam o chip PCM para cobrir o atraso físico do reposicionamento do laser.'
      },
      {
        id: 'mcd-pcm',
        title: 'Áudio: Ricoh RF5C164 + FM',
        spec: '8ch PCM (64 KB) + YM2612',
        subSpec: 'Total: 18 Canais Digitais/FM + CD-DA',
        category: 'audio',
        metrics: [
          { label: 'Chip Mega-CD', value: 'Ricoh RF5C164 (8ch PCM)' },
          { label: 'Wave RAM', value: '64 KB Dedicados ao PCM' },
          { label: 'Chips Mega Drive', value: 'YM2612 (6 FM) + SN76489 (4 PSG)' },
          { label: 'Streaming', value: '2 Canais CD-DA Estéreo' }
        ],
        detail:
          'Une a síntese FM do Mega Drive (YM2612) aos 8 canais de samples PCM do Mega-CD (até 32 kHz) e à trilha sonora em qualidade de CD.'
      }
    ]
  },

  ps1: {
    id: 'ps1',
    shortName: 'Sony PlayStation',
    name: 'Sony PlayStation — SCPH-1000 (1994)',
    subtitle: 'SoC CXD8530BQ (CW33300 / R3000A + GTE + MDEC) • Dual Bus (Main 32b / Sub 16b) • 2 MB EDO',
    year: '1994',
    sources: [
      { label: 'Copetti — PlayStation', url: 'https://www.copetti.org/writings/consoles/playstation' },
      { label: 'RetroReversing — PS1 Architecture', url: 'https://www.retroreversing.com/ps1' }
    ],
    simulationSteps: [
      {
        step: 0,
        shortTitle: 'Visão Geral',
        title: 'SoC Sony CXD8530BQ: CPU + GTE (3D) + MDEC + Scratchpad no Mesmo Chip',
        summary:
          'A Sony unificou na mesma pastilha de silício (fabricada pela LSI Logic) o núcleo RISC de 32 bits (CW33300 / R3000A @ 33.87 MHz), o motor 3D (GTE), o descompressor de vídeo (MDEC) e 1 KB de Scratchpad SRAM.',
        flowSteps: [
          { tag: 'Núcleo CW33300', text: 'MIPS R3000A (32-bit RISC @ 33.87 MHz) + CP0 (controle de cache e interrupções).' },
          { tag: 'GTE (CP2) & MDEC', text: 'GTE calcula matrizes 3D em ponto fixo (66 MIPS); MDEC descomprime vídeos FMV.' },
          { tag: '1 KB Scratchpad', text: 'Não há D-Cache comum: os 1 KB internos funcionam como uma SRAM ultrarrápida ($1F800000).' }
        ],
        insight:
          'Integrar CPU, GTE e MDEC no mesmo chip eliminou gargalos externos: a CPU projeta vértices 3D no GTE usando instruções diretas de coprocessador sem sair do silício!',
        speech:
          '"Chegamos ao PlayStation de 1994, baseado em Rodrigo Copetti e RetroReversing. O segredo é o SoC Sony CXD8530BQ (núcleo LSI CW33300 / MIPS R3000A a 33.87 MHz). No mesmo chip vivem a CPU, o GTE para cálculos 3D, o MDEC para vídeos e 1 KB de memória Scratchpad ultrarrápida no lugar de um cache de dados comum!"',
        activeNodes: ['ps1-cpu', 'ps1-ram', 'ps1-dma', 'ps1-biu'],
        activeBuses: [],
        packets: []
      },
      {
        step: 1,
        shortTitle: 'CD 2x & Sub Bus',
        title: 'Leitura CD-ROM 2x (300 KB/s) e a Ponte BIU (Sub Bus 16/8-bit)',
        summary:
          'O PlayStation divide seu barramento em dois: Main Bus (32-bit) e Sub Bus (16/8-bit), conectados pela BIU. O leitor de CD 2x valida o disco (trava SCEx) e carrega 32 KB de buffer no Sub Bus.',
        flowSteps: [
          { tag: 'Trava Wobble SCEx', text: 'O MCU do CD verifica a oscilação física gravada na trilha inicial do disco preto.' },
          { tag: 'Leitura 2x (300 KB/s)', text: 'Dobra a velocidade da geração anterior e guarda setores em 32 KB de SRAM.' },
          { tag: 'Ponte BIU', text: 'A Bus Interface Unit isola os periféricos lentos (CD, SPU, BIOS) no Sub Bus de 16/8 bits.' }
        ],
        insight:
          'Separar o Sub Bus através da BIU impedia que periféricos mais lentos (como o leitor de CD e os controles) reduzissem a velocidade do Main Bus de 32 bits.',
        speech:
          '"Como explica Copetti, o PS1 divide seus barramentos em Main Bus (32 bits) e Sub Bus (16/8 bits) unidos pela ponte BIU. O leitor de CD 2x (300 KB/s) fica no Sub Bus, valida a trava física anti-pirataria SCEx e preenche seu buffer próprio de 32 KB."',
        activeNodes: ['ps1-cd', 'ps1-biu'],
        activeBuses: ['bus-ps1-cd-sub'],
        packets: [
          { pathId: 'path-ps1-cd-sub', color: '#f97316', label: '300 KB/s (2x CD)', badgeX: 605, badgeY: 400 }
        ]
      },
      {
        step: 2,
        shortTitle: 'DMA Assume o Bus',
        title: 'DMA Canal 3 Assume o Main Bus (132 MB/s → 2 MB EDO DRAM)',
        summary:
          'Quando o controlador de DMA transfere dados do CD para os 2 MB de EDO DRAM, ele assume posse exclusiva do Main Bus de 32 bits. A CPU só não trava se rodar na Scratchpad de 1 KB!',
        flowSteps: [
          { tag: 'DMA Toma o Bus', text: 'O DMA bloqueia o acesso da CPU ao Main Bus para disparar rajadas a até 132 MB/s.' },
          { tag: '2 MB EDO DRAM', text: 'Memória Extended Data Out (4× 512 KB) recebe código, texturas e geometria 3D.' },
          { tag: 'Scratchpad Ativa', text: 'Enquanto o DMA ocupa a RAM, a CPU continua trabalhando no I-Cache (4 KB) + Scratchpad (1 KB)!' }
        ],
        insight:
          'Seg. Copetti ("Taking over the CPU"): Essa é a razão da Scratchpad de 1 KB ser tão famosa no PS1 — os programadores colocavam a pilha e variáveis críticas nela para a CPU processar enquanto o DMA usava o barramento!',
        speech:
          '"Aqui acontece o ponto destacado por Copetti em Taking over the CPU: quando o DMA Canal 3 copia os dados do CD para os 2 MB de memória EDO DRAM a 132 MB/s, o DMA assume o controle exclusivo do Main Bus! A CPU fica impedida de acessar a RAM principal, mas pode continuar operando dentro dos 1 KB da Scratchpad interna!"',
        activeNodes: ['ps1-cd', 'ps1-biu', 'ps1-dma', 'ps1-ram', 'ps1-cpu'],
        activeBuses: ['bus-ps1-cd-sub', 'bus-ps1-biu-dma', 'bus-ps1-dma-ram'],
        packets: [
          { pathId: 'path-ps1-biu-dma', color: '#f59e0b', label: 'DMA Ch3 Req', badgeX: 405, badgeY: 350 },
          { pathId: 'path-ps1-dma-ram', color: '#10b981', label: 'Burst 132 MB/s -> EDO', badgeX: 500, badgeY: 225 }
        ]
      },
      {
        step: 3,
        shortTitle: 'Vídeo FMV (MDEC)',
        title: 'Descompressão de Vídeo FMV pelo MDEC (9.000 Macroblocos/s)',
        summary:
          'Para tocar aberturas e cutscenes em vídeo (STR), o DMA Canal 0 envia frames comprimidos da EDO RAM para o MDEC dentro da CPU, que devolve imagens em 24 bits via DMA Canal 1.',
        flowSteps: [
          { tag: 'DMA Ch0 (In)', text: 'Busca streams de vídeo comprimidos (DCT/JPEG) nos 2 MB de EDO DRAM.' },
          { tag: 'MDEC (9.000 MB/s)', text: 'Descomprime blocos 8×8 pixels em cores reais de 24-bit (16.7 milhões de cores).' },
          { tag: 'DMA Ch1 (Out)', text: 'Devolve o quadro pronto a 30 fps para ser exibido pela GPU sem gastar a CPU!' }
        ],
        insight:
          'Graças ao MDEC integrado no silício da CPU, o PlayStation exibia vídeos FMV em tela cheia a 30 fps com qualidade muito superior aos vídeos granulados dos consoles de 16 bits.',
        speech:
          '"Quando o jogo roda uma cutscene em vídeo FMV, os canais 0 e 1 do DMA enviam os quadros comprimidos da RAM para o MDEC dentro do chip da CPU. Ele descomprime 9.000 macroblocos por segundo em cores de 24 bits a 30 quadros por segundo sem ocupar o processador MIPS!"',
        activeNodes: ['ps1-ram', 'ps1-dma', 'ps1-cpu'],
        activeBuses: ['bus-ps1-dma-ram', 'bus-ps1-dma-cpu'],
        packets: [
          { pathId: 'path-ps1-dma-cpu', color: '#ec4899', label: 'DMA Ch0/1: MDEC FMV', badgeX: 205, badgeY: 255 }
        ]
      },
      {
        step: 4,
        shortTitle: 'Pipeline 3D & SPU',
        title: 'Geometria 3D (GTE + Ordering Table) → GPU (1 MB VRAM) e SPU (24ch)',
        summary:
          'O GTE projeta os polígonos 3D em ponto fixo e monta a Ordering Table na RAM (já que a GPU não tem Z-Buffer). O DMA 2 envia tudo para a GPU (1 MB VRAM) e o DMA 4 abastece a SPU.',
        flowSteps: [
          { tag: 'GTE + Ordering Table', text: 'Calcula vértices 3D em ponto fixo e ordena polígonos por profundidade Z na RAM.' },
          { tag: 'DMA Ch2 → GPU', text: 'Envia a lista de polígonos e texturas CLUT para a grade 1024×512 (1 MB VRAM).' },
          { tag: 'DMA Ch4 → SPU', text: 'Transfere samples de áudio para os 512 KB da SPU (24 canais ADPCM + Reverb).' }
        ],
        insight:
          'Seg. Copetti: Como a GPU do PS1 não tem Z-Buffer e usa coordenadas inteiras com projeção afim de texturas, surgiam as famosas texturas "dançantes" (affine warping) nos jogos 3D!',
        speech:
          '"Por fim, veja como o 3D funciona: o GTE calcula a perspectiva em ponto fixo e organiza os polígonos em uma Ordering Table na RAM, pois a GPU não tem Z-Buffer. Depois, o DMA Canal 2 envia tudo para o 1 MB de VRAM da GPU (uma tela de 1024x512 onde ficam o Framebuffer e as texturas CLUT), enquanto o DMA Canal 4 abastece as 24 vozes da SPU!"',
        activeNodes: ['ps1-cpu', 'ps1-ram', 'ps1-dma', 'ps1-gpu', 'ps1-spu'],
        activeBuses: ['bus-ps1-dma-cpu', 'bus-ps1-dma-ram', 'bus-ps1-dma-gpu', 'bus-ps1-dma-spu'],
        packets: [
          { pathId: 'path-ps1-dma-gpu', color: '#38bdf8', label: 'DMA Ch2: 3D + Texturas', badgeX: 800, badgeY: 235 },
          { pathId: 'path-ps1-dma-spu', color: '#a855f7', label: 'DMA Ch4: SPU 512KB', badgeX: 305, badgeY: 400 }
        ]
      }
    ],
    components: [
      {
        id: 'ps1-cpu',
        title: 'SoC Sony CXD8530BQ',
        spec: '33.87 MHz • CW33300 (R3000A)',
        subSpec: 'CP0 + GTE (CP2) + MDEC + 1KB SRAM',
        category: 'cpu',
        metrics: [
          { label: 'Núcleo RISC', value: 'LSI CW33300 (MIPS R3000A)' },
          { label: 'Coprocessador 3D', value: 'CP2: GTE (66 MIPS Ponto Fixo)' },
          { label: 'Vídeo Hardware', value: 'MDEC (9.000 Macroblocos/s)' },
          { label: 'Memória Interna', value: '4 KB I-Cache + 1 KB Scratchpad' }
        ],
        detail:
          'Seg. Copetti & RetroReversing: Chip customizado pela LSI Logic que integra CPU RISC 32-bit (MIPS I ISA), CP0, motor geométrico GTE (CP2), descompressor MDEC, 4 KB de I-Cache e 1 KB de Scratchpad SRAM mapeada em $1F800000 (no lugar de um D-Cache comum).'
      },
      {
        id: 'ps1-dma',
        title: 'Main Bus & DMA (7 Canais)',
        spec: '32-bit @ 132 MB/s',
        subSpec: 'Assume posse exclusiva do Main Bus',
        category: 'storage',
        metrics: [
          { label: 'Largura / Taxa', value: '32 bits @ 132 MB/s' },
          { label: 'Canais DMA', value: '7 Canais (MDEC, GPU, CD, SPU, OTC)' },
          { label: 'Arbitragem', value: 'Assume o Main Bus (Pausa CPU na RAM)' },
          { label: 'Escape da CPU', value: 'Executar via 1 KB Scratchpad SRAM' }
        ],
        detail:
          'Seg. Copetti ("Taking over the CPU"): Quando um canal de DMA é acionado, o controlador assume o Main Bus de 32 bits por completo. Durante a transferência, a CPU não consegue acessar a EDO DRAM, podendo operar apenas dentro do I-Cache e da Scratchpad de 1 KB.'
      },
      {
        id: 'ps1-ram',
        title: 'Main RAM: 2 MB EDO DRAM',
        spec: '4× 512 KB Chips EDO',
        subSpec: 'Código, Geometria e Ordering Tables',
        category: 'ram',
        metrics: [
          { label: 'Capacidade', value: '2 MB EDO DRAM' },
          { label: 'Tecnologia', value: 'Extended Data Out (Baixa Latência)' },
          { label: 'Barramento', value: 'Conectada ao Main Bus (32-bit)' },
          { label: 'Uso Chave', value: 'Kernel, Heap, Polígonos e Ordering Tables' }
        ],
        detail:
          'Seg. Copetti: A Sony adotou chips EDO DRAM que reduzem a latência entre leituras consecutivas em relação à FPM DRAM comum. Guarda o código do jogo e as Ordering Tables (listas encadeadas que ordenam os polígonos por profundidade Z).'
      },
      {
        id: 'ps1-biu',
        title: 'Bus Interface Unit (BIU)',
        spec: 'Ponte Main 32b ↔ Sub Bus 16/8b',
        subSpec: 'Conecta CD-ROM, SPU, BIOS (512 KB) e I/O',
        category: 'storage',
        metrics: [
          { label: 'Lado Rápido', value: 'Main Bus (32-bit)' },
          { label: 'Lado Periférico', value: 'Sub Bus (16-bit / 8-bit)' },
          { label: 'BIOS ROM', value: '512 KB ROM no Sub Bus' },
          { label: 'Isolamento', value: 'Evita lentidão no Main Bus' }
        ],
        detail:
          'Seg. Copetti: Divide a placa-mãe em dois barramentos. A BIU faz a ponte entre o Main Bus de 32 bits e o Sub Bus de 16/8 bits onde residem a SPU, o controlador de CD-ROM, a BIOS de 512 KB e as portas de controle/Memory Card.'
      },
      {
        id: 'ps1-gpu',
        title: 'Sony GPU + 1 MB VRAM',
        spec: 'Grade 1024×512 (16 bpp)',
        subSpec: 'Rasterizador 2D/3D • CLUT • Sem Z-Buffer',
        category: 'gpu',
        metrics: [
          { label: 'VRAM', value: '1 MB (Matriz 1024×512 pixels @ 16-bit)' },
          { label: 'Armazenamento', value: 'Framebuffer + Texture Pages + CLUTs' },
          { label: 'Sombreado', value: 'Flat e Gouraud Shading + Texturas' },
          { label: 'Peculiaridades', value: 'Sem Z-Buffer • Projeção Afim' }
        ],
        detail:
          'Seg. Copetti: Enxerga seu 1 MB de VRAM como uma grande tela 2D de 1024×512 pixels onde coexistem a imagem visível na TV, as páginas de texturas comprimidas (4/8/15-bit) e as paletas CLUT. Não possui Z-Buffer nem correção de perspectiva nas texturas.'
      },
      {
        id: 'ps1-spu',
        title: 'SPU (24 Canais ADPCM)',
        spec: '16-bit @ 44.1 kHz + 512 KB RAM',
        subSpec: 'ADSR • Pitch Mod • Reverb Digital',
        category: 'audio',
        metrics: [
          { label: 'Polifonia', value: '24 Canais ADPCM Simultâneos' },
          { label: 'Qualidade', value: '16-bit @ 44.1 kHz (Qualidade CD)' },
          { label: 'Sound RAM', value: '512 KB Dedicados' },
          { label: 'DSP de Efeitos', value: 'Envelope ADSR + Reverb por Hardware' }
        ],
        detail:
          'Unidade de som dedicada abastecida via DMA Canal 4. Toca 24 vozes ADPCM de seus 512 KB próprios e mixa diretamente o streaming de áudio CD-DA e CD-ROM XA vindo do leitor óptico.'
      },
      {
        id: 'ps1-cd',
        title: 'Subsistema CD-ROM (2x)',
        spec: '300 KB/s + 32 KB Buffer SRAM',
        subSpec: 'MCU 68HC05 • XA Mode 2 • Trava SCEx',
        category: 'cd',
        metrics: [
          { label: 'Velocidade', value: '2x CLV (300 KB/s)' },
          { label: 'Microcontrolador', value: 'Motorola 68HC05 + DSP + 32 KB SRAM' },
          { label: 'Formatos', value: 'Mode 1, CD-DA e CD-ROM XA Mode 2' },
          { label: 'Anti-Pirataria', value: 'Trava Wobble SCEx no Lead-In' }
        ],
        detail:
          'Seg. Copetti & RetroReversing: Possui microcontrolador próprio que gerencia a leitura óptica a 300 KB/s, decodifica setores intercalados de áudio/vídeo (CD-ROM XA) e valida a oscilação física SCEx gravada nos discos originais.'
      }
    ]
  }
};

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
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(false);
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

  // Renderizador de Linha de Barramento com Fluxo Animado
  const renderBusLine = (busId, x1, y1, x2, y2, baseColor, width = 4.5) => {
    const active = isBusActive(busId);
    return (
      <g key={busId}>
        {/* Sombra brilhante quando ativo */}
        {active && (
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#facc15"
            strokeWidth={width + 6}
            strokeLinecap="round"
            opacity="0.22"
          />
        )}
        {/* Trilha Base */}
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={active ? baseColor : lightMode ? '#cbd5e1' : '#334155'}
          strokeWidth={width}
          strokeLinecap="round"
          opacity={active ? 0.95 : 0.45}
        />
        {/* Corrente de Dados Animada */}
        {active && (
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#fef08a"
            strokeWidth={Math.max(2.5, width - 1.5)}
            strokeDasharray="8 6"
            strokeLinecap="round"
            className="animate-bus-flow"
          />
        )}
      </g>
    );
  };

  // Renderizador de Bloco de Hardware no SVG (Mais limpo, legível e com foco inteligente)
  const renderHardwareNode = (id, x, y, w, h, title, spec, subSpec, category) => {
    const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.cpu;
    const active = isNodeActive(id);
    const isSelected = selectedNodeId === id;
    const isHovered = hoveredNodeId === id;

    // Foco inteligente: nos passos 1 a 4, blocos inativos ficam suavemente esmaecidos para destacar a animação
    const shouldDim = simStep > 0 && !active && !isSelected && !isHovered;

    const fill = lightMode ? style.lightBg : style.bg;
    const stroke = isSelected
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
        {/* Halo pulsante quando ativo na simulação ou selecionado */}
        {(active || isSelected) && (
          <rect
            x={x - 4}
            y={y - 4}
            width={w + 8}
            height={h + 8}
            rx={14}
            fill="none"
            stroke={isSelected ? '#38bdf8' : '#facc15'}
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
          strokeWidth={active || isSelected ? '3' : '1.8'}
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
            y={y + 62}
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

  // Renderizador de Pacotes Animados + Etiquetas Flutuantes no Diagrama
  const renderAnimatedPackets = () => {
    const packets = currentSimData?.packets || [];
    return packets.map((pkt, idx) => (
      <g key={`${pkt.pathId}-${idx}`}>
        {/* Pacote Principal com Brilho */}
        <circle r="7.5" fill={pkt.color} filter="url(#glowEffect)">
          <animateMotion dur="1.6s" repeatCount="indefinite">
            <mpath href={`#${pkt.pathId}`} />
          </animateMotion>
        </circle>
        <circle r="3.5" fill="#ffffff">
          <animateMotion dur="1.6s" repeatCount="indefinite">
            <mpath href={`#${pkt.pathId}`} />
          </animateMotion>
        </circle>

        {/* Segundo Pacote Defasado para Sensação Contínua de Fluxo */}
        <circle r="6" fill={pkt.color} opacity="0.85" filter="url(#glowEffect)">
          <animateMotion dur="1.6s" repeatCount="indefinite" begin="0.8s">
            <mpath href={`#${pkt.pathId}`} />
          </animateMotion>
        </circle>

        {/* Etiqueta Flutuante no Próprio Diagrama indicando o dado transmitido */}
        {pkt.badgeX && pkt.badgeY && (
          <g transform={`translate(${pkt.badgeX}, ${pkt.badgeY})`}>
            <rect
              x="-72"
              y="-13"
              width="144"
              height="24"
              rx="12"
              fill={lightMode ? '#0f172a' : '#090d16'}
              stroke={pkt.color}
              strokeWidth="2"
              filter="url(#dropShadow)"
            />
            <circle cx="-58" cy="-1" r="4" fill={pkt.color} />
            <text
              x="5"
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

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${lightMode ? 'bg-slate-100 text-slate-900' : 'bg-[#060911] text-slate-100'
        } font-sans pb-8`}
    >
      {/* =====================================================================
          BARRA SUPERIOR COMPACTA E LIMPA (TUDO EM UMA ÚNICA LINHA)
         ===================================================================== */}
      <header
        className={`border-b ${lightMode ? 'bg-white/95 border-slate-200 shadow-xs' : 'bg-[#0b101d]/95 border-slate-800/80'
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

            {/* Seletor de Consoles Integrado */}
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
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${active
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
                  onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${showSpeakerNotes
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : lightMode
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                        : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  title="Mostrar/Ocultar Roteiro de Apresentação (Tecla N)"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Roteiro</span>
                </button>

                <button
                  onClick={() => setPresentationMode(!presentationMode)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${presentationMode
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
              className={`p-1.5 rounded-lg border transition ${lightMode
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
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${lightMode
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
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${lightMode
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
          ÁREA PRINCIPAL: DIAGRAMA EM DESTAQUE + PAINEL TÉCNICO ESTRUTURADO
         ===================================================================== */}
      <main className="max-w-[1440px] mx-auto px-4 mt-3">
        {activeTab !== 'compare' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* COLUNA ESQUERDA: LINHA DO TEMPO DE PASSOS + DIAGRAMA ANIMADO */}
            <div className={presentationMode ? 'lg:col-span-12 space-y-3' : 'lg:col-span-8 space-y-3'}>
              {/* BARRA UNIFICADA DE PASSOS DA SIMULAÇÃO */}
              <div
                className={`p-2.5 rounded-2xl border flex flex-wrap items-center justify-between gap-2 ${lightMode ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0c1221] border-slate-800'
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
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${isCurrent
                            ? 'bg-amber-400 text-slate-950 shadow-sm'
                            : lightMode
                              ? 'text-slate-600 hover:bg-slate-100'
                              : 'text-slate-400 hover:bg-slate-800/70'
                          }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-black ${isCurrent
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
                    className={`p-1.5 rounded-lg border transition ${lightMode
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                        : 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-200'
                      }`}
                    title="Passo Anterior (Seta ←)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${isAutoPlaying
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
                    className={`p-1.5 rounded-lg border transition ${lightMode
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
                  CANVAS SVG INTERATIVO COM ANIMAÇÃO DE BARRAMENTOS E PACOTES
                 ================================================================= */}
              <div
                className={`rounded-2xl border overflow-hidden shadow-xl relative ${lightMode ? 'bg-white border-slate-300' : 'bg-[#080c15] border-slate-800/90'
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
                        <path id="path-pce-hucard" d="M 425 135 L 365 135 L 365 165 L 290 165" />
                        <path id="path-pce-scsi" d="M 735 235 L 665 235" />
                        <path id="path-pce-exp" d="M 425 235 L 365 235 L 365 165 L 290 165" />
                        <path id="path-pce-vdc" d="M 172 205 L 172 410" />
                        <path id="path-pce-vce" d="M 172 465 L 172 495" />
                        <path id="path-pce-audio" d="M 845 275 L 845 360 L 665 360" />
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

                      {/* Barramento Central de Expansão (21-bit MMU / 8-bit Data) */}
                      {renderBusLine('bus-pce-exp', 365, 95, 365, 515, '#38bdf8', 7)}
                      <text
                        x="353"
                        y="310"
                        transform="rotate(-90 353 310)"
                        textAnchor="middle"
                        fill={lightMode ? '#475569' : '#94a3b8'}
                        fontSize="10"
                        fontWeight="800"
                      >
                        BARRAMENTO 21-BIT MMU / 8-BIT DADOS
                      </text>

                      {/* Conexões */}
                      {renderBusLine('bus-pce-hucard', 365, 135, 425, 135, '#f59e0b', 4.5)}
                      {renderBusLine('bus-pce-exp', 290, 165, 365, 165, '#38bdf8', 4.5)}
                      {renderBusLine('bus-pce-exp', 365, 235, 425, 235, '#10b981', 4.5)}
                      {renderBusLine('bus-pce-scsi', 665, 235, 735, 235, '#f97316', 5)}
                      {renderBusLine('bus-pce-vdc', 172, 205, 172, 410, '#38bdf8', 4.5)}
                      {renderBusLine('bus-pce-vce', 172, 465, 172, 495, '#a855f7', 4.5)}

                      <path
                        d="M 845 275 L 845 360 L 665 360"
                        fill="none"
                        stroke={isBusActive('bus-pce-audio') ? '#10b981' : lightMode ? '#cbd5e1' : '#334155'}
                        strokeWidth="4"
                        strokeDasharray="7 5"
                        className={isBusActive('bus-pce-audio') ? 'animate-bus-flow' : ''}
                      />

                      {/* Blocos PC Engine Base */}
                      {renderHardwareNode(
                        'pce-cpu',
                        50,
                        115,
                        240,
                        82,
                        'CPU HuC6280 + MMU',
                        '8-bit 65C02 @ 7.16 MHz',
                        '8× Regs MPR (21-bit) + 6ch PSG',
                        'cpu'
                      )}
                      {renderHardwareNode(
                        'pce-wram',
                        50,
                        220,
                        240,
                        68,
                        'Work RAM Base',
                        '8 KB SRAM Interna',
                        '1 Página MPR no Console',
                        'ram'
                      )}
                      {renderHardwareNode(
                        'pce-vdc',
                        50,
                        310,
                        240,
                        72,
                        'VDC: HuC6270 (Vídeo)',
                        'Bus VRAM 16-bit + SATB DMA',
                        'Tiles 8×8 e 64 Sprites 16×16',
                        'gpu'
                      )}
                      {renderHardwareNode(
                        'pce-vram',
                        50,
                        396,
                        240,
                        66,
                        'VRAM Dedicada',
                        '64 KB (Words de 16-bit)',
                        'Gráficos Planar 4-bit (CH0-CH3)',
                        'ram'
                      )}
                      {renderHardwareNode(
                        'pce-vce',
                        50,
                        475,
                        240,
                        62,
                        'VCE: HuC6260 (Cores)',
                        '32 Paletas × 16 Cores (RGB 9b)',
                        'Até 482 cores na tela -> Saída TV',
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
                        'CD-ROM² Work RAM',
                        '64 KB DRAM + 2 KB BRAM',
                        'Buffer de código/dados + Saves',
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
                        'Mixa Vozes + CD-DA + PSG Estéreo',
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
                        '150 KB/s • Barramento SCSI',
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
                        <path id="path-mcd-cd" d="M 885 215 L 885 150 L 795 150" />
                        <path id="path-mcd-prg" d="M 700 185 L 700 250" />
                        <path id="path-mcd-sub-word" d="M 605 150 L 462 150 L 462 250" />
                        <path id="path-mcd-main-word" d="M 375 285 L 295 150" />
                        <path id="path-mcd-vdp" d="M 165 190 L 165 340" />
                        <path id="path-mcd-z80" d="M 165 305 L 165 455" />
                        <path id="path-mcd-pcm" d="M 885 305 L 885 385" />
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
                        PONTE WORD RAM &amp; ASIC
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

                      {/* Barramentos */}
                      {renderBusLine('bus-mcd-main-word', 295, 150, 375, 285, '#ec4899', 4.5)}
                      {renderBusLine('bus-mcd-sub-word', 550, 150, 605, 150, '#a855f7', 4.5)}
                      {renderBusLine('bus-mcd-sub-word', 462, 195, 462, 250, '#a855f7', 4.5)}
                      {renderBusLine('bus-mcd-vdp', 165, 190, 165, 340, '#38bdf8', 4.5)}
                      {renderBusLine('bus-mcd-z80', 165, 305, 165, 455, '#f59e0b', 4)}
                      {renderBusLine('bus-mcd-prg', 700, 185, 700, 250, '#10b981', 4.5)}
                      {renderBusLine('bus-mcd-cd', 795, 150, 885, 215, '#f97316', 4.5)}
                      {renderBusLine('bus-mcd-pcm', 885, 305, 885, 385, '#10b981', 4)}

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
                        '64 KB RAM + Árbitro de Bus',
                        'Work RAM 68k + Bus Arbiter',
                        'Pausa 68k ou Z80 p/ evitar colisão',
                        'ram'
                      )}
                      {renderHardwareNode(
                        'mcd-vdp',
                        40,
                        325,
                        265,
                        86,
                        'VDP (Modo V + DMA)',
                        '64KB VRAM + 128B CRAM + 80B VSRAM',
                        'Tiles 8×8 • 4 Planos • 64 Cores (512)',
                        'gpu'
                      )}
                      {renderHardwareNode(
                        'mcd-z80',
                        40,
                        440,
                        265,
                        82,
                        'Zilog Z80 + 8 KB RAM',
                        '~3.58 MHz • ALU 4-bit',
                        'Comanda YM2612 (6ch FM) + PSG',
                        'audio'
                      )}

                      {/* Blocos Ponte Word RAM & ASIC */}
                      {renderHardwareNode(
                        'mcd-asic',
                        372,
                        110,
                        178,
                        84,
                        'ASIC Gráfico',
                        'Rotação e Escala Afim',
                        'Bitmap -> Tiles 8×8 VDP',
                        'gpu'
                      )}
                      {renderHardwareNode(
                        'mcd-wordram',
                        372,
                        245,
                        178,
                        95,
                        'Word RAM (256 KB)',
                        'Dual-Bank 2M ou 1M/1M',
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
                        '12.5 MHz CISC (Mega-CD)',
                        'Controla CD, FMV e ASIC',
                        'cpu'
                      )}
                      {renderHardwareNode(
                        'mcd-prgram',
                        605,
                        245,
                        190,
                        86,
                        'Program RAM (512 KB)',
                        '512 KB DRAM Exclusiva',
                        'Execução da Sub-CPU 12.5 MHz',
                        'ram'
                      )}
                      {renderHardwareNode(
                        'mcd-drive',
                        810,
                        215,
                        155,
                        88,
                        'CD-ROM (1x CLV)',
                        '150 KB/s + 16KB Cache',
                        'Dados + Áudio CD-DA',
                        'cd'
                      )}
                      {renderHardwareNode(
                        'mcd-pcm',
                        605,
                        385,
                        360,
                        86,
                        'Áudio Mega-CD: Ricoh RF5C164 (8ch PCM)',
                        '64 KB PCM Wave RAM + Mixagem CD-DA',
                        'Soma-se ao YM2612 + PSG = 18 Canais + CD-DA',
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
                        <path id="path-ps1-biu-dma" d="M 455 375 L 455 300" />
                        <path id="path-ps1-dma-ram" d="M 500 278 L 500 165" />
                        <path id="path-ps1-dma-cpu" d="M 200 278 L 200 235" />
                        <path id="path-ps1-dma-gpu" d="M 800 278 L 800 195" />
                        <path id="path-ps1-dma-spu" d="M 355 420 L 275 420" />
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
                        <rect
                          x="30"
                          y="62"
                          width="335"
                          height="185"
                          rx="14"
                          fill={lightMode ? '#eff6ff' : '#0d182e'}
                          stroke={isNodeActive('ps1-cpu') ? '#facc15' : '#3b82f6'}
                          strokeWidth={isNodeActive('ps1-cpu') ? '3' : '2'}
                          filter="url(#dropShadow)"
                        />
                        <text x="45" y="84" fill="#60a5fa" fontSize="11.5" fontWeight="800">
                          SoC SONY CXD8530BQ (CW33300 @ 33.87 MHz)
                        </text>

                        <rect x="45" y="95" width="145" height="62" rx="8" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5" />
                        <text x="117" y="115" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800">
                          MIPS R3000A Core
                        </text>
                        <text x="117" y="131" textAnchor="middle" fill="#93c5fd" fontSize="9.5" fontWeight="700">
                          32-bit RISC (MIPS I)
                        </text>
                        <text x="117" y="146" textAnchor="middle" fill="#cbd5e1" fontSize="9">
                          + CP0 (Cache/IRQ)
                        </text>

                        <rect x="200" y="95" width="150" height="62" rx="8" fill="#312e81" stroke="#6366f1" strokeWidth="1.5" />
                        <text x="275" y="115" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800">
                          COP2: GTE (3D)
                        </text>
                        <text x="275" y="131" textAnchor="middle" fill="#a5b4fc" fontSize="9.5" fontWeight="700">
                          66 MIPS Ponto Fixo
                        </text>
                        <text x="275" y="146" textAnchor="middle" fill="#cbd5e1" fontSize="9">
                          Matrizes + Z-Sort
                        </text>

                        <rect x="45" y="168" width="145" height="64" rx="8" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
                        <text x="117" y="188" textAnchor="middle" fill="#fff" fontSize="10.5" fontWeight="800">
                          4KB I-Cache + 1KB SRAM
                        </text>
                        <text x="117" y="204" textAnchor="middle" fill="#6ee7b7" fontSize="9.5" fontWeight="700">
                          Scratchpad ($1F800000)
                        </text>
                        <text x="117" y="219" textAnchor="middle" fill="#fde68a" fontSize="8.5" fontWeight="700">
                          Livre durante DMA!
                        </text>

                        <rect x="200" y="168" width="150" height="64" rx="8" fill="#500724" stroke="#ec4899" strokeWidth="1.5" />
                        <text x="275" y="188" textAnchor="middle" fill="#fff" fontSize="10.5" fontWeight="800">
                          MDEC (Vídeo FMV)
                        </text>
                        <text x="275" y="204" textAnchor="middle" fill="#f9a8d4" fontSize="9.5" fontWeight="700">
                          9.000 Macroblocos/s
                        </text>
                        <text x="275" y="219" textAnchor="middle" fill="#cbd5e1" fontSize="8.5">
                          320×240 @ 30fps 24-bit
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
                        'Código, 3D e Ordering Tables',
                        'ram'
                      )}

                      {/* BLOCO 3: GPU + 1 MB VRAM */}
                      {renderHardwareNode(
                        'ps1-gpu',
                        640,
                        72,
                        330,
                        115,
                        'Sony GPU + 1 MB VRAM',
                        'Grade 1024×512 (16 bpp) • CLUT',
                        'Framebuffer + Texturas • Sem Z-Buffer',
                        'gpu'
                      )}

                      {/* Linhas Conectadas ao Main Bus */}
                      {renderBusLine('bus-ps1-dma-cpu', 200, 247, 200, 276, '#ec4899', 5)}
                      {renderBusLine('bus-ps1-dma-ram', 500, 164, 500, 276, '#10b981', 5)}
                      {renderBusLine('bus-ps1-dma-gpu', 800, 187, 800, 276, '#38bdf8', 5)}
                      {renderBusLine('bus-ps1-biu-dma', 455, 326, 455, 375, '#f59e0b', 5)}

                      {/* MAIN BUS (32-BIT @ 132 MB/s + DMA CONTROLLER) */}
                      <g
                        onClick={() => setSelectedNodeId('ps1-dma' === selectedNodeId ? null : 'ps1-dma')}
                        style={{ cursor: 'pointer' }}
                      >
                        <rect
                          x="30"
                          y="276"
                          width="940"
                          height="50"
                          rx="11"
                          fill={lightMode ? '#fefce8' : '#182235'}
                          stroke={
                            isBusActive('bus-ps1-dma-ram') ||
                              isBusActive('bus-ps1-dma-gpu') ||
                              isBusActive('bus-ps1-dma-cpu')
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
                          MAIN BUS (32-BIT • 132 MB/s) &amp; CONTROLADOR DE DMA (7 CANAIS — ASSUME O BUS)
                        </text>
                        <text
                          x="500"
                          y="314"
                          textAnchor="middle"
                          fill={lightMode ? '#b45309' : '#cbd5e1'}
                          fontSize="10"
                          fontWeight="600"
                        >
                          Ch0/1: MDEC FMV • Ch2: GPU (Ordering Table/Texturas) • Ch3: CD-ROM • Ch4: SPU • Ch6: OTC
                        </text>
                      </g>

                      {/* BUS INTERFACE UNIT (BIU) E SUB BUS */}
                      {renderHardwareNode(
                        'ps1-biu',
                        355,
                        375,
                        205,
                        86,
                        'Ponte BIU & Sub Bus',
                        'Main 32b ↔ Sub Bus 16/8b',
                        'BIOS (512 KB) + Controles I/O',
                        'storage'
                      )}

                      {/* Conexões do Sub Bus */}
                      {renderBusLine('bus-ps1-dma-spu', 275, 420, 355, 420, '#a855f7', 4.5)}
                      {renderBusLine('bus-ps1-cd-sub', 560, 420, 650, 420, '#f97316', 4.5)}

                      {/* BLOCO SPU */}
                      {renderHardwareNode(
                        'ps1-spu',
                        30,
                        375,
                        245,
                        92,
                        'SPU (24 Canais ADPCM)',
                        '16-bit @ 44.1 kHz + 512 KB RAM',
                        'Envelope ADSR + Reverb Digital',
                        'audio'
                      )}

                      {/* BLOCO SUBSISTEMA CD-ROM 2X */}
                      {renderHardwareNode(
                        'ps1-cd',
                        650,
                        375,
                        320,
                        92,
                        'Subsistema CD-ROM (2x)',
                        '300 KB/s + 32 KB Buffer SRAM',
                        'MCU 68HC05 • XA Mode 2 • Trava SCEx',
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
                        STREAMING DIRETO DE ÁUDIO CD-DA / XA ADPCM (SEM PASSAR PELA MAIN RAM)
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
                    Clique em qualquer bloco do diagrama para inspecionar seus detalhes técnicos • Setas ← → mudam o passo da animação
                  </text>
                </svg>
              </div>

              {/* BARRA DE LEGENDA DE CORES COMPACTA ABAIXO DO DIAGRAMA */}
              <div
                className={`px-3.5 py-2 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs ${lightMode ? 'bg-white border-slate-200' : 'bg-[#0c1221] border-slate-800/80'
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
                <div className="flex items-center gap-2">
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
                COLUNA DIREITA: PAINEL TÉCNICO FÁCIL DE LER (PASSO OU CHIP)
               ================================================================= */}
            {!presentationMode && (
              <div className="lg:col-span-4 space-y-3">
                {/* Seletor de Modo do Painel Lateral (Explicação do Passo vs Chip Selecionado) */}
                <div
                  className={`p-1 rounded-xl border grid grid-cols-2 gap-1 ${lightMode ? 'bg-slate-200/70 border-slate-300' : 'bg-[#0c1221] border-slate-800'
                    }`}
                >
                  <button
                    onClick={() => setSelectedNodeId(null)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${!selectedComponent
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
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${selectedComponent
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
                    className={`p-4 rounded-2xl border space-y-4 ${lightMode ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0c1221] border-slate-800'
                      }`}
                  >
                    {/* Cabeçalho do Passo */}
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Passo {simStep} de {currentArch.simulationSteps.length - 1}
                        </span>
                        {currentSimData.packets?.length > 0 && (
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            Fluxo Ativo no Diagrama
                          </span>
                        )}
                      </div>
                      <h2 className="text-base font-extrabold mt-2 leading-snug">{currentSimData.title}</h2>
                      <p className={`text-xs mt-1.5 leading-relaxed ${lightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                        {currentSimData.summary}
                      </p>
                    </div>

                    {/* Fluxo Técnico Numerado (Fácil de escanear visualmente) */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                        Como Funciona Passo a Passo
                      </div>
                      {currentSimData.flowSteps.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${lightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/70 border-slate-800/90'
                            }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div className="text-xs leading-relaxed">
                            <span className="font-extrabold text-blue-400 mr-1.5">{item.tag}:</span>
                            <span className={lightMode ? 'text-slate-700' : 'text-slate-300'}>{item.text}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Insight Técnico (Por que isso importa?) */}
                    <div
                      className={`p-3 rounded-xl border-l-4 border-amber-400 ${lightMode ? 'bg-amber-50/80 text-slate-800' : 'bg-amber-500/10 text-slate-200'
                        }`}
                    >
                      <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-400 mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Detalhe de Arquitetura (Copetti)
                      </div>
                      <p className="text-xs leading-relaxed">{currentSimData.insight}</p>
                    </div>

                    {/* Roteiro de Fala (Apenas se o usuário ativou o botão "Roteiro") */}
                    {showSpeakerNotes && (
                      <div
                        className={`p-3 rounded-xl border-l-4 border-indigo-500 ${lightMode ? 'bg-indigo-50 text-indigo-950' : 'bg-indigo-950/40 text-indigo-200'
                          }`}
                      >
                        <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-indigo-400 mb-1">
                          <Mic className="w-3.5 h-3.5" />
                          Sugestão de Fala para Apresentação
                        </div>
                        <p className="text-xs italic leading-relaxed">{currentSimData.speech}</p>
                      </div>
                    )}

                    {/* Chips Ativos neste Passo (Pílulas Clicáveis) */}
                    <div>
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                        Chips Ativos neste Passo (Clique para inspecionar)
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {currentSimData.activeNodes.map((nodeId) => {
                          const comp = currentArch.components.find((c) => c.id === nodeId);
                          if (!comp) return null;
                          return (
                            <button
                              key={nodeId}
                              onClick={() => setSelectedNodeId(nodeId)}
                              className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition flex items-center gap-1 ${lightMode
                                  ? 'bg-slate-100 hover:bg-blue-50 border-slate-300 text-slate-800'
                                  : 'bg-slate-800/90 hover:bg-slate-800 border-slate-700 text-slate-200'
                                }`}
                            >
                              <span>{comp.title}</span>
                              <ArrowRight className="w-3 h-3 text-blue-400" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* MODO B: INSPETOR DO CHIP SELECIONADO */
                  <div
                    className={`p-4 rounded-2xl border space-y-4 ${lightMode ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0c1221] border-slate-800'
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
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${lightMode
                            ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                          }`}
                      >
                        ← Voltar
                      </button>
                    </div>

                    {/* Grade de Especificações Técnicas Rápidas */}
                    {selectedComponent.metrics && (
                      <div className="grid grid-cols-2 gap-2">
                        {selectedComponent.metrics.map((m, idx) => (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-xl border ${lightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/70 border-slate-800'
                              }`}
                          >
                            <div className="text-[10px] font-bold uppercase text-slate-400">{m.label}</div>
                            <div className="text-xs font-extrabold mt-0.5 text-blue-400">{m.value}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Explicação Técnica Direta */}
                    <div
                      className={`p-3 rounded-xl border ${lightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
                        }`}
                    >
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                        Funcionamento Interno
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
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${selectedNodeId === comp.id
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
              className={`p-5 rounded-2xl border ${lightMode ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0c1221] border-slate-800'
                }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                    Experimento Interativo
                  </span>
                  <h2 className="text-base md:text-lg font-extrabold mt-1">
                    Por que os jogos em CD precisavam de telas de &ldquo;Loading&rdquo;? (XIP vs. Buffer em RAM)
                  </h2>
                  <p className={`text-xs mt-0.5 ${lightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                    No cartucho (Execute-In-Place), a CPU lê o jogo direto dos chips de ROM em nanossegundos. No CD-ROM, o laser precisa buscar a trilha (Seek) e copiar tudo para a RAM antes da fase começar.
                  </p>
                </div>

                <div
                  className={`p-3 rounded-xl border flex items-center gap-3 ${lightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                    }`}
                >
                  <label className="text-xs font-bold whitespace-nowrap">Dados da Fase:</label>
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
                    speed: 'Acesso Direto (XIP no Bus 16-bit)',
                    seek: '100 ns (Sem motor físico)',
                    time: '< 0.05 s (Instantâneo)',
                    ramRole: '64 KB só para variáveis',
                    barWidth: '4%',
                    color: 'bg-emerald-500'
                  },
                  {
                    name: 'PC Engine CD-ROM² (1x)',
                    speed: '150 KB/s via Porta Expansão',
                    seek: '~600 ms (Busca óptica)',
                    time: `${(0.6 + benchPayloadKB / 150).toFixed(1)} segundos`,
                    ramRole: '64 KB CD-RAM + System Card',
                    barWidth: `${Math.min(100, ((0.6 + benchPayloadKB / 150) / 15) * 100)}%`,
                    color: 'bg-orange-500'
                  },
                  {
                    name: 'Sega Mega-CD (1x)',
                    speed: '150 KB/s → Sub-CPU 12.5 MHz',
                    seek: '~500 ms (Busca óptica)',
                    time: `${(0.5 + benchPayloadKB / 150).toFixed(1)} segundos`,
                    ramRole: '512 KB PRG-RAM + 256 KB Word',
                    barWidth: `${Math.min(100, ((0.5 + benchPayloadKB / 150) / 15) * 100)}%`,
                    color: 'bg-purple-500'
                  },
                  {
                    name: 'Sony PlayStation (2x)',
                    speed: '300 KB/s → DMA Ch3 (132 MB/s)',
                    seek: '~300 ms (Busca óptica)',
                    time: `${(0.3 + benchPayloadKB / 300).toFixed(1)} segundos`,
                    ramRole: '2 MB EDO DRAM + 1 MB VRAM',
                    barWidth: `${Math.min(100, ((0.3 + benchPayloadKB / 300) / 15) * 100)}%`,
                    color: 'bg-blue-500'
                  }
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border ${lightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/70 border-slate-800'
                      }`}
                  >
                    <div className="text-xs font-extrabold">{item.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.speed}</div>
                    <div className="text-xl font-black text-amber-400 mt-2">{item.time}</div>
                    <div className="w-full h-2 rounded-full bg-slate-700/60 overflow-hidden my-2">
                      <div className={`h-full ${item.color} transition-all duration-300`} style={{ width: item.barWidth }} />
                    </div>
                    <div className="text-[11px] space-y-0.5 text-slate-400">
                      <div>Latência Seek: {item.seek}</div>
                      <div className="font-semibold text-blue-400">Destinos: {item.ramRole}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quadro Comparativo Limpo e Direto */}
            <div
              className={`p-5 rounded-2xl border overflow-x-auto ${lightMode ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0c1221] border-slate-800'
                }`}
            >
              <h3 className="text-base font-extrabold mb-3">
                Comparativo Técnico lado a lado (Segundo Rodrigo Copetti &amp; RetroReversing)
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
                    <td className="p-3">HuC6280 (8-bit 65C02 mod.) @ 7.16 MHz + MMU (8× MPR → 21-bit / 2 MB)</td>
                    <td className="p-3">Motorola 68000 @ ~7.67 MHz (Regs 32-bit, ALU 16-bit, Bus 16-bit, Addr 24-bit)</td>
                    <td className="p-3">SoC CXD8530BQ (CW33300 / MIPS R3000A) @ 33.87 MHz (32-bit RISC)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Coprocessadores</td>
                    <td className="p-3">Sem coprocessador (CPU de 8 bits gerencia o sistema via MMU)</td>
                    <td className="p-3">2º Motorola 68000 @ 12.5 MHz (Mega-CD) + Zilog Z80 @ 3.58 MHz + ASIC</td>
                    <td className="p-3">CP0 (Sistema) + CP2/GTE (Geometria 3D 66 MIPS) + MDEC (9.000 macroblocos/s)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Memória RAM</td>
                    <td className="p-3">8 KB Base + 64 KB CD-RAM + 64 KB ADPCM + 192 KB (Super System Card)</td>
                    <td className="p-3">64 KB (68k) + 8 KB (Z80) + 512 KB (PRG-RAM) + 256 KB (Word RAM) + 64 KB (PCM)</td>
                    <td className="p-3">2 MB EDO DRAM + 4 KB I-Cache + 1 KB Scratchpad SRAM ($1F800000)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Vídeo &amp; VRAM</td>
                    <td className="p-3">HuC6270 (VDC) + HuC6260 (VCE) • 64 KB VRAM (Words 16-bit) • 482 cores</td>
                    <td className="p-3">VDP (~13 MHz): 64 KB VRAM + 128 B CRAM (64 cores) + 80 B VSRAM + ASIC</td>
                    <td className="p-3">Sony GPU 32-bit • 1 MB VRAM (grade 1024×512) • CLUT • Sem Z-Buffer</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Barramentos &amp; DMA</td>
                    <td className="p-3">Expansão 8-bit + Slot HuCard 38p + SATB DMA interno no VDC</td>
                    <td className="p-3">Árbitro de Bus (68k↔Z80) + Word RAM Bank Swap (2M / 1M) + VDP DMA</td>
                    <td className="p-3">Main Bus (32-bit, 132 MB/s, DMA 7 canais assume o bus) + BIU Sub Bus (16/8b)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Cartões das 4 Fontes Oficiais Utilizadas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[
                {
                  title: 'PC Engine Architecture',
                  author: 'Rodrigo Copetti',
                  desc: 'Análise do HuC6280, MMU MPR de 21 bits, par gráfico VDC/VCE e expansão CD-ROM².',
                  url: 'https://classic.copetti.org/writings/consoles/pc-engine/'
                },
                {
                  title: 'Arquitetura do Mega Drive / Genesis',
                  author: 'Rodrigo Copetti (PT-BR)',
                  desc: 'Análise do Motorola 68000, Z80, Árbitro de Barramento, VDP (VRAM/CRAM/VSRAM) e Mega-CD.',
                  url: 'https://www.copetti.org/pt-br/writings/consoles/mega-drive-genesis/'
                },
                {
                  title: 'PlayStation (PS1) Architecture',
                  author: 'Rodrigo Copetti',
                  desc: 'Análise do SoC CW33300, GTE, MDEC, Scratchpad de 1 KB, Main/Sub Bus (BIU) e GPU 1024×512.',
                  url: 'https://www.copetti.org/writings/consoles/playstation'
                },
                {
                  title: 'PS1 Hardware Architecture',
                  author: 'RetroReversing',
                  desc: 'Engenharia reversa do chip Sony CXD8530BQ (LSI Logic), subsistema de CD e canais de DMA.',
                  url: 'https://www.retroreversing.com/ps1'
                }
              ].map((ref, idx) => (
                <a
                  key={idx}
                  href={ref.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`p-4 rounded-xl border transition group flex flex-col justify-between ${lightMode
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
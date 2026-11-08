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
  CheckCircle2
} from 'lucide-react';

// ============================================================================
// BASE DE DADOS VERIFICADA NOS 4 SITES ORIGINAIS (ATUALIZAÇÕES 2025/2026)
// Inclui Modo Técnico + Analogias Simples e Roteiro Acessível para Leigos
// ============================================================================

const ARCHITECTURE_DATA = {
  pce: {
    id: 'pce',
    shortName: 'PC Engine CD-ROM²',
    name: 'NEC PC Engine + CD-ROM² (1988)',
    subtitle: 'HuC6280 (8-bit + MMU 21-bit) • Vídeo Dual-Chip (VDC + VCE) • Expansão CD-ROM²',
    year: '1988',
    sources: [
      { label: 'Copetti — PC Engine (Rev. 2026)', url: 'https://classic.copetti.org/writings/consoles/pc-engine/' }
    ],
    simulationSteps: [
      {
        step: 0,
        shortTitle: 'Visão Geral',
        title: 'Console Base: CPU 8-bit com "Índice" MMU de 21-bit',
        summary:
          'O PC Engine usa o chip HuC6280 (65C02 modificado a 7.16 MHz). Para superar o limite de 64 KB dos processadores de 8 bits, ele traz uma MMU interna que expande o alcance para 2 MB em páginas de 8 KB.',
        simpleAnalogy:
          'Imagine um trabalhador rápido que só consegue enxergar 8 folhas em cima da mesa por vez (64 KB), mas tem um fichário inteligente (MMU) que troca essas folhas instantaneamente a partir de um arquivo de 256 páginas (2 MB).',
        flowSteps: [
          { tag: 'CPU 8-bit', text: 'HuC6280 opera a 1.79 MHz ou 7.16 MHz com instruções de paginação TAM e TMA.' },
          { tag: 'MMU (8× MPR)', text: '8 registradores MPR paginam blocos de 8 KB em um barramento físico de 21 bits (2 MB).' },
          { tag: 'Sem BIOS Interna', text: 'Apenas 8 KB de RAM interna e nenhum ROM de boot (o console liga direto pelo slot HuCard).' }
        ],
        insight:
          'Verificado em Copetti: O PC Engine base não possui ROM de boot interna (o vetor de reset $FFFE-$FFFF aponta direto para o cartão HuCard) e tem só 8 KB de RAM — por isso o módulo de CD precisou trazer RAM e BIOS próprios.',
        speechSimple:
          '"Pessoal, este é o PC Engine de 1988, o primeiro videogame da história a usar CD-ROM. O cérebro dele é um chip pequeno de 8 bits, mas muito rápido. O problema é que ele nasceu com uma mesinha de trabalho minúscula de apenas 8 KB de memória — o que era ótimo para cartões simples, mas impossível para guardar os dados gigantes de um CD."',
        speechTech:
          '"Começamos pelo PC Engine com o HuC6280 a 7.16 MHz. Como uma CPU de 8 bits só enxerga 64 KB lógicos, a Hudson incluiu uma MMU com 8 registradores MPR (TAM/TMA) que expandem o barramento para 21 bits (2 MB em páginas de 8 KB)."',
        activeNodes: ['pce-cpu', 'pce-wram', 'pce-vdc', 'pce-vce'],
        activeBuses: [],
        packets: []
      },
      {
        step: 1,
        shortTitle: 'System Card',
        title: 'Slot HuCard (38 pinos): Manual de Instruções (BIOS) e Mais RAM',
        summary:
          'Como o console original não tinha sistema operacional para ler CDs, um cartão especial (System Card) é inserido no slot de jogos para fornecer a BIOS de boot e memória RAM extra.',
        simpleAnalogy:
          'Como o videogame nasceu sem saber o que é um CD, colocamos um "cartão-tradutor" (System Card) na entrada de jogos. Ele ensina o console a conversar com o leitor de CD e ainda amplia a mesa de trabalho (memória RAM).',
        flowSteps: [
          { tag: 'Slot 38 pinos', text: 'A System Card entra no slot HuCard e assume o endereço de boot ($FFFE-$FFFF).' },
          { tag: 'BIOS do CD', text: 'Fornece as rotinas do leitor óptico que não existiam no console original.' },
          { tag: 'Expansão RAM', text: 'Super System Card soma +192 KB RAM (total 256 KB); Arcade Card soma +2 MB DRAM.' }
        ],
        insight:
          'Verificado em Copetti: Os CDs do PC Engine não têm trava física de região! A trava acontecia apenas nos cartões HuCard/System Card, pois a NEC inverteu a ordem dos pinos de dados nos consoles americanos (TurboGrafx-16).',
        speechSimple:
          '"Como o console não sabia ler CDs de fábrica, a solução foi genial: você coloca um cartão chamado System Card na entrada normal de jogos. Esse cartão funciona como um manual de instruções para o leitor de CD e ainda aumenta a memória do aparelho em até 2 Megabytes nos cartões mais avançados!"',
        speechTech:
          '"Como o vetor de reset aponta para o slot HuCard de 38 pinos, inserimos nele a System Card: ela fornece a BIOS do CD-ROM² e expande a RAM mapeada na MMU em +192 KB (Super System Card) ou +2 MB (Arcade Card)."',
        activeNodes: ['pce-syscard', 'pce-cpu'],
        activeBuses: ['bus-pce-hucard'],
        packets: [
          { pathId: 'path-pce-hucard', color: '#f59e0b', label: 'BIOS + RAM Extra', badgeX: 365, badgeY: 105 }
        ]
      },
      {
        step: 2,
        shortTitle: 'Leitura CD 1x',
        title: 'Leitura Óptica 1x (150 KB/s) via Porta de Expansão Traseira',
        summary:
          'O leitor CD-ROM² lê o disco na velocidade 1x (150 KB/s via SCSI) e guarda os arquivos da fase nos 64 KB de RAM da maleta (Interface Unit) antes de entregá-los à CPU.',
        simpleAnalogy:
          'O CD é como um depósito gigante de 650 MB, mas o entregador (laser 1x) caminha devagar. Por isso, ele copia apenas os objetos da fase atual para uma bancada de 64 KB dentro da base acoplada.',
        flowSteps: [
          { tag: 'Laser 1x CLV', text: 'Transfere dados a 150 KB/s pelo protocolo SCSI-1 até a Interface Unit (IFU-30).' },
          { tag: '64 KB CD-RAM', text: 'Guarda o código e os gráficos da fase atual + 2 KB de memória para salvar o jogo.' },
          { tag: 'Porta Traseira', text: 'Expõe todos os pinos de dados e endereços da CPU para enxergar a RAM do CD.' }
        ],
        insight:
          'No cartucho a leitura é instantânea; já no CD de 1x (150 KB/s), os dados precisam ser copiados para os 64 KB de RAM da base antes que a CPU possa executá-los.',
        speechSimple:
          '"Veja a animação laranja: o laser lê o CD a 150 KB por segundo — a velocidade dos primeiros leitores de música. Como o CD é lento demais para rodar o jogo direto dele, os dados da fase são copiados primeiro para uma memória de 64 KB na base do aparelho, além de ter 2 KB com bateria para salvar seu progresso."',
        speechTech:
          '"O leitor 1x CLV transfere setores a 150 KB/s via barramento SCSI até os 64 KB de DRAM da Interface Unit (que sobe para 256 KB no Super CD-ROM²), mais 2 KB de Save RAM mapeados na porta traseira."',
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
        title: 'Dupla Gráfica de 16 bits: HuC6270 (Desenhista) + HuC6260 (Pintor)',
        summary:
          'Mesmo com uma CPU de 8 bits, o vídeo usa dois chips de 16 bits: o VDC monta os cenários e personagens em uma VRAM de 16 bits (64 KB) e envia para o VCE pintar até 482 cores.',
        simpleAnalogy:
          'Pense em dois artistas trabalhando juntos: o primeiro chip (VDC) desenha o contorno dos cenários e personagens em alta velocidade (16 bits), e o segundo chip (VCE) pinta tudo com até 482 cores antes de mandar para a TV.',
        flowSteps: [
          { tag: 'VRAM em 16-bit', text: 'Os 64 KB de memória de vídeo são organizados em palavras de 16 bits (2 linhas de tile por vez).' },
          { tag: 'VDC (HuC6270)', text: 'Monta o Background (tiles 8×8) e 64 Sprites (16×16 via DMA interno na SATB).' },
          { tag: 'VCE (HuC6260)', text: 'Recebe o fluxo digital de 9 bits do VDC e aplica 32 paletas (até 482 cores na tela).' }
        ],
        insight:
          'Verificado em Copetti: A CPU não consegue acessar a tabela interna de sprites (SATB) diretamente — ela escreve a lista na VRAM e o VDC faz um DMA interno automático para atualizar os 64 sprites!',
        speechSimple:
          '"Aqui está o truque que deixava os jogos lindos: embora o processador principal seja de 8 bits, a parte de vídeo trabalha em 16 bits! São dois chips em dupla: o primeiro monta os cenários e até 64 personagens na tela, e o segundo funciona como um pintor que aplica até 482 cores ao mesmo tempo — mais cores na tela que o próprio Mega Drive!"',
        speechTech:
          '"O VDC (HuC6270) acessa seus 64 KB de VRAM em palavras de 16 bits (lendo duas linhas de bitplanes CH0-CH3 por acesso) e atualiza a SATB via DMA interno. Depois envia um stream de 9 bits para o VCE (HuC6260), que aplica 32 paletas RGB de 9 bits."',
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
        title: 'Três Fontes de Som: Ondas na CPU + Vozes ADPCM (64 KB) + Música CD',
        summary:
          'A unidade CD-ROM² mistura o sintetizador interno da CPU (capaz até de PCM de 5 ou 10 bits) com um chip dedicado a vozes (64 KB ADPCM) e música de CD tocando direto do laser.',
        simpleAnalogy:
          'É como uma banda com três músicos independentes: o chip principal faz os bipes de efeitos, um segundo chip exclusivo com memória própria fala as vozes dos personagens, e o CD toca a trilha sonora gravada em estúdio!',
        flowSteps: [
          { tag: 'Waveform PSG', text: '6 canais de ondas de 5 bits na CPU (com modo Direct D/A para samples de 5 ou 10 bits).' },
          { tag: '64 KB ADPCM', text: 'Memória exclusiva para vozes/efeitos decodificados pelo chip OKI MSM5205.' },
          { tag: 'CD-DA Estéreo', text: 'Música com qualidade de CD lida direto do laser sem gastar 1 byte de memória RAM!' }
        ],
        insight:
          'Verificado em Copetti: Além dos 64 KB exclusivos para vozes ADPCM na maleta de CD, o sintetizador da CPU tinha um modo Direct D/A (DDA) que podia combinar dois canais para tocar áudio PCM de 10 bits!',
        speechSimple:
          '"Para fechar o PC Engine, olhem a linha verde do som: ele toca três coisas juntas! A música de estúdio vem direto do CD sem gastar memória; as vozes dubladas têm um depósito exclusivo de 64 KB só para elas não roubarem espaço dos gráficos; e os efeitos de tiro e pulo saem do próprio processador!"',
        speechTech:
          '"O subsistema sonoro mistura os 6 canais Waveform PSG da CPU (com suporte a LFO e modo DDA de 5/10 bits), o decodificador ADPCM OKI MSM5205 com 64 KB próprios e o streaming Red Book CD-DA."',
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
        simpleRole: 'É o cérebro do console: coordena a lógica do jogo, troca páginas de memória e ainda gera 6 canais de som.',
        metrics: [
          { label: 'Clock', value: '1.79 / 7.16 MHz' },
          { label: 'Barramento', value: '8-bit Dados / 21-bit Addr' },
          { label: 'Paginação MMU', value: '8× Bancos MPR de 8 KB' },
          { label: 'Áudio Interno', value: '6ch PSG + DDA 5/10-bit' }
        ],
        detail:
          'Seg. Copetti: Baseado no WDC 65C02, adiciona instruções de bloco (TII, TDD) e 8 registradores MPR controlados por TAM/TMA que convertem endereços de 16 bits em 21 bits (2 MB). Seu áudio interno também suporta LFO e modo Direct D/A (até 10-bit combinando 2 canais).'
      },
      {
        id: 'pce-wram',
        title: 'Work RAM Base',
        spec: '8 KB SRAM Interna',
        subSpec: '1 Página MPR no Console',
        category: 'ram',
        simpleRole: 'A pequena mesa de trabalho original do videogame (só 8 KB), onde ficam as variáveis imediatas da partida.',
        metrics: [
          { label: 'Capacidade', value: '8 KB SRAM' },
          { label: 'Mapeamento', value: '1 Página MPR ($F8)' },
          { label: 'Boot ROM', value: 'Inexistente (Boot via HuCard)' },
          { label: 'Limitação', value: 'Exige RAM extra p/ CD' }
        ],
        detail:
          'Memória de trabalho original do console base. Como 8 KB bastavam para cartões ROM mas eram insuficientes para armazenar arquivos vindos de um CD, o módulo CD-ROM² precisou adicionar RAM externa.'
      },
      {
        id: 'pce-vdc',
        title: 'VDC: HuC6270 (Vídeo)',
        spec: 'Barramento VRAM 16-bit',
        subSpec: 'Tiles 8×8 + 64 Sprites (SATB DMA)',
        category: 'gpu',
        simpleRole: 'O "desenhista" de 16 bits: posiciona os blocos do cenário e até 64 personagens móveis na tela.',
        metrics: [
          { label: 'Acesso VRAM', value: 'Palavras de 16 bits (15 linhas)' },
          { label: 'Background', value: '1 Camada Tiles 8×8 (até 1024×512)' },
          { label: 'Sprites', value: '64 na SATB (16 por linha)' },
          { label: 'Saída Digital', value: 'Stream 9-bit p/ o VCE' }
        ],
        detail:
          'Seg. Copetti: Embora a CPU seja de 8 bits, o VDC organiza a VRAM em palavras de 16 bits. Como a CPU não acessa o buffer interno de sprites (SATB) diretamente, ela escreve na VRAM e o VDC copia via DMA interno.'
      },
      {
        id: 'pce-vram',
        title: 'VRAM Dedicada',
        spec: '64 KB SRAM (16-bit Words)',
        subSpec: 'Tiles Planar 4-bit + Sprites',
        category: 'ram',
        simpleRole: 'O caderno de desenho exclusivo do chip de vídeo, lido de duas em duas folhas por vez (16 bits) para ganhar velocidade.',
        metrics: [
          { label: 'Capacidade', value: '64 KB (32K Words × 16-bit)' },
          { label: 'Formato Tile', value: '4 Bitplanes (CH0–CH3)' },
          { label: 'Sprites', value: '16×16 até 32×64 pixels' },
          { label: 'Ligação', value: 'Exclusiva do chip VDC' }
        ],
        detail:
          'Acessada exclusivamente pelo VDC em palavras de 16 bits. Armazena duas linhas de planos de bits simultaneamente em cada endereço, dobrando a largura de banda gráfica.'
      },
      {
        id: 'pce-vce',
        title: 'VCE: HuC6260 (Cores)',
        spec: '32 Paletas × 16 Cores',
        subSpec: 'Até 482 Cores de 512 (RGB 9-bit)',
        category: 'gpu',
        simpleRole: 'O "pintor" do console: recebe os desenhos prontos do VDC e aplica as cores finais antes de enviar para a TV.',
        metrics: [
          { label: 'Paletas', value: '16 Background + 16 Sprites' },
          { label: 'Cores Simultâneas', value: 'Até 482 cores na tela' },
          { label: 'Espaço de Cor', value: 'RGB 9-bit (512 cores)' },
          { label: 'Saída Analógica', value: 'RF / Composto / RGB (Exp)' }
        ],
        detail:
          'Seg. Copetti: Recebe o índice de paleta e cor em 9 bits vindos do VDC, consulta sua tabela interna de 32 paletas e converte em sinal de vídeo para a TV.'
      },
      {
        id: 'pce-syscard',
        title: 'System Card (HuCard)',
        spec: 'BIOS ROM + Expansão RAM',
        subSpec: '+192 KB (Super) ou +2 MB (Arcade)',
        category: 'storage',
        simpleRole: 'Cartão especial colocado na entrada de jogos que ensina o console a usar o CD e adiciona memória extra.',
        metrics: [
          { label: 'Conector', value: 'Slot HuCard (38 pinos)' },
          { label: 'System Card 1–2', value: 'BIOS CD-ROM²' },
          { label: 'Super System Card', value: 'BIOS + 192 KB RAM (Total 256 KB)' },
          { label: 'Arcade Card', value: 'BIOS + 2 MB DRAM' }
        ],
        detail:
          'Inserida no slot de cartucho do PC Engine. Fornece a BIOS do CD-ROM² e expande a RAM. Seg. Copetti, a trava de região entre Japão e EUA ficava nos pinos invertidos deste slot, e não nos CDs.'
      },
      {
        id: 'pce-cdram',
        title: 'CD-ROM² Work RAM',
        spec: '64 KB DRAM + 2 KB BRAM',
        subSpec: 'Buffer de Código/Dados + Save RAM',
        category: 'ram',
        simpleRole: 'Bancada de 64 KB na maleta do CD que recebe as fases lidas do disco, mais 2 KB para salvar o jogo.',
        metrics: [
          { label: 'RAM Geral', value: '64 KB DRAM (256 KB no Super CD)' },
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
        simpleRole: 'Chip de som com 64 KB exclusivos só para falar as vozes dos personagens sem gastar a memória dos gráficos.',
        metrics: [
          { label: 'Buffer ADPCM', value: '64 KB DRAM Exclusiva' },
          { label: 'Decodificador', value: 'OKI MSM5205 (4-bit → 12-bit)' },
          { label: 'Taxa de Amostragem', value: 'Até 32 kHz' },
          { label: 'Saída Final', value: 'Mixagem ADPCM + CD-DA + PSG' }
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
        simpleRole: 'O leitor óptico que lê até 650 MB de fases, animações e músicas com qualidade de estúdio.',
        metrics: [
          { label: 'Velocidade', value: '1x CLV (150 KB/s)' },
          { label: 'Interface', value: 'Controlador SCSI-1' },
          { label: 'Capacidade', value: '~650 MB por disco' },
          { label: 'Trava no Disco', value: 'Nenhuma trava física no CD' }
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
      { label: 'Copetti — Mega Drive / Genesis PT-BR (Rev. 2026)', url: 'https://www.copetti.org/pt-br/writings/consoles/mega-drive-genesis/' }
    ],
    simulationSteps: [
      {
        step: 0,
        shortTitle: 'Visão Geral',
        title: 'Mega Drive Base: 68000 + Z80 Coordenados pelo Árbitro de Barramento',
        summary:
          'O Mega Drive combina duas CPUs: o Motorola 68000 (~7.67 MHz) para o jogo e o Zilog Z80 (~3.58 MHz) para o som, coordenados por um Árbitro de Barramento que evita colisões na memória.',
        simpleAnalogy:
          'No Mega Drive trabalham dois funcionários: o chefe principal (68000) cuida do jogo e um assistente (Z80) cuida só da música. Um "guarda de trânsito" (Árbitro) pede para um esperar alguns instantes quando o outro precisa cruzar o corredor.',
        flowSteps: [
          { tag: 'Motorola 68000', text: 'Registradores 32-bit, ALU 16-bit, Bus de dados 16-bit e endereços 24-bit (16 MB).' },
          { tag: 'Zilog Z80', text: 'CPU de 8 bits (ALU interna de 4 bits) com 8 KB de RAM dedicada ao som.' },
          { tag: 'Árbitro de Bus', text: 'Pausa temporariamente uma CPU quando a outra acessa o barramento compartilhado.' }
        ],
        insight:
          'Verificado em Copetti (PT-BR): Embora o 68000 tenha registradores de 32 bits, sua unidade aritmética (ALU) e seu barramento externo são de 16 bits; já o Z80 tem registradores de 8 bits e uma ALU de 4 bits.',
        speechSimple:
          '"No Mega Drive original temos dois processadores trabalhando juntos: o Motorola 68000 cuida das regras do jogo e dos gráficos, enquanto um chip menor chamado Z80 cuida exclusivamente da música. E existe um guarda de trânsito interno — o Árbitro de Barramento — que evita que os dois batam de frente quando precisam usar a mesma pista!"',
        speechTech:
          '"Na arquitetura analisada por Rodrigo Copetti, o Mega Drive combina o Motorola 68000 a 7.67 MHz (registradores de 32 bits, ALU e bus de 16 bits, endereços de 24 bits) com o Z80 a 3.58 MHz (ALU de 4 bits, 8 KB RAM), coordenados pelo Árbitro de Barramento."',
        activeNodes: ['mcd-maincpu', 'mcd-z80', 'mcd-arbiter', 'mcd-vdp'],
        activeBuses: [],
        packets: []
      },
      {
        step: 1,
        shortTitle: 'Sub-CPU 12.5 MHz',
        title: 'Mega-CD: Leitura 1x (150 KB/s) e um 2º Motorola 68000 Mais Rápido',
        summary:
          'Ao encaixar o Mega-CD, o console ganha um segundo processador Motorola 68000 rodando a 12.5 MHz (63% mais veloz que o principal) e 512 KB de memória própria (PRG-RAM).',
        simpleAnalogy:
          'O Mega-CD não é só um leitor de discos: é quase um segundo videogame inteiro acoplado! Ele traz um segundo "chefe" 63% mais rápido e uma bancada de 512 KB (8 vezes maior que a do Mega Drive) para descompactar fases e vídeos sem deixar o jogo lento.',
        flowSteps: [
          { tag: 'Laser 1x CLV', text: 'Lê setores do CD a 150 KB/s passando por um cache local de 16 KB.' },
          { tag: 'Sub-CPU 12.5 MHz', text: 'Segundo Motorola 68000 dedicado ao Mega-CD rodando em paralelo ao console.' },
          { tag: '512 KB PRG-RAM', text: 'Memória 8× maior que a RAM do Mega Drive para código, áudio e vídeo FMV.' }
        ],
        insight:
          'Ter dois processadores Motorola 68000 reais trabalhando ao mesmo tempo exigia sincronismo cuidadoso dos programadores, mas permitia descomprimir vídeos enquanto o jogo rodava.',
        speechSimple:
          '"Quando acoplamos o Mega-CD, ganhamos um segundo processador Motorola 68000, só que 63% mais rápido que o do próprio Mega Drive! Veja na animação: o leitor lê o CD a 150 KB por segundo e entrega tudo para essa segunda CPU trabalhar tranquila na sua memória gigante de 512 KB."',
        speechTech:
          '"O módulo Mega-CD adiciona uma Sub-CPU Motorola 68000 a 12.5 MHz com 512 KB de Program RAM exclusiva. O leitor 1x (150 KB/s) abastece essa PRG-RAM sem consumir ciclos do barramento principal do Mega Drive."',
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
        title: 'Rotação/Escala no ASIC e "Troca de Bancadas" (Bank Swap na Word RAM)',
        summary:
          'O chip gráfico ASIC do Mega-CD gira/redimensiona imagens dentro da Word RAM (256 KB) e alterna os bancos de memória (Bank Swap) para entregá-las prontas ao Mega Drive.',
        simpleAnalogy:
          'Os dois processadores 68000 não podem mexer na mesma mesa ao mesmo tempo. A solução foi usar duas bancadas giratórias de 128 KB (Bank Swap): enquanto o Mega-CD desenha e gira efeitos 3D na Bancada A, o Mega Drive pega o desenho pronto da Bancada B — depois eles trocam!',
        flowSteps: [
          { tag: 'ASIC Gráfico', text: 'Gira e escala imagens por hardware (estilo Mode 7) e converte Bitmaps em Tiles 8×8.' },
          { tag: 'Word RAM 256 KB', text: 'Funciona como 1 bloco único de 256 KB (2M) ou 2 bancos de 128 KB (1M/1M).' },
          { tag: 'Bank Swap', text: 'Alterna os bancos de 128 KB entre a Sub-CPU e a Main-CPU sem fila de espera!' }
        ],
        insight:
          'Como o VDP original do Mega Drive só entendia ladrilhos (tiles) de 8×8 e não girava imagens, o ASIC do Mega-CD calcula a rotação e já entrega o resultado fatiado em tiles de 8×8 na Word RAM!',
        speechSimple:
          '"Aqui acontece a mágica do Mega-CD: como o Mega Drive original não conseguia girar ou dar zoom em imagens (como o Super Nintendo fazia), a Sega colocou um chip especial chamado ASIC no meio do caminho. Ele gira a imagem dentro de uma memória dividida em duas bancadas de 128 KB: enquanto o Mega-CD desenha numa bancada, o Mega Drive lê a outra sem ninguém esperar!"',
        speechTech:
          '"Como os dois 68000 não têm barramento direto, a ponte é a Word RAM de 256 KB junto ao ASIC gráfico. O ASIC aplica rotação/escala afim, converte bitmaps em tiles 8×8 e realiza o Bank Swap (modo 1M/1M de 2× 128 KB) para o 68000 principal."',
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
          'O 68000 do Mega Drive aciona o motor de transferência (DMA) do VDP para puxar os gráficos prontos da Word RAM e abastecer suas três memórias internas de vídeo.',
        simpleAnalogy:
          'O chip de vídeo do Mega Drive (VDP) tem três gavetas separadas: uma grande para os desenhos dos cenários e personagens (VRAM), uma caixinha de tintas para 64 cores (CRAM) e uma régua que controla a altura das colunas do cenário (VSRAM).',
        flowSteps: [
          { tag: '64 KB VRAM', text: 'Guarda os tiles 8×8 dos 4 planos (Plano B fundo, Plano A frente, Janela e 80 Sprites).' },
          { tag: '128 B CRAM', text: 'Guarda 4 paletas de 16 cores (64 cores de 512, ou até 183 com Shadow/Highlight).' },
          { tag: '80 B VSRAM', text: 'Memória dedicada à rolagem vertical (Vertical Scroll) que pausa a CPU durante DMA.' }
        ],
        insight:
          'Verificado em Copetti (PT-BR): Enquanto o DMA do VDP copia gráficos da RAM para a VRAM, o 68000 fica pausado. Além disso, atualizar as cores da CRAM fora do intervalo vertical gera pontinhos coloridos na borda da TV chamados "CRAM Dots"!',
        speechSimple:
          '"Depois que o gráfico está pronto na bancada do meio, o chip de vídeo do Mega Drive puxa tudo de uma vez e organiza em três gavetas internas: 64 KB para montar 4 camadas de cenários e até 80 personagens, uma gavetinha para as 64 cores da tela e outra só para fazer o cenário rolar suavemente!"',
        speechTech:
          '"O VDP (~13.4 MHz, Modo V) usa sua unidade de DMA dedicada (que pausa o 68000 durante a cópia RAM→VRAM) para abastecer três memórias: 64 KB de VRAM (Planos A, B, Janela e 80 sprites), 128 B de CRAM (64 cores + modos S/H) e 80 B de VSRAM."',
        activeNodes: ['mcd-wordram', 'mcd-maincpu', 'mcd-vdp'],
        activeBuses: ['bus-mcd-main-word', 'bus-mcd-vdp'],
        packets: [
          { pathId: 'path-mcd-vdp', color: '#38bdf8', label: 'DMA -> 64KB VRAM', badgeX: 165, badgeY: 315 }
        ]
      },
      {
        step: 4,
        shortTitle: 'Som FM + PCM',
        title: 'Áudio: Yamaha YM2612 (FM) + Ricoh 8ch PCM + O Truque de Sonic CD',
        summary:
          'O Z80 comanda o sintetizador FM (YM2612) e o PSG no Mega Drive, somando-se aos 8 canais de áudio digital (Ricoh PCM) e à música de CD do Mega-CD.',
        simpleAnalogy:
          'Quando uma música de CD chegava ao fim e precisava voltar ao começo, o motor do leitor 1x demorava meio segundo para voltar o laser — deixando um silêncio chato. Os engenheiros usavam o chip de memória PCM do Mega-CD para tocar um "remendo musical" enquanto o laser viajava de volta!',
        flowSteps: [
          { tag: 'YM2612 + PSG', text: '6 canais FM (canal 6 toca PCM 8-bit @ 32 kHz) + 4 canais PSG guiados pelo Z80.' },
          { tag: 'Ricoh 8ch PCM', text: 'Chip RF5C164 no Mega-CD com 64 KB de Wave RAM para instrumentos e vozes.' },
          { tag: 'Truque Sonic CD', text: 'Na beta e no remaster de Sonic CD, o PCM cobria o atraso do laser 1x ao repetir músicas!' }
        ],
        insight:
          'Verificado em Copetti (Seção Bônus Som do Mega-CD): Como o laser 1x demorava para voltar ao início da faixa no loop de músicas CD-DA, Sonic CD (na versão protótipo e no remaster de 2011) usava o chip PCM para tocar um trecho de preenchimento e esconder o silêncio do laser!',
        speechSimple:
          '"Olhem que curiosidade incrível descoberta nos artigos do Copetti sobre o som do Mega-CD: além do som clássico do Mega Drive e da música de CD, o Mega-CD tinha um chip de som com memória própria (PCM). Como o laser de 1x demorava um tempinho para voltar ao começo quando a música do CD repetia, em Sonic CD eles programaram esse chip de memória para tocar alguns acordes exatamente durante a viagem do laser, evitando que a música ficasse muda!"',
        speechTech:
          '"O Z80 controla o Yamaha YM2612 (6 canais FM; canal 6 aceita PCM 8-bit @ 32 kHz) e o SN76489, somados ao Ricoh RF5C164 (8 canais PCM com 64 KB) e 2 canais CD-DA. Como destaca Copetti no Bônus do Mega-CD, o chip PCM era usado para mascarar o seek time do laser 1x nos loops de CD-DA."',
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
        simpleRole: 'O processador principal dentro do Mega Drive que controla os comandos do jogador, a física e a tela.',
        metrics: [
          { label: 'Clock', value: '7.67 MHz (NTSC) / 7.60 (PAL)' },
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
        simpleRole: 'A memória de 64 KB do Mega Drive junto com o "guarda de trânsito" que impede que as duas CPUs batam de frente.',
        metrics: [
          { label: 'Work RAM', value: '64 KB DRAM (68000)' },
          { label: 'Controle', value: 'Árbitro de Barramento' },
          { label: 'Função', value: 'Evita colisão 68000 / Z80' },
          { label: 'Pausa no DMA', value: 'VDP DMA pausa o 68000' }
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
        simpleRole: 'O chip de vídeo do Mega Drive: monta 4 camadas de imagem e pinta até 64 cores na TV.',
        metrics: [
          { label: 'VRAM Principal', value: '64 KB (Planos A, B, Janela, Sprites)' },
          { label: 'CRAM (Cores)', value: '128 B (64 de 512 cores + CRAM Dots)' },
          { label: 'VSRAM (Scroll)', value: '80 Bytes (Scroll Vertical)' },
          { label: 'Sprites', value: '80 na tela / 20 por linha (512×512)' }
        ],
        detail:
          'Seg. Copetti: Opera no Modo V (~13.4 MHz), renderizando 4 planos (Plano B, Plano A, Janela e até 80 sprites) e modos Shadow/Highlight. Alterar a CRAM durante a varredura ativa causa os famosos "CRAM Dots".'
      },
      {
        id: 'mcd-z80',
        title: 'Zilog Z80 + 8 KB RAM',
        spec: '~3.58 MHz • ALU 4-bit',
        subSpec: 'Comanda YM2612 (FM) + SN76489',
        category: 'audio',
        simpleRole: 'O processador auxiliar dedicado à música: trabalha sozinho regendo os chips de som para aliviar a CPU principal.',
        metrics: [
          { label: 'Clock', value: '3.58 MHz' },
          { label: 'Arquitetura', value: 'Regs 8-bit / ALU 4-bit' },
          { label: 'Sound RAM', value: '8 KB Dedicados' },
          { label: 'YM2612 PCM', value: 'Canal 6 toca PCM 8-bit @ 32 kHz' }
        ],
        detail:
          'Seg. Copetti: Possui registradores de 8 bits e ALU de 4 bits. Roda o driver de som nos seus 8 KB de RAM, disparando notas no Yamaha YM2612 (cujo canal 6 aceita PCM de 8 bits a 32 kHz) e no PSG SN76489.'
      },
      {
        id: 'mcd-asic',
        title: 'ASIC Gráfico (Mega-CD)',
        spec: 'Rotação e Escala Afim',
        subSpec: 'Converte Bitmap → Tiles 8×8 VDP',
        category: 'gpu',
        simpleRole: 'Chip especial do Mega-CD que faz efeitos de rotação, zoom e pista 3D que o Mega Drive sozinho não tinha.',
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
        simpleRole: 'As duas bancadas giratórias de 128 KB onde o Mega-CD deixa os gráficos prontos e o Mega Drive pega sem fila.',
        metrics: [
          { label: 'Capacidade', value: '256 KB DRAM' },
          { label: 'Modo 2M', value: '1 Bloco único de 256 KB' },
          { label: 'Modo 1M / 1M', value: '2 Bancos de 128 KB (Bank Swap)' },
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
        simpleRole: 'O segundo cérebro completo que vive dentro do Mega-CD: é 63% mais rápido que o do Mega Drive!',
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
        simpleRole: 'A mesa de trabalho gigante de 512 KB exclusiva do Mega-CD (8 vezes maior que a do Mega Drive!).',
        metrics: [
          { label: 'Capacidade', value: '512 KB DRAM (4 Mbit)' },
          { label: 'Proprietário', value: 'Sub-CPU 68000 (12.5 MHz)' },
          { label: 'Proteção', value: 'Write-Protection por blocos' },
          { label: 'Uso', value: 'Código do jogo, FMV e Áudio' }
        ],
        detail:
          'Memória principal do módulo Mega-CD. É 8 vezes maior que a Work RAM de 64 KB do Mega Drive original, permitindo armazenar fases inteiras carregadas do CD.'
      },
      {
        id: 'mcd-drive',
        title: 'Leitor CD-ROM (1x CLV)',
        spec: '150 KB/s + 16 KB Cache',
        subSpec: 'ISO 9660 + Áudio CD-DA',
        category: 'cd',
        simpleRole: 'O leitor óptico que lê 500 a 650 MB de fases, vídeos e músicas gravadas em estúdio.',
        metrics: [
          { label: 'Velocidade', value: '1x CLV (150 KB/s)' },
          { label: 'Buffer Local', value: '16 KB Cache' },
          { label: 'Capacidade', value: '500 MB – 650 MB' },
          { label: 'Áudio Óptico', value: 'Red Book CD-DA Estéreo' }
        ],
        detail:
          'Seg. Copetti: Leitor óptico de 1x controlado pela Sub-CPU. Como o laser 1x levava frações de segundo para buscar o início da faixa ao repetir músicas CD-DA, Sonic CD (beta/2011) usava o chip PCM para cobrir o intervalo.'
      },
      {
        id: 'mcd-pcm',
        title: 'Áudio: Ricoh RF5C164 + FM',
        spec: '8ch PCM (64 KB) + YM2612',
        subSpec: 'Total: 18 Canais Digitais/FM + CD-DA',
        category: 'audio',
        simpleRole: 'Adiciona 8 canais de áudio gravado (bateria, guitarra, vozes) com 64 KB próprios, além da música do CD.',
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
      { label: 'Copetti — PlayStation (Rev. Ago/2026)', url: 'https://www.copetti.org/writings/consoles/playstation' },
      { label: 'RetroReversing — PS1 (Rev. Out/2026)', url: 'https://www.retroreversing.com/ps1' }
    ],
    simulationSteps: [
      {
        step: 0,
        shortTitle: 'Visão Geral',
        title: 'SoC Sony CXD8530BQ: CPU + Motor 3D (GTE) + Vídeo (MDEC) + Scratchpad no Mesmo Chip',
        summary:
          'Diferente dos consoles anteriores que usavam CD como acessório, o PlayStation nasceu para o CD e o 3D: a Sony juntou dentro do mesmo chip a CPU de 32 bits (33.87 MHz), o calculador 3D (GTE), o descompressor de filmes (MDEC) e um "bloco de notas" de 1 KB (Scratchpad).',
        simpleAnalogy:
          'Em vez de espalhar vários chips distantes pela placa, a Sony colocou o Cérebro (CPU), o Engenheiro 3D (GTE), o Projetor de Cinema (MDEC) e um Bloco de Notas ultrarrápido (1 KB Scratchpad) morando dentro do mesmo prédio!',
        flowSteps: [
          { tag: 'Núcleo CW33300', text: 'MIPS R3000A (32-bit RISC @ 33.87 MHz) + CP0 (controle de sistema/cache).' },
          { tag: 'GTE (CP2) & MDEC', text: 'GTE projeta até 1.5M vértices 3D/s em ponto fixo (66 MIPS); MDEC descomprime vídeos.' },
          { tag: '1 KB Scratchpad', text: 'Sem D-Cache tradicional: 1 KB de SRAM ultrarrápida ($1F800000) dentro do chip!' }
        ],
        insight:
          'Verificado em Copetti & RetroReversing: O MDEC fica na mesma pastilha de silício (SoC CXD8530BQ), mas diferente do GTE (que é o coprocessador MIPS CP2), o MDEC é alimentado diretamente via canais de DMA 0 e 1!',
        speechSimple:
          '"Chegamos ao PlayStation de 1994! Diferente do PC Engine e do Mega-CD, onde o leitor de CD era um acessório vendido à parte, o PlayStation já nasceu projetado em torno do CD e do 3D. Olhem o bloco azul no canto superior esquerdo: a Sony colocou dentro do mesmo chip o processador principal, a calculadora de mundos 3D (GTE), o descompressor de vídeos de cinema (MDEC) e um bloquinho de notas super-rápido de 1 KB!"',
        speechTech:
          '"O coração do PS1 é o SoC Sony CXD8530BQ (núcleo LSI Logic CW33300 / MIPS R3000A a 33.87 MHz). No mesmo die residem a CPU RISC de 32 bits, o CP0, o motor geométrico GTE (CP2 a 66 MIPS em ponto fixo), o MDEC (via DMA) e 4 KB de I-Cache + 1 KB de Scratchpad SRAM."',
        activeNodes: ['ps1-cpu', 'ps1-ram', 'ps1-dma', 'ps1-biu'],
        activeBuses: [],
        packets: []
      },
      {
        step: 1,
        shortTitle: 'CD 2x & Sub Bus',
        title: 'Um "Computador Dentro do Leitor de CD" (2x — 300 KB/s) e a Ponte BIU',
        summary:
          'O subsistema de CD do PS1 é um pequeno computador próprio (com processador Motorola 68HC05 e 32 KB de RAM) que lê a 300 KB/s (2x), checa a trava física do disco preto e fica isolado na pista secundária (Sub Bus) pela ponte BIU.',
        simpleAnalogy:
          'Para que o leitor de CD e os controles (que são mais lentos) não atrapalhem a rodovia expressa de 32 bits do console, a Sony criou uma "via marginal" (Sub Bus) ligada por um pedágio inteligente (ponte BIU).',
        flowSteps: [
          { tag: 'Computador no CD', text: 'Tem CPU própria (Motorola 68HC05 com 16 KB ROM + 512 B RAM), DSP e 32 KB de SRAM.' },
          { tag: 'Trava Wobble SCEx', text: 'Verifica a ondulação física gravada no início do disco (SCEA/SCEE/SCEI) + LibCrypt.' },
          { tag: 'Ponte BIU', text: 'Separa o Sub Bus (16/8-bit: CD, SPU, BIOS de 512 KB) do Main Bus rápido (32-bit).' }
        ],
        insight:
          'Verificado em Copetti (Rev. 2026): O leitor de CD tem um microcontrolador Motorola 68HC05 completo que checa a ondulação física "Wobble Groove" (strings SCEA/SCEE/SCEI que gravadores comuns não copiavam) e decodifica áudio XA-ADPCM direto para a SPU!',
        speechSimple:
          '"Olhem o canto inferior direito: o leitor de CD do PlayStation tem o dobro da velocidade dos anteriores (300 KB/s) e traz um microcomputador próprio lá dentro! É esse pequeno chip do leitor que verifica aquela ondulação secreta nos famosos CDs pretos originais para impedir cópias piratas. Além disso, ele fica numa rua separada (Sub Bus) para não deixar a avenida principal lenta!"',
        speechTech:
          '"Como detalha Copetti, a Bus Interface Unit (BIU) isola o Sub Bus (16/8-bit) do Main Bus (32-bit). No Sub Bus vive o subsistema de CD 2x (300 KB/s, 620 MB), gerenciado por um Motorola 68HC05 (16 KB ROM / 512 B RAM) que valida o Wobble Groove (SCEA/SCEE/SCEI) e abastece 32 KB de SRAM."',
        activeNodes: ['ps1-cd', 'ps1-biu'],
        activeBuses: ['bus-ps1-cd-sub'],
        packets: [
          { pathId: 'path-ps1-cd-sub', color: '#f97316', label: '300 KB/s (2x CD)', badgeX: 605, badgeY: 400 }
        ]
      },
      {
        step: 2,
        shortTitle: 'DMA Assume o Bus',
        title: 'DMA Assume a Rodovia Principal (132 MB/s → 2 MB EDO) e a CPU Usa a Scratchpad',
        summary:
          'Quando o DMA Canal 3 transfere os arquivos do CD para os 2 MB de memória EDO DRAM, ele interdita a pista principal (Main Bus). A CPU fica bloqueada da RAM, mas continua trabalhando nos 1 KB da Scratchpad interna!',
        simpleAnalogy:
          'O DMA é como um trem expresso a 132 MB/s que fecha a avenida principal para descarregar o CD na memória de 2 MB. Enquanto a avenida está fechada, o Cérebro (CPU) não fica parado: ele continua fazendo contas no seu "bloquinho de notas de bolso" de 1 KB (Scratchpad)!',
        flowSteps: [
          { tag: 'DMA Toma o Bus', text: 'Seg. Copetti ("Taking over the CPU"): o DMA bloqueia o acesso da CPU ao Main Bus.' },
          { tag: '2 MB EDO DRAM', text: '4 chips de 512 KB EDO DRAM recebem os dados (mais os 64 KB do Kernel da BIOS).' },
          { tag: 'Escape na Scratchpad', text: 'A CPU continua rodando código no I-Cache (4 KB) e lendo dados na Scratchpad (1 KB)!' }
        ],
        insight:
          'Verificado em Copetti ("Taking over the CPU"): Sempre que qualquer um dos 7 canais de DMA assume o Main Bus, a CPU não consegue ler a RAM principal de 2 MB — por isso os programadores guardavam a pilha e cálculos rápidos dentro da Scratchpad de 1 KB!',
        speechSimple:
          '"Prestem atenção nesta animação verde e amarela no centro: quando os dados do CD atravessam a ponte e entram na avenida principal (Main Bus), o controlador de DMA fecha a avenida inteira para disparar os dados a 132 Megabytes por segundo até a memória principal de 2 MB! Durante esse instante, a CPU é proibida de usar a avenida — mas ela não trava porque continua trabalhando usando aquele bloquinho de notas interno de 1 KB!"',
        speechTech:
          '"Na seção Taking over the CPU, Copetti explica que o DMA assume posse exclusiva do Main Bus de 32 bits (132 MB/s) ao copiar do CD (Ch3) para os 2 MB de EDO DRAM. Com o barramento bloqueado, a CPU só evita ficar ociosa se executar rotinas no I-Cache (4 KB) operando sobre a Scratchpad de 1 KB ($1F800000)."',
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
        title: 'Cinema em Tela Cheia: MDEC Descomprime 9.000 Blocos/s em 24-bit',
        summary:
          'Para exibir aberturas e filmes (como em Final Fantasy e Resident Evil), o DMA Canal 0 leva os quadros comprimidos da RAM até o MDEC dentro do chip principal, que devolve imagens de cinema em 16,7 milhões de cores via DMA Canal 1.',
        simpleAnalogy:
          'Sabe aquelas aberturas de cinema famosas do PS1? Existe um "projetor de filmes" exclusivo (MDEC) dentro do chip principal: ele pega o vídeo compactado da memória, abre em 16 milhões de cores a 30 quadros por segundo e devolve pronto sem cansar o processador!',
        flowSteps: [
          { tag: 'DMA Ch0 (Entrada)', text: 'Envia os quadros comprimidos (parecidos com JPEG/MPEG) da EDO DRAM para o MDEC.' },
          { tag: 'MDEC (9.000 MB/s)', text: 'Descomprime 9.000 macroblocos 8×8/s convertendo YCbCr para RGB de 24 ou 15 bits.' },
          { tag: 'DMA Ch1 (Saída)', text: 'Devolve o vídeo a 320×240 @ 30 fps para a RAM/GPU sem ocupar o processador MIPS!' }
        ],
        insight:
          'Enquanto o Mega-CD precisava usar sua Sub-CPU para tentar descomprimir vídeos em poucas cores, o PS1 tinha o MDEC dedicado em hardware gerando filmes em True Color (24 bits) a 30 fps!',
        speechSimple:
          '"Quem jogou PlayStation lembra das aberturas em vídeo de tirar o fôlego. Como ele conseguia aquilo em 1994? Veja a animação rosa: os canais 0 e 1 do DMA levam o vídeo compactado da memória direto para o chip MDEC, um descompressor de cinema embutido no processador que entrega 30 quadros por segundo com 16 milhões de cores sem gastar a força da CPU!"',
        speechTech:
          '"Para reproduzir vídeos STR/FMV, o DMA Canal 0 alimenta o MDEC com fluxos comprimidos por DCT/RLE. O MDEC processa 9.000 macroblocos (8×8) por segundo em 24 bpp e o DMA Canal 1 devolve os frames a 30 fps para envio à GPU."',
        activeNodes: ['ps1-ram', 'ps1-dma', 'ps1-cpu'],
        activeBuses: ['bus-ps1-dma-ram', 'bus-ps1-dma-cpu'],
        packets: [
          { pathId: 'path-ps1-dma-cpu', color: '#ec4899', label: 'DMA Ch0/1: MDEC FMV', badgeX: 205, badgeY: 255 }
        ]
      },
      {
        step: 4,
        shortTitle: 'Pipeline 3D & SPU',
        title: 'Por que o 3D do PS1 Treme? GTE + Ordering Table → GPU (1 MB VRAM) e SPU (24 Vozes)',
        summary:
          'O GTE calcula os polígonos 3D e monta uma lista ordenada por distância (Ordering Table) na RAM. O DMA 2 envia tudo para a GPU (1 MB VRAM), enquanto o DMA 4 e o CD abastecem a SPU de 24 canais.',
        simpleAnalogy:
          'Por que as paredes dos jogos de PS1 pareciam "dançar" ou tremer? Porque a placa de vídeo (GPU) colava os adesivos das paredes (texturas) sem saber qual ponta estava mais longe (falta de Z-Buffer e perspectiva) e arredondava a posição dos cantos para números inteiros!',
        flowSteps: [
          { tag: 'GTE + Ordering Table', text: 'Calcula até 1.5M vértices/s e ordena os polígonos de trás para frente na RAM (Ch6 OTC).' },
          { tag: 'GPU (1 MB VRAM)', text: 'Quadro 1024×512 (Framebuffer + Texture Pages 256×256 + CLUTs) com 2 KB Texture Cache.' },
          { tag: 'SPU (508 KB + XA)', text: '24 canais 16-bit @ 44.1 kHz (508 KB úteis de 512 KB) + streaming direto XA-ADPCM do CD!' }
        ],
        insight:
          'Verificado em Copetti (Rev. 2026): Copetti desmistifica os 3 efeitos clássicos do 3D do PS1: (1) vértices "pulando" ocorrem porque a GPU amostra pixels inteiros sem resolução sub-pixel; (2) texturas entortando ocorrem pelo mapeamento afim sem profundidade Z; e (3) polígonos piscando vêm da falta de Z-Buffer!',
        speechSimple:
          '"Para fechar com chave de ouro, este passo explica o visual clássico do PS1! Primeiro, o motor GTE calcula o 3D e organiza os objetos do mais distante para o mais próximo numa lista na memória. Depois, o DMA 2 manda tudo para a placa de vídeo (GPU). E por que as paredes dos jogos de PS1 tremiam tanto? O site do Copetti explica que não era defeito do calculador 3D: é que a GPU arredondava os cantos dos triângulos para pixels inteiros e colava as texturas de forma reta, sem profundidade! Ao mesmo tempo, lá embaixo, o chip de som SPU toca 24 canais com qualidade de CD e eco de cinema!"',
        speechTech:
          '"O GTE projeta os vértices em ponto fixo e o DMA Ch6 limpa a Ordering Table na RAM. O DMA Ch2 envia a lista à GPU (1 MB VRAM 1024×512 com Texture Pages 256×256, CLUTs e 2 KB Texture Cache). Como detalha Copetti na revisão de 2026, o tremor vem da ausência de sub-pixel resolution na GPU, projeção afim e falta de Z-Buffer. Já a SPU usa 508 KB úteis (de 512 KB) para 24 vozes SPU-ADPCM, além de receber XA-ADPCM direto do controlador de CD!"',
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
        simpleRole: 'O super-chip principal: reúne na mesma peça o Cérebro (CPU), o Calculador 3D (GTE), o Descompressor de Filmes (MDEC) e 1 KB de bloco de notas.',
        metrics: [
          { label: 'Núcleo RISC', value: 'LSI CW33300 (MIPS R3000A)' },
          { label: 'Coprocessador 3D', value: 'CP2: GTE (66 MIPS / 1.5M vért/s)' },
          { label: 'Vídeo Hardware', value: 'MDEC (9.000 Macroblocos/s)' },
          { label: 'Memória Interna', value: '4 KB I-Cache + 1 KB Scratchpad' }
        ],
        detail:
          'Seg. Copetti & RetroReversing: Chip customizado pela LSI Logic que integra CPU RISC 32-bit (MIPS I ISA @ 33.87 MHz), CP0, motor geométrico GTE (CP2, sem FPU CP1), MDEC (via DMA), 4 KB de I-Cache e 1 KB de Scratchpad SRAM ($1F800000).'
      },
      {
        id: 'ps1-dma',
        title: 'Main Bus & DMA (7 Canais)',
        spec: '32-bit @ 132 MB/s',
        subSpec: 'Assume posse exclusiva do Main Bus',
        category: 'storage',
        simpleRole: 'A rodovia expressa de 7 pistas que transporta dados a 132 MB/s entre o CD, a memória, o vídeo e o som.',
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
        subSpec: 'Kernel (64KB), Jogo e Ordering Tables',
        category: 'ram',
        simpleRole: 'A mesa principal de trabalho de 2 Megabytes onde ficam a fase atual, os objetos 3D e a lista de distância dos polígonos.',
        metrics: [
          { label: 'Capacidade', value: '2 MB EDO DRAM (4× 512 KB)' },
          { label: 'PlayStation OS', value: '64 KB Kernel copiado da BIOS' },
          { label: 'Barramento', value: 'Conectada ao Main Bus (32-bit)' },
          { label: 'Ordenação 3D', value: 'Ordering Tables (Limpa via DMA Ch6)' }
        ],
        detail:
          'Seg. Copetti: A Sony adotou chips EDO DRAM que reduzem a latência entre leituras consecutivas. Guarda os 64 KB do Kernel copiados da BIOS no boot, o código do jogo e as Ordering Tables que ordenam os polígonos por profundidade Z.'
      },
      {
        id: 'ps1-biu',
        title: 'Bus Interface Unit (BIU)',
        spec: 'Ponte Main 32b ↔ Sub Bus 16/8b',
        subSpec: 'Conecta CD-ROM, SPU, BIOS (512 KB) e I/O',
        category: 'storage',
        simpleRole: 'O "pedágio inteligente" que separa a avenida rápida de 32 bits da rua secundária onde ficam o CD e os controles.',
        metrics: [
          { label: 'Lado Rápido', value: 'Main Bus (32-bit)' },
          { label: 'Lado Periférico', value: 'Sub Bus (16-bit / 8-bit)' },
          { label: 'BIOS ROM', value: '512 KB ROM no Sub Bus' },
          { label: 'Portas Frontais', value: 'Serial p/ Controles e Memory Card' }
        ],
        detail:
          'Seg. Copetti: Divide a placa-mãe em dois barramentos. A BIU faz a ponte entre o Main Bus de 32 bits e o Sub Bus de 16/8 bits onde residem a SPU, o controlador de CD-ROM, a BIOS de 512 KB e as portas seriais de controle/Memory Card.'
      },
      {
        id: 'ps1-gpu',
        title: 'Sony GPU + 1 MB VRAM',
        spec: 'Grade 1024×512 (16 bpp)',
        subSpec: '2KB Tex Cache • CLUT • Sem Z-Buffer',
        category: 'gpu',
        simpleRole: 'A placa de vídeo que desenha até 360 mil polígonos por segundo em um grande quadro de 1 MB onde cabem a tela da TV e os "adesivos" das texturas.',
        metrics: [
          { label: 'VRAM (1 MB)', value: 'Dual-Port VRAM (16b) → SGRAM (32b)' },
          { label: 'Cache Interno', value: '2 KB Texture Cache + 64B FIFO' },
          { label: 'Organização', value: 'Framebuffer + Tex Pages 256×256 + CLUT' },
          { label: 'Visual Clássico', value: 'Sem Sub-pixel • Projeção Afim • Sem Z-Buf' }
        ],
        detail:
          'Seg. Copetti (Rev. 2026) & RetroReversing: Enxerga 1 MB de VRAM (Dual-ported nas primeiras revisões, SGRAM 32-bit nas posteriores) como uma tela de 1024×512 onde ficam o Framebuffer (ex: 2× 512×240 para page-flipping), Texture Pages (256×256 em 4/8/15-bit) e paletas CLUT. Não tem resolução sub-pixel nem Z-Buffer.'
      },
      {
        id: 'ps1-spu',
        title: 'SPU (24 Canais ADPCM)',
        spec: '16-bit @ 44.1 kHz + 512 KB RAM',
        subSpec: '508 KB Úteis • XA-ADPCM • Reverb',
        category: 'audio',
        simpleRole: 'O estúdio de som com 24 vozes simultâneas em qualidade de CD, efeitos de eco (reverb) e ligação direta com o leitor de CD.',
        metrics: [
          { label: 'Polifonia', value: '24 Canais 16-bit @ 44.1 kHz' },
          { label: 'Sound RAM', value: '512 KB (508 KB úteis p/ o jogo)' },
          { label: 'Formatos ADPCM', value: 'SPU-ADPCM (RAM) + XA-ADPCM (CD)' },
          { label: 'DSP de Efeitos', value: 'Envelope ADSR + Reverb Digital' }
        ],
        detail:
          'Seg. Copetti (Rev. 2026): Dos 512 KB de Sound RAM, 508 KB ficam livres para samples SPU-ADPCM e 4 KB são reservados para captura/reverb. Também recebe áudio XA-ADPCM descomprimido direto pelo controlador de CD sem gastar Sound RAM!'
      },
      {
        id: 'ps1-cd',
        title: 'Subsistema CD-ROM (2x)',
        spec: '300 KB/s + 32 KB Buffer SRAM',
        subSpec: 'MCU 68HC05 (16KB ROM) • Trava SCEx',
        category: 'cd',
        simpleRole: 'Um computador próprio dentro do leitor que lê 620 MB no dobro da velocidade (2x) e confere a trava anti-pirataria dos discos pretos.',
        metrics: [
          { label: 'Velocidade / Disco', value: '2x CLV (300 KB/s) • 620 MB' },
          { label: 'Sub-CPU do CD', value: 'Motorola 68HC05 (512B RAM / 16KB ROM)' },
          { label: 'Buffer & Áudio', value: '32 KB SRAM + DMA Direto XA → SPU' },
          { label: 'Anti-Pirataria', value: 'Wobble Groove (SCEA/E/I) + LibCrypt' }
        ],
        detail:
          'Seg. Copetti (Rev. 2026) & RetroReversing: Um computador independente dentro do PS1. Seu Motorola 68HC05 lê a oscilação física Wobble Groove no Lead-In (SCEA/SCEE/SCEI), verifica checksums LibCrypt nos subcanais e descomprime setores CD-ROM XA direto para a SPU.'
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
    desc: 'Guarda 650 MB (centenas de vezes mais que uma fita de cartucho!), mas o laser precisa se mover fisicamente para ler. 1x lê 150 KB por segundo; 2x (no PS1) lê o dobro: 300 KB por segundo.'
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
    desc: 'O Barramento é a estrada que liga os chips. O DMA é um "trem expresso" que leva cargas pesadas direto do CD ou da memória para o vídeo sem precisar que o Cérebro (CPU) carregue caixa por caixa.'
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
  const [easyMode, setEasyMode] = useState(true); // Por padrão mostra a analogia fácil + roteiro simples junto com o técnico!
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

  // Renderizador de Linha de Barramento com Fluxo Animado
  const renderBusLine = (busId, x1, y1, x2, y2, baseColor, width = 4.5) => {
    const active = isBusActive(busId);
    return (
      <g key={`${busId}-${x1}-${y1}-${x2}-${y2}`}>
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
                  Copetti &amp; RetroReversing (Verificado)
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
                  title="Alternar entre Explicação Fácil (Analogias) e Modo Apenas Técnico"
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
          ÁREA PRINCIPAL: DIAGRAMA EM DESTAQUE + PAINEL TÉCNICO E SIMPLES
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
                  CANVAS SVG INTERATIVO COM ANIMAÇÃO DE BARRAMENTOS E PACOTES
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
                          1.5M Vértices/s + Z-Sort
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
                        'Kernel (64KB), 3D e Ordering Table',
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
                        'Grade 1024×512 • 2KB Tex Cache',
                        'Tex Pages 256×256 + CLUT • Sem Z-Buffer',
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
                        'BIOS (512 KB) + Portas Controles',
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
                        '508 KB Úteis • XA-ADPCM • Reverb',
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
                        '300 KB/s (620 MB) + 32 KB SRAM',
                        'MCU 68HC05 (16KB ROM) • Trava SCEx',
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
                        DMA DIRETO DO CONTROLADOR DE CD: ÁUDIO XA-ADPCM / CD-DA → SPU (SEM GASTAR CPU/RAM)
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
                    Clique em qualquer bloco do diagrama para inspecionar • Setas ← → mudam o passo da animação
                  </text>
                </svg>
              </div>

              {/* BARRA DE LEGENDA DE CORES COMPACTA ABAIXO DO DIAGRAMA */}
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
                COLUNA DIREITA: PAINEL COM ANALOGIA SIMPLES + DETALHE TÉCNICO
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

                    {/* CAIXA DE ANALOGIA SIMPLES (PARA LEIGOS ENTENDEREM DE CARA) */}
                    {easyMode && currentSimData.simpleAnalogy && (
                      <div
                        className={`p-3 rounded-xl border-l-4 border-emerald-500 ${
                          lightMode ? 'bg-emerald-50 text-slate-800' : 'bg-emerald-950/35 text-emerald-100'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 mb-1">
                          <MessageSquareHeart className="w-3.5 h-3.5" />
                          Em Linguagem Simples (Analogia)
                        </div>
                        <p className="text-xs leading-relaxed font-medium">{currentSimData.simpleAnalogy}</p>
                      </div>
                    )}

                    {/* ROTEIRO DE FALA PARA APRESENTAR (VERSÃO FÁCIL / TÉCNICA) */}
                    {showSpeakerNotes && (
                      <div
                        className={`p-3 rounded-xl border-l-4 border-indigo-500 ${
                          lightMode ? 'bg-indigo-50 text-indigo-950' : 'bg-indigo-950/40 text-indigo-100'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5 mb-1">
                          <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-indigo-400">
                            <Mic className="w-3.5 h-3.5" />
                            {easyMode ? 'O que Falar (Fácil para Todos)' : 'O que Falar (Técnico)'}
                          </span>
                          <button
                            onClick={() => handleTabChange('script')}
                            className="text-[10px] font-bold text-indigo-400 hover:underline"
                          >
                            Ver Roteiro Completo →
                          </button>
                        </div>
                        <p className="text-xs italic leading-relaxed">
                          {easyMode ? currentSimData.speechSimple : currentSimData.speechTech}
                        </p>
                      </div>
                    )}

                    {/* Fluxo Técnico Numerado (Fácil de escanear visualmente) */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                        Resumo Técnico em 3 Pontos
                      </div>
                      {currentSimData.flowSteps.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                            lightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/70 border-slate-800/90'
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

                    {/* Insight Técnico Verificado nos Sites Originais */}
                    <div
                      className={`p-3 rounded-xl border-l-4 border-amber-400 ${
                        lightMode ? 'bg-amber-50/80 text-slate-800' : 'bg-amber-500/10 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-400 mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Curiosidade das Fontes Originais
                      </div>
                      <p className="text-xs leading-relaxed">{currentSimData.insight}</p>
                    </div>

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
                              className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition flex items-center gap-1 ${
                                lightMode
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
                          O que esta peça faz (Sem Jargão)
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

                    {/* Explicação Técnica Direta */}
                    <div
                      className={`p-3 rounded-xl border ${
                        lightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                        Detalhamento Técnico (Copetti &amp; RetroReversing)
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
                    speed: 'Acesso Direto nos Chips (XIP)',
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

            {/* Quadro Comparativo Limpo e Direto */}
            <div
              className={`p-5 rounded-2xl border overflow-x-auto ${
                lightMode ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0c1221] border-slate-800'
              }`}
            >
              <h3 className="text-base font-extrabold mb-3">
                Comparativo Técnico Verificado nos 4 Sites Originais (Copetti &amp; RetroReversing)
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
                    <td className="p-3">2º Motorola 68000 @ 12.5 MHz (Mega-CD) + Zilog Z80 (ALU 4-bit) + ASIC</td>
                    <td className="p-3">CP0 (Sistema) + CP2/GTE (3D 66 MIPS / 1.5M vért/s) + MDEC (9.000 macroblocos/s)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Memória RAM</td>
                    <td className="p-3">8 KB Base + 64 KB CD-RAM (256 KB Super CD) + 64 KB ADPCM + 2 MB (Arcade Card)</td>
                    <td className="p-3">64 KB (68k) + 8 KB (Z80) + 512 KB (PRG-RAM) + 256 KB (Word RAM) + 64 KB (PCM)</td>
                    <td className="p-3">2 MB EDO DRAM + 4 KB I-Cache + 1 KB Scratchpad SRAM ($1F800000)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Vídeo &amp; VRAM</td>
                    <td className="p-3">HuC6270 (VDC) + HuC6260 (VCE) • 64 KB VRAM (Words 16-bit) • 482 cores</td>
                    <td className="p-3">VDP (~13 MHz): 64 KB VRAM + 128 B CRAM (64 cores) + 80 B VSRAM + ASIC</td>
                    <td className="p-3">Sony GPU • 1 MB VRAM (1024×512, 2KB Tex Cache, CLUT) • Sem Sub-pixel / Sem Z-Buf</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Áudio &amp; CD-ROM</td>
                    <td className="p-3">6ch Waveform PSG (DDA 5/10-bit) + ADPCM (OKI) + CD 1x (150 KB/s, sem trava no CD)</td>
                    <td className="p-3">YM2612 (6ch FM / PCM 32kHz) + PSG + Ricoh 8ch PCM + CD 1x (150 KB/s)</td>
                    <td className="p-3">SPU 24ch (508 KB úteis + XA-ADPCM) + CD 2x (300 KB/s, 620 MB, 68HC05 Wobble SCEx)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Cartões das 4 Fontes Oficiais Utilizadas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[
                {
                  title: 'PC Engine Architecture',
                  author: 'Rodrigo Copetti (Rev. 2026)',
                  desc: 'Análise do HuC6280, MMU MPR de 21 bits, par gráfico VDC/VCE, DDA 10-bit e expansão CD-ROM².',
                  url: 'https://classic.copetti.org/writings/consoles/pc-engine/'
                },
                {
                  title: 'Arquitetura do Mega Drive / Genesis',
                  author: 'Rodrigo Copetti PT-BR (Rev. 2026)',
                  desc: 'Análise do Motorola 68000, Z80, Árbitro de Barramento, VDP (CRAM Dots) e som do Mega-CD.',
                  url: 'https://www.copetti.org/pt-br/writings/consoles/mega-drive-genesis/'
                },
                {
                  title: 'PlayStation (PS1) Architecture',
                  author: 'Rodrigo Copetti (Rev. 2026)',
                  desc: 'Análise do CW33300, GTE, MDEC, Scratchpad 1 KB, SPU (508 KB + XA-ADPCM) e mitos do 3D.',
                  url: 'https://www.copetti.org/writings/consoles/playstation'
                },
                {
                  title: 'PS1 Hardware Architecture',
                  author: 'RetroReversing (Rev. 2026)',
                  desc: 'Engenharia reversa do chip Sony CXD8530BQ (LSI Logic), subsistema de CD 68HC05 e DMA.',
                  url: 'https://www.retroreversing.com/ps1'
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
                    Use este guia para apresentar o simulador para qualquer público. Ele usa comparações do dia a dia (mesa de trabalho, depósito, bancada giratória e rodovia expressa) mantendo 100% de fidelidade aos artigos de Rodrigo Copetti e RetroReversing.
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
                  1º Passo (Quebra-Gelo): Como explicar as 5 peças de um videogame em 30 segundos
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
                    '"Para começar, vamos voltar para 1988 com o PC Engine, o primeiro videogame da história a usar CD-ROM. Antes dele, os jogos vinham em cartuchos que cabiam pouquíssima coisa, mas eram lidos instantaneamente. Quando colocaram um CD de 650 Megabytes nele, surgiu um desafio: o console original só tinha 8 KB de memória interna — uma mesinha minúscula!"',
                  steps: ARCHITECTURE_DATA.pce.simulationSteps
                },
                {
                  id: 'megacd',
                  badge: 'Parte 2 • 1991',
                  title: 'Sega Mega Drive + Mega-CD',
                  tagline: 'Força bruta em dupla: Dois processadores 68000 trocando desenhos por uma "bancada giratória".',
                  color: 'border-purple-500/50',
                  btnColor: 'bg-purple-600 hover:bg-purple-500',
                  introSpeech:
                    '"Três anos depois, em 1991, a Sega lançou o Mega-CD para o Mega Drive. Em vez de adicionar só um leitor de discos e memória, a Sega colocou praticamente um segundo videogame inteiro dentro do aparelho! Agora temos dois chefes trabalhando ao mesmo tempo."',
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

            {/* Resumo das Verificações nos 4 Sites Originais */}
            <div
              className={`p-5 rounded-2xl border ${
                lightMode ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0c1221] border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-extrabold uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-4 h-4" />
                Auditoria nas 4 Fontes Originais (Atualizações 2025/2026 Verificadas)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className={`p-3 rounded-xl border ${lightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                  <div className="font-extrabold text-orange-400 mb-1">1. PC Engine (classic.copetti.org)</div>
                  <p className={`text-[11px] leading-relaxed ${lightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                    Confirmado: Sem BIOS ROM interna no console base (boot via slot HuCard de 38 pinos); MMU com 8 registradores MPR (TAM/TMA) gerando 21 bits (2 MB); SATB atualizada por DMA interno do VDC; modo Direct D/A (DDA) de 5 ou 10 bits no áudio; e ausência de trava de região nos CDs (a trava física era a inversão dos pinos do HuCard nos EUA).
                  </p>
                </div>
                <div className={`p-3 rounded-xl border ${lightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                  <div className="font-extrabold text-purple-400 mb-1">2. Mega Drive PT-BR (copetti.org/pt-br)</div>
                  <p className={`text-[11px] leading-relaxed ${lightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                    Confirmado: 68000 com registradores de 32 bits e ALU/barramento de 16 bits; Z80 com ALU de 4 bits e 8 KB RAM coordenados pelo Árbitro de Barramento; VDP pausando o 68000 durante DMA e gerando &ldquo;CRAM Dots&rdquo; ao atualizar cores na varredura ativa; e seção bônus do Mega-CD explicando o uso do chip PCM em Sonic CD para cobrir o seek time do laser 1x.
                  </p>
                </div>
                <div className={`p-3 rounded-xl border ${lightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                  <div className="font-extrabold text-blue-400 mb-1">3 &amp; 4. PlayStation (Copetti &amp; RetroReversing)</div>
                  <p className={`text-[11px] leading-relaxed ${lightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                    Confirmado (incluindo o update de 06/2026 de Copetti): SoC CXD8530BQ (CW33300 @ 33.87 MHz, GTE 1.5M vértices/s, MDEC via DMA e 1 KB Scratchpad); SPU com 508 KB úteis de 512 KB + streaming XA-ADPCM direto do CD; GPU com 2 KB Texture Cache, Texture Pages 256×256 e CLUTs; e distinção exata entre falta de resolução sub-pixel (wobble), mapeamento afim (warping) e falta de Z-Buffer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
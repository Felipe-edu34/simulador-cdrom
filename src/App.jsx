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
// BASE DE DADOS EQUILIBRADA (RODRIGO COPETTI & RETROREVERSING)
// Mantém os nomes e números reais, mas com texto fluido, natural e fácil de falar!
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
        title: 'Console Base: CPU de 8 bits com Expansor de Memória (MMU)',
        summary:
          'O PC Engine usa o processador HuC6280 (8 bits a 7.16 MHz). Para superar o limite antigo de 64 KB dos chips de 8 bits, ele traz uma MMU interna que amplia o alcance para até 2 MB.',
        simpleAnalogy:
          'Imagine um trabalhador rápido que só consegue colocar 8 folhas na mesa por vez (64 KB), mas tem um fichário inteligente (MMU) que troca essas folhas rapidamente de um arquivo de 2 MB.',
        flowSteps: [
          {
            tag: 'CPU 8-bit Rápida',
            iconType: 'code',
            text: 'O chip HuC6280 roda a 7.16 MHz — um dos processadores de 8 bits mais rápidos da época.'
          },
          {
            tag: 'MMU (Paginação)',
            iconType: 'code',
            text: 'Divide a memória em páginas de 8 KB para conseguir enxergar até 2 MB no total.'
          },
          {
            tag: 'RAM Base (8 KB)',
            iconType: 'code',
            text: 'O console sozinho tem apenas 8 KB de RAM e nenhuma BIOS de CD interna.'
          }
        ],
        insight:
          'Por ter apenas 8 KB de memória interna, o PC Engine sozinho não tinha espaço para guardar arquivos vindos de um CD — por isso a unidade de CD precisou trazer memória extra.',
        speechSimple:
          '"Pessoal, este é o PC Engine de 1988, o primeiro videogame da história a usar CD-ROM. O cérebro dele é um chip de 8 bits muito rápido, mas que nasceu com apenas 8 KB de memória interna — o que bastava para cartões simples, mas exigiu memória extra para ler CDs."',
        speechTech:
          '"Começamos pelo PC Engine com o chip HuC6280 de 8 bits a 7.16 MHz. Para superar o limite de 64 KB dos processadores de 8 bits, a Hudson incluiu uma MMU interna que pagina blocos de 8 KB e expande o alcance para até 2 MB."',
        activeNodes: ['pce-cpu', 'pce-wram', 'pce-vdc', 'pce-vce'],
        activeBuses: [],
        packets: []
      },
      {
        step: 1,
        shortTitle: 'System Card',
        title: 'Slot de Cartucho (38 pinos): O Cartão que Ensina a Ler o CD',
        summary:
          'Como o console original não sabia ler CDs de fábrica, inserimos um cartão especial (System Card) na entrada de jogos para dar o sistema de boot (BIOS) e muito mais memória RAM.',
        simpleAnalogy:
          'Como o videogame nasceu sem saber o que é um CD, colocamos um "cartão-tradutor" (System Card) na entrada de jogos. Ele ensina o aparelho a usar o CD e ainda aumenta a mesa de trabalho (RAM).',
        flowSteps: [
          {
            tag: 'Slot HuCard',
            iconType: 'code',
            text: 'A System Card vai encaixada na mesma entrada onde entravam os jogos em cartão.'
          },
          {
            tag: 'Sistema (BIOS)',
            iconType: 'code',
            text: 'Fornece os comandos para controlar o motor e o laser do leitor de CD.'
          },
          {
            tag: 'Upgrade de RAM',
            iconType: 'code',
            text: 'A Super System Card adiciona +192 KB de RAM, e o Arcade Card adiciona +2 MB!'
          }
        ],
        insight:
          'Seg. Copetti: Os CDs do PC Engine não têm trava de região! A verificação acontecia apenas nos pinos do cartão inserido no slot HuCard.',
        speechSimple:
          '"Como o videogame original não sabia ler CDs, a solução foi colocar um cartão chamado System Card na entrada normal de jogos. Ele funciona como o manual de instruções do leitor de CD e ainda adiciona até 2 Megabytes de memória extra!"',
        speechTech:
          '"Como o PC Engine base não tinha BIOS de CD, inserimos a System Card no slot de 38 pinos: ela fornece o sistema operacional do CD-ROM² e expande a memória RAM em +192 KB (Super System Card) ou +2 MB (Arcade Card)."',
        activeNodes: ['pce-syscard', 'pce-cpu'],
        activeBuses: ['bus-pce-hucard'],
        packets: [
          {
            pathId: 'path-pce-hucard',
            color: '#f59e0b',
            type: 'code',
            label: 'BIOS + RAM Extra',
            badgeX: 365,
            badgeY: 105
          }
        ]
      },
      {
        step: 2,
        shortTitle: 'Leitura CD 1x',
        title: 'Leitura do CD em 1x (150 KB/s) pela Porta de Expansão',
        summary:
          'O leitor óptico lê o disco a 150 KB/s e guarda o código e os desenhos da fase nos 64 KB de memória RAM da base acoplada antes de enviá-los ao processador.',
        simpleAnalogy:
          'O CD guarda 650 MB, mas o laser 1x lê devagar. Por isso, ele copia primeiro os dados da fase atual para uma bancada de 64 KB dentro da base acoplada.',
        flowSteps: [
          {
            tag: 'Laser 1x (150 KB/s)',
            iconType: 'disc',
            text: 'Lê os dados do CD e envia pelo cabo SCSI até a base (Interface Unit).'
          },
          {
            tag: '64 KB CD-RAM',
            iconType: 'code',
            text: 'Guarda os arquivos da fase atual + 2 KB de memória com bateria para salvar o jogo.'
          },
          {
            tag: 'Porta Traseira',
            iconType: 'code',
            text: 'Conecta a base do CD diretamente ao processador do PC Engine.'
          }
        ],
        insight:
          'Diferente dos cartuchos (onde a leitura é instantânea), no CD é obrigatório copiar a fase para a memória RAM antes de jogar — criando as telas de Loading.',
        speechSimple:
          '"Vejam o ícone do CD viajando na linha laranja: o laser lê o disco a 150 KB por segundo e abastece uma memória de 64 KB na base do aparelho, além de contar com 2 KB para salvar o progresso do jogador."',
        speechTech:
          '"Para carregar uma fase, o leitor 1x lê o CD a 150 KB/s via barramento SCSI e abastece os 64 KB de RAM da Interface Unit (ou 256 KB no Super CD-ROM²), além de 2 KB de memória BRAM para saves."',
        activeNodes: ['pce-drive', 'pce-cdram', 'pce-cpu'],
        activeBuses: ['bus-pce-scsi', 'bus-pce-exp'],
        packets: [
          {
            pathId: 'path-pce-scsi',
            color: '#f97316',
            type: 'disc',
            label: '150 KB/s (Dados CD)',
            badgeX: 700,
            badgeY: 205
          },
          {
            pathId: 'path-pce-exp',
            color: '#38bdf8',
            type: 'code',
            label: 'Bus 8-bit Expansão',
            badgeX: 365,
            badgeY: 235
          }
        ]
      },
      {
        step: 3,
        shortTitle: 'Vídeo Dual-Chip',
        title: 'Dupla Gráfica de 16 bits: VDC (Desenha) + VCE (Colore)',
        summary:
          'O vídeo é dividido em dois chips de 16 bits: o VDC monta os cenários e personagens em uma VRAM de 64 KB e envia a imagem para o VCE aplicar até 482 cores na TV.',
        simpleAnalogy:
          'Dois artistas trabalham juntos: o primeiro chip (VDC) desenha os cenários e personagens em 16 bits, e o segundo chip (VCE) pinta tudo com até 482 cores antes de mostrar na TV.',
        flowSteps: [
          {
            tag: 'VRAM de 16 bits',
            iconType: 'image',
            text: 'Mesmo com CPU de 8 bits, a memória de vídeo (64 KB) trabalha em pares de 16 bits.'
          },
          {
            tag: 'VDC (Desenhista)',
            iconType: 'image',
            text: 'Monta o cenário em blocos (Tiles 8×8) e até 64 personagens móveis (Sprites).'
          },
          {
            tag: 'VCE (Pintor)',
            iconType: 'image',
            text: 'Recebe o desenho pronto e aplica 32 paletas (até 482 cores simultâneas na TV).'
          }
        ],
        insight:
          'Seg. Copetti: Embora a CPU seja de 8 bits, o chip de vídeo acessa a VRAM em 16 bits! Isso dobrava a velocidade gráfica e deixava o visual no nível dos consoles de 16 bits.',
        speechSimple:
          '"Olhem o ícone de imagem descendo pelos chips de vídeo: embora o processador seja de 8 bits, o vídeo trabalha em 16 bits! O primeiro chip (VDC) monta os cenários e 64 personagens, e o segundo chip (VCE) pinta até 482 cores na tela!"',
        speechTech:
          '"Aqui está o segredo gráfico apontado por Copetti: embora a CPU seja de 8 bits, o chip VDC organiza seus 64 KB de VRAM em palavras de 16 bits. Ele monta os tiles e sprites e envia um fluxo de 9 bits para o VCE colorir até 482 cores na TV."',
        activeNodes: ['pce-cdram', 'pce-cpu', 'pce-vdc', 'pce-vram', 'pce-vce'],
        activeBuses: ['bus-pce-exp', 'bus-pce-vdc', 'bus-pce-vce'],
        packets: [
          {
            pathId: 'path-pce-vdc',
            color: '#38bdf8',
            type: 'image',
            label: 'Sprites & Cenários 16b',
            badgeX: 175,
            badgeY: 315
          },
          {
            pathId: 'path-pce-vce',
            color: '#a855f7',
            type: 'image',
            label: 'Imagem 482 Cores',
            badgeX: 175,
            badgeY: 472
          }
        ]
      },
      {
        step: 4,
        shortTitle: 'Áudio Triplo',
        title: 'Som Triplo: Sintetizador na CPU + Vozes ADPCM + Música de CD',
        summary:
          'A unidade CD-ROM² junta os 6 canais de som da própria CPU com um chip exclusivo para vozes gravadas (ADPCM com 64 KB próprios) e música de CD tocando direto do laser.',
        simpleAnalogy:
          'É uma banda com 3 músicos: a CPU faz os efeitos de tiro/pulo, um chip com memória própria fala as vozes dos personagens e o CD toca a música gravada em estúdio!',
        flowSteps: [
          {
            tag: '6 Canais na CPU',
            iconType: 'audio',
            text: 'Gera ondas programáveis para efeitos sonoros (e até áudio digital de 5 ou 10 bits).'
          },
          {
            tag: '64 KB só p/ Vozes',
            iconType: 'audio',
            text: 'Memória exclusiva para vozes dubladas (ADPCM) sem roubar espaço dos gráficos.'
          },
          {
            tag: 'Música de CD',
            iconType: 'audio',
            text: 'Trilha sonora lida direto do disco óptico sem gastar memória RAM.'
          }
        ],
        insight:
          'Separar 64 KB exclusivos para o som ADPCM permitia ter falas dubladas sem diminuir o espaço dos gráficos na memória principal.',
        speechSimple:
          '"Para fechar o PC Engine, vejam o símbolo de música na linha verde: ele mistura a música de estúdio vinda direto do CD, um espaço exclusivo de 64 KB só para vozes dubladas e os efeitos sonoros saindo do processador!"',
        speechTech:
          '"O áudio mistura 3 fontes ao mesmo tempo: os 6 canais Waveform PSG dentro da CPU (com modo DDA de até 10 bits), os 64 KB exclusivos na unidade de CD para vozes em ADPCM e a trilha CD-DA lida direto do laser!"',
        activeNodes: ['pce-drive', 'pce-adpcm', 'pce-cpu'],
        activeBuses: ['bus-pce-audio'],
        packets: [
          {
            pathId: 'path-pce-audio',
            color: '#10b981',
            type: 'audio',
            label: 'Música CD + Vozes',
            badgeX: 735,
            badgeY: 360
          }
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
        simpleRole: 'O cérebro do console: comanda a lógica do jogo, troca páginas de memória e ainda gera 6 canais de som.',
        metrics: [
          { label: 'Clock', value: '1.79 / 7.16 MHz' },
          { label: 'Barramento', value: '8-bit Dados / 21-bit Addr' },
          { label: 'Paginação MMU', value: '8× Páginas de 8 KB (2 MB)' },
          { label: 'Áudio Interno', value: '6 Canais Waveform PSG' }
        ],
        detail:
          'Seg. Copetti: Baseado no 65C02, adiciona instruções rápidas de cópia em bloco e uma MMU com 8 registradores (MPR) que expandem o endereçamento de 64 KB para 2 MB, além de 6 canais de som internos.'
      },
      {
        id: 'pce-wram',
        title: 'Work RAM Base',
        spec: '8 KB SRAM Interna',
        subSpec: 'Memória Original do Console',
        category: 'ram',
        simpleRole: 'A pequena mesa de trabalho original do videogame (8 KB), usada para guardar as variáveis da partida.',
        metrics: [
          { label: 'Capacidade', value: '8 KB SRAM' },
          { label: 'Mapeamento', value: '1 Página de 8 KB na MMU' },
          { label: 'Acesso', value: 'Rápido (Sem fila de espera)' },
          { label: 'No CD-ROM²', value: 'Complementada pela RAM do CD' }
        ],
        detail:
          'Memória de trabalho original do console base. Como 8 KB bastavam para cartões ROM mas eram pequenos para dados de CD, o módulo CD-ROM² precisou adicionar novos bancos de RAM.'
      },
      {
        id: 'pce-vdc',
        title: 'VDC: HuC6270 (Vídeo)',
        spec: 'Barramento VRAM 16-bit',
        subSpec: 'Tiles 8×8 + 64 Sprites (DMA)',
        category: 'gpu',
        simpleRole: 'O "desenhista" de 16 bits: monta os blocos do cenário e posiciona até 64 personagens na tela.',
        metrics: [
          { label: 'Acesso VRAM', value: 'Palavras de 16 bits' },
          { label: 'Cenário', value: 'Camada de Tiles 8×8' },
          { label: 'Sprites', value: '64 na tela (16 por linha)' },
          { label: 'Saída Digital', value: 'Envia imagem 9-bit ao VCE' }
        ],
        detail:
          'Seg. Copetti: Embora a CPU seja de 8 bits, o VDC organiza a VRAM em palavras de 16 bits. Possui DMA interno para atualizar a tabela de 64 sprites (SATB) e envia os pixels para o VCE colorir.'
      },
      {
        id: 'pce-vram',
        title: 'VRAM Dedicada',
        spec: '64 KB SRAM (16-bit Words)',
        subSpec: 'Guarda Cenários e Sprites',
        category: 'ram',
        simpleRole: 'O caderno de desenho exclusivo do vídeo, lido em 16 bits para dobrar a velocidade dos gráficos.',
        metrics: [
          { label: 'Capacidade', value: '64 KB (32K Words × 16-bit)' },
          { label: 'Formato', value: '4 Planos de Bits (16 cores/bloco)' },
          { label: 'Sprites', value: '16×16 até 32×64 pixels' },
          { label: 'Ligação', value: 'Exclusiva do chip VDC' }
        ],
        detail:
          'Acessada diretamente pelo VDC em palavras de 16 bits. Isso permite ler duas linhas de gráfico de uma só vez, garantindo animações rápidas mesmo com uma CPU de 8 bits.'
      },
      {
        id: 'pce-vce',
        title: 'VCE: HuC6260 (Cores)',
        spec: '32 Paletas × 16 Cores',
        subSpec: 'Até 482 Cores na Tela (de 512)',
        category: 'gpu',
        simpleRole: 'O "pintor" do console: recebe o desenho do VDC e aplica as cores finais antes de mandar para a TV.',
        metrics: [
          { label: 'Paletas', value: '16 Cenário + 16 Sprites' },
          { label: 'Cores na Tela', value: 'Até 482 cores simultâneas' },
          { label: 'Catálogo Total', value: '512 cores (RGB 9-bit)' },
          { label: 'Saída de Vídeo', value: 'Sinal para a TV' }
        ],
        detail:
          'Seg. Copetti: Recebe os pixels vindos do VDC, consulta suas 32 paletas internas (16 para fundo e 16 para personagens) e gera o sinal de vídeo para a TV.'
      },
      {
        id: 'pce-syscard',
        title: 'System Card (HuCard)',
        spec: 'BIOS ROM + Expansão RAM',
        subSpec: '+192 KB (Super) ou +2 MB (Arcade)',
        category: 'storage',
        simpleRole: 'Cartão colocado na entrada de jogos que ensina o console a usar o CD e adiciona memória RAM extra.',
        metrics: [
          { label: 'Conector', value: 'Slot HuCard (38 pinos)' },
          { label: 'System Card', value: 'Sistema BIOS do CD-ROM²' },
          { label: 'Super System Card', value: 'BIOS + 192 KB de RAM extra' },
          { label: 'Arcade Card', value: 'BIOS + 2 MB de RAM extra' }
        ],
        detail:
          'Inserida no slot de cartucho do PC Engine. Fornece o sistema operacional do leitor de CD e expande a memória RAM para jogos mais pesados.'
      },
      {
        id: 'pce-cdram',
        title: 'CD-ROM² Work RAM',
        spec: '64 KB DRAM + 2 KB BRAM',
        subSpec: 'Memória das Fases + Saves',
        category: 'ram',
        simpleRole: 'Bancada de 64 KB na base do CD onde ficam os arquivos da fase atual, mais 2 KB para salvar o jogo.',
        metrics: [
          { label: 'RAM Geral', value: '64 KB (256 KB no Super CD)' },
          { label: 'Save Memory', value: '2 KB BRAM com bateria' },
          { label: 'Mapeamento', value: 'Páginas de 8 KB na MMU' },
          { label: 'Entrada', value: 'Recebe dados a 150 KB/s do CD' }
        ],
        detail:
          'Localizada na base (Interface Unit). Recebe o código e os gráficos lidos do CD-ROM antes de serem usados pela CPU e pelo chip de vídeo.'
      },
      {
        id: 'pce-adpcm',
        title: 'Áudio ADPCM + Mixer',
        spec: '64 KB ADPCM + OKI MSM5205',
        subSpec: 'Vozes Digitais + Música CD-DA',
        category: 'audio',
        simpleRole: 'Chip de som com 64 KB exclusivos só para falar as vozes dos personagens sem gastar a memória dos gráficos.',
        metrics: [
          { label: 'Memória de Voz', value: '64 KB Exclusivos' },
          { label: 'Decodificador', value: 'Chip OKI MSM5205' },
          { label: 'Qualidade', value: 'Vozes até 32 kHz' },
          { label: 'Saída Final', value: 'Mixa Vozes + Música do CD' }
        ],
        detail:
          'Seg. Copetti: Dedica 64 KB exclusivos para vozes e efeitos gravados (ADPCM), deixando a memória principal livre para o código e os cenários do jogo.'
      },
      {
        id: 'pce-drive',
        title: 'Leitor CD-ROM² (1x)',
        spec: '150 KB/s • Barramento SCSI',
        subSpec: '650 MB (Dados + Música de CD)',
        category: 'cd',
        simpleRole: 'O primeiro leitor de CD dos videogames: lê até 650 MB de fases, animações e músicas de estúdio.',
        metrics: [
          { label: 'Velocidade', value: '1x (150 KB por segundo)' },
          { label: 'Interface', value: 'Barramento SCSI-1' },
          { label: 'Capacidade', value: 'Até 650 MB por disco' },
          { label: 'Trava no Disco', value: 'Sem trava física no CD' }
        ],
        detail:
          'Primeira unidade de CD-ROM para videogames domésticos (1988). Lê trilhas de dados do jogo e faixas de música com qualidade de CD.'
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
        title: 'Mega Drive Base: 68000 + Z80 e o Árbitro de Barramento',
        summary:
          'O Mega Drive combina dois processadores: o Motorola 68000 (7.67 MHz) para o jogo e o Zilog Z80 (3.58 MHz) dedicado ao som, coordenados por um Árbitro de Barramento.',
        simpleAnalogy:
          'São dois funcionários trabalhando juntos: o chefe (68000) cuida do jogo e um assistente (Z80) cuida só da música, enquanto um "guarda de trânsito" (Árbitro) evita que os dois batam de frente.',
        flowSteps: [
          {
            tag: 'Motorola 68000',
            iconType: 'code',
            text: 'CPU principal a 7.67 MHz com barramento de 16 bits (enxerga até 16 MB).'
          },
          {
            tag: 'Zilog Z80 (Som)',
            iconType: 'audio',
            text: 'CPU auxiliar de 8 bits com 8 KB de RAM que comanda os chips de música.'
          },
          {
            tag: 'Árbitro de Bus',
            iconType: 'code',
            text: 'Pausa rapidamente uma CPU quando a outra precisa usar o mesmo caminho.'
          }
        ],
        insight:
          'Seg. Copetti: Como o 68000 e o Z80 não podem mexer na memória um do outro ao mesmo tempo, o Árbitro de Barramento organiza a vez de cada um sem travar o jogo.',
        speechSimple:
          '"No Mega Drive original temos dois processadores: o Motorola 68000 cuida do jogo e dos gráficos, enquanto o chip Z80 cuida exclusivamente da música. E existe um guarda de trânsito interno — o Árbitro de Barramento — que evita colisões quando os dois precisam usar a mesma estrada!"',
        speechTech:
          '"Na arquitetura da Sega analisada por Copetti, o Mega Drive usa dois processadores: o Motorola 68000 a 7.67 MHz (barramento e ALU de 16 bits) e o Z80 a 3.58 MHz para o som, coordenados por um Árbitro de Barramento."',
        activeNodes: ['mcd-maincpu', 'mcd-z80', 'mcd-arbiter', 'mcd-vdp'],
        activeBuses: [],
        packets: []
      },
      {
        step: 1,
        shortTitle: 'Sub-CPU 12.5 MHz',
        title: 'Mega-CD: Leitura 1x (150 KB/s) e um 2º Motorola 68000 Mais Veloz',
        summary:
          'O módulo Mega-CD adiciona um segundo processador Motorola 68000 rodando a 12.5 MHz (63% mais rápido) com 512 KB de memória própria para descomprimir fases e vídeos do CD.',
        simpleAnalogy:
          'O Mega-CD traz praticamente um segundo videogame inteiro lá dentro: um segundo "chefe" 63% mais rápido e uma mesa de 512 KB (8 vezes maior que a do Mega Drive)!',
        flowSteps: [
          {
            tag: 'Laser 1x (150 KB/s)',
            iconType: 'disc',
            text: 'Lê os arquivos do CD passando por um pequeno cache de 16 KB no leitor.'
          },
          {
            tag: '2º 68000 (12.5 MHz)',
            iconType: 'code',
            text: 'Roda 63% mais rápido que o Mega Drive para processar dados em paralelo.'
          },
          {
            tag: '512 KB PRG-RAM',
            iconType: 'code',
            text: 'Memória exclusiva dessa segunda CPU para guardar código, vídeos e fases.'
          }
        ],
        insight:
          'Com dois processadores 68000 reais rodando ao mesmo tempo, o Mega-CD podia descompactar vídeos e calcular efeitos enquanto o Mega Drive mantinha o jogo fluido.',
        speechSimple:
          '"Ao encaixar o Mega-CD, ganhamos um segundo processador Motorola 68000 rodando a 12.5 MHz — 63% mais rápido que o do próprio Mega Drive! Vejam o símbolo do CD abastecendo os 512 KB de memória exclusivos dessa segunda CPU."',
        speechTech:
          '"Ao conectar o Mega-CD, ganhamos um segundo Motorola 68000 rodando a 12.5 MHz. O leitor de 1x carrega os dados a 150 KB/s direto nos 512 KB de Program RAM exclusivos dessa Sub-CPU."',
        activeNodes: ['mcd-drive', 'mcd-subcpu', 'mcd-prgram'],
        activeBuses: ['bus-mcd-cd', 'bus-mcd-prg'],
        packets: [
          {
            pathId: 'path-mcd-cd',
            color: '#f97316',
            type: 'disc',
            label: '150 KB/s (Dados CD)',
            badgeX: 845,
            badgeY: 165
          },
          {
            pathId: 'path-mcd-prg',
            color: '#10b981',
            type: 'code',
            label: '512 KB PRG-RAM',
            badgeX: 700,
            badgeY: 222
          }
        ]
      },
      {
        step: 2,
        shortTitle: 'ASIC & Word RAM',
        title: 'Rotação no Chip ASIC e "Troca de Bancadas" (Word RAM 256 KB)',
        summary:
          'O chip gráfico ASIC do Mega-CD gira e redimensiona imagens dentro da Word RAM (256 KB) e alterna os bancos de memória (Bank Swap) para entregá-las prontas ao Mega Drive.',
        simpleAnalogy:
          'Como os dois processadores não podem mexer na mesma mesa juntos, eles usam duas bancadas giratórias de 128 KB (Bank Swap): enquanto o Mega-CD desenha na Bancada A, o Mega Drive lê a Bancada B!',
        flowSteps: [
          {
            tag: 'ASIC Gráfico',
            iconType: 'image',
            text: 'Faz rotação e zoom por hardware (estilo Mode 7) e já fatia a imagem em blocos 8×8.'
          },
          {
            tag: 'Word RAM (256 KB)',
            iconType: 'image',
            text: 'Funciona como 1 bloco de 256 KB ou dividida em 2 bancadas de 128 KB.'
          },
          {
            tag: 'Bank Swap',
            iconType: 'image',
            text: 'Enquanto o Mega-CD desenha num banco de 128 KB, o Mega Drive lê o outro sem fila!'
          }
        ],
        insight:
          'Os dois processadores 68000 não têm um fio direto entre si: toda entrega de gráficos do Mega-CD para o Mega Drive acontece trocando os bancos da Word RAM.',
        speechSimple:
          '"Olhem o ícone de imagem passando pelo meio: como o Mega Drive original não conseguia girar imagens ou dar zoom, o Mega-CD trouxe o chip gráfico ASIC. Ele gira a imagem dentro da Word RAM e troca a bancada (Bank Swap) para entregar o desenho pronto ao Mega Drive!"',
        speechTech:
          '"Como o VDP do Mega Drive não fazia rotação e escala por hardware, o Mega-CD trouxe o chip ASIC junto à Word RAM de 256 KB. O ASIC rotaciona a imagem, converte em tiles de 8×8 e faz o Bank Swap para o 68000 principal!"',
        activeNodes: ['mcd-subcpu', 'mcd-asic', 'mcd-wordram', 'mcd-maincpu'],
        activeBuses: ['bus-mcd-sub-word', 'bus-mcd-main-word'],
        packets: [
          {
            pathId: 'path-mcd-sub-word',
            color: '#a855f7',
            type: 'image',
            label: 'Rotação & Escala',
            badgeX: 485,
            badgeY: 225
          },
          {
            pathId: 'path-mcd-main-word',
            color: '#ec4899',
            type: 'image',
            label: 'Imagem Pronta (Swap)',
            badgeX: 330,
            badgeY: 210
          }
        ]
      },
      {
        step: 3,
        shortTitle: 'VDP & 3 Memórias',
        title: 'DMA do VDP (~13 MHz): VRAM (64 KB), CRAM (Cores) e VSRAM (Scroll)',
        summary:
          'O 68000 principal aciona o DMA do chip de vídeo (VDP) para puxar os gráficos prontos da Word RAM e preencher suas três memórias internas de imagem.',
        simpleAnalogy:
          'O chip de vídeo (VDP) guarda tudo em 3 gavetas separadas: uma grande para os desenhos (64 KB VRAM), uma caixinha de tintas para 64 cores (CRAM) e outra só para rolar o cenário (VSRAM).',
        flowSteps: [
          {
            tag: '64 KB VRAM',
            iconType: 'image',
            text: 'Guarda os 4 planos de imagem (Fundo B, Frente A, Janela e até 80 Sprites).'
          },
          {
            tag: '128 B CRAM (Cores)',
            iconType: 'image',
            text: 'Guarda 4 paletas de 16 cores (64 cores na tela de um catálogo de 512).'
          },
          {
            tag: '80 B VSRAM (Scroll)',
            iconType: 'image',
            text: 'Memória dedicada à rolagem vertical suave dos cenários.'
          }
        ],
        insight:
          'Seg. Copetti: Usando os modos de Sombra e Brilho (Shadow & Highlight) do VDP, o Mega Drive conseguia ampliar suas 64 cores para até 183 tonalidades na tela!',
        speechSimple:
          '"Vejam o ícone de imagem descendo até o chip VDP: ele puxa os gráficos prontos da Word RAM e organiza em três memórias internas — 64 KB para os cenários e 80 personagens, uma memória para 64 cores e outra só para o movimento do fundo!"',
        speechTech:
          '"Agora entra a estrutura interna do VDP detalhada por Copetti: ele possui três memórias separadas — 64 KB de VRAM para os 4 planos gráficos, 128 Bytes de CRAM para 64 cores e 80 Bytes de VSRAM para rolagem vertical, abastecidas via DMA!"',
        activeNodes: ['mcd-wordram', 'mcd-maincpu', 'mcd-vdp'],
        activeBuses: ['bus-mcd-main-word', 'bus-mcd-vdp'],
        packets: [
          {
            pathId: 'path-mcd-vdp',
            color: '#38bdf8',
            type: 'image',
            label: 'DMA -> 64KB Vídeo',
            badgeX: 165,
            badgeY: 315
          }
        ]
      },
      {
        step: 4,
        shortTitle: 'Som FM + PCM',
        title: 'Áudio: Yamaha YM2612 (FM) + Ricoh 8 Canais PCM + Música de CD',
        summary:
          'O Z80 controla o sintetizador FM (YM2612) no Mega Drive, somando-se aos 8 canais de áudio digital (Ricoh PCM) e à música de CD do Mega-CD.',
        simpleAnalogy:
          'Quando a música do CD ia repetir do início, o laser 1x demorava meio segundo para voltar. Em Sonic CD, eles usaram o chip de memória PCM para tocar um trecho musical e esconder o silêncio do laser!',
        flowSteps: [
          {
            tag: 'Yamaha YM2612',
            iconType: 'audio',
            text: '6 canais de síntese FM clássica + 4 canais PSG comandados pelo chip Z80.'
          },
          {
            tag: 'Ricoh 8ch PCM',
            iconType: 'audio',
            text: 'Chip no Mega-CD com 64 KB próprios para instrumentos gravados e vozes.'
          },
          {
            tag: 'Truque em Sonic CD',
            iconType: 'audio',
            text: 'O chip PCM tocava um preenchimento para disfarçar a volta do laser 1x no loop da música!'
          }
        ],
        insight:
          'Seg. Copetti (Bônus Som do Mega-CD): Como o leitor 1x demorava para reposicionar o laser ao repetir uma música do CD, o chip PCM era usado para cobrir esse intervalo sem deixar silêncio!',
        speechSimple:
          '"No som, temos o sintetizador FM clássico do Mega Drive somado a 8 canais digitais e música de CD. E uma curiosidade citada por Copetti: quando a música do CD voltava ao começo, Sonic CD usava o chip de memória PCM para cobrir o tempinho que o laser levava para voltar!"',
        speechTech:
          '"No áudio, o Z80 comanda o Yamaha YM2612 (6 canais FM) e o PSG, enquanto o Mega-CD adiciona 8 canais PCM (Ricoh RF5C164 com 64 KB) e áudio CD-DA — usado inclusive para mascarar o tempo de busca do laser 1x nos loops musicais."',
        activeNodes: ['mcd-z80', 'mcd-arbiter', 'mcd-pcm', 'mcd-drive'],
        activeBuses: ['bus-mcd-z80', 'bus-mcd-pcm'],
        packets: [
          {
            pathId: 'path-mcd-z80',
            color: '#f59e0b',
            type: 'audio',
            label: 'Z80 -> Som FM',
            badgeX: 165,
            badgeY: 440
          },
          {
            pathId: 'path-mcd-pcm',
            color: '#10b981',
            type: 'audio',
            label: '8ch PCM + Música CD',
            badgeX: 885,
            badgeY: 350
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
          { label: 'Clock', value: '7.67 MHz' },
          { label: 'Interno', value: 'Regs 32-bit / ALU 16-bit' },
          { label: 'Barramento', value: 'Dados 16-bit / Addr 24-bit' },
          { label: 'Alcance', value: 'Até 16 MB de memória' }
        ],
        detail:
          'Seg. Copetti: Processador híbrido 16/32 bits da Motorola. Seus registradores internos são de 32 bits, enquanto sua unidade aritmética (ALU) e seu barramento de dados operam em 16 bits.'
      },
      {
        id: 'mcd-arbiter',
        title: '64 KB RAM + Árbitro de Bus',
        spec: 'Work RAM 68k + Bus Arbiter',
        subSpec: 'Coordena acesso 68000 ↔ Z80',
        category: 'ram',
        simpleRole: 'A memória de 64 KB do Mega Drive junto com o "guarda de trânsito" que impede colisões entre as CPUs.',
        metrics: [
          { label: 'Work RAM', value: '64 KB DRAM (68000)' },
          { label: 'Controle', value: 'Árbitro de Barramento' },
          { label: 'Função', value: 'Evita colisão 68000 / Z80' },
          { label: 'No DMA', value: 'Pausa a CPU durante cópia VDP' }
        ],
        detail:
          'Seg. Copetti: Como o 68000 e o Z80 não podem acessar o barramento um do outro ao mesmo tempo, o Árbitro de Barramento pausa uma CPU enquanto a outra lê ou escreve.'
      },
      {
        id: 'mcd-vdp',
        title: 'VDP (Modo V + DMA)',
        spec: '64KB VRAM + 128B CRAM + 80B VSRAM',
        subSpec: 'Tiles 8×8 • 4 Planos • 64 Cores',
        category: 'gpu',
        simpleRole: 'O chip de vídeo do Mega Drive: monta 4 camadas de cenário/personagens e pinta até 64 cores na TV.',
        metrics: [
          { label: 'VRAM (Desenhos)', value: '64 KB (Planos A, B, W e Sprites)' },
          { label: 'CRAM (Cores)', value: '128 Bytes (64 de 512 cores)' },
          { label: 'VSRAM (Scroll)', value: '80 Bytes (Rolagem Vertical)' },
          { label: 'Sprites', value: 'Até 80 na tela (20 por linha)' }
        ],
        detail:
          'Seg. Copetti: Opera a ~13.4 MHz renderizando 2 planos de cenário, 1 plano Janela e até 80 sprites, com unidade de DMA própria para puxar gráficos rápido da memória.'
      },
      {
        id: 'mcd-z80',
        title: 'Zilog Z80 + 8 KB RAM',
        spec: '~3.58 MHz • ALU 4-bit',
        subSpec: 'Comanda YM2612 (FM) + SN76489',
        category: 'audio',
        simpleRole: 'O processador auxiliar dedicado à música: trabalha sozinho regendo os chips de som.',
        metrics: [
          { label: 'Clock', value: '3.58 MHz' },
          { label: 'Arquitetura', value: 'Regs 8-bit / ALU 4-bit' },
          { label: 'Memória Som', value: '8 KB Dedicados' },
          { label: 'Chips de Som', value: 'YM2612 (6ch FM) + PSG (4ch)' }
        ],
        detail:
          'Seg. Copetti: Roda o programa de música a partir de seus 8 KB de RAM, disparando notas no sintetizador FM Yamaha YM2612 e no PSG sem ocupar o Motorola 68000.'
      },
      {
        id: 'mcd-asic',
        title: 'ASIC Gráfico (Mega-CD)',
        spec: 'Rotação e Escala por Hardware',
        subSpec: 'Converte Imagem → Tiles 8×8 VDP',
        category: 'gpu',
        simpleRole: 'Chip especial do Mega-CD que gira imagens e cria pistas 3D (efeito que o Mega Drive sozinho não tinha).',
        metrics: [
          { label: 'Chip', value: 'Sega Custom ASIC' },
          { label: 'Efeitos', value: 'Rotação, Zoom e Perspectiva' },
          { label: 'Conversão', value: 'Imagem → Blocos 8×8 do VDP' },
          { label: 'Onde Atua', value: 'Trabalha direto na Word RAM' }
        ],
        detail:
          'Supre a falta de rotação e escala no Mega Drive original. Calcula a transformação na Word RAM e já entrega o desenho fatiado em blocos de 8×8 prontos para o VDP.'
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
          { label: 'Modo 1M / 1M', value: '2 Bancos de 128 KB (Swap)' },
          { label: 'Função', value: 'Ponte Mega-CD ↔ Mega Drive' }
        ],
        detail:
          'Ponte gráfica entre o Mega-CD e o Mega Drive. No modo 1M/1M, um processador desenha em um banco de 128 KB enquanto o outro lê o segundo banco sem espera.'
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
          { label: 'Ganho', value: '+63% mais rápido que a base' },
          { label: 'RAM Própria', value: '512 KB Program RAM' },
          { label: 'Funções', value: 'Controla CD, Vídeos e ASIC' }
        ],
        detail:
          'Segundo processador Motorola 68000 completo localizado dentro do Mega-CD. Descomprime vídeos, controla o leitor de CD e comanda o chip gráfico ASIC.'
      },
      {
        id: 'mcd-prgram',
        title: 'Program RAM (PRG-RAM)',
        spec: '512 KB DRAM Exclusiva',
        subSpec: 'Memória da Sub-CPU de 12.5 MHz',
        category: 'ram',
        simpleRole: 'A mesa de trabalho gigante de 512 KB exclusiva do Mega-CD (8 vezes maior que a do Mega Drive).',
        metrics: [
          { label: 'Capacidade', value: '512 KB DRAM' },
          { label: 'Dono', value: 'Sub-CPU 68000 (12.5 MHz)' },
          { label: 'Comparação', value: '8× maior que a RAM base' },
          { label: 'Uso', value: 'Código do jogo, Vídeo e Som' }
        ],
        detail:
          'Memória principal do módulo Mega-CD. É 8 vezes maior que os 64 KB do Mega Drive original, guardando fases inteiras e quadros de vídeo vindos do CD.'
      },
      {
        id: 'mcd-drive',
        title: 'Leitor CD-ROM (1x CLV)',
        spec: '150 KB/s + 16 KB Cache',
        subSpec: 'Dados + Música de CD (CD-DA)',
        category: 'cd',
        simpleRole: 'O leitor óptico que lê 500 a 650 MB de fases, aberturas em vídeo e músicas de estúdio.',
        metrics: [
          { label: 'Velocidade', value: '1x (150 KB por segundo)' },
          { label: 'Cache Local', value: '16 KB no leitor' },
          { label: 'Capacidade', value: '500 MB – 650 MB' },
          { label: 'Áudio Óptico', value: 'Música Estéreo de CD' }
        ],
        detail:
          'Seg. Copetti: Leitor óptico de 1x controlado pela Sub-CPU. Em loops de música de CD, jogos como Sonic CD usavam o chip PCM para disfarçar o tempo de retorno do laser.'
      },
      {
        id: 'mcd-pcm',
        title: 'Áudio: Ricoh RF5C164 + FM',
        spec: '8ch PCM (64 KB) + YM2612',
        subSpec: 'Total: 18 Canais + Música de CD',
        category: 'audio',
        simpleRole: 'Adiciona 8 canais de som gravado (bateria, guitarra, vozes) com 64 KB próprios, além da música do CD.',
        metrics: [
          { label: 'Chip Mega-CD', value: 'Ricoh RF5C164 (8 canais PCM)' },
          { label: 'Memória Som', value: '64 KB Wave RAM' },
          { label: 'Chips Base', value: 'YM2612 (6 FM) + PSG (4ch)' },
          { label: 'Streaming', value: 'Música CD-DA Estéreo' }
        ],
        detail:
          'Une o som FM clássico do Mega Drive aos 8 canais digitais PCM do Mega-CD e à música em qualidade de CD.'
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
        title: 'SoC Sony CXD8530BQ: CPU + Motor 3D (GTE) + Vídeo (MDEC) + Scratchpad no Mesmo Chip',
        summary:
          'A Sony uniu dentro do mesmo chip o processador de 32 bits (MIPS R3000A a 33.87 MHz), o calculador 3D (GTE), o descompressor de vídeo (MDEC) e uma memória interna ultrarrápida de 1 KB (Scratchpad).',
        simpleAnalogy:
          'Em vez de espalhar peças distantes pela placa, a Sony colocou o Cérebro (CPU), o Engenheiro 3D (GTE), o Projetor de Cinema (MDEC) e um Bloco de Notas rápido (1 KB Scratchpad) morando dentro do mesmo chip!',
        flowSteps: [
          {
            tag: 'CPU 32-bit (33.87 MHz)',
            iconType: 'code',
            text: 'Núcleo MIPS R3000A (CW33300) que comanda a lógica do jogo e os chips vizinhos.'
          },
          {
            tag: 'GTE (3D) & MDEC (Vídeo)',
            iconType: 'image',
            text: 'O GTE calcula até 1,5 milhão de pontos 3D/s e o MDEC descomprime vídeos de cinema.'
          },
          {
            tag: '1 KB Scratchpad',
            iconType: 'code',
            text: 'Memória ultrarrápida dentro do chip que funciona como um "bloco de notas" imediato.'
          }
        ],
        insight:
          'Colocar a CPU, o motor 3D (GTE) e o descompressor de vídeo (MDEC) dentro do mesmo chip eliminou atrasos: os cálculos 3D acontecem instantaneamente sem sair do processador!',
        speechSimple:
          '"Chegamos ao PlayStation de 1994! Diferente dos anteriores, onde o CD era um acessório, o PS1 já nasceu feito para o CD e para o 3D. Olhem o bloco azul no alto: a Sony colocou dentro do mesmo chip o processador, a calculadora 3D (GTE), o descompressor de filmes (MDEC) e um bloquinho de notas super-rápido de 1 KB!"',
        speechTech:
          '"O coração do PlayStation é o chip Sony CXD8530BQ a 33.87 MHz. Na mesma pastilha de silício vivem a CPU MIPS R3000A de 32 bits, o motor matemático GTE para cálculos 3D, o MDEC para vídeos e 1 KB de memória Scratchpad ultrarrápida!"',
        activeNodes: ['ps1-cpu', 'ps1-ram', 'ps1-dma', 'ps1-biu'],
        activeBuses: [],
        packets: []
      },
      {
        step: 1,
        shortTitle: 'CD 2x & Sub Bus',
        title: 'Leitura CD-ROM 2x (300 KB/s) e a Ponte BIU (Sub Bus Separado)',
        summary:
          'O PlayStation divide seus caminhos em dois: uma avenida rápida de 32 bits (Main Bus) e uma rua secundária (Sub Bus), ligadas pela ponte BIU. O leitor de CD 2x lê a 300 KB/s e checa a trava do disco preto.',
        simpleAnalogy:
          'Para que o leitor de CD e os controles (que são mais lentos) não atrapalhem a avenida expressa de 32 bits, a Sony criou uma "rua marginal" (Sub Bus) ligada por um pedágio inteligente (ponte BIU).',
        flowSteps: [
          {
            tag: 'Trava do Disco Preto',
            iconType: 'disc',
            text: 'O chip próprio do leitor confere a ondulação física gravada nos CDs originais (SCEx).'
          },
          {
            tag: 'Leitura 2x (300 KB/s)',
            iconType: 'disc',
            text: 'Tem o dobro da velocidade da geração anterior e guarda dados em 32 KB próprios.'
          },
          {
            tag: 'Ponte BIU',
            iconType: 'code',
            text: 'Isola os periféricos lentos (CD, Som, BIOS e Controles) na rua secundária (Sub Bus).'
          }
        ],
        insight:
          'Seg. Copetti: O leitor de CD tem um microcomputador próprio lá dentro (Motorola 68HC05) que controla o laser, checa a trava anti-pirataria e manda música direto para o chip de som!',
        speechSimple:
          '"Vejam o ícone do CD lá embaixo à direita: o leitor do PlayStation tem o dobro da velocidade dos anteriores (300 KB/s) e traz um microcomputador próprio que confere aquela ondulação secreta nos famosos CDs pretos originais. E ele fica numa rua separada (Sub Bus) para não deixar a avenida principal lenta!"',
        speechTech:
          '"Como explica Copetti, o PS1 divide seus barramentos em Main Bus (32 bits) e Sub Bus (16/8 bits) unidos pela ponte BIU. O leitor de CD 2x (300 KB/s) fica no Sub Bus, valida a trava física SCEx e abastece seu buffer de 32 KB."',
        activeNodes: ['ps1-cd', 'ps1-biu'],
        activeBuses: ['bus-ps1-cd-sub'],
        packets: [
          {
            pathId: 'path-ps1-cd-sub',
            color: '#f97316',
            type: 'disc',
            label: '300 KB/s (CD 2x)',
            badgeX: 605,
            badgeY: 400
          }
        ]
      },
      {
        step: 2,
        shortTitle: 'DMA Assume o Bus',
        title: 'DMA Canal 3 Assume a Avenida Principal (132 MB/s → 2 MB EDO RAM)',
        summary:
          'Quando o DMA transfere os arquivos do CD para os 2 MB de memória principal (EDO RAM), ele fecha o Main Bus só para ele. A CPU fica bloqueada da RAM, mas continua trabalhando nos 1 KB da Scratchpad!',
        simpleAnalogy:
          'O DMA é um trem expresso a 132 MB/s que fecha a avenida principal para descarregar o CD na memória de 2 MB. Enquanto a avenida está fechada, a CPU continua trabalhando no seu "bloquinho de bolso" de 1 KB (Scratchpad)!',
        flowSteps: [
          {
            tag: 'DMA Assume o Bus',
            iconType: 'code',
            text: 'O DMA bloqueia a avenida principal para copiar dados em rajadas de até 132 MB/s.'
          },
          {
            tag: '2 MB EDO DRAM',
            iconType: 'code',
            text: 'A memória principal recebe os cenários, texturas e objetos 3D vindos do CD.'
          },
          {
            tag: 'Scratchpad (1 KB)',
            iconType: 'code',
            text: 'Enquanto o DMA usa a RAM, a CPU continua trabalhando dentro da Scratchpad de 1 KB!'
          }
        ],
        insight:
          'Seg. Copetti ("Taking over the CPU"): É por isso que a Scratchpad de 1 KB é tão famosa no PS1 — os programadores guardavam as contas mais importantes nela para a CPU não ficar parada durante o DMA!',
        speechSimple:
          '"Olhem a animação no centro: quando o DMA leva os dados do CD para a memória principal de 2 MB, ele fecha a avenida principal inteira a 132 MB por segundo! Durante esse instante, a CPU não pode acessar a memória RAM, mas continua trabalhando sem travar dentro do seu bloquinho de notas de 1 KB (Scratchpad)!"',
        speechTech:
          '"Aqui acontece o ponto destacado por Copetti em Taking over the CPU: quando o DMA Canal 3 copia os dados do CD para os 2 MB de memória EDO DRAM a 132 MB/s, o DMA assume o controle exclusivo do Main Bus! A CPU fica bloqueada da RAM principal, mas continua operando dentro dos 1 KB da Scratchpad!"',
        activeNodes: ['ps1-cd', 'ps1-biu', 'ps1-dma', 'ps1-ram', 'ps1-cpu'],
        activeBuses: ['bus-ps1-cd-sub', 'bus-ps1-biu-dma', 'bus-ps1-dma-ram'],
        packets: [
          {
            pathId: 'path-ps1-biu-dma',
            color: '#f59e0b',
            type: 'code',
            label: 'Pedido DMA Ch3',
            badgeX: 405,
            badgeY: 350
          },
          {
            pathId: 'path-ps1-dma-ram',
            color: '#10b981',
            type: 'code',
            label: '132 MB/s -> 2MB RAM',
            badgeX: 500,
            badgeY: 225
          }
        ]
      },
      {
        step: 3,
        shortTitle: 'Vídeo FMV (MDEC)',
        title: 'Aberturas de Cinema (FMV) Descomprimidas pelo Chip MDEC',
        summary:
          'Para exibir aberturas e filmes em tela cheia, o DMA leva os quadros comprimidos da memória até o MDEC dentro do chip da CPU, que devolve imagens em 16 milhões de cores (24 bits) a 30 quadros por segundo.',
        simpleAnalogy:
          'Sabe aquelas aberturas de cinema famosas do PS1? Existe um "projetor de filmes" exclusivo (MDEC) dentro do chip principal que abre o vídeo em 16 milhões de cores sem cansar o processador!',
        flowSteps: [
          {
            tag: 'DMA Canal 0 (Vai)',
            iconType: 'video',
            text: 'Busca os quadros de vídeo compactados nos 2 MB de memória RAM.'
          },
          {
            tag: 'Chip MDEC',
            iconType: 'video',
            text: 'Descomprime 9.000 blocos por segundo em cores reais de 24 bits (16,7 milhões de cores).'
          },
          {
            tag: 'DMA Canal 1 (Volta)',
            iconType: 'video',
            text: 'Devolve o filme pronto a 30 fps para ser exibido na TV sem gastar a CPU!'
          }
        ],
        insight:
          'Graças ao MDEC dedicado dentro do chip principal, o PlayStation exibia vídeos em tela cheia com qualidade de cinema, muito acima dos vídeos granulados da geração de 16 bits.',
        speechSimple:
          '"Vejam o ícone de filme na linha rosa: quando o jogo toca uma abertura de cinema, o DMA leva o vídeo compactado da memória direto para o MDEC dentro do processador. Ele abre o vídeo em 16 milhões de cores a 30 quadros por segundo sem ocupar a CPU!"',
        speechTech:
          '"Quando o jogo roda uma cutscene em vídeo FMV, os canais 0 e 1 do DMA enviam os quadros comprimidos da RAM para o MDEC dentro do chip da CPU. Ele descomprime 9.000 macroblocos por segundo em cores de 24 bits a 30 fps sem ocupar o processador MIPS!"',
        activeNodes: ['ps1-ram', 'ps1-dma', 'ps1-cpu'],
        activeBuses: ['bus-ps1-dma-ram', 'bus-ps1-dma-cpu'],
        packets: [
          {
            pathId: 'path-ps1-dma-cpu',
            color: '#ec4899',
            type: 'video',
            label: 'Vídeo FMV 30fps',
            badgeX: 205,
            badgeY: 255
          }
        ]
      },
      {
        step: 4,
        shortTitle: 'Pipeline 3D & SPU',
        title: 'Gráficos 3D (GTE + Ordering Table) → GPU (1 MB VRAM) e Som SPU (24 Canais)',
        summary:
          'O GTE calcula o 3D e monta uma fila ordenada por distância (Ordering Table) na RAM, já que a GPU não tem Z-Buffer. O DMA 2 manda a imagem 3D para a GPU (1 MB VRAM) e o DMA 4 manda o som para a SPU.',
        simpleAnalogy:
          'Por que as paredes dos jogos de PS1 pareciam "tremer"? Porque a placa de vídeo (GPU) arredondava os cantos dos triângulos para pixels inteiros e colava as texturas retas, sem saber a profundidade!',
        flowSteps: [
          {
            tag: 'GTE + Ordering Table',
            iconType: 'image',
            text: 'O GTE projeta os triângulos 3D e organiza do mais distante ao mais próximo na RAM.'
          },
          {
            tag: 'DMA 2 → GPU (1 MB)',
            iconType: 'image',
            text: 'Envia os polígonos 3D e as texturas para o quadro de 1024×512 (1 MB VRAM) da GPU.'
          },
          {
            tag: 'DMA 4 → SPU (Som)',
            iconType: 'audio',
            text: 'Abastece os 512 KB da SPU para tocar 24 canais com qualidade de CD e eco digital.'
          }
        ],
        insight:
          'Seg. Copetti: Os cantos "pulando" nos jogos 3D do PS1 aconteciam porque a GPU desenhava apenas em coordenadas inteiras (sem sub-pixel), e as texturas entortavam por usar projeção afim sem profundidade Z!',
        speechSimple:
          '"Por fim, olhem o ícone de imagem indo para a placa de vídeo (GPU) na linha azul e o ícone de música indo para o som (SPU) lá embaixo! O motor GTE calcula o 3D e manda para o 1 MB de vídeo da GPU. E como explica o Copetti, as paredes do PS1 tremiam porque a GPU arredondava os cantos dos triângulos para pixels inteiros e não tinha sensor de profundidade (Z-Buffer)!"',
        speechTech:
          '"Veja como o 3D e o som fecham o ciclo: o GTE calcula a perspectiva e organiza os polígonos em uma Ordering Table na RAM, pois a GPU não tem Z-Buffer. O DMA Canal 2 envia a cena 3D e as texturas para o 1 MB de VRAM da GPU (grade 1024×512), enquanto o DMA Canal 4 e o CD abastecem as 24 vozes da SPU!"',
        activeNodes: ['ps1-cpu', 'ps1-ram', 'ps1-dma', 'ps1-gpu', 'ps1-spu'],
        activeBuses: ['bus-ps1-dma-cpu', 'bus-ps1-dma-ram', 'bus-ps1-dma-gpu', 'bus-ps1-dma-spu'],
        packets: [
          {
            pathId: 'path-ps1-dma-gpu',
            color: '#38bdf8',
            type: 'image',
            label: 'Imagem 3D + Texturas',
            badgeX: 800,
            badgeY: 235
          },
          {
            pathId: 'path-ps1-dma-spu',
            color: '#a855f7',
            type: 'audio',
            label: 'Som SPU (24 Vozes)',
            badgeX: 305,
            badgeY: 400
          }
        ]
      }
    ],
    components: [
      {
        id: 'ps1-cpu',
        title: 'SoC Sony CXD8530BQ',
        spec: '33.87 MHz • CW33300 (R3000A)',
        subSpec: 'CPU + GTE (3D) + MDEC + 1KB SRAM',
        category: 'cpu',
        simpleRole: 'O super-chip principal: reúne na mesma peça o Cérebro (CPU), o Calculador 3D (GTE), o Projetor de Filmes (MDEC) e 1 KB de bloco de notas.',
        metrics: [
          { label: 'Núcleo RISC', value: 'LSI CW33300 (MIPS R3000A)' },
          { label: 'Motor 3D (GTE)', value: '66 MIPS (1,5 milhão vértices/s)' },
          { label: 'Vídeo (MDEC)', value: '9.000 Macroblocos/s (30 fps)' },
          { label: 'Memória Interna', value: '4 KB I-Cache + 1 KB Scratchpad' }
        ],
        detail:
          'Seg. Copetti & RetroReversing: Chip customizado pela LSI Logic que reúne na mesma pastilha a CPU RISC de 32 bits (33.87 MHz), o motor 3D GTE, o descompressor de vídeo MDEC, 4 KB de cache de instruções e 1 KB de Scratchpad ultrarrápida.'
      },
      {
        id: 'ps1-dma',
        title: 'Main Bus & DMA (7 Canais)',
        spec: '32-bit @ 132 MB/s',
        subSpec: 'Assume posse exclusiva do Main Bus',
        category: 'storage',
        simpleRole: 'A avenida expressa de 7 pistas que transporta dados a 132 MB/s entre o CD, a memória, o vídeo e o som.',
        metrics: [
          { label: 'Velocidade', value: '32 bits @ 132 MB/s' },
          { label: 'Canais DMA', value: '7 Canais (MDEC, GPU, CD, SPU, OTC)' },
          { label: 'Regra de Trânsito', value: 'Assume o Main Bus por completo' },
          { label: 'Escape da CPU', value: 'Rodar nos 1 KB da Scratchpad' }
        ],
        detail:
          'Seg. Copetti ("Taking over the CPU"): Quando um canal de DMA é acionado, ele assume o Main Bus de 32 bits. Enquanto os dados viajam, a CPU fica impedida de acessar a RAM principal, podendo trabalhar apenas na sua Scratchpad de 1 KB.'
      },
      {
        id: 'ps1-ram',
        title: 'Main RAM: 2 MB EDO DRAM',
        spec: '4× 512 KB Chips EDO',
        subSpec: 'Código, Cenários 3D e Ordering Tables',
        category: 'ram',
        simpleRole: 'A mesa principal de trabalho de 2 Megabytes onde ficam a fase atual, os objetos 3D e a fila de distância dos polígonos.',
        metrics: [
          { label: 'Capacidade', value: '2 MB EDO DRAM (4× 512 KB)' },
          { label: 'Tecnologia', value: 'EDO (Mais rápida em leituras)' },
          { label: 'Ligação', value: 'Conectada ao Main Bus (32-bit)' },
          { label: 'Uso no 3D', value: 'Guarda as Ordering Tables' }
        ],
        detail:
          'Seg. Copetti: A Sony usou chips EDO DRAM de menor latência. Guarda o sistema (64 KB copiados da BIOS), o código do jogo e as Ordering Tables (listas que ordenam os polígonos de trás para frente).'
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
          { label: 'Função', value: 'Evita lentidão no Main Bus' }
        ],
        detail:
          'Seg. Copetti: Faz a ponte entre o Main Bus de 32 bits e o Sub Bus de 16/8 bits (onde ficam a SPU, o leitor de CD, a BIOS de 512 KB e as portas de controle e Memory Card).'
      },
      {
        id: 'ps1-gpu',
        title: 'Sony GPU + 1 MB VRAM',
        spec: 'Grade 1024×512 (16 bpp)',
        subSpec: '2KB Tex Cache • CLUT • Sem Z-Buffer',
        category: 'gpu',
        simpleRole: 'A placa de vídeo que desenha os polígonos 3D em um grande quadro de 1 MB onde cabem a imagem da TV e as texturas.',
        metrics: [
          { label: 'VRAM', value: '1 MB (Quadro 1024×512 pixels)' },
          { label: 'Cache Interno', value: '2 KB Texture Cache + 64B FIFO' },
          { label: 'O que Guarda', value: 'Tela da TV + Texturas + Cores CLUT' },
          { label: 'Visual Clássico', value: 'Sem Sub-pixel e Sem Z-Buffer' }
        ],
        detail:
          'Seg. Copetti: Enxerga seu 1 MB de VRAM como uma grande tela 2D de 1024×512 onde moram juntas a imagem visível na TV, as páginas de texturas (256×256) e as paletas CLUT. Por não ter sub-pixel nem Z-Buffer, gerava o famoso visual trêmulo do PS1.'
      },
      {
        id: 'ps1-spu',
        title: 'SPU (24 Canais ADPCM)',
        spec: '16-bit @ 44.1 kHz + 512 KB RAM',
        subSpec: '508 KB Úteis • XA-ADPCM • Reverb',
        category: 'audio',
        simpleRole: 'O estúdio de som com 24 vozes simultâneas em qualidade de CD, efeitos de eco (reverb) e ligação direta com o CD.',
        metrics: [
          { label: 'Vozes', value: '24 Canais Simultâneos' },
          { label: 'Qualidade', value: '16-bit @ 44.1 kHz (Qualidade CD)' },
          { label: 'Memória Som', value: '512 KB (508 KB livres p/ o jogo)' },
          { label: 'Áudio do CD', value: 'Recebe XA-ADPCM direto do leitor' }
        ],
        detail:
          'Seg. Copetti: Dos 512 KB de memória de som, 508 KB guardam efeitos e instrumentos do jogo e 4 KB servem para o eco digital (reverb). Também recebe músicas e vozes XA-ADPCM direto do CD sem gastar memória!'
      },
      {
        id: 'ps1-cd',
        title: 'Subsistema CD-ROM (2x)',
        spec: '300 KB/s (620 MB) + 32 KB SRAM',
        subSpec: 'Chip 68HC05 • Áudio XA • Trava SCEx',
        category: 'cd',
        simpleRole: 'Um computador próprio dentro do leitor que lê 620 MB no dobro da velocidade (2x) e confere a trava dos discos pretos.',
        metrics: [
          { label: 'Velocidade', value: '2x (300 KB/s) • 620 MB' },
          { label: 'CPU do Leitor', value: 'Motorola 68HC05 + 32 KB SRAM' },
          { label: 'Formatos', value: 'Dados, Música CD e CD-ROM XA' },
          { label: 'Anti-Pirataria', value: 'Ondulação Wobble SCEx no disco' }
        ],
        detail:
          'Seg. Copetti & RetroReversing: Funciona como um computador independente dentro do PS1. Seu chip Motorola 68HC05 controla a leitura a 300 KB/s, descomprime áudio XA direto para a SPU e verifica a ondulação física dos discos originais.'
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

  // ============================================================================
  // ÍCONES VETORIAIS MINIATURA PARA OS PACOTES ANIMADOS (IMAGEM, VÍDEO, SOM, CD, DADOS)
  // Desenhados centrados em (0,0) para viajar suavemente pelos barramentos sem poluir!
  // ============================================================================
  const renderMiniSvgIcon = (type) => {
    if (type === 'image') {
      // Símbolo de uma Imagem / Quadro (Moldura + Sol + Montanha)
      return (
        <g stroke="#ffffff" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x="-5.5" y="-4.5" width="11" height="9" rx="1.5" fill="#090d1644" />
          <circle cx="-2.2" cy="-1.6" r="1.1" fill="#ffffff" stroke="none" />
          <polyline points="-4.5,3.5 -1,0 1.5,2.5 3,1 5,3.5" />
        </g>
      );
    }
    if (type === 'video') {
      // Símbolo de Filme / Vídeo (Tela + Triângulo Play)
      return (
        <g stroke="#ffffff" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x="-5.5" y="-4.5" width="11" height="9" rx="1.5" fill="#090d1644" />
          <polygon points="-1.5,-2.2 -1.5,2.2 2.8,0" fill="#ffffff" stroke="none" />
        </g>
      );
    }
    if (type === 'audio') {
      // Símbolo de Nota Musical (Áudio / Música)
      return (
        <g stroke="#ffffff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M -2 3.5 L -2 -3.5 L 4 -4.5 L 4 2.5" />
          <circle cx="-3.3" cy="3.5" r="1.6" fill="#ffffff" stroke="none" />
          <circle cx="2.7" cy="2.5" r="1.6" fill="#ffffff" stroke="none" />
        </g>
      );
    }
    if (type === 'disc') {
      // Símbolo de Disco CD-ROM
      return (
        <g stroke="#ffffff" strokeWidth="1.4" fill="none">
          <circle cx="0" cy="0" r="5.2" fill="#090d1644" />
          <circle cx="0" cy="0" r="1.6" fill="#ffffff" stroke="none" />
        </g>
      );
    }
    // Padrão ('code'): Símbolo de Dados / Chip / Raio
    return (
      <g fill="#ffffff" stroke="none">
        <polygon points="0.8,-5 -4.2,0.8 -0.5,0.8 -1.2,5 4.2,-0.8 0.5,-0.8" />
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

  // Renderizador de Pacotes Animados com Símbolo Visual (Imagem, Vídeo, Áudio, CD, Dados)
  const renderAnimatedPackets = () => {
    const packets = currentSimData?.packets || [];
    return packets.map((pkt, idx) => (
      <g key={`${pkt.pathId}-${idx}`}>
        {/* Pacote Principal Viajando com o Símbolo Dentro (Ex: Símbolo de Imagem quando for gráfico!) */}
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

  // Ícone nos cartões de 3 passos do painel direito
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
          ÁREA PRINCIPAL: DIAGRAMA EM DESTAQUE + PAINEL FÁCIL DE LER E FALAR
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
                  CANVAS SVG INTERATIVO COM ANIMAÇÃO E ÍCONES NOS PACOTES
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
                          Scratchpad Interna
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
                        'Código, 3D e Ordering Table',
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
                        'Chip 68HC05 • Áudio XA • Trava SCEx',
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
                        STREAMING DIRETO DO LEITOR DE CD: ÁUDIO XA-ADPCM / CD-DA → SPU (SEM GASTAR CPU/RAM)
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
                    Clique em qualquer bloco do diagrama para inspecionar • Os pacotes animados mostram o ícone do dado (Imagem, Filme, Música ou CD)
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
                COLUNA DIREITA: PAINEL COM RESUMO FÁCIL DE FALAR + ANALOGIA
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

                    {/* Como Funciona Passo a Passo (Fácil de ler e falar, com ícone de Imagem/Música/CD!) */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                        Resumo Fácil de Explicar (3 Pontos)
                      </div>
                      {currentSimData.flowSteps.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                            lightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/70 border-slate-800/90'
                          }`}
                        >
                          {renderStepTypeBadge(item.iconType, idx)}
                          <div className="text-xs leading-relaxed">
                            <span className="font-extrabold text-blue-400 mr-1.5">{item.tag}:</span>
                            <span className={lightMode ? 'text-slate-700' : 'text-slate-300'}>{item.text}</span>
                          </div>
                        </div>
                      ))}
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

                    {/* Chips Ativos neste Passo (Pílulas Clicáveis) */}
                    <div>
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                        Chips Ativos neste Passo (Clique para ver)
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

            {/* Quadro Comparativo Limpo e Direto */}
            <div
              className={`p-5 rounded-2xl border overflow-x-auto ${
                lightMode ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0c1221] border-slate-800'
              }`}
            >
              <h3 className="text-base font-extrabold mb-3">
                Comparativo lado a lado (Segundo Rodrigo Copetti &amp; RetroReversing)
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
                    <td className="p-3">HuC6280 (8-bit @ 7.16 MHz) + MMU (expande para até 2 MB)</td>
                    <td className="p-3">Motorola 68000 @ ~7.67 MHz (Bus 16-bit, enxerga até 16 MB)</td>
                    <td className="p-3">SoC CXD8530BQ (MIPS R3000A @ 33.87 MHz, 32-bit RISC)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Chips Auxiliares</td>
                    <td className="p-3">Sem coprocessador (a CPU de 8 bits gerencia tudo via MMU)</td>
                    <td className="p-3">2º Motorola 68000 @ 12.5 MHz (Mega-CD) + Zilog Z80 (Som) + ASIC</td>
                    <td className="p-3">GTE (Geometria 3D a 66 MIPS) + MDEC (Vídeo FMV a 30 fps) no mesmo chip</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Memória RAM</td>
                    <td className="p-3">8 KB Base + 64 KB CD-RAM + 64 KB ADPCM + Upgrade System Card</td>
                    <td className="p-3">64 KB (Base) + 8 KB (Z80) + 512 KB (Mega-CD) + 256 KB (Word RAM)</td>
                    <td className="p-3">2 MB EDO DRAM + 4 KB Cache + 1 KB Scratchpad ultrarrápida</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Vídeo &amp; VRAM</td>
                    <td className="p-3">VDC (Desenha) + VCE (Colore) • 64 KB VRAM (16-bit) • 482 cores</td>
                    <td className="p-3">VDP: 64 KB VRAM + 128 B CRAM (64 cores) + 80 B VSRAM + ASIC</td>
                    <td className="p-3">Sony GPU • 1 MB VRAM (Quadro 1024×512) • Sem Z-Buffer</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Áudio &amp; CD-ROM</td>
                    <td className="p-3">6ch PSG + Vozes ADPCM + CD 1x (150 KB/s, sem trava no disco)</td>
                    <td className="p-3">Yamaha YM2612 (FM) + 8ch PCM (Ricoh) + CD 1x (150 KB/s)</td>
                    <td className="p-3">SPU 24 Canais (512 KB) + CD 2x (300 KB/s, trava física no disco preto)</td>
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
                  desc: 'Análise do HuC6280, MMU de 21 bits, dupla gráfica VDC/VCE e expansão CD-ROM².',
                  url: 'https://classic.copetti.org/writings/consoles/pc-engine/'
                },
                {
                  title: 'Arquitetura do Mega Drive / Genesis',
                  author: 'Rodrigo Copetti (PT-BR)',
                  desc: 'Análise do Motorola 68000, Z80, Árbitro de Barramento, VDP e som do Mega-CD.',
                  url: 'https://www.copetti.org/pt-br/writings/consoles/mega-drive-genesis/'
                },
                {
                  title: 'PlayStation (PS1) Architecture',
                  author: 'Rodrigo Copetti',
                  desc: 'Análise do chip principal, GTE, MDEC, Scratchpad de 1 KB, SPU e o visual 3D do PS1.',
                  url: 'https://www.copetti.org/writings/consoles/playstation'
                },
                {
                  title: 'PS1 Hardware Architecture',
                  author: 'RetroReversing',
                  desc: 'Engenharia reversa do chip Sony CXD8530BQ, subsistema de CD e canais de DMA.',
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
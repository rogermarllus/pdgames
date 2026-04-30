# 💀 RetroDungeon

> Um mini-game de combate tático baseado em D&D 5e, desenvolvido como atividade de estágio na PD Case com estética retrô e mecânicas fiéis ao sistema original.

**Desenvolvedor:** Roger Marllus Oliveira Leal  
**Organização:** PD Case  
**Deploy:** [retro-dungeon.vercel.app](http://retro-dungeon.vercel.app)

---

## Sobre o Projeto

**RetroDungeon** é um mini-game de combate por turnos inspirado no sistema D&D 5e (2014), desenvolvido como atividade de estágio na PD Case. O jogador escolhe um monstro para enfrentar e uma magia para utilizar, então batalha em turnos alternados usando ataques físicos, magias com cooldown e uma cura de emergência — tudo consumindo dados reais do sistema D&D por meio de uma API pública.

O projeto tem foco em arquitetura modular com Vanilla JS puro, sem frameworks, utilizando módulos ES nativos, gerenciamento de estado persistente, suporte offline via Service Worker e integração com bibliotecas de áudio e animação.

---

## Acesso

O jogo está hospedado no Vercel e pode ser acessado diretamente pelo navegador.

🔗 **[retro-dungeon.vercel.app](http://retro-dungeon.vercel.app)**

---

## Estrutura de Pastas

```
pdgames/
├── assets/
│   ├── audio/
│   │   ├── music/            # Trilhas sonoras (menu, preparação, combate, vitória, derrota)
│   │   └── sfx/              # Efeitos sonoros (hit, miss, spell, heal, random)
│   ├── fonts/                # Fontes locais
│   └── images/
│       ├── icons/            # Ícones de interface
│       ├── monsters/         # Arte dos monstros (.png)
│       └── main-art.png      # Arte principal da tela inicial
├── css/
│   ├── main.css              # Estilos globais e variáveis
│   ├── hud.css               # HUD de combate (barras de HP, status)
│   └── combat-log.css        # Log de ações do combate
├── js/
│   ├── pages/
│   │   ├── combat-preparation.js  # Seleção de monstro e magia
│   │   ├── combat-result.js       # Tela de resultado final
│   │   ├── error-loading.js       # Loading e tratamento de erros de API
│   │   └── index.js               # Tela inicial
│   ├── utils/
│   │   ├── animations.js     # Animações de impacto via anime.js
│   │   ├── audio.js          # Gerenciamento de músicas e SFX via Howler.js
│   │   ├── dice.js           # Parser e executor de notação de dados (ex: 2d6+3)
│   │   └── monsters.js       # Normalização dos dados brutos de monstros
│   ├── api.js                # Integração com a D&D 5e API 2014
│   ├── app.js                # Lógica principal do combate (loop de turnos)
│   ├── game.js               # Estado global do jogo
│   └── ui.js                 # Manipulação do DOM (HUDs, log, selects)
├── libs/
│   ├── anime.esm.min.js      # anime.js (local)
│   └── howler.min.js         # Howler.js (local)
├── pages/
│   ├── achievements.html     # Tela de conquistas
│   ├── combat-preparation.html
│   ├── combat-result.html
│   ├── combat.html
│   ├── credits.html          # Tela de créditos
│   ├── error-loading.html
│   └── offline-page.html     # Página exibida sem conexão
├── index.html                # Ponto de entrada da aplicação
├── sw.js                     # Service Worker (suporte offline)
└── README.md
```

---

## Funcionalidades

### Tela Inicial
- Verifica se há um jogo salvo no `localStorage`
- Habilita o botão **Carregar Jogo** apenas se um estado salvo existir
- Toca música de menu automaticamente

### Preparação de Combate
- Carrega lista de monstros filtrada (apenas os que possuem arte disponível)
- Carrega lista de magias curadas com dano configurado por nível
- Suporte a **seleção aleatória** de monstro e magia (com SFX)
- Exibe descrição dinâmica da magia selecionada (dano, tipo, cooldown)
- Redireciona para uma tela de loading que busca os dados completos antes de iniciar o combate

### Combate por Turnos
- **Ataque físico:** rola 1d20 + bônus vs. CA do monstro; dano com dado próprio do jogador
- **Magia:** causa dano mágico tipado, aplica imunidade/resistência/vulnerabilidade do monstro, entra em cooldown de 3 turnos
- **Cura:** uso único por combate, disponível apenas quando o jogador não está com HP máximo
- **Turno do monstro:** ataque automático com bônus e dado retirados diretamente da API
- **Desistência:** encerra o combate como derrota imediata

### Sistema de Dados
- Suporta notação padrão: `NdX`, `NdX+B`, `NdX-B`
- Fallback automático para `1d6` em notações inválidas
- Resultado mínimo garantido de 1

### Persistência de Estado
- Estado salvo no `localStorage` a cada troca de turno
- Jogo pode ser retomado a partir da tela inicial após fechar o navegador
- Estado limpo ao fim do combate (vitória ou derrota)

### Suporte Offline
- Service Worker (`sw.js`) para cache de assets estáticos
- Página dedicada (`offline-page.html`) exibida quando não há conexão disponível

### Tratamento de Erros de API
- Timeout configurável (padrão: 6 segundos)
- Detecção de ausência de conexão (`navigator.onLine`)
- Mensagens de erro categorizadas: `TIMEOUT`, `NO_CONNECTION`, `HTTP_ERROR:XXX`
- Tela dedicada com opção de **tentar novamente** sem perder o contexto da requisição

### Tela de Resultado
- Exibe **Vitória** ou **Derrota** com estilo visual distinto
- Estatísticas da partida: turnos jogados, uso de cura, HP restante
- Ações disponíveis: tentar de novo, novo combate, voltar ao início
- Toca trilha sonora correspondente ao resultado

---

## Integração com a API

**Base URL:** `https://www.dnd5eapi.co/api/2014`

| Endpoint | Uso |
|---|---|
| `GET /monsters` | Lista todos os monstros |
| `GET /monsters/{index}` | Dados completos de um monstro |
| `GET /spells` | Lista todas as magias |
| `GET /spells/{index}` | Dados completos de uma magia |

Os monstros e magias exibidos ao jogador são **subconjuntos curados** — apenas entradas com arte disponível no projeto ou com dano configurável são incluídas.

### Normalização de Monstros
Os dados brutos da API são normalizados pela função `normalizeMonster()`, que extrai:
- HP e CA (com suporte a múltiplos formatos de resposta)
- Bônus de ataque e dado de dano da primeira ação disponível
- Listas de imunidade, resistência e vulnerabilidade a dano

### Magias
O dano final da magia é resolvido com base no nível:
- **Cantrip (nível 0):** `damage_at_character_level[1]`
- **Nível 1:** `damage_at_slot_level[1]`

---

## Dependências

| Biblioteca | Uso |
|---|---|
| [Howler.js](https://howlerjs.com/) | Reprodução de músicas e efeitos sonoros |
| [anime.js](https://animejs.com/) | Animações de impacto no sprite do monstro |

Ambas são servidas **localmente** via `libs/`.

---

## Assets

### Músicas (`/assets/audio/music/`)
| Arquivo | Contexto |
|---|---|
| `main-menu.mp3` | Tela inicial |
| `preparation.mp3` | Seleção de monstro e magia |
| `combat.mp3` | Durante o combate |
| `victory.mp3` | Tela de vitória |
| `game-over.mp3` | Tela de derrota |

### SFX (`/assets/audio/sfx/`)
| Arquivo | Contexto |
|---|---|
| `hit.wav` | Acerto físico |
| `miss.wav` | Ataque errado |
| `spell.wav` | Conjuração de magia |
| `heal.wav` | Uso de cura |
| `random.wav` | Seleção aleatória |

### Monstros Disponíveis
`adult-bronze-dragon`, `balor`, `berserker`, `bugbear`, `cockatrice`, `dretch`, `gargoyle`, `giant-ape`, `giant-octopus`, `giant-scorpion`, `giant-shark`, `goblin`, `hell-hound`, `hill-giant`, `knight`, `lich`, `lion`, `lizardfolk`, `mimic`, `mummy-lord`, `nightmare`, `satyr`, `skeleton`, `spider`, `stone-golem`, `werewolf`, `worg`

### Magias Disponíveis
`acid-splash`, `burning-hands`, `chill-touch`, `eldritch-blast`, `fire-bolt`, `guiding-bolt`, `magic-missile`, `ray-of-frost`, `shocking-grasp`, `thunderwave`

---

## Tecnologias

- **Vanilla JavaScript** — ES Modules nativos, sem transpilação
- **HTML5 / CSS3** — Custom Properties, layouts responsivos
- **Service Worker** — Cache offline e resiliência de rede
- **Vercel** — Hospedagem e deploy contínuo

---

## Licença

Projeto desenvolvido por **Roger Marllus Oliveira Leal** como atividade de estágio na **PD Case**.  
Os dados de D&D 5e são fornecidos pela [D&D 5e API](https://www.dnd5eapi.co/) sob a licença da Wizards of the Coast.
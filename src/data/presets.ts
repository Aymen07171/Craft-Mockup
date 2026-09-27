import { NichePreset, FrameColor, CaseTypeOption } from '../types';

export const CASE_TYPE_OPTIONS: CaseTypeOption[] = [
  {
    id: 'slim',
    name: 'Slim Case',
    description: 'Ultra-thin sleek polycarbonate profile with vibrant gloss print',
    badge: 'Popular',
    finish: 'liquid-gloss',
  },
  {
    id: 'clear',
    name: 'Clear Case',
    description: 'Crystal-clear shock-absorbing hybrid frame with vivid artwork',
    badge: 'Transparent',
    finish: 'clear-hybrid',
  },
  {
    id: 'tough',
    name: 'Tough Case',
    description: 'Dual-layer armor with impact rubber lining & reinforced corners',
    badge: 'Heavy Duty',
    finish: 'tough-armor',
  },
  {
    id: 'silicone',
    name: 'Silicone Case',
    description: 'Soft-touch velvet matte liquid silicone finish with anti-glare',
    badge: 'Velvet Soft',
    finish: 'velvet-matte',
  },
  {
    id: 'protective',
    name: 'Protective Case',
    description: 'Raised camera bevel & drop-protection bumper casing',
    badge: 'All-Round',
    finish: 'tough-armor',
  },
];

export const FRAME_COLORS: FrameColor[] = [
  { id: 'natural-titanium', name: 'Natural Titanium', hex: '#8a857d', accentHex: '#c2beb6' },
  { id: 'obsidian-black', name: 'Obsidian Black', hex: '#1e1f22', accentHex: '#3b3d42' },
  { id: 'desert-titanium', name: 'Desert Sand Gold', hex: '#a68c74', accentHex: '#dfccb7' },
  { id: 'white-titanium', name: 'Alpine Silver', hex: '#d9dade', accentHex: '#f1f2f5' },
  { id: 'deep-violet', name: 'Cosmic Violet', hex: '#392d47', accentHex: '#6d5a85' },
];

export const NICHE_PRESETS: NichePreset[] = [
  {
    id: 'anime-vitrail',
    name: 'Anime Vitrail (Stained Glass)',
    badge: 'Popular • Stained Glass',
    description: 'Luminous translucent glass panes with ornate leadline came, celestial characters, and botanicals.',
    template: `A breathtaking 2D anime illustration of {{SUBJECT_POSE}}

surrounded by {{BOTANICAL}}, and a {{COMPANION}}.

The entire composition is designed in an intricate, vibrant stained glass
(vitrail) mosaic style.

Thick, elegant black outlines, translucent and luminous
{{COLOR_PALETTE}}.

High-detail anime art style infused with Art Nouveau
{{BORDER_THEME}} borders.

Flat lay, purely 2D graphic design, completely flat background.

Centered vertical composition, perfectly cropped for a rectangular print canvas.

No shading or 3D depth outside of the anime illustration style.

Aspect ratio: 9:16.

Do not include:
phone, phone case, mockup, device, shadows, 3D render, realistic photography.`,
    sampleImage: '/src/assets/images/sample_vitrail_pure2d_1790462384613.jpg',
    defaultPlaceholders: [
      {
        tag: 'SUBJECT_POSE',
        label: 'Subject & Pose',
        description: 'Main character and dynamic posture',
        value: 'celestial fox spirit samurai dual-wielding glowing katanas in a dynamic mid-air leap',
        options: [
          'celestial fox spirit samurai dual-wielding glowing katanas in a dynamic mid-air leap',
          'ethereal cyber shrine maiden with flowing luminous hair casting talisman warding seals',
          'armored dragon knight kneeling with greatsword enveloped in sacred light beams',
          'moonlit archer maiden drawing a glowing celestial bow amidst floating petals',
          'wandering ronin with straw hat standing poised against incoming winds',
          'winged celestial seraph anime girl with ornate gilded armor holding a crystal lotus',
        ],
      },
      {
        tag: 'BOTANICAL',
        label: 'Botanical Elements',
        description: 'Floral, vines, or foliage accents',
        value: 'cherry blossoms and weeping wisteria branches',
        options: [
          'cherry blossoms and weeping wisteria branches',
          'golden ginkgo leaves swirling in a cosmic vortex',
          'deep crimson spider lilies (higanbana) with thorny curving vines',
          'ornate art nouveau water lilies with winding aquatic stems',
          'luminescent night-blooming jasmine and wild thorny brambles',
          'cascading weeping willows intertwined with climbing ivy',
        ],
      },
      {
        tag: 'COMPANION',
        label: 'Companion Creature',
        description: 'Guardian, familiar, or spiritual beast',
        value: 'spirit fox with nine flame tails',
        options: [
          'spirit fox with nine flame tails',
          'cybernetic mechanical raven with neon cyan plumage',
          'ethereal jade koi fish swimming through floating star dust',
          'celestial horned stag with glowing crystal antlers',
          'miniature celestial dragon spiraling playfully through clouds',
          'shadow origami bird folding and unfolding in mid-flight',
        ],
      },
      {
        tag: 'COLOR_PALETTE',
        label: 'Color Palette',
        description: 'Stained glass glass colors and gemstone tones',
        value: 'deep sapphire indigo, vibrant crimson, luminous gold, and ethereal cyan',
        options: [
          'deep sapphire indigo, vibrant crimson, luminous gold, and ethereal cyan',
          'emerald green, warm amber gold, obsidian black, and rose quartz',
          'amethyst purple, midnight navy, iridescent teal, and platinum silver',
          'sunset vermillion, molten copper, royal violet, and pastel lilac',
          'monochrome charcoal leadlines with glowing molten gold and ruby glass',
          'ethereal opalescent pearl, pastel seafoam, and lavender dusk',
        ],
      },
      {
        tag: 'BORDER_THEME',
        label: 'Border Theme',
        description: 'Architectural or filigree case border',
        value: 'art nouveau brass filigree frame with celestial star constellations',
        options: [
          'art nouveau brass filigree frame with celestial star constellations',
          'gothic cathedral pointed arch with delicate trefoil tracery and floral engraving',
          'ornate Japanese torii gate pillars with geometric seigaiha wave motifs',
          'celestial zodiac wheel with gilded astronomical rings and crescent moons',
          'antique baroque gilded scrollwork with symmetrical acanthus leaf borders',
          'minimalist modern leadline border with delicate beveled diamond corners',
        ],
      },
    ],
  },
  {
    id: 'cyberpunk-mecha',
    name: 'Cyberpunk & Mecha Urban',
    badge: 'Sci-Fi • Techwear',
    description: 'High-contrast futuristic mecha components, tactical tech decals, and holographic neon accents.',
    template:
      'Tactical cyberpunk phone case print, {{SUBJECT_POSE}}, augmented with {{COMPANION}}, surrounded by {{BOTANICAL}}, high-tech aesthetic, colorway of {{COLOR_PALETTE}}, framed by {{BORDER_THEME}}, industrial typography, holographic foil accents, 8k product render',
    defaultPlaceholders: [
      {
        tag: 'SUBJECT_POSE',
        label: 'Subject & Pose',
        description: 'Cyborg or pilot character',
        value: 'futuristic cyborg pilot in carbon-fiber exosuit crouching on rain-soaked skyscraper ledge',
        options: [
          'futuristic cyborg pilot in carbon-fiber exosuit crouching on rain-soaked skyscraper ledge',
          'streetwear anime hacker with holographic visor and oversized techwear parka',
          'heavy combat android unit holding railgun with glowing ventilation exhaust',
          'cyber samurai wielding thermal blade with sparks flying in dark alley',
        ],
      },
      {
        tag: 'COMPANION',
        label: 'Mechanical Familiar',
        description: 'Drone or cybernetic beast',
        value: 'reconnaissance surveillance drone with multi-sensor optic cluster',
        options: [
          'reconnaissance surveillance drone with multi-sensor optic cluster',
          'quadrupedal robotic courier hound with glowing status lights',
          'swarming micro-drones emitting digital interference rings',
          'cybernetic falcon with razor carbon fiber wings',
        ],
      },
      {
        tag: 'BOTANICAL',
        label: 'Urban Flora / Wiring',
        description: 'Tech plants or circuit wiring',
        value: 'exposed fiber-optic cable vines intertwined with neon bio-luminescent moss',
        options: [
          'exposed fiber-optic cable vines intertwined with neon bio-luminescent moss',
          'synthetic hydroponic neon sakura branches growing through concrete',
          'braided coolant tubes and copper busbars forming organic branch patterns',
          'shattered holo-glass shards with digitized floral light projections',
        ],
      },
      {
        tag: 'COLOR_PALETTE',
        label: 'Color Palette',
        description: 'Neon and metallic accents',
        value: 'acid neon lime, electric cyan, matte stealth black, and warning hazard orange',
        options: [
          'acid neon lime, electric cyan, matte stealth black, and warning hazard orange',
          'hot magenta, cyberpunk yellow, deep midnight purple, and chrome silver',
          'monochrome stealth carbon gray with blinding ultraviolet accents',
          'crimson red, gunmetal titanium, and glowing white LED strips',
        ],
      },
      {
        tag: 'BORDER_THEME',
        label: 'Border Theme',
        description: 'Tech decals and telemetry frames',
        value: 'tactical HUD military targeting grid with serial number telemetry and warning barcodes',
        options: [
          'tactical HUD military targeting grid with serial number telemetry and warning barcodes',
          'hexagonal carbon weave border with chamfered corner bumpers and caution stripes',
          'circuit board PCB copper trace lines framing perimeter with solder pads',
          'minimalist industrial stencil typography and caution hazard diagonal strips',
        ],
      },
    ],
  },
  {
    id: 'botanical-tarot',
    name: 'Dark Botanical & Celestial Tarot',
    badge: 'Luxury • Mystical',
    description: 'Elegantly etched botanical flora, golden astrological celestial diagrams, and vintage luxury engravings.',
    template:
      'High-end mystical luxury phone case graphic, {{SUBJECT_POSE}}, accompanied by {{COMPANION}}, intertwined with {{BOTANICAL}}, celestial tarot iconography, color palette of {{COLOR_PALETTE}}, bordered by {{BORDER_THEME}}, gold foil stamp finish, fine line woodcut engraving, clean black canvas',
    defaultPlaceholders: [
      {
        tag: 'SUBJECT_POSE',
        label: 'Central Symbol / Subject',
        description: 'Tarot or celestial persona',
        value: 'celestial celestial goddess of the moon holding a crescent sphere with closed serene eyes',
        options: [
          'celestial goddess of the moon holding a crescent sphere with closed serene eyes',
          'mystic alchemist hands holding a glowing prism casting sacred geometry rays',
          'crowned ouroboros serpent wrapped around a crystal dagger',
          'majestic celestial moth with open wings patterned with moon phases',
        ],
      },
      {
        tag: 'BOTANICAL',
        label: 'Botanical Flora',
        description: 'Herbal and floral illustrations',
        value: 'nightshade, dried poppy pods, and delicate climbing wild fern fronds',
        options: [
          'nightshade, dried poppy pods, and delicate climbing wild fern fronds',
          'blooming white peonies, olive branches, and eucalyptus sprigs',
          'sacred mandrake roots, eucalyptus leaves, and pomegranate blossoms',
          'delicate dried wheat sheaves and lavender sprigs woven in rings',
        ],
      },
      {
        tag: 'COMPANION',
        label: 'Astral Creature',
        description: 'Nocturnal animal or spirit',
        value: 'barn owl with speckled feathers and golden eyes perching softly',
        options: [
          'barn owl with speckled feathers and golden eyes perching softly',
          'slender black cat with crescent moon forehead marking',
          'mystical stag with glowing constellation stars on fur',
          'golden scarab beetle with iridescent wings spread wide',
        ],
      },
      {
        tag: 'COLOR_PALETTE',
        label: 'Color Palette',
        description: 'Luxury metallic and dark tones',
        value: 'burnished antique gold leaf, deep midnight pitch black, and muted sage green',
        options: [
          'burnished antique gold leaf, deep midnight pitch black, and muted sage green',
          'rose gold foil, velvety terracotta burgundy, and warm ivory',
          'champagne metallic, deep forest pine green, and aged parchment beige',
          'iridescent mother-of-pearl shimmer with fine black ink lines',
        ],
      },
      {
        tag: 'BORDER_THEME',
        label: 'Border Theme',
        description: 'Tarot frame and astronomical rings',
        value: 'classic Rider-Waite tarot card arch with solar rays, star charts, and Roman numerals',
        options: [
          'classic Rider-Waite tarot card arch with solar rays, star charts, and Roman numerals',
          'delicate concentric geometric rings with compass roses and lunar phase cycles',
          'ornate Victorian rococo gold foil filigree with crowned flourishes',
          'clean modern double-line gold hairline frame with corner crosshairs',
        ],
      },
    ],
  },
  {
    id: 'synthwave-sunset',
    name: 'Retro 80s Synthwave & Sunset',
    badge: 'Retro • 80s Nostalgia',
    description: 'Neon wireframe perspectives, neon chrome reflections, palm trees, and radical gradient horizons.',
    template:
      'Radical 80s retro synthwave phone case illustration, {{SUBJECT_POSE}}, accompanied by {{COMPANION}}, framed by silhouetted {{BOTANICAL}}, vibrant neon gradient horizon, colorway of {{COLOR_PALETTE}}, enclosed within {{BORDER_THEME}}, chrome typography accents, crisp vector illustration, 8k crisp details',
    defaultPlaceholders: [
      {
        tag: 'SUBJECT_POSE',
        label: 'Central Subject / Vehicle',
        description: 'Iconic retro vehicle or icon',
        value: 'vintage 1980s sports supercar speeding toward a giant neon wireframe sunset',
        options: [
          'vintage 1980s sports supercar speeding toward a giant neon wireframe sunset',
          'roller-skating anime girl wearing neon headphones on Miami boardwalk',
          'futuristic DeLorean hovering over a glowing purple wireframe perspective grid',
          'chrome robotic panther leaping forward through neon beams',
        ],
      },
      {
        tag: 'BOTANICAL',
        label: 'Silhouetted Botanicals',
        description: 'Tropical or desert plants',
        value: 'silhouetted tropical palm trees against glowing orange dusk',
        options: [
          'silhouetted tropical palm trees against glowing orange dusk',
          'neon wireframe wire-grid cactus and desert succulents',
          'geometric polygon foliage with laser gradient reflections',
          'stylized art deco fan palms with gradient neon leaves',
        ],
      },
      {
        tag: 'COMPANION',
        label: 'Retro Element',
        description: 'Floating synthwave objects',
        value: 'floating iridescent 80s cassette tape with glowing tape ribbon',
        options: [
          'floating iridescent 80s cassette tape with glowing tape ribbon',
          'flying digital flamingo with glowing neon wireframe contours',
          'wireframe prism pyramid casting split spectrum laser beams',
          'hovering arcade coin token with pixelated sparkles',
        ],
      },
      {
        tag: 'COLOR_PALETTE',
        label: 'Color Palette',
        description: 'Neon sunsets and laser lights',
        value: 'laser hot pink, electric cyan, sunset tangerine orange, and deep purple dusk',
        options: [
          'laser hot pink, electric cyan, sunset tangerine orange, and deep purple dusk',
          'outrun magenta, cobalt neon blue, sunburst yellow, and jet black',
          'pastel mint vaporwave, soft bubblegum pink, and lavender twilight',
          'chrome mirror metallic, radioactive lime green, and dark violet',
        ],
      },
      {
        tag: 'BORDER_THEME',
        label: 'Border Theme',
        description: 'Perspective grid and VHS frames',
        value: 'infinite perspective wireframe neon grid receding into horizon with VHS glitch badge',
        options: [
          'infinite perspective wireframe neon grid receding into horizon with VHS glitch badge',
          'neon laser tube perimeter glow with beveled geometric corner cuts',
          'retro arcade cabinet border with pixel stars and score counter',
          'clean dual neon pink and cyan offset racing stripes down the edge',
        ],
      },
    ],
  },
];


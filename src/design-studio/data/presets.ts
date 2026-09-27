import { NichePreset } from '../types';

export const NICHE_PRESETS: NichePreset[] = [
  {
    id: 'vitrail-woodland',
    name: 'Woodland Fox & Sunburst (Stained Glass)',
    badge: 'Reference 1 • Sleeping Fox',
    styleTag: 'Cathedral Stained Glass',
    description:
      'Sleeping woodland fox curled in a spiral, segmented amber sunburst halo, crescent moon, fly agaric mushrooms, acorns, and autumn oak leaves in backlit leaded glass.',
    defaultAspectRatio: '9:16',
    referenceNotes:
      'Directly matches Reference 1: Curled sleeping fox, radiant sunburst glass halo, crescent moon in upper arch, forest mushrooms & oak leaves, and symmetrical Art Nouveau leaded frame.',
    template: `Masterpiece authentic cathedral stained glass window (vitrail), symmetrical arched vertical composition.

In the center, {{SUBJECT_POSE}}.

Directly behind the subject is {{HALO_BACKGROUND}}.

Framed and grounded along the base and sides by {{BOTANICAL}}, and accompanied by {{COMPANION}}.

Rich translucent jewel-tone color palette of {{COLOR_PALETTE}}.

Enclosed within an intricate {{BORDER_THEME}}.

Authentic leaded came solder outlines, segmented colored glass panes, translucent backlit stained glass radiance, Louis Comfort Tiffany stained glass style, fine Art Nouveau botanical tracery, subtle glass textures and beveled leadlines.

Pure 2D flat-lay graphic art print, vertical 9:16 aspect ratio, clean full-bleed decorative art piece, sharp fine details, high-end collector print.

Do not include: phone, phone case, mockup, device, realistic photography, 3D render, modern clutter, shadows.`,
    sampleImage: '/src/assets/images/sample_vitrail_pure2d_1790462384613.jpg',
    defaultPlaceholders: [
      {
        tag: 'SUBJECT_POSE',
        label: 'Central Subject & Sleeping Pose',
        description: 'Sleeping woodland animal curled in a spiral',
        value: 'a peaceful sleeping red fox curled in a tight circle with fluffy tail wrapped around its body',
        options: [
          'a peaceful sleeping red fox curled in a tight circle with fluffy tail wrapped around its body',
          'a majestic silver wolf sleeping curled peacefully in a crescent moon pose on the forest floor',
          'a celestial horned stag resting gracefully with glowing crystal antlers tucked back',
          'a coiled mythical miniature emerald dragon sleeping within a sacred circle',
          'a mother bear and cub curled together in peaceful slumber',
        ],
      },
      {
        tag: 'HALO_BACKGROUND',
        label: 'Sunburst Halo & Celestial Arch',
        description: 'Sunburst rays or celestial halo behind subject',
        value: 'a radiant segmented sunburst halo with glowing amber and golden glass rays, with a golden crescent moon and twinkling stars in the upper arch',
        options: [
          'a radiant segmented sunburst halo with glowing amber and golden glass rays, with a golden crescent moon and twinkling stars in the upper arch',
          'a luminous solar mandala with concentric geometric glass rings and golden sunbeam facets',
          'a midnight celestial window arch with silver crescent moon phases and glittering diamond star glass',
          'an ornate cathedral rose-window mandala with intricate filigree glass petals',
        ],
      },
      {
        tag: 'BOTANICAL',
        label: 'Woodland Botanicals & Mushrooms',
        description: 'Forest foliage, acorns, and toadstools framing the base',
        value: 'red fly agaric mushrooms with white dots, golden chanterelles, acorns, autumn oak leaves, forest berries, and woodland fern fronds',
        options: [
          'red fly agaric mushrooms with white dots, golden chanterelles, acorns, autumn oak leaves, forest berries, and woodland fern fronds',
          'crimson maple leaves, mossy tree roots, wild blueberries, and delicate maidenhair ferns',
          'golden autumn ginkgo leaves, pine cones, glowing forest moss, and blooming heather',
          'wild blackberries on thorny brambles, hazelnut clusters, and lichen-covered stones',
        ],
      },
      {
        tag: 'COMPANION',
        label: 'Forest Familiar or Companion Accent',
        description: 'Small woodland creature or spirit element',
        value: 'subtle glowing woodland sprites and tiny sleeping dormice tucked among the leaves',
        options: [
          'subtle glowing woodland sprites and tiny sleeping dormice tucked among the leaves',
          'a small perched barn owl with speckled feathers watching quietly from the branch came',
          'a pair of miniature golden field mice resting by the mushroom stems',
          'gentle floating firefly glass sparks drifting through the dark forest glass',
        ],
      },
      {
        tag: 'COLOR_PALETTE',
        label: 'Glass Jewel Tones',
        description: 'Backlit translucent glass colors',
        value: 'warm amber gold, fiery autumn orange, deep russet red, forest moss green, deep teal indigo, and dark leaded came metallic outlines',
        options: [
          'warm amber gold, fiery autumn orange, deep russet red, forest moss green, deep teal indigo, and dark leaded came metallic outlines',
          'molten honey gold, burnt sienna, emerald green, midnight Prussian blue, and antique bronze solder',
          'amethyst purple, celestial sapphire, golden topaz, and rich jade green',
          'monochrome charcoal leadlines with glowing molten amber and ruby glass accents',
        ],
      },
      {
        tag: 'BORDER_THEME',
        label: 'Art Nouveau Arched Frame',
        description: 'Cathedral window frame and came tracery',
        value: 'Art Nouveau cathedral arched stained-glass frame with curving leadline came tracery, amber glass cabochons, and decorative border tiles',
        options: [
          'Art Nouveau cathedral arched stained-glass frame with curving leadline came tracery, amber glass cabochons, and decorative border tiles',
          'ornate gothic cathedral pointed arch with trefoil came tracery and beveled glass corner rosettes',
          'symmetrical floral vine leadwork arch with blooming leaf came and jewel roundels',
          'clean elegant double leadline border with faceted diamond cut glass corner blocks',
        ],
      },
    ],
  },
  {
    id: 'anime-mucha-wave',
    name: 'Anime Pirate & Great Wave (Art Nouveau Tarot)',
    badge: 'Reference 2 • Anime Tarot',
    styleTag: 'Art Nouveau Anime Tarot',
    description:
      'Heroic anime captain with straw hat, dynamic surging Great Waves, blooming sakura blossoms, celestial night arch, nautical ropes, and Alphonse Mucha decorative borders.',
    defaultAspectRatio: '9:16',
    referenceNotes:
      'Directly matches Reference 2: Anime protagonist with straw hat, dramatic Great Waves with foam crests, sakura cherry blossoms, celestial night sky arch with crescent moons, nautical ropes, and Mucha card border.',
    template: `Masterpiece Art Nouveau anime collectible tarot card illustration in the ornamental style of Alphonse Mucha and traditional Japanese ukiyo-e woodblock print.

In the center stands {{SUBJECT_POSE}}.

Background features {{HALO_BACKGROUND}}, complemented by {{COMPANION}}.

Surrounded and framed along the perimeter by {{BOTANICAL}}.

Refined color palette of {{COLOR_PALETTE}}.

Enclosed within an elaborate {{BORDER_THEME}}.

Crisp clean ink linework, ornamental anime poster aesthetic, delicate decorative flourishes, vintage Japanese collector card composition, flat lay 2D graphic illustration, vertical 9:16 aspect ratio, sharp fine details, masterpiece quality.

Do not include: 3D render, realistic photography, phone, mockup, modern clutter, distorted anatomy.`,
    sampleImage: '/src/assets/images/sample_vitrail_pure2d_1790462384613.jpg',
    defaultPlaceholders: [
      {
        tag: 'SUBJECT_POSE',
        label: 'Heroic Anime Subject & Attire',
        description: 'Anime character with pose and signature costume',
        value: 'a heroic anime pirate captain with straw hat touching the brim with one hand, a confident grin, open unbuttoned red vest showing toned chest with scar, blue denim shorts with white fur cuffs, and yellow sash belt',
        options: [
          'a heroic anime pirate captain with straw hat touching the brim with one hand, a confident grin, open unbuttoned red vest showing toned chest with scar, blue denim shorts with white fur cuffs, and yellow sash belt',
          'a wandering ronin anime swordsman in haori cloak resting hand on katana hilt against blowing winds',
          'a fierce anime demon hunter with patterned checkerboard haori drawing glowing nichirin blade',
          'a cybernetic anime warrior maiden standing poised with energy rapier and flowing twin tails',
          'a celestial shrine priestess in white and vermilion miko robes holding a golden kagura bell',
        ],
      },
      {
        tag: 'HALO_BACKGROUND',
        label: 'Celestial Arch & Surging Great Waves',
        description: 'Dynamic ocean waves and starry arch backdrop',
        value: 'dynamic surging Japanese ukiyo-e Great Waves with white foam crests and concentric wave ripples, beneath a deep indigo celestial arch with golden crescent moons and glittering stars',
        options: [
          'dynamic surging Japanese ukiyo-e Great Waves with white foam crests and concentric wave ripples, beneath a deep indigo celestial arch with golden crescent moons and glittering stars',
          'surging tidal waves with swirling white sea foam crests framing the character beneath a radiant golden sun disc',
          'a swirling vortex of cosmic stardust and celestial constellations over calm concentric ripples',
          'stormy tempest ocean waves illuminated by dramatic golden lightning bolts and moonlight',
        ],
      },
      {
        tag: 'BOTANICAL',
        label: 'Cherry Blossoms & Floral Accents',
        description: 'Traditional sakura blossoms and clouds',
        value: 'blooming pink cherry blossoms (sakura) drifting in the sea breeze, accompanied by stylized Japanese golden clouds',
        options: [
          'blooming pink cherry blossoms (sakura) drifting in the sea breeze, accompanied by stylized Japanese golden clouds',
          'cascading crimson momiji maple leaves and swirling wind gusts',
          'blooming white lotus blossoms floating on wave ripples and pine boughs',
          'golden chrysanthemum flowers with flowing decorative water ribbons',
        ],
      },
      {
        tag: 'COMPANION',
        label: 'Nautical Emblems & Details',
        description: 'Pirate jolly roger, ropes, and tassels',
        value: 'ornamental jolly roger pirate skull emblems framed in golden roundels, nautical hemp ropes, and decorative Japanese knot tassels',
        options: [
          'ornamental jolly roger pirate skull emblems framed in golden roundels, nautical hemp ropes, and decorative Japanese knot tassels',
          'a miniature soaring sea gull spirit carrying a scroll through the waves',
          'golden compass rose and ornamental ship helm wheel emblems with cordage',
          'traditional torii gate and omamori lucky charm amulets framed in roundels',
        ],
      },
      {
        tag: 'COLOR_PALETTE',
        label: 'Vintage Tarot Color Palette',
        description: 'Ukiyo-e and vintage Mucha tones',
        value: 'deep Prussian indigo blue, ocean wave jade teal, cinnabar crimson red, warm vintage parchment cream, straw yellow, and aged gold leaf foil accents',
        options: [
          'deep Prussian indigo blue, ocean wave jade teal, cinnabar crimson red, warm vintage parchment cream, straw yellow, and aged gold leaf foil accents',
          'midnight navy, seafoam turquoise, coral red, weathered ivory, and burnished gold',
          'cobalt blue, vermilion orange, emerald teal, warm beige, and antique brass',
          'monochrome sumi-e ink wash with striking crimson and gold leaf highlights',
        ],
      },
      {
        tag: 'BORDER_THEME',
        label: 'Art Nouveau Card Frame',
        description: 'Mucha-inspired card border and arch',
        value: 'Alphonse Mucha ornamental arched tarot card border with gilded filigree, decorative corner cartouches, nautical rope trims, and tassel knots',
        options: [
          'Alphonse Mucha ornamental arched tarot card border with gilded filigree, decorative corner cartouches, nautical rope trims, and tassel knots',
          'traditional Japanese woodblock print border with geometric seigaiha wave patterns and kanji cartouches',
          'celestial astrological card frame with zodiac wheel symbols and lunar phase medallions',
          'antique gold leaf filigree scrollwork frame with ornamental crests and ribbon banners',
        ],
      },
    ],
  },
  {
    id: 'vitrail-witch-spirit',
    name: 'Celestial Witch & Spirit Familiar (Stained Glass)',
    badge: 'Reference 3 • Witch & Wolf',
    styleTag: 'Cathedral Stained Glass',
    description:
      'Serene anime witch in pointed hat and hooded cloak with cupped hands, accompanied by a glowing cyan spirit wolf, sunflowers, maple leaves, and rose-window mandala.',
    defaultAspectRatio: '9:16',
    referenceNotes:
      'Directly matches Reference 3: Anime witch with pointed wide-brim hat and serene closed eyes, glowing cyan spirit familiar, radiant mandala halo, flanking sunflowers & maple leaves, and symmetrical leaded arch.',
    template: `Masterpiece authentic cathedral stained glass window (vitrail), symmetrical Art Nouveau arched window composition.

In the center stands {{SUBJECT_POSE}}.

At her side walks {{COMPANION}}.

Directly behind her head is {{HALO_BACKGROUND}}.

Flanked on both sides and framed along the perimeter by {{BOTANICAL}}.

Vibrant translucent jewel-tone color palette of {{COLOR_PALETTE}}.

Enclosed within an exquisite {{BORDER_THEME}}.

Authentic leadline came solder seams, translucent backlit mosaic glass panels, jewel-toned glass radiance, fine Art Nouveau botanical tracery, subtle glass textures and beveled facets.

Pure 2D flat-lay graphic art print, vertical 9:16 aspect ratio, clean full-bleed decorative art piece, sharp fine details, museum-quality stained glass artwork.

Do not include: phone, phone case, mockup, device, 3D render, realistic photography, modern clutter.`,
    sampleImage: '/src/assets/images/sample_vitrail_pure2d_1790462384613.jpg',
    defaultPlaceholders: [
      {
        tag: 'SUBJECT_POSE',
        label: 'Anime Witch Subject & Pose',
        description: 'Witch or sorceress character and posture',
        value: 'a graceful anime witch maiden with pointed wide-brim witch hat, flowing brown hair, serene closed eyes, ornate hooded crimson and amber stained-glass cloak, holding open cupped hands in blessing',
        options: [
          'a graceful anime witch maiden with pointed wide-brim witch hat, flowing brown hair, serene closed eyes, ornate hooded crimson and amber stained-glass cloak, holding open cupped hands in blessing',
          'a celestial shrine maiden in stained-glass robes with closed eyes and clasped praying hands beneath a veil',
          'an anime celestial sorceress casting glowing starlight runes from outstretched fingertips',
          'a winged anime seraph in gilded stained-glass armor holding a blooming crystal lily',
          'a moon goddess in flowing translucent glass robes cradling a miniature glowing star sphere',
        ],
      },
      {
        tag: 'COMPANION',
        label: 'Glowing Spirit Familiar',
        description: 'Luminescent mythical beast at her feet',
        value: 'an ethereal glowing celestial spirit wolf with translucent luminous cyan and golden fur and a long flowing tail walking gracefully at her feet',
        options: [
          'an ethereal glowing celestial spirit wolf with translucent luminous cyan and golden fur and a long flowing tail walking gracefully at her feet',
          'a nine-tailed spirit fox with incandescent cyan and sapphire flame tails swirling protectively',
          'a majestic barn owl familiar with glowing crystal plumage perched on a flowering came branch',
          'a miniature winged celestial dragon curled around her shoulders with radiant azure scales',
          'a pair of luminous spectral hares leaping playfully among the glass flowers',
        ],
      },
      {
        tag: 'HALO_BACKGROUND',
        label: 'Mandala Halo & Window Arch',
        description: 'Backlit halo and cathedral tracery',
        value: 'a radiant circular stained-glass rose-window mandala halo directly behind her head, glowing with amber and turquoise light',
        options: [
          'a radiant circular stained-glass rose-window mandala halo directly behind her head, glowing with amber and turquoise light',
          'an ornate gothic tracery trefoil halo with radiant stained-glass beams emanating outward',
          'a celestial zodiac mandala with gilded star constellation came and crescent moon accents',
          'a sunburst flower of life sacred geometry glass wheel with jewel-toned facets',
        ],
      },
      {
        tag: 'BOTANICAL',
        label: 'Sunflowers & Autumn Botanicals',
        description: 'Foliage and blooms flanking the window',
        value: 'blooming golden sunflowers flanking both sides, falling autumn maple leaves, and climbing floral vine came with lily corner rosettes',
        options: [
          'blooming golden sunflowers flanking both sides, falling autumn maple leaves, and climbing floral vine came with lily corner rosettes',
          'deep crimson spider lilies with climbing wild thorny brambles and floating petals',
          'fragrant white water lilies, weeping willow branches, and curling aquatic stems',
          'night-blooming jasmine, deep purple bellflowers, and wild forest ferns',
        ],
      },
      {
        tag: 'COLOR_PALETTE',
        label: 'Jewel-Toned Stained Glass Colors',
        description: 'Translucent glowing glass pigments',
        value: 'ruby crimson, deep sapphire blue, radiant sunflower gold, glowing cyan starlight, emerald green, and dark bronze leadline came',
        options: [
          'ruby crimson, deep sapphire blue, radiant sunflower gold, glowing cyan starlight, emerald green, and dark bronze leadline came',
          'amethyst purple, midnight navy, turquoise cyan, warm amber gold, and antique lead came',
          'fiery vermilion, molten copper, golden topaz, celestial teal, and rich obsidian lead lines',
          'opalescent pearl, soft lavender, seafoam cyan, and burnished gold solder',
        ],
      },
      {
        tag: 'BORDER_THEME',
        label: 'Cathedral Arch Frame',
        description: 'Symmetrical window arch and came border',
        value: 'symmetrical Art Nouveau stained-glass arched cathedral window border with intricate bronze came leadlines and floral corner rosettes',
        options: [
          'symmetrical Art Nouveau stained-glass arched cathedral window border with intricate bronze came leadlines and floral corner rosettes',
          'gothic pointed arch with dual leaded border tiles and beveled amber glass cabochons',
          'intertwined acanthus leaf came filigree with stained-glass diamond perimeter panels',
          'delicate concentric leadline arch with starburst corner brackets and faceted gems',
        ],
      },
    ],
  },
  {
    id: 'anime-vitrail-samurai',
    name: 'Kitsune Samurai (Anime Vitrail)',
    badge: 'Popular • Stained Glass',
    styleTag: 'Cathedral Stained Glass',
    description:
      'Celestial fox spirit samurai dual-wielding glowing katanas, cherry blossoms, weeping wisteria, and spirit fox in intricate stained glass mosaic.',
    defaultAspectRatio: '9:16',
    referenceNotes:
      'High-energy dynamic anime figure in vitrail mosaic style with celestial katanas and spirit fox companion.',
    template: `A breathtaking 2D anime illustration of {{SUBJECT_POSE}}

surrounded by {{BOTANICAL}}, and accompanied by {{COMPANION}}.

Directly behind is {{HALO_BACKGROUND}}.

The entire composition is designed in an intricate, vibrant stained glass (vitrail) mosaic style.

Thick, elegant leadline came outlines, translucent and luminous {{COLOR_PALETTE}}.

High-detail anime art style infused with Art Nouveau {{BORDER_THEME}} borders.

Flat lay, purely 2D graphic design, completely flat background, vertical 9:16 aspect ratio, sharp fine details.

Do not include: phone, phone case, mockup, device, shadows, 3D render, realistic photography.`,
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
        ],
      },
      {
        tag: 'HALO_BACKGROUND',
        label: 'Mandala & Halo',
        description: 'Backlit halo behind figure',
        value: 'radiant celestial sunburst halo with glowing geometric glass facets and star rays',
        options: [
          'radiant celestial sunburst halo with glowing geometric glass facets and star rays',
          'concentric astronomical rings with golden crescent moon and constellation came',
          'stained-glass torii gate arch with glowing sacred shimenawa rope came',
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
        ],
      },
      {
        tag: 'COLOR_PALETTE',
        label: 'Color Palette',
        description: 'Stained glass colors and gemstone tones',
        value: 'deep sapphire indigo, vibrant crimson, luminous gold, and ethereal cyan',
        options: [
          'deep sapphire indigo, vibrant crimson, luminous gold, and ethereal cyan',
          'emerald green, warm amber gold, obsidian black, and rose quartz',
          'amethyst purple, midnight navy, iridescent teal, and platinum silver',
        ],
      },
      {
        tag: 'BORDER_THEME',
        label: 'Border Theme',
        description: 'Architectural or filigree border framing',
        value: 'art nouveau brass filigree frame with celestial star constellations',
        options: [
          'art nouveau brass filigree frame with celestial star constellations',
          'gothic cathedral pointed arch with delicate trefoil tracery and floral engraving',
          'ornate Japanese torii gate pillars with geometric seigaiha wave motifs',
        ],
      },
    ],
  },
  {
    id: 'botanical-tarot',
    name: 'Dark Botanical & Celestial Tarot',
    badge: 'Luxury • Mystical',
    styleTag: 'Celestial Tarot & Woodcut',
    description:
      'Elegantly etched botanical flora, golden astrological celestial diagrams, and vintage luxury engravings.',
    defaultAspectRatio: '9:16',
    referenceNotes: 'Vintage celestial tarot with gold foil stamp and fine line woodcut engraving.',
    template: `High-end mystical luxury graphic artwork, {{SUBJECT_POSE}}, accompanied by {{COMPANION}}, directly behind is {{HALO_BACKGROUND}}, intertwined with {{BOTANICAL}}, celestial tarot iconography, color palette of {{COLOR_PALETTE}}, bordered by {{BORDER_THEME}}, gold foil stamp finish, fine line woodcut engraving, clean canvas, vertical 9:16 aspect ratio, sharp fine details.`,
    defaultPlaceholders: [
      {
        tag: 'SUBJECT_POSE',
        label: 'Central Symbol / Subject',
        description: 'Tarot or celestial persona',
        value: 'celestial goddess of the moon holding a crescent sphere with closed serene eyes',
        options: [
          'celestial goddess of the moon holding a crescent sphere with closed serene eyes',
          'mystic alchemist hands holding a glowing prism casting sacred geometry rays',
          'crowned ouroboros serpent wrapped around a crystal dagger',
          'majestic celestial moth with open wings patterned with moon phases',
        ],
      },
      {
        tag: 'HALO_BACKGROUND',
        label: 'Celestial Arch / Mandala',
        description: 'Astrological rings or solar rays',
        value: 'delicate concentric astrological rings with compass roses and lunar phase cycles',
        options: [
          'delicate concentric astrological rings with compass roses and lunar phase cycles',
          'radiant sunburst with sacred geometry rays and Roman numerals',
          'circular zodiac wheel with gilded star constellation diagrams',
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
        ],
      },
      {
        tag: 'BORDER_THEME',
        label: 'Border Theme',
        description: 'Tarot frame and astronomical rings',
        value: 'classic Rider-Waite tarot card arch with solar rays, star charts, and Roman numerals',
        options: [
          'classic Rider-Waite tarot card arch with solar rays, star charts, and Roman numerals',
          'ornate Victorian rococo gold foil filigree with crowned flourishes',
          'clean modern double-line gold hairline frame with corner crosshairs',
        ],
      },
    ],
  },
];

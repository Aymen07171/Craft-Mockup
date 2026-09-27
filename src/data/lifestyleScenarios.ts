import { PresetLifestyleScenario } from '../types';

export const LIFESTYLE_SCENARIOS: PresetLifestyleScenario[] = [
  {
    id: 'person-talking',
    title: 'Person Talking to Friend',
    category: 'social',
    description: 'Casual outdoor conversation with natural single-hand grip',
    prompt:
      'A young adult standing outdoors talking to a friend while casually holding a smartphone in one hand. The back of the phone is facing the camera and clearly shows the custom phone case design with natural finger placement on the sides.',
    cameraAngle: 'Medium shot, eye-level, soft blurred companion in background',
    personPose: 'Standing naturally, smiling, gesturing lightly, phone held chest-height facing camera',
  },
  {
    id: 'coffee-shop',
    title: 'Artisanal Coffee Shop',
    category: 'cafe',
    description: 'Seated at wood table with latte art, holding phone in hand',
    prompt:
      'A person sitting in a modern warm coffee shop while holding a smartphone in one hand resting comfortably on the table next to a ceramic cup. The back of the phone case is clearly visible, showing the uploaded artwork with warm ambient cafe lighting.',
    cameraAngle: 'Close-up over table, shallow depth of field, warm wooden textures',
    personPose: 'Seated comfortably, relaxed hand resting phone at slight tilt showing back cover',
  },
  {
    id: 'walking-city',
    title: 'Walking in Modern City',
    category: 'outdoor',
    description: 'Urban sidewalk stride, dynamic daylight lighting',
    prompt:
      'A person walking through a modern city street with architectural glass storefronts while holding their smartphone naturally. The camera captures the back of the phone case and clearly displays the custom design with clean natural daylight.',
    cameraAngle: 'Over-the-shoulder medium shot, natural daylight, soft city background motion',
    personPose: 'In stride, natural arm swing, hand gripping phone securely facing camera',
  },
  {
    id: 'social-gathering',
    title: 'Social Group Conversation',
    category: 'social',
    description: 'Casual gathering with friends outdoors on a sunny terrace',
    prompt:
      'A person talking with friends on an outdoor patio terrace while holding a smartphone casually. The phone case is visible from the back and the uploaded design remains clearly recognizable and in sharp focus.',
    cameraAngle: 'Medium group shot with focus locked on phone case in foreground',
    personPose: 'Gesturing with other hand, phone held at side angled toward camera',
  },
  {
    id: 'everyday-moment',
    title: 'Everyday Lifestyle Moment',
    category: 'everyday',
    description: 'Cozy living room / home interior with soft natural window light',
    prompt:
      'A realistic everyday moment where a person is relaxing in a sunlit modern interior using their smartphone. The composition naturally exposes the back of the phone case so the custom design is clearly visible with realistic hand anatomy.',
    cameraAngle: 'Close-up on hands and phone case, soft window morning light, cozy aesthetic',
    personPose: 'Comfortable relaxed posture, fingers curled around phone case perimeter without obscuring artwork',
  },
  {
    id: 'desk-creative-workspace',
    title: 'Creative Studio Desk',
    category: 'work',
    description: 'Modern workspace with laptop, notebook, holding phone',
    prompt:
      'A designer sitting at a minimalist birch wood desk with a laptop and notebook, pausing work while holding their smartphone in hand. The back of the phone case is angled toward the camera clearly displaying the printed artwork.',
    cameraAngle: 'Three-quarter angle, bright clean workspace lighting, aesthetic minimalist backdrop',
    personPose: 'Hand holding phone above desk surface, backplate clearly exposed',
  },
];

export const DIVERSE_MOCKUP_CONCEPTS = [
  {
    title: 'Handheld City Portrait',
    prompt: 'Eye-level handheld lifestyle portrait outdoors. A person holds the phone one-handed at shoulder height with the full case back facing the lens. Frame the hand and phone prominently against a softly blurred city street; fingers touch only the case edges.',
  },
  {
    title: 'Marble Desk Still Life',
    prompt: 'Low three-quarter tabletop product photograph. Place the phone diagonally on a pale veined marble desk, case back completely visible, with a closed notebook far behind it. Cool window light and long natural shadows; no person or hand.',
  },
  {
    title: 'Artwork Detail Close-Up',
    prompt: 'Extreme close-up commercial product photograph of the case back filling almost the entire frame. Keep the complete artwork plane sharply visible with realistic fine case texture and precise print edges; use raking studio light and a nearly black background.',
  },
  {
    title: 'Themed Flat Lay',
    prompt: 'Strictly overhead flat-lay on a warm cream tabletop. Place the phone vertically just off-center with its full case artwork facing up; arrange a few small objects inspired by the artwork at the outer corners, well clear of the phone and its shadow.',
  },
  {
    title: 'Minimal Studio Hero',
    prompt: 'Minimal premium studio hero photograph: one phone standing upright, case back squarely facing camera against a seamless soft sage-green background. Broad diffused key light and subtle grounded shadow; no props, text, or extra devices.',
  },
  {
    title: 'Bookshop Discovery',
    prompt: 'Authentic bookstore café lifestyle photograph from a seated table perspective. The phone rests on a dark wood table beside a closed book, case back fully visible and sharply focused; bookshelves and warm pendant lights dissolve into background bokeh. No hands.',
  },
  {
    title: 'First-Person In-Hand',
    prompt: 'First-person point of view looking down at one hand holding the phone over a sunlit park bench. The case back faces the viewer and remains fully visible; thumb and fingertips wrap only around the outer frame. Grass and path softly out of focus.',
  },
  {
    title: 'Three-Quarter Product Angle',
    prompt: 'Premium three-quarter product photograph with the phone lying diagonally on dark green felt. A low offset camera reveals case thickness and side buttons while keeping the complete back artwork sharp. A narrow softbox highlight defines the case edge.',
  },
  {
    title: 'Standing by the Bedside',
    prompt: 'Vertical lifestyle product photograph at a bedside table in soft morning light. Stand the phone upright, leaning securely against a small ceramic lamp base, case back toward camera and full artwork visible. Bed linens and window light form a softly blurred background.',
  },
  {
    title: 'Artwork-Inspired Scene',
    prompt: 'Create an elegant themed product-photography set based only on colors and motifs visible in the supplied case artwork. Place the phone upright at a gentle three-quarter angle on a complementary sculptural plinth, with restrained matching materials and directional editorial light. Keep props beside or behind the phone.',
  },
] as const;

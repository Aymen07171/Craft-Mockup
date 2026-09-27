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

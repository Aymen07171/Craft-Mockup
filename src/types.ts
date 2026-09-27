export type DeviceType = 'iphone-16-pro' | 'samsung-s25-ultra';

export type MockupWorkflowStep =
  | 'upload-design'
  | 'product-reference'
  | 'scene-description'
  | 'generate-mockup'
  | 'preview-result'
  | 'download-result';

export interface MockupWorkflowState {
  activeStep: MockupWorkflowStep;
  artwork: { fileName: string; imageUrl: string } | null;
  productReferenceIds: string[];
  productReferenceImages: Record<string, { fileName: string; imageUrl: string }>;
  sceneReferenceImages: { id: string; fileName: string; imageUrl: string }[];
  sceneDescription: string;
  generatedMockups: GeneratedWorkflowMockup[];
  generatedImageUrl: string | null;
  isGenerating: boolean;
  generationProgress: string | null;
  generationError: string | null;
}

export interface GeneratedWorkflowMockup {
  modelId: string;
  modelName: string;
  sceneTitle: string;
  prompt: string;
  imageUrl: string | null;
  status: 'generating' | 'generated' | 'failed';
  error?: string;
}

export type CaseType = 'slim' | 'clear' | 'tough' | 'silicone' | 'protective';

export type CaseFinish = 'liquid-gloss' | 'velvet-matte' | 'clear-hybrid' | 'tough-armor';

export interface CaseTypeOption {
  id: CaseType;
  name: string;
  description: string;
  badge: string;
  finish: CaseFinish;
}

export type FrameColor = {
  id: string;
  name: string;
  hex: string;
  accentHex: string;
};

export interface PlaceholderField {
  tag: string; // e.g. "SUBJECT_POSE"
  label: string; // e.g. "Subject & Pose"
  description?: string;
  value: string;
  options: string[];
}

export interface NichePreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  template: string;
  defaultPlaceholders: PlaceholderField[];
  sampleImage?: string;
}

export interface GeneratedDesign {
  id: string;
  title: string;
  prompt: string;
  imageUrl: string;
  niche: string;
  createdAt: number;
  placeholders: Record<string, string>;
  isPreset?: boolean;
}

export interface MockupItem {
  id: string;
  device: DeviceType;
  deviceName: string;
  platform: 'iphone' | 'samsung';
  caseType: CaseType;
  caseTypeName: string;
  finish: CaseFinish;
  frameColorId: string;
  artworkUrl: string;
  designTitle: string;
  renderUrl?: string;
}

export type SkinTone = 'fair' | 'honey' | 'bronze' | 'deep';

export interface PresetLifestyleScenario {
  id: string;
  title: string;
  category: 'social' | 'outdoor' | 'cafe' | 'work' | 'everyday' | 'product';
  description: string;
  prompt: string;
  cameraAngle: string;
  personPose: string;
}

export interface GeneratedLifestyleMockup {
  id: string;
  sceneTitle: string;
  userPrompt: string;
  modelName: string;
  brand: 'apple' | 'samsung';
  caseType: CaseType;
  imageUrl: string;
  designId: string;
  designTitle: string;
  createdAt: number;
  variationIndex?: number;
}


export interface MockupConfig {
  device: DeviceType;
  finish: CaseFinish;
  frameColor: string;
  showMagsafe: boolean;
  glossIntensity: number; // 0 - 100
  caseScale: number; // 0.6 - 1.4
  caseRotation: number; // -45 to 45
  rotateX: number;
  rotateY: number;
  caseOffsetX: number; // px
  caseOffsetY: number; // px
  artworkZoom: number; // 0.8 - 1.5
  artworkShiftY: number; // px
  showHands: boolean;
  skinTone: SkinTone;
  blendMode?: 'normal' | 'multiply' | 'overlay' | 'soft-light';
  showTitleBadge?: boolean;
  customTitle?: string;
}

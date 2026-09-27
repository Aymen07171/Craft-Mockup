export type AspectRatio = '9:16' | '1:1' | '3:4' | '4:3' | '16:9';

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
  defaultAspectRatio?: AspectRatio;
  referenceNotes?: string;
  styleTag?: string;
}

export interface GeneratedDesign {
  id: string;
  title: string;
  prompt: string;
  imageUrl: string;
  sourceUrl?: string;
  niche: string;
  createdAt: number;
  placeholders: Record<string, string>;
  isPreset?: boolean;
  seed?: number;
  aspectRatio?: AspectRatio;
  width?: number;
  height?: number;
}

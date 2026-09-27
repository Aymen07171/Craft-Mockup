import { GeneratedDesign } from '../types';

export type ListingStatus = 'DRAFT' | 'READY' | 'PROCESSING' | 'PUBLISHED' | 'ERROR' | 'PAUSED';

export interface ListingSettings {
  defaultPrice: string;
  blueprintId: string;
  printProviderId: string;
  variantIds: Record<string, string>;
}

export interface EtsyListingDraft {
  designId: string;
  productId: string;
  designName: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  primaryColor: string;
  secondaryColor: string;
  style: string;
  occasion: string;
  recipient: string;
  sku: string;
  price: string;
  designFileUrl: string;
  mockupUrls: string[];
  blueprintId: string;
  printProviderId: string;
  selectedModels: string[];
  status: ListingStatus;
  printifyProductId: string;
  etsyListingId: string;
  error: string;
  createdDate: string;
  publishedDate: string;
  primaryKeywords: string[];
  longTailKeywords: string[];
  searchIntent: string[];
  keywordRationale: string;
}

export const PHONE_MODELS = [
  'iPhone 17',
  'iPhone 17 Pro',
  'iPhone 17 Pro Max',
  'iPhone 16',
  'iPhone 16 Pro',
  'iPhone 16 Pro Max',
  'Samsung Galaxy S25',
  'Samsung Galaxy S25 Ultra',
] as const;

export const DEFAULT_LISTING_SETTINGS: ListingSettings = {
  defaultPrice: '24.99',
  blueprintId: '',
  printProviderId: '',
  variantIds: Object.fromEntries(PHONE_MODELS.map((model) => [model, ''])),
};

const DRAFTS_KEY = 'casecraft-etsy-listing-drafts-v1';
const SETTINGS_KEY = 'casecraft-etsy-listing-settings-v1';
const PRODUCT_SEQUENCE_KEY = 'casecraft-product-sequence-v1';

export const loadListingDrafts = (): Record<string, EtsyListingDraft> => {
  try {
    return JSON.parse(localStorage.getItem(DRAFTS_KEY) || '{}') as Record<string, EtsyListingDraft>;
  } catch {
    return {};
  }
};

export const saveListingDrafts = (drafts: Record<string, EtsyListingDraft>): void => {
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
};

export const loadListingSettings = (): ListingSettings => {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') as Partial<ListingSettings>;
    return {
      ...DEFAULT_LISTING_SETTINGS,
      ...saved,
      variantIds: { ...DEFAULT_LISTING_SETTINGS.variantIds, ...saved.variantIds },
    };
  } catch {
    return DEFAULT_LISTING_SETTINGS;
  }
};

export const saveListingSettings = (settings: ListingSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const nextProductId = (): string => {
  try {
    const previous = Number.parseInt(localStorage.getItem(PRODUCT_SEQUENCE_KEY) || '0', 10);
    const next = Number.isSafeInteger(previous) && previous > 0 ? previous + 1 : 1;
    localStorage.setItem(PRODUCT_SEQUENCE_KEY, String(next));
    return `CASE-${String(next).padStart(5, '0')}`;
  } catch {
    return `CASE-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  }
};

const initialDesignUrl = (design: GeneratedDesign): string => {
  if (design.sourceUrl) return design.sourceUrl;
  if (/^data:image\//i.test(design.imageUrl)) return '';
  try {
    return new URL(design.imageUrl, window.location.origin).toString();
  } catch {
    return '';
  }
};

export const createListingDraft = (
  design: GeneratedDesign,
  settings: ListingSettings,
  existing?: EtsyListingDraft
): EtsyListingDraft => {
  const productId = existing?.productId || nextProductId();
  return {
    designId: design.id,
    productId,
    designName: existing?.designName || design.title,
    title: existing?.title || '',
    description: existing?.description || '',
    tags: existing?.tags?.length === 13 ? [...existing.tags] : Array(13).fill(''),
    category: existing?.category || '',
    primaryColor: existing?.primaryColor || '',
    secondaryColor: existing?.secondaryColor || '',
    style: existing?.style || '',
    occasion: existing?.occasion || '',
    recipient: existing?.recipient || '',
    sku: existing?.sku || productId,
    price: existing?.price || settings.defaultPrice,
    designFileUrl: existing?.designFileUrl || initialDesignUrl(design),
    mockupUrls: existing?.mockupUrls?.length === 6 ? [...existing.mockupUrls] : Array(6).fill(''),
    blueprintId: existing?.blueprintId || settings.blueprintId,
    printProviderId: existing?.printProviderId || settings.printProviderId,
    selectedModels: existing?.selectedModels || [],
    status: existing?.status || 'DRAFT',
    printifyProductId: existing?.printifyProductId || '',
    etsyListingId: existing?.etsyListingId || '',
    error: existing?.error || '',
    createdDate: existing?.createdDate || new Date().toISOString(),
    publishedDate: existing?.publishedDate || '',
    primaryKeywords: existing?.primaryKeywords || [],
    longTailKeywords: existing?.longTailKeywords || [],
    searchIntent: existing?.searchIntent || [],
    keywordRationale: existing?.keywordRationale || '',
  };
};

const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};

const isSupportedImageReference = (value: string): boolean =>
  isHttpUrl(value) || /^data:image\/(?:png|jpe?g|webp);base64,/i.test(value);

export const validateListingDraft = (
  draft: EtsyListingDraft,
  settings: ListingSettings,
  mockupFiles: (File | null)[],
  hasDesignSource: boolean
): string[] => {
  const errors: string[] = [];
  const required: [string, string][] = [
    ['Product_ID', draft.productId],
    ['Design_Name', draft.designName],
    ['Title', draft.title],
    ['Description', draft.description],
    ['SKU', draft.sku],
    ['Status', draft.status],
  ];
  required.forEach(([name, value]) => {
    if (!value.trim()) errors.push(`${name} is required.`);
  });

  if (draft.title.length > 140) errors.push(`Title is ${draft.title.length} characters. Maximum allowed: 140.`);
  if (draft.tags.length !== 13) errors.push(`Exactly 13 Etsy tags are required; currently ${draft.tags.length}.`);
  const normalizedTags = draft.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean);
  if (new Set(normalizedTags).size !== normalizedTags.length) errors.push('Etsy tags must be unique. Remove repeated tags.');
  draft.tags.forEach((tag, index) => {
    const label = `Tag ${String(index + 1).padStart(2, '0')}`;
    if (!tag.trim()) errors.push(`${label} is required.`);
    else if (tag.length > 20) errors.push(`${label} is ${tag.length} characters. Maximum allowed: 20.`);
    else if (!/^[A-Za-z0-9][A-Za-z0-9 -]*$/.test(tag)) errors.push(`${label} contains unsupported characters.`);
  });

  if (!draft.designFileUrl.trim() && !hasDesignSource) errors.push('Design_File_URL is required.');
  else if (draft.designFileUrl.trim() && !isSupportedImageReference(draft.designFileUrl.trim())) {
    errors.push('Design_File_URL must be an HTTP/HTTPS URL or supported image data URL.');
  }
  const availableMockups = draft.mockupUrls.filter((url) => url.trim()).length + mockupFiles.filter(Boolean).length;
  if (availableMockups === 0) errors.push('Add at least one mockup URL or image file.');
  draft.mockupUrls.forEach((url, index) => {
    if (url.trim() && !isSupportedImageReference(url.trim())) {
      errors.push(`Mockup ${String(index + 1).padStart(2, '0')} must be an HTTP/HTTPS URL or supported image data URL.`);
    }
  });
  if (!draft.price.trim() || !Number.isFinite(Number(draft.price)) || Number(draft.price) <= 0) {
    errors.push('Price must be a number greater than 0.');
  }
  if (!draft.blueprintId.trim()) errors.push('Printify Blueprint_ID is required.');
  if (!draft.printProviderId.trim()) errors.push('Printify Print_Provider_ID is required.');
  if (draft.selectedModels.length === 0) errors.push('Select at least one phone model.');
  draft.selectedModels.forEach((model) => {
    if (!settings.variantIds[model]?.trim()) errors.push(`Configure the Printify Variant_ID for ${model}.`);
  });

  return errors;
};

export const listingToSheetRow = (
  draft: EtsyListingDraft,
  settings: ListingSettings,
  status: ListingStatus
): (string | number)[] => [
  draft.productId,
  draft.designName,
  draft.title,
  draft.description,
  ...Array.from({ length: 13 }, (_, index) => draft.tags[index] || ''),
  draft.category,
  draft.primaryColor,
  draft.secondaryColor,
  draft.style,
  draft.occasion,
  draft.recipient,
  draft.designFileUrl,
  ...Array.from({ length: 6 }, (_, index) => draft.mockupUrls[index] || ''),
  draft.sku,
  Number(draft.price),
  draft.blueprintId,
  draft.printProviderId,
  draft.selectedModels.map((model) => settings.variantIds[model]).filter(Boolean).join(','),
  status,
  draft.printifyProductId,
  draft.etsyListingId,
  draft.error,
  draft.createdDate,
  draft.publishedDate,
];
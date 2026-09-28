/**
 * Centralized Product Manager & ID Sequence
 * Generates and associates CASE-00001 with design, mockups, Drive files, listing, and automation.
 */

import { UnifiedProductRecord } from '../types/unifiedWorkflow';

const PRODUCT_SEQUENCE_KEY = 'casecraft-product-sequence-v2';
const PRODUCTS_STORE_KEY = 'casecraft-unified-products-v1';

export const getNextProductId = (): string => {
  try {
    const raw = localStorage.getItem(PRODUCT_SEQUENCE_KEY);
    let nextNum = 1;
    if (raw) {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && parsed > 0) {
        nextNum = parsed + 1;
      }
    }
    localStorage.setItem(PRODUCT_SEQUENCE_KEY, String(nextNum));
    return `CASE-${String(nextNum).padStart(5, '0')}`;
  } catch {
    return `CASE-${Math.floor(Math.random() * 90000 + 10000)}`;
  }
};

export const createInitialProductRecord = (
  designName = 'Mystical Stained Glass Fox',
  designPrompt = '',
  designLocalUrl = ''
): UnifiedProductRecord => {
  const productId = getNextProductId();
  return {
    productId,
    designName,
    design: {
      title: designName,
      prompt: designPrompt,
      localUrl: designLocalUrl,
      fileId: '',
      fileUrl: '',
      verified: false,
    },
    mockups: [],
    listing: {
      title: '',
      description: '',
      tags: Array(13).fill(''),
      category: 'Electronics Cases',
      primaryColor: '',
      secondaryColor: '',
      style: '',
      occasion: '',
      recipient: '',
    },
    product: {
      sku: productId,
      price: 24.99,
    },
    printify: {
      blueprintId: '68', // Printify Tough Case Blueprint default
      printProviderId: '1', // Spoke Custom Products / default provider
      variantIds: [],
      selectedModels: ['iPhone 15 Pro', 'iPhone 15 Pro Max', 'Samsung Galaxy S24'],
    },
    automation: {
      status: 'DRAFT',
      printifyProductId: '',
      etsyListingId: '',
      error: '',
      createdDate: new Date().toISOString(),
      publishedDate: '',
    },
  };
};

export const loadStoredProducts = (): Record<string, UnifiedProductRecord> => {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveStoredProducts = (products: Record<string, UnifiedProductRecord>): void => {
  try {
    localStorage.setItem(PRODUCTS_STORE_KEY, JSON.stringify(products));
  } catch (e) {
    console.warn('Failed to save products to localStorage:', e);
  }
};

export const saveProductRecord = (record: UnifiedProductRecord): void => {
  const all = loadStoredProducts();
  all[record.productId] = record;
  saveStoredProducts(all);
};

export const validateProductForExport = (record: UnifiedProductRecord): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!record.productId) {
    errors.push('Product ID is missing.');
  }

  // Design check
  if (!record.design.fileId || !record.design.fileUrl) {
    errors.push(`Design file for ${record.productId} has not been uploaded to Google Drive.`);
  }

  // Mockup check (at least 1 mockup is required, and all generated ones must have valid Drive URLs)
  if (record.mockups.length === 0) {
    errors.push(`At least one product mockup is required for ${record.productId}.`);
  } else {
    record.mockups.forEach((m, idx) => {
      if (!m.fileId || !m.fileUrl) {
        errors.push(`Mockup_${String(idx + 1).padStart(2, '0')} (${m.modelName}) failed to upload to Google Drive.`);
      }
    });
  }

  // Listing check
  if (!record.listing.title.trim()) {
    errors.push('Etsy Title is required.');
  } else if (record.listing.title.length > 140) {
    errors.push(`Etsy Title exceeds 140 characters (${record.listing.title.length}).`);
  }

  if (!record.listing.description.trim()) {
    errors.push('Etsy Description is required.');
  }

  const validTags = record.listing.tags.filter((t) => t.trim().length > 0);
  if (validTags.length !== 13) {
    errors.push(`Exactly 13 Etsy tags are required (currently ${validTags.length}).`);
  } else {
    // Check duplicates and lengths
    const lowerTags = validTags.map((t) => t.trim().toLowerCase());
    const uniqueTags = new Set(lowerTags);
    if (uniqueTags.size !== 13) {
      errors.push('Etsy tags must be unique without repeats.');
    }
    validTags.forEach((t, i) => {
      if (t.length > 20) {
        errors.push(`Tag ${i + 1} ("${t}") exceeds maximum 20 characters.`);
      }
    });
  }

  // Printify configuration check
  if (!record.printify.blueprintId) {
    errors.push('Printify Blueprint_ID is required.');
  }
  if (!record.printify.printProviderId) {
    errors.push('Printify Print_Provider_ID is required.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

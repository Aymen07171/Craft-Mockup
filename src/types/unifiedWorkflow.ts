/**
 * Unified Product Workflow Data Model
 * Associates Design, Mockups, Google Drive Assets, Listing, Printify, and Automation
 */

export type ProductWorkflowStep =
  | 'design'
  | 'mockup'
  | 'drive'
  | 'listing'
  | 'export';

export type ProductStatus = 'DRAFT' | 'READY' | 'PROCESSING' | 'PUBLISHED' | 'ERROR';

export interface DriveAssetRef {
  fileId: string;
  fileUrl: string;       // webViewLink or direct download URL
  webContentLink?: string;
  name: string;
  mimeType: string;
  sizeBytes?: number;
  uploadedAt?: number;
  verified?: boolean;
}

export interface UnifiedProductRecord {
  productId: string; // e.g. CASE-00001
  designName: string;

  // Design Asset
  design: {
    id?: string;
    title: string;
    prompt: string;
    localUrl: string; // generated preview/base64/dataUrl
    sourceUrl?: string;
    niche?: string;
    aspectRatio?: string;
    fileId: string;
    fileUrl: string;
    webContentLink?: string;
    verified?: boolean;
  };

  // Mockups (up to 6 slots)
  mockups: {
    slotIndex: number; // 0..5 (Mockup_01 .. Mockup_06)
    modelId: string;
    modelName: string;
    sceneTitle: string;
    prompt?: string;
    localUrl: string | null;
    fileId: string;
    fileUrl: string;
    webContentLink?: string;
    verified?: boolean;
    status: 'pending' | 'generating' | 'generated' | 'failed' | 'uploaded';
    error?: string;
  }[];

  // Etsy Listing
  listing: {
    title: string;
    description: string;
    tags: string[]; // exactly 13 tags
    category: string;
    primaryColor: string;
    secondaryColor: string;
    style: string;
    occasion: string;
    recipient: string;
    primaryKeywords?: string[];
    longTailKeywords?: string[];
    searchIntent?: string[];
    keywordRationale?: string;
  };

  // Product E-commerce details
  product: {
    sku: string;
    price: number;
  };

  // Printify specifications
  printify: {
    blueprintId: string;
    printProviderId: string;
    variantIds: string[]; // list of variant IDs or comma-separated
    selectedModels: string[];
  };

  // Automation & status tracking for Make.com / Etsy / Printify
  automation: {
    status: ProductStatus;
    printifyProductId: string;
    etsyListingId: string;
    error: string;
    createdDate: string;
    publishedDate: string;
  };
}

export interface GoogleDriveFolderRef {
  id: string;
  name: string;
}

export interface ProductProcessingProgress {
  creatingProduct: boolean;
  generatingDesign: 'idle' | 'running' | 'done' | 'failed';
  generatingMockups: 'idle' | 'running' | 'done' | 'failed';
  uploadingDesign: 'idle' | 'running' | 'done' | 'failed';
  uploadingMockups: 'idle' | 'running' | 'done' | 'failed';
  verifyingDriveAssets: 'idle' | 'running' | 'done' | 'failed';
  generatingListing: 'idle' | 'running' | 'done' | 'failed';
  exportingSheets: 'idle' | 'running' | 'done' | 'failed';
  currentMessage: string;
  overallStatus: ProductStatus;
  error?: string | null;
}

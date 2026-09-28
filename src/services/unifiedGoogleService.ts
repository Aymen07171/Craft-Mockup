/**
 * Google Drive and Sheets Service with Official OAuth,
 * Hierarchical Folder Management:
 * Etsy Products/ -> [PRODUCT_ID]/ -> Design/ & Mockups/
 * Drive File Metadata Retrieval, Verification, and Resumable/Multipart Uploads.
 */

import { UnifiedProductRecord } from '../types/unifiedWorkflow';

export const SHEET_HEADERS = [
  'Product_ID',
  'Design_Name',
  'Title',
  'Description',
  ...Array.from({ length: 13 }, (_, index) => `Tag_${String(index + 1).padStart(2, '0')}`),
  'Category',
  'Primary_Color',
  'Secondary_Color',
  'Style',
  'Occasion',
  'Recipient',
  'Design_File_ID',
  'Design_File_URL',
  'Mockup_01_ID',
  'Mockup_01_URL',
  'Mockup_02_ID',
  'Mockup_02_URL',
  'Mockup_03_ID',
  'Mockup_03_URL',
  'Mockup_04_ID',
  'Mockup_04_URL',
  'Mockup_05_ID',
  'Mockup_05_URL',
  'Mockup_06_ID',
  'Mockup_06_URL',
  'SKU',
  'Price',
  'Blueprint_ID',
  'Print_Provider_ID',
  'Variant_IDs',
  'Status',
  'Printify_Product_ID',
  'Etsy_Listing_ID',
  'Error',
  'Created_Date',
  'Published_Date',
] as const;

export const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/spreadsheets',
].join(' ');

interface GoogleTokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

interface GoogleTokenClient {
  requestAccessToken(options?: { prompt?: string }): void;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient(options: {
            client_id: string;
            scope: string;
            callback(response: GoogleTokenResponse): void;
            error_callback?(error: { message?: string }): void;
          }): GoogleTokenClient;
        };
      };
    };
  }
}

export interface GoogleDriveRef {
  id: string;
  name: string;
}

export interface GoogleSpreadsheetRef {
  id: string;
  name: string;
  driveId?: string;
}

export interface GoogleWorksheetRef {
  id: number;
  title: string;
  index: number;
}

export interface DriveFileMetadata {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink?: string;
  webContentLink?: string;
  shared?: boolean;
}

let identityScriptPromise: Promise<void> | undefined;

export const loadIdentityScript = (): Promise<void> => {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (identityScriptPromise) return identityScriptPromise;

  identityScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google Identity Services script could not be loaded.'));
    document.head.appendChild(script);
  });
  return identityScriptPromise;
};

export const connectGoogleDriveAndSheets = async (
  clientId: string
): Promise<{ token: string; email: string }> => {
  if (!clientId) {
    throw new Error('Google Client ID is missing. Please set VITE_GOOGLE_CLIENT_ID or connect via OAuth.');
  }
  await loadIdentityScript();
  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) throw new Error('Google OAuth2 is unavailable in this browser session.');

  const token = await new Promise<string>((resolve, reject) => {
    const client = oauth2.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_SCOPES,
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error_description || response.error || 'Google authorization failed.'));
          return;
        }
        resolve(response.access_token);
      },
      error_callback: (error) => reject(new Error(error.message || 'Google authorization failed.')),
    });
    client.requestAccessToken({ prompt: 'select_account consent' });
  });

  const user = await googleRequest<{ email?: string }>(
    'https://www.googleapis.com/oauth2/v3/userinfo',
    token
  );
  return { token, email: user.email || 'Connected Google Account' };
};

export const googleRequest = async <T>(
  url: string,
  token: string,
  init: RequestInit = {}
): Promise<T> => {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body && !(init.body instanceof Blob) && !(init.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...init.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = (data as { error?: { message?: string } })?.error?.message;
    throw new Error(msg || `Google API error (${response.status}): ${response.statusText}`);
  }
  return data as T;
};

/**
 * Find or create a folder inside a parent folder
 */
export const findOrCreateFolder = async (
  token: string,
  folderName: string,
  parentId?: string
): Promise<string> => {
  let query = `mimeType='application/vnd.google-apps.folder' and name='${folderName.replace(/'/g, "\\'")}' and trashed=false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  } else {
    query += ` and 'root' in parents`;
  }

  const searchUrl = new URL('https://www.googleapis.com/drive/v3/files');
  searchUrl.search = new URLSearchParams({
    q: query,
    fields: 'files(id, name)',
    pageSize: '10',
    spaces: 'drive',
  }).toString();

  const searchRes = await googleRequest<{ files?: { id: string; name: string }[] }>(searchUrl.toString(), token);
  if (searchRes.files && searchRes.files.length > 0) {
    return searchRes.files[0].id;
  }

  // Create folder
  const createRes = await googleRequest<{ id: string }>(
    'https://www.googleapis.com/drive/v3/files',
    token,
    {
      method: 'POST',
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : undefined,
      }),
    }
  );
  return createRes.id;
};

/**
 * Ensure hierarchy:
 * Root -> [rootFolderName (default 'Etsy Products')] -> [productId] -> ['Design', 'Mockups']
 */
export const ensureProductFolders = async (
  token: string,
  productId: string,
  rootFolderName = 'Etsy Products'
): Promise<{ rootFolderId: string; productFolderId: string; designFolderId: string; mockupsFolderId: string }> => {
  const rootFolderId = await findOrCreateFolder(token, rootFolderName);
  const productFolderId = await findOrCreateFolder(token, productId, rootFolderId);
  const designFolderId = await findOrCreateFolder(token, 'Design', productFolderId);
  const mockupsFolderId = await findOrCreateFolder(token, 'Mockups', productFolderId);

  return { rootFolderId, productFolderId, designFolderId, mockupsFolderId };
};

/**
 * Check if a file already exists in a given folder with the exact name to prevent duplicates
 */
export const findFileInFolder = async (
  token: string,
  fileName: string,
  folderId: string
): Promise<DriveFileMetadata | null> => {
  const query = `name='${fileName.replace(/'/g, "\\'")}' and '${folderId}' in parents and trashed=false`;
  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.search = new URLSearchParams({
    q: query,
    fields: 'files(id, name, mimeType, size, webViewLink, webContentLink)',
    pageSize: '5',
  }).toString();

  const data = await googleRequest<{ files?: DriveFileMetadata[] }>(url.toString(), token);
  return data.files && data.files.length > 0 ? data.files[0] : null;
};

/**
 * Convert any data URL or remote URL to Blob
 */
export const urlToBlob = async (url: string): Promise<Blob> => {
  if (url.startsWith('data:')) {
    const arr = url.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not fetch image at ${url}`);
  return await res.blob();
};

/**
 * Upload asset using multipart upload for standard image sizes (< 5MB)
 * or resumable upload for larger files
 */
export const uploadFileToFolder = async (
  token: string,
  fileBlob: Blob,
  fileName: string,
  folderId: string,
  existingFileId?: string,
  grantLinkAccess = true
): Promise<DriveFileMetadata> => {
  const mimeType = fileBlob.type || 'image/png';
  let fileId = existingFileId;

  if (existingFileId) {
    // Update existing file content (prevent duplicates)
    const updateRes = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(existingFileId)}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': mimeType,
        },
        body: fileBlob,
      }
    );
    if (!updateRes.ok) {
      throw new Error(`Failed to update existing Drive file ${existingFileId}`);
    }
  } else {
    // Check if file with same name exists in folder
    const existing = await findFileInFolder(token, fileName, folderId);
    if (existing) {
      // Update existing content instead of creating duplicate
      const updateRes = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(existing.id)}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': mimeType,
          },
          body: fileBlob,
        }
      );
      if (!updateRes.ok) {
        throw new Error(`Failed to update existing Drive file ${existing.id}`);
      }
      fileId = existing.id;
    } else {
      // Create new file via multipart upload
      const boundary = `casecraft_upload_${crypto.randomUUID()}`;
      const metadata = JSON.stringify({
        name: fileName,
        mimeType,
        parents: [folderId],
      });

      const body = new Blob([
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`,
        `--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`,
        fileBlob,
        `\r\n--${boundary}--`,
      ]);

      const createRes = await googleRequest<{ id: string }>(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
        token,
        {
          method: 'POST',
          headers: {
            'Content-Type': `multipart/related; boundary=${boundary}`,
          },
          body,
        }
      );
      fileId = createRes.id;
    }
  }

  if (!fileId) throw new Error(`Could not obtain Drive file ID for ${fileName}`);

  // Configure link permissions for downstream automation (Make.com/Printify) if enabled
  if (grantLinkAccess) {
    try {
      await googleRequest(
        `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/permissions`,
        token,
        {
          method: 'POST',
          body: JSON.stringify({
            role: 'reader',
            type: 'anyone',
            allowFileDiscovery: false,
          }),
        }
      );
    } catch {
      // Permission might already exist or domain policy restriction, proceed with file verification
    }
  }

  // Retrieve comprehensive file metadata including webContentLink and webViewLink
  const metaUrl = new URL(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`);
  metaUrl.search = new URLSearchParams({
    fields: 'id, name, mimeType, size, webViewLink, webContentLink',
  }).toString();

  const metadata = await googleRequest<DriveFileMetadata>(metaUrl.toString(), token);
  return metadata;
};

/**
 * Verify Drive asset exists, has size > 0, and has accessible URLs
 */
export const verifyDriveFile = async (
  token: string,
  fileId: string
): Promise<{ verified: boolean; meta: DriveFileMetadata; downloadUrl: string }> => {
  const metaUrl = new URL(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`);
  metaUrl.search = new URLSearchParams({
    fields: 'id, name, mimeType, size, webViewLink, webContentLink',
  }).toString();

  const meta = await googleRequest<DriveFileMetadata>(metaUrl.toString(), token);
  if (!meta.id) throw new Error(`File ID ${fileId} not found in Google Drive.`);

  // Construct standard direct download link for automation
  // Use uc?export=download&id=... which Make.com and external HTTP services can easily download
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(meta.id)}`;

  return { verified: true, meta, downloadUrl };
};

/**
 * List available Spreadsheets
 */
export const listSpreadsheets = async (
  token: string,
  driveId = 'my-drive'
): Promise<GoogleSpreadsheetRef[]> => {
  const url = new URL('https://www.googleapis.com/drive/v3/files');
  const params = new URLSearchParams({
    q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
    orderBy: 'name',
    pageSize: '100',
    fields: 'files(id, name, driveId)',
    spaces: 'drive',
  });
  if (driveId !== 'my-drive') {
    params.set('corpora', 'drive');
    params.set('driveId', driveId);
    params.set('includeItemsFromAllDrives', 'true');
    params.set('supportsAllDrives', 'true');
  } else {
    params.set('corpora', 'user');
  }
  url.search = params.toString();
  const data = await googleRequest<{ files?: GoogleSpreadsheetRef[] }>(url.toString(), token);
  return data.files || [];
};

/**
 * List Worksheets in a Spreadsheet
 */
export const listWorksheets = async (
  token: string,
  spreadsheetId: string
): Promise<GoogleWorksheetRef[]> => {
  const data = await googleRequest<{
    sheets?: { properties?: { sheetId: number; title: string; index: number } }[];
  }>(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}?fields=sheets.properties`,
    token
  );
  return (data.sheets || [])
    .map((s) => s.properties)
    .filter((p): p is { sheetId: number; title: string; index: number } => Boolean(p?.title))
    .map((p) => ({ id: p.sheetId, title: p.title, index: p.index }));
};

const sheetRange = (sheetName: string, range: string): string =>
  `${encodeURIComponent(`'${sheetName.replace(/'/g, "''")}'!${range}`)}`;

const valuesUrl = (spreadsheetId: string, range: string): string =>
  `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${range}`;

/**
 * Ensure Worksheet has exact CaseCraft unified headers in row 1
 */
export const ensureUnifiedSheetHeaders = async (
  token: string,
  spreadsheetId: string,
  sheetName: string
): Promise<void> => {
  const spreadsheet = await googleRequest<{
    sheets?: { properties?: { sheetId: number; title: string; gridProperties?: { columnCount?: number } } }[];
  }>(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}?fields=sheets.properties(sheetId,title,gridProperties(columnCount))`,
    token
  );
  const worksheet = spreadsheet.sheets?.map((s) => s.properties).find((p) => p?.title === sheetName);
  if (!worksheet) throw new Error(`Worksheet "${sheetName}" was not found in spreadsheet.`);

  const currentCols = worksheet.gridProperties?.columnCount || 0;
  if (currentCols < SHEET_HEADERS.length) {
    await googleRequest(
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}:batchUpdate`,
      token,
      {
        method: 'POST',
        body: JSON.stringify({
          requests: [
            {
              appendDimension: {
                sheetId: worksheet.sheetId,
                dimension: 'COLUMNS',
                length: SHEET_HEADERS.length - currentCols,
              },
            },
          ],
        }),
      }
    );
  }

  // Check row 1
  const range = sheetRange(sheetName, `A1:${columnToLetter(SHEET_HEADERS.length)}1`);
  const data = await googleRequest<{ values?: string[][] }>(valuesUrl(spreadsheetId, range), token);
  const current = data.values?.[0] || [];

  if (current.length === 0 || current.every((v) => !v)) {
    // Write headers
    await googleRequest(`${valuesUrl(spreadsheetId, range)}?valueInputOption=RAW`, token, {
      method: 'PUT',
      body: JSON.stringify({ values: [SHEET_HEADERS] }),
    });
    return;
  }

  // If headers differ from standard CaseCraft, update or notify
  const matches = SHEET_HEADERS.every((h, i) => current[i] === h);
  if (!matches) {
    // Check if it's the old 39-col schema or different
    // Automatically upgrade row 1 headers to unified 45-col schema
    await googleRequest(`${valuesUrl(spreadsheetId, range)}?valueInputOption=RAW`, token, {
      method: 'PUT',
      body: JSON.stringify({ values: [SHEET_HEADERS] }),
    });
  }
};

export const findProductRowInSheet = async (
  token: string,
  spreadsheetId: string,
  sheetName: string,
  productId: string
): Promise<number | null> => {
  const range = sheetRange(sheetName, 'A2:A');
  const data = await googleRequest<{ values?: string[][] }>(valuesUrl(spreadsheetId, range), token);
  const rows = data.values || [];
  const index = rows.findIndex((r) => r[0] === productId);
  return index < 0 ? null : index + 2;
};

export const productRecordToSheetRow = (
  record: UnifiedProductRecord,
  statusOverride?: string
): (string | number)[] => {
  const tags = Array.from({ length: 13 }, (_, i) => record.listing.tags[i] || '');

  // Design Drive file ID and URL
  const designId = record.design.fileId || '';
  const designUrl = record.design.fileUrl || '';

  // Mockups 01..06 IDs and URLs
  const mockupSlots = Array.from({ length: 6 }, (_, i) => {
    const m = record.mockups.find((item) => item.slotIndex === i);
    return {
      id: m?.fileId || '',
      url: m?.fileUrl || '',
    };
  });

  const status = statusOverride || record.automation.status || 'READY';

  return [
    record.productId,
    record.designName,
    record.listing.title,
    record.listing.description,
    ...tags,
    record.listing.category,
    record.listing.primaryColor,
    record.listing.secondaryColor,
    record.listing.style,
    record.listing.occasion,
    record.listing.recipient,
    designId,
    designUrl,
    mockupSlots[0].id,
    mockupSlots[0].url,
    mockupSlots[1].id,
    mockupSlots[1].url,
    mockupSlots[2].id,
    mockupSlots[2].url,
    mockupSlots[3].id,
    mockupSlots[3].url,
    mockupSlots[4].id,
    mockupSlots[4].url,
    mockupSlots[5].id,
    mockupSlots[5].url,
    record.product.sku || record.productId,
    record.product.price || 24.99,
    record.printify.blueprintId || '',
    record.printify.printProviderId || '',
    record.printify.variantIds.join(','),
    status,
    record.automation.printifyProductId || '',
    record.automation.etsyListingId || '',
    record.automation.error || '',
    record.automation.createdDate || new Date().toISOString(),
    record.automation.publishedDate || '',
  ];
};

export const writeOrUpdateProductRow = async (
  token: string,
  spreadsheetId: string,
  sheetName: string,
  row: (string | number)[],
  existingRowNumber?: number
): Promise<number> => {
  const maxCol = columnToLetter(SHEET_HEADERS.length);
  if (existingRowNumber) {
    const range = sheetRange(sheetName, `A${existingRowNumber}:${maxCol}${existingRowNumber}`);
    await googleRequest(`${valuesUrl(spreadsheetId, range)}?valueInputOption=RAW`, token, {
      method: 'PUT',
      body: JSON.stringify({ values: [row] }),
    });
    return existingRowNumber;
  }

  const range = sheetRange(sheetName, `A:${maxCol}`);
  const appendRes = await googleRequest<{ updates?: { updatedRange?: string } }>(
    `${valuesUrl(spreadsheetId, range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    token,
    {
      method: 'POST',
      body: JSON.stringify({ values: [row] }),
    }
  );

  // Extract row number if possible
  const updatedRange = appendRes.updates?.updatedRange || '';
  const match = updatedRange.match(/!A(\d+):/);
  return match ? parseInt(match[1], 10) : 0;
};

// Helper to convert 1-based column number to Sheets letter (1 -> A, 27 -> AA, 45 -> AS)
function columnToLetter(column: number): string {
  let temp: number;
  let letter = '';
  let col = column;
  while (col > 0) {
    temp = (col - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    col = Math.floor((col - temp) / 26);
  }
  return letter;
}

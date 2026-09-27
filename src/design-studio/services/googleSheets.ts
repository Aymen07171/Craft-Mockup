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
  'Design_File_URL',
  ...Array.from({ length: 6 }, (_, index) => `Mockup_${String(index + 1).padStart(2, '0')}_URL`),
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

const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.file',
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

export interface GoogleDrive {
  id: string;
  name: string;
}

export interface GoogleSpreadsheet {
  id: string;
  name: string;
  driveId?: string;
}

export interface GoogleWorksheet {
  id: number;
  title: string;
  index: number;
}

interface GoogleWorksheetProperties {
  sheetId: number;
  title: string;
  index: number;
}

let identityScriptPromise: Promise<void> | undefined;

const loadIdentityScript = (): Promise<void> => {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (identityScriptPromise) return identityScriptPromise;

  identityScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google sign-in could not be loaded.'));
    document.head.appendChild(script);
  });
  return identityScriptPromise;
};

export const connectGoogle = async (clientId: string): Promise<{ token: string; email: string }> => {
  if (!clientId) throw new Error('Set VITE_GOOGLE_CLIENT_ID to enable Google Sheets.');
  await loadIdentityScript();
  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) throw new Error('Google sign-in is unavailable in this browser.');

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
  return { token, email: user.email || 'Google account' };
};

const googleRequest = async <T>(url: string, token: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = (data as { error?: { message?: string } }).error?.message;
    throw new Error(message || `Google API request failed (${response.status}).`);
  }
  return data as T;
};

export const listGoogleDrives = async (token: string): Promise<GoogleDrive[]> => {
  const url = new URL('https://www.googleapis.com/drive/v3/drives');
  url.search = new URLSearchParams({ pageSize: '100', fields: 'drives(id,name)' }).toString();
  const data = await googleRequest<{ drives?: GoogleDrive[] }>(url.toString(), token);
  return [{ id: 'my-drive', name: 'My Drive' }, ...(data.drives || [])];
};

export const listSpreadsheets = async (token: string, driveId: string): Promise<GoogleSpreadsheet[]> => {
  const url = new URL('https://www.googleapis.com/drive/v3/files');
  const params = new URLSearchParams({
    q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
    orderBy: 'name',
    pageSize: '100',
    fields: 'files(id,name,driveId)',
    spaces: 'drive',
  });
  if (driveId === 'my-drive') {
    params.set('corpora', 'user');
  } else {
    params.set('corpora', 'drive');
    params.set('driveId', driveId);
    params.set('includeItemsFromAllDrives', 'true');
    params.set('supportsAllDrives', 'true');
  }
  url.search = params.toString();
  const data = await googleRequest<{ files?: GoogleSpreadsheet[] }>(url.toString(), token);
  return data.files || [];
};

export const listWorksheets = async (token: string, spreadsheetId: string): Promise<GoogleWorksheet[]> => {
  const data = await googleRequest<{
    sheets?: { properties?: GoogleWorksheetProperties }[];
  }>(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}?fields=sheets.properties`,
    token
  );
  return (data.sheets || [])
    .map((sheet) => sheet.properties)
    .filter((sheet): sheet is GoogleWorksheetProperties => Boolean(sheet?.title))
    .map((sheet) => ({ id: sheet.sheetId, title: sheet.title, index: sheet.index }));
};

const sheetRange = (sheetName: string, range: string): string =>
  `${encodeURIComponent(`'${sheetName.replace(/'/g, "''")}'!${range}`)}`;

const valuesUrl = (spreadsheetId: string, range: string): string =>
  `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${range}`;

export const ensureSheetHeaders = async (
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
  const worksheet = spreadsheet.sheets?.map((sheet) => sheet.properties).find((sheet) => sheet?.title === sheetName);
  if (!worksheet) throw new Error(`Worksheet "${sheetName}" was not found in the selected spreadsheet.`);

  const currentColumnCount = worksheet.gridProperties?.columnCount || 0;
  if (currentColumnCount < SHEET_HEADERS.length) {
    await googleRequest(
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}:batchUpdate`,
      token,
      {
        method: 'POST',
        body: JSON.stringify({
          requests: [{
            appendDimension: {
              sheetId: worksheet.sheetId,
              dimension: 'COLUMNS',
              length: SHEET_HEADERS.length - currentColumnCount,
            },
          }],
        }),
      }
    );
  }

  const range = sheetRange(sheetName, 'A1:AO1');
  const data = await googleRequest<{ values?: string[][] }>(valuesUrl(spreadsheetId, range), token);
  const current = data.values?.[0] || [];
  if (current.length === 0 || current.every((value) => !value)) {
    await googleRequest(valuesUrl(spreadsheetId, range) + '?valueInputOption=RAW', token, {
      method: 'PUT',
      body: JSON.stringify({ values: [SHEET_HEADERS] }),
    });
    return;
  }
  if (current.length !== SHEET_HEADERS.length || SHEET_HEADERS.some((header, index) => current[index] !== header)) {
    throw new Error('The selected worksheet has different columns in row 1. Choose an empty worksheet or the CaseCraft Etsy columns.');
  }
};

export const findProductRow = async (
  token: string,
  spreadsheetId: string,
  sheetName: string,
  productId: string
): Promise<number | null> => {
  const range = sheetRange(sheetName, 'A2:A');
  const data = await googleRequest<{ values?: string[][] }>(valuesUrl(spreadsheetId, range), token);
  const index = (data.values || []).findIndex((row) => row[0] === productId);
  return index < 0 ? null : index + 2;
};

export const readProductRow = async (
  token: string,
  spreadsheetId: string,
  sheetName: string,
  rowNumber: number
): Promise<string[] | null> => {
  const range = sheetRange(sheetName, `A${rowNumber}:AO${rowNumber}`);
  const data = await googleRequest<{ values?: string[][] }>(valuesUrl(spreadsheetId, range), token);
  return data.values?.[0] || null;
};

export const writeProductRow = async (
  token: string,
  spreadsheetId: string,
  sheetName: string,
  row: (string | number)[],
  rowNumber?: number
): Promise<void> => {
  if (row.length !== SHEET_HEADERS.length) {
    throw new Error('The listing does not match the required Google Sheets columns.');
  }
  if (rowNumber) {
    const range = sheetRange(sheetName, `A${rowNumber}:AO${rowNumber}`);
    await googleRequest(valuesUrl(spreadsheetId, range) + '?valueInputOption=RAW', token, {
      method: 'PUT',
      body: JSON.stringify({ values: [row] }),
    });
    return;
  }

  const range = sheetRange(sheetName, 'A:AO');
  await googleRequest(
    valuesUrl(spreadsheetId, range) + ':append?valueInputOption=RAW&insertDataOption=INSERT_ROWS',
    token,
    { method: 'POST', body: JSON.stringify({ values: [row] }) }
  );
};

export const uploadPublicImage = async (
  token: string,
  imageUrl: string,
  fileName: string
): Promise<string> => {
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) throw new Error(`Could not load ${fileName} for Google Drive upload.`);
  const image = await imageResponse.blob();
  if (!image.type.startsWith('image/')) throw new Error(`${fileName} is not an image.`);

  const boundary = `casecraft-${crypto.randomUUID()}`;
  const metadata = JSON.stringify({ name: fileName, mimeType: image.type });
  const body = new Blob([
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`,
    `--${boundary}\r\nContent-Type: ${image.type}\r\n\r\n`,
    image,
    `\r\n--${boundary}--`,
  ]);
  const uploaded = await googleRequest<{ id: string }>(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
    token,
    {
      method: 'POST',
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      body,
    }
  );
  await googleRequest(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(uploaded.id)}/permissions`,
    token,
    { method: 'POST', body: JSON.stringify({ type: 'anyone', role: 'reader' }) }
  );
  return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(uploaded.id)}`;
};
import React, { useEffect, useState } from 'react';
import { Check, Copy, ExternalLink, RefreshCw, Settings2, Sparkles } from 'lucide-react';
import { GeneratedDesign } from '../types';
import {
  connectGoogle,
  ensureSheetHeaders,
  findProductRow,
  GoogleDrive,
  GoogleSpreadsheet,
  GoogleWorksheet,
  listGoogleDrives,
  listSpreadsheets,
  listWorksheets,
  readProductRow,
  SHEET_HEADERS,
  uploadPublicImage,
  writeProductRow,
} from '../services/googleSheets';
import {
  createListingDraft,
  EtsyListingDraft,
  ListingSettings,
  ListingStatus,
  loadListingDrafts,
  loadListingSettings,
  listingToSheetRow,
  nextProductId,
  PHONE_MODELS,
  saveListingDrafts,
  saveListingSettings,
  validateListingDraft,
} from '../services/listingData';

interface EtsyListingResponse {
  productTitle: string;
  productDescription: string;
  primaryKeywords: string[];
  longTailKeywords: string[];
  etsyTags: string[];
  category: string;
  primaryColor: string;
  secondaryColor: string;
  occasion: string;
  targetCustomer: string[];
  designStyle: string[];
  searchIntent: string[];
  keywordRationale: string;
}

interface EtsyListingGeneratorProps {
  design: GeneratedDesign;
  designs: GeneratedDesign[];
}

interface PendingDuplicate {
  designId: string;
  rowNumber: number;
  remainingIds: string[];
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const getImageDataUrl = async (imageUrl: string): Promise<string> => {
  if (/^data:image\/(?:png|jpe?g|webp);base64,/i.test(imageUrl)) return imageUrl;
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error('Could not load the selected design image.');
  const imageBlob = await response.blob();
  if (!imageBlob.type.startsWith('image/')) throw new Error('The selected design is not a supported image.');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string'
      ? resolve(reader.result)
      : reject(new Error('Could not read the selected design image.'));
    reader.onerror = () => reject(new Error('Could not read the selected design image.'));
    reader.readAsDataURL(imageBlob);
  });
};

const formatListing = (listing: EtsyListingDraft): string => [
  'PRODUCT ID', listing.productId,
  '', 'ETSY TITLE', listing.title,
  '', 'DESCRIPTION', listing.description,
  '', 'ETSY TAGS', ...listing.tags.map((tag, index) => `${String(index + 1).padStart(2, '0')}. ${tag}`),
  '', 'CATEGORY', listing.category,
  '', 'COLORS', `${listing.primaryColor} / ${listing.secondaryColor}`,
  '', 'STYLE', listing.style,
  '', 'OCCASION', listing.occasion,
  '', 'RECIPIENT', listing.recipient,
  '', 'KEYWORD RATIONALE', listing.keywordRationale,
].join('\n');

const isLocalUrl = (value: string): boolean => {
  if (value.startsWith('data:image/')) return true;
  try {
    return ['localhost', '127.0.0.1', '::1'].includes(new URL(value).hostname);
  } catch {
    return true;
  }
};

const verifyImageUrl = (url: string, label: string): Promise<void> => new Promise((resolve, reject) => {
  const image = new Image();
  const timeout = window.setTimeout(() => reject(new Error(`${label} could not be loaded.`)), 15000);
  image.referrerPolicy = 'no-referrer';
  image.onload = () => {
    window.clearTimeout(timeout);
    image.naturalWidth > 0 ? resolve() : reject(new Error(`${label} is not a valid image.`));
  };
  image.onerror = () => {
    window.clearTimeout(timeout);
    reject(new Error(`${label} URL could not be loaded.`));
  };
  image.src = url;
});

export const EtsyListingGenerator: React.FC<EtsyListingGeneratorProps> = ({ design, designs }) => {
  const [drafts, setDrafts] = useState<Record<string, EtsyListingDraft>>(loadListingDrafts);
  const [settings, setSettings] = useState<ListingSettings>(loadListingSettings);
  const [selectedDesignIds, setSelectedDesignIds] = useState<string[]>([design.id]);
  const [activeDraftId, setActiveDraftId] = useState(design.id);
  const [mockupFiles, setMockupFiles] = useState<Record<string, (File | null)[]>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleBusy, setGoogleBusy] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [drives, setDrives] = useState<GoogleDrive[]>([]);
  const [driveId, setDriveId] = useState('my-drive');
  const [spreadsheets, setSpreadsheets] = useState<GoogleSpreadsheet[]>([]);
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [worksheets, setWorksheets] = useState<GoogleWorksheet[]>([]);
  const [worksheetTitle, setWorksheetTitle] = useState('');
  const [allowPublicDriveLinks, setAllowPublicDriveLinks] = useState(false);
  const [pendingDuplicate, setPendingDuplicate] = useState<PendingDuplicate | null>(null);

  useEffect(() => {
    setActiveDraftId(design.id);
    setSelectedDesignIds((current) => current.includes(design.id) ? current : [design.id, ...current]);
  }, [design.id]);

  const activeDesign = designs.find((item) => item.id === activeDraftId) || design;
  const activeDraft = drafts[activeDraftId] || null;
  const activeFiles = mockupFiles[activeDraftId] || Array(6).fill(null);

  const setDraftMap = (next: Record<string, EtsyListingDraft>, persist = false) => {
    setDrafts(next);
    if (persist) {
      try {
        saveListingDrafts(next);
      } catch {
        setError('The listing could not be saved in this browser. Check available storage.');
      }
    }
  };

  const updateActiveDraft = (patch: Partial<EtsyListingDraft>) => {
    const base = drafts[activeDraftId] || createListingDraft(activeDesign, settings);
    setDraftMap({ ...drafts, [activeDraftId]: { ...base, ...patch } });
    setValidationErrors([]);
    setError(null);
    setMessage(null);
  };

  const updateSettings = (patch: Partial<ListingSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    try {
      saveListingSettings(next);
    } catch {
      setError('Listing settings could not be saved in this browser.');
    }
  };

  const updateDraftById = (draft: EtsyListingDraft, persist = false) => {
    setDraftMap({ ...drafts, [draft.designId]: draft }, persist);
  };

  const openDraft = (designId: string) => {
    const selectedDesign = designs.find((item) => item.id === designId);
    if (!selectedDesign) return;
    if (!drafts[designId]) {
      setDraftMap({ ...drafts, [designId]: createListingDraft(selectedDesign, settings) });
    }
    setActiveDraftId(designId);
    setError(null);
    setValidationErrors([]);
  };

  const toggleSelectedDesign = (designId: string) => {
    setSelectedDesignIds((current) => current.includes(designId)
      ? current.filter((id) => id !== designId)
      : [...current, designId]);
  };

  const generateListings = async () => {
    const selected = designs.filter((item) => selectedDesignIds.includes(item.id));
    if (selected.length === 0) {
      setError('Select at least one design to generate a listing.');
      return;
    }
    setIsGenerating(true);
    setError(null);
    setMessage(null);
    setGenerationProgress('');
    let nextDrafts = { ...drafts };
    const failed: string[] = [];

    for (const [index, selectedDesign] of selected.entries()) {
      setGenerationProgress(`Analyzing ${selectedDesign.title} (${index + 1} of ${selected.length})...`);
      try {
        const imageDataUrl = await getImageDataUrl(selectedDesign.imageUrl);
        const response = await fetch('/design-api/generate-etsy-listing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: selectedDesign.prompt, imageDataUrl, designTitle: selectedDesign.title, niche: selectedDesign.niche }),
        });
        const data = await response.json() as { listing?: EtsyListingResponse; error?: string };
        if (!response.ok || !data.listing) throw new Error(data.error || 'Could not generate the Etsy listing.');

        const listing = data.listing;
        const draft = createListingDraft(selectedDesign, settings, nextDrafts[selectedDesign.id]);
        nextDrafts[selectedDesign.id] = {
          ...draft,
          title: listing.productTitle,
          description: listing.productDescription,
          tags: Array.from({ length: 13 }, (_, tagIndex) => listing.etsyTags?.[tagIndex] || ''),
          category: listing.category || draft.category,
          primaryColor: listing.primaryColor || draft.primaryColor,
          secondaryColor: listing.secondaryColor || draft.secondaryColor,
          style: listing.designStyle?.join(', ') || draft.style,
          occasion: listing.occasion || draft.occasion,
          recipient: listing.targetCustomer?.join(', ') || draft.recipient,
          primaryKeywords: listing.primaryKeywords || [],
          longTailKeywords: listing.longTailKeywords || [],
          searchIntent: listing.searchIntent || [],
          keywordRationale: listing.keywordRationale || '',
          status: 'DRAFT',
          error: '',
        };
        setDrafts({ ...nextDrafts });
        if (index === 0) setActiveDraftId(selectedDesign.id);
      } catch (generationError) {
        failed.push(`${selectedDesign.title}: ${generationError instanceof Error ? generationError.message : 'Listing generation failed.'}`);
      }
    }

    setIsGenerating(false);
    setGenerationProgress('');
    if (failed.length) setError(failed.join('\n'));
    else setMessage(`${selected.length} Etsy listing${selected.length === 1 ? '' : 's'} generated for review.`);
  };

  const saveActiveListing = () => {
    if (!activeDraft) return;
    const status = activeDraft.status === 'ERROR' ? 'DRAFT' : activeDraft.status;
    const saved = { ...activeDraft, status, error: status === 'DRAFT' ? '' : activeDraft.error };
    updateDraftById(saved, true);
    setMessage(`Draft ${saved.productId} saved in this browser.`);
    setError(null);
  };

  const copyListing = async () => {
    if (!activeDraft) return;
    try {
      await navigator.clipboard.writeText(formatListing(activeDraft));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Clipboard access is unavailable in this browser.');
    }
  };

  const connectSheets = async () => {
    setGoogleBusy(true);
    setGoogleError(null);
    try {
      const account = await connectGoogle(GOOGLE_CLIENT_ID);
      const availableDrives = await listGoogleDrives(account.token);
      const availableSpreadsheets = await listSpreadsheets(account.token, 'my-drive');
      setGoogleToken(account.token);
      setGoogleEmail(account.email);
      setDrives(availableDrives);
      setDriveId('my-drive');
      setSpreadsheets(availableSpreadsheets);
      setSpreadsheetId('');
      setWorksheets([]);
      setWorksheetTitle('');
    } catch (connectionError) {
      setGoogleError(connectionError instanceof Error ? connectionError.message : 'Google authorization failed.');
    } finally {
      setGoogleBusy(false);
    }
  };

  const changeDrive = async (selectedDriveId: string) => {
    if (!googleToken) return;
    setDriveId(selectedDriveId);
    setSpreadsheetId('');
    setWorksheets([]);
    setWorksheetTitle('');
    setGoogleBusy(true);
    setGoogleError(null);
    try {
      setSpreadsheets(await listSpreadsheets(googleToken, selectedDriveId));
    } catch (driveError) {
      setGoogleError(driveError instanceof Error ? driveError.message : 'Could not read this Google Drive.');
    } finally {
      setGoogleBusy(false);
    }
  };

  const changeSpreadsheet = async (selectedSpreadsheetId: string) => {
    setSpreadsheetId(selectedSpreadsheetId);
    setWorksheets([]);
    setWorksheetTitle('');
    if (!googleToken || !selectedSpreadsheetId) return;
    setGoogleBusy(true);
    setGoogleError(null);
    try {
      setWorksheets(await listWorksheets(googleToken, selectedSpreadsheetId));
    } catch (spreadsheetError) {
      setGoogleError(spreadsheetError instanceof Error ? spreadsheetError.message : 'Could not read the spreadsheet.');
    } finally {
      setGoogleBusy(false);
    }
  };

  const preparePublicUrls = async (
    draft: EtsyListingDraft,
    selectedDesign: GeneratedDesign,
    files: (File | null)[]
  ): Promise<EtsyListingDraft> => {
    if (!googleToken) throw new Error('Connect Google Sheets before uploading listing images.');
    let designFileUrl = draft.designFileUrl.trim() || selectedDesign.sourceUrl || selectedDesign.imageUrl;
    const needsDriveUpload = isLocalUrl(designFileUrl) || files.some(Boolean) || draft.mockupUrls.some((url) => url && isLocalUrl(url));
    if (needsDriveUpload && !allowPublicDriveLinks) {
      throw new Error('Allow public Google Drive links before uploading images for Make.com.');
    }

    if (isLocalUrl(designFileUrl)) {
      designFileUrl = await uploadPublicImage(
        googleToken,
        designFileUrl,
        `${draft.productId}-print-file.${selectedDesign.imageUrl.startsWith('data:image/png') ? 'png' : 'jpg'}`
      );
    }

    const mockupUrls = [...draft.mockupUrls];
    for (let index = 0; index < mockupUrls.length; index += 1) {
      const file = files[index];
      if (file) {
        const localUrl = URL.createObjectURL(file);
        try {
          mockupUrls[index] = await uploadPublicImage(googleToken, localUrl, `${draft.productId}-mockup-${index + 1}-${file.name}`);
        } finally {
          URL.revokeObjectURL(localUrl);
        }
      } else if (mockupUrls[index] && isLocalUrl(mockupUrls[index])) {
        mockupUrls[index] = await uploadPublicImage(googleToken, mockupUrls[index], `${draft.productId}-mockup-${index + 1}.jpg`);
      }
    }
    return { ...draft, designFileUrl, mockupUrls };
  };

  const exportBatch = async (
    designIds: string[],
    initialDrafts: Record<string, EtsyListingDraft> = drafts
  ) => {
    if (!googleToken || !spreadsheetId || !worksheetTitle) {
      setGoogleError('Connect Google Sheets and select a Drive, spreadsheet, and worksheet.');
      return;
    }
    const records = designIds.map((id) => initialDrafts[id]);
    if (records.some((record) => !record)) {
      setError('Generate a listing for every selected design before exporting.');
      return;
    }
    const validRecords = records.filter((record): record is EtsyListingDraft => Boolean(record));
    const preflightErrors = validRecords.flatMap((record) => {
      const selectedDesign = designs.find((item) => item.id === record.designId);
      const files = mockupFiles[record.designId] || Array(6).fill(null);
      return validateListingDraft(record, settings, files, Boolean(selectedDesign?.imageUrl || record.designFileUrl))
        .map((issue) => `${record.designName}: ${issue}`);
    });
    if (preflightErrors.length) {
      setValidationErrors(preflightErrors);
      const firstInvalid = validRecords.find((record) => validateListingDraft(
        record,
        settings,
        mockupFiles[record.designId] || Array(6).fill(null),
        Boolean(designs.find((item) => item.id === record.designId)?.imageUrl || record.designFileUrl)
      ).length > 0);
      if (firstInvalid) setActiveDraftId(firstInvalid.designId);
      return;
    }

    setIsExporting(true);
    setError(null);
    setGoogleError(null);
    setMessage(null);
    setValidationErrors([]);
    let workingDrafts = { ...initialDrafts };
    let currentDesignId = designIds[0];
    const exported: string[] = [];

    try {
      for (const record of validRecords) {
        const selectedDesign = designs.find((item) => item.id === record.designId);
        if (!selectedDesign) throw new Error(`The design for ${record.designName} is no longer available.`);
        const files = mockupFiles[record.designId] || Array(6).fill(null);
        const designUrl = record.designFileUrl.trim() || selectedDesign.sourceUrl || selectedDesign.imageUrl;
        await verifyImageUrl(designUrl, 'Design file');
        for (let index = 0; index < record.mockupUrls.length; index += 1) {
          if (files[index]) {
            if (!files[index]?.type.startsWith('image/')) throw new Error(`Mockup ${index + 1} is not an image file.`);
          } else if (record.mockupUrls[index]?.trim()) {
            await verifyImageUrl(record.mockupUrls[index], `Mockup ${String(index + 1).padStart(2, '0')}`);
          }
        }
      }
      await ensureSheetHeaders(googleToken, spreadsheetId, worksheetTitle);
      for (const [index, designId] of designIds.entries()) {
        currentDesignId = designId;
        const draft = workingDrafts[designId];
        const selectedDesign = designs.find((item) => item.id === designId);
        if (!selectedDesign) throw new Error(`The design for ${draft.designName} is no longer available.`);
        const rowNumber = await findProductRow(googleToken, spreadsheetId, worksheetTitle, draft.productId);
        if (rowNumber) {
          setPendingDuplicate({ designId, rowNumber, remainingIds: designIds.slice(index + 1) });
          setMessage(`Product ${draft.productId} already exists.`);
          return;
        }

        const prepared = await preparePublicUrls(draft, selectedDesign, mockupFiles[designId] || Array(6).fill(null));
        const finalErrors = validateListingDraft(prepared, settings, Array(6).fill(null), Boolean(prepared.designFileUrl));
        if (finalErrors.length) {
          setActiveDraftId(designId);
          setValidationErrors(finalErrors);
          return;
        }
        const ready = { ...prepared, status: 'READY' as const, error: '' };
        await writeProductRow(googleToken, spreadsheetId, worksheetTitle, listingToSheetRow(ready, settings, 'READY'));
        workingDrafts = { ...workingDrafts, [designId]: ready };
        setDraftMap(workingDrafts, true);
        exported.push(ready.productId);
      }
      if (exported.length) {
        setMessage(exported.map((id) => `Product ${id} successfully added to Google Sheets.`).join('\n'));
      }
    } catch (exportError) {
      const messageText = exportError instanceof Error ? exportError.message : 'Google Sheets export failed.';
      const failedDraft = workingDrafts[currentDesignId] || validRecords[0];
      if (failedDraft) {
        const failed = { ...failedDraft, status: 'ERROR' as const, error: messageText };
        workingDrafts = { ...workingDrafts, [failed.designId]: failed };
        setDraftMap(workingDrafts, true);
        setError(messageText);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const resolveDuplicate = async (choice: 'update' | 'new-id' | 'cancel') => {
    if (!pendingDuplicate || !googleToken || !spreadsheetId || !worksheetTitle) return;
    const pending = pendingDuplicate;
    const existingDraft = drafts[pending.designId];
    if (!existingDraft) return;
    setPendingDuplicate(null);
    if (choice === 'cancel') {
      setMessage('Export canceled. No duplicate row was added.');
      return;
    }

    setIsExporting(true);
    try {
      let draft = existingDraft;
      if (choice === 'new-id') {
        let productId = nextProductId();
        while (await findProductRow(googleToken, spreadsheetId, worksheetTitle, productId)) productId = nextProductId();
        draft = { ...draft, productId, sku: draft.sku === draft.productId ? productId : draft.sku };
      }
      const selectedDesign = designs.find((item) => item.id === pending.designId);
      if (!selectedDesign) throw new Error('The design for this listing is no longer available.');
      const prepared = await preparePublicUrls(draft, selectedDesign, mockupFiles[pending.designId] || Array(6).fill(null));
      const errors = validateListingDraft(prepared, settings, Array(6).fill(null), Boolean(prepared.designFileUrl));
      if (errors.length) {
        setActiveDraftId(pending.designId);
        setValidationErrors(errors);
        return;
      }
      let savedStatus: ListingStatus = 'READY';
      const ready = { ...prepared, status: 'READY' as const, error: '' };
      const row = listingToSheetRow(ready, settings, 'READY');
      if (choice === 'update') {
        const previous = await readProductRow(googleToken, spreadsheetId, worksheetTitle, pending.rowNumber);
        if (previous) {
          for (const column of ['Printify_Product_ID', 'Etsy_Listing_ID', 'Created_Date', 'Published_Date']) {
            const columnIndex = SHEET_HEADERS.indexOf(column as typeof SHEET_HEADERS[number]);
            if (previous[columnIndex]) row[columnIndex] = previous[columnIndex];
          }
          const statusIndex = SHEET_HEADERS.indexOf('Status');
          if (previous[statusIndex] && !['DRAFT', 'ERROR', 'READY'].includes(previous[statusIndex])) {
            row[statusIndex] = previous[statusIndex];
            savedStatus = previous[statusIndex] as ListingStatus;
          }
        }
      }
      await writeProductRow(
        googleToken,
        spreadsheetId,
        worksheetTitle,
        row,
        choice === 'update' ? pending.rowNumber : undefined
      );
      const updated = { ...drafts, [pending.designId]: { ...ready, status: savedStatus } };
      setDraftMap(updated, true);
      setMessage(choice === 'update'
        ? `Product ${ready.productId} updated in Google Sheets.`
        : `Product ${ready.productId} successfully added to Google Sheets.`);
      await exportBatch(pending.remainingIds, updated);
    } catch (duplicateError) {
      const messageText = duplicateError instanceof Error ? duplicateError.message : 'Could not resolve the duplicate product.';
      const failed = { ...existingDraft, status: 'ERROR' as const, error: messageText };
      setDraftMap({ ...drafts, [failed.designId]: failed }, true);
      setError(messageText);
    } finally {
      setIsExporting(false);
    }
  };

  const changeMockupFile = (index: number, file: File | null) => {
    setMockupFiles((current) => {
      const nextFiles = [...(current[activeDraftId] || Array(6).fill(null))];
      nextFiles[index] = file;
      return { ...current, [activeDraftId]: nextFiles };
    });
  };

  const selectedCount = selectedDesignIds.filter((id) => designs.some((item) => item.id === id)).length;
  const hasLocalAssets = Boolean(activeDraft && (
    isLocalUrl(activeDraft.designFileUrl || activeDesign.sourceUrl || activeDesign.imageUrl) ||
    activeFiles.some(Boolean) || activeDraft.mockupUrls.some((url) => url && isLocalUrl(url))
  ));

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-white">
            <Sparkles className="h-4 w-4 text-amber-300" /> Etsy Listing
          </h3>
          <p className="mt-1 text-xs text-slate-400">Analyze the selected artwork, review the listing, and export a product row.</p>
        </div>
        <button type="button" onClick={generateListings} disabled={isGenerating || selectedCount === 0} className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-amber-300/40 bg-amber-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-wait disabled:opacity-70">
          {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {isGenerating ? generationProgress || 'Analyzing design...' : selectedCount > 1 ? 'Generate Etsy Listings' : activeDraft ? 'Regenerate Listing' : 'Generate Etsy Listing'}
        </button>
      </div>

      {designs.length > 1 && (
        <div className="mt-5 border-t border-slate-800 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-300">Designs</h4>
            <span className="text-xs text-slate-500">{selectedCount} selected</span>
          </div>
          <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
            {designs.map((item) => (
              <label key={item.id} className="flex min-w-0 items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={selectedDesignIds.includes(item.id)} onChange={() => toggleSelectedDesign(item.id)} className="h-4 w-4 accent-amber-300" />
                <button type="button" onClick={() => openDraft(item.id)} className="truncate text-left hover:text-white">{item.title}{drafts[item.id] ? ` · ${drafts[item.id].status}` : ''}</button>
              </label>
            ))}
          </div>
        </div>
      )}

      {error && <p role="alert" className="mt-4 whitespace-pre-line rounded-md border border-rose-900 bg-rose-950/50 p-3 text-sm text-rose-200">{error}</p>}
      {message && <p role="status" className="mt-4 whitespace-pre-line rounded-md border border-emerald-900 bg-emerald-950/40 p-3 text-sm text-emerald-200">{message}</p>}
      {validationErrors.length > 0 && <ul role="alert" className="mt-4 list-inside list-disc space-y-1 rounded-md border border-rose-900 bg-rose-950/50 p-3 text-sm text-rose-200">{validationErrors.map((issue, index) => <li key={`${index}-${issue}`}>{issue}</li>)}</ul>}

      {activeDraft && (
        <div className="mt-6 space-y-6 border-t border-slate-800 pt-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <img src={activeDesign.imageUrl} alt={activeDesign.title} className="h-20 w-14 rounded border border-slate-700 object-cover" />
              <div><p className="text-[11px] font-semibold uppercase tracking-wide text-amber-300">Product ID</p><p className="mt-1 font-mono text-sm text-white">{activeDraft.productId}</p><p className="mt-1 max-w-xl text-xs text-slate-400">{activeDesign.title}</p></div>
            </div>
            <button type="button" onClick={copyListing} className="flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:border-slate-500">
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}{copied ? 'Copied' : 'Copy full listing'}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs text-slate-300">Design name<input value={activeDraft.designName} onChange={(event) => updateActiveDraft({ designName: event.target.value })} className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" /></label>
            <label className="text-xs text-slate-300">Product_ID<input value={activeDraft.productId} readOnly className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-slate-400" /></label>
          </div>

          <label className="block text-xs text-slate-300">Etsy title
            <input value={activeDraft.title} maxLength={200} onChange={(event) => updateActiveDraft({ title: event.target.value })} className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" />
            <span className={`mt-1 block text-right ${activeDraft.title.length > 140 ? 'text-rose-300' : 'text-slate-500'}`}>{activeDraft.title.length} / 140</span>
          </label>

          <label className="block text-xs text-slate-300">Etsy description<textarea value={activeDraft.description} rows={10} onChange={(event) => updateActiveDraft({ description: event.target.value })} className="mt-1 w-full resize-y rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm leading-6 text-white" /></label>

          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-300">Etsy tags</h4>
            <div className="mt-2 grid gap-x-4 gap-y-2 sm:grid-cols-2">
              {Array.from({ length: 13 }, (_, index) => {
                const tag = activeDraft.tags[index] || '';
                return <label key={index} className="grid grid-cols-[30px_1fr_auto] items-center gap-2 text-xs text-slate-400">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <input value={tag} maxLength={40} onChange={(event) => { const tags = [...activeDraft.tags]; tags[index] = event.target.value; updateActiveDraft({ tags }); }} className="min-w-0 rounded-md border border-slate-700 bg-slate-950 px-2.5 py-2 text-sm text-white" />
                  <span className={tag.length > 20 ? 'text-rose-300' : 'text-slate-500'}>{tag.length}/20</span>
                </label>;
              })}
            </div>
          </section>

          <section>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-300">Product information</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                ['category', 'Category'], ['primaryColor', 'Primary color'], ['secondaryColor', 'Secondary color'],
                ['style', 'Style'], ['occasion', 'Occasion'], ['recipient', 'Recipient / target customer'],
              ] as const).map(([key, label]) => <label key={key} className="text-xs text-slate-300">{label}<input value={activeDraft[key]} onChange={(event) => updateActiveDraft({ [key]: event.target.value })} className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" /></label>)}
              <label className="text-xs text-slate-300">SKU<input value={activeDraft.sku} onChange={(event) => updateActiveDraft({ sku: event.target.value })} className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" /></label>
              <label className="text-xs text-slate-300">Selling price<input type="number" min="0.01" step="0.01" value={activeDraft.price} onChange={(event) => updateActiveDraft({ price: event.target.value })} className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" /></label>
            </div>
          </section>

          <section>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-300">Design file and mockups</h4>
            <label className="block text-xs text-slate-300">Design_File_URL<input value={activeDraft.designFileUrl} onChange={(event) => updateActiveDraft({ designFileUrl: event.target.value })} placeholder="Public design URL or leave for Drive upload" className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" /></label>
            <div className="mt-3 grid gap-x-4 gap-y-3 sm:grid-cols-2">
              {Array.from({ length: 6 }, (_, index) => <div key={index} className="space-y-1.5">
                <label className="block text-xs text-slate-300">Mockup_{String(index + 1).padStart(2, '0')}_URL{index === 0 ? ' · primary image' : ''}
                  <input value={activeDraft.mockupUrls[index] || ''} onChange={(event) => { const mockupUrls = [...activeDraft.mockupUrls]; mockupUrls[index] = event.target.value; updateActiveDraft({ mockupUrls }); }} placeholder="https://..." className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" />
                </label>
                <input type="file" accept="image/png,image/jpeg,image/webp" aria-label={`Upload mockup ${index + 1}`} onChange={(event) => changeMockupFile(index, event.target.files?.[0] || null)} className="block w-full text-xs text-slate-400 file:mr-2 file:rounded file:border-0 file:bg-slate-800 file:px-2 file:py-1 file:text-xs file:text-slate-200" />
                {activeFiles[index] && <p className="truncate text-[11px] text-slate-500">Selected: {activeFiles[index]?.name}</p>}
              </div>)}
            </div>
          </section>

          <section>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-300">Printify configuration</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-slate-300">Blueprint_ID<input value={activeDraft.blueprintId} onChange={(event) => updateActiveDraft({ blueprintId: event.target.value })} className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" /></label>
              <label className="text-xs text-slate-300">Print_Provider_ID<input value={activeDraft.printProviderId} onChange={(event) => updateActiveDraft({ printProviderId: event.target.value })} className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" /></label>
            </div>
            <div className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-2">
              {PHONE_MODELS.map((model) => <label key={model} className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={activeDraft.selectedModels.includes(model)} onChange={(event) => updateActiveDraft({ selectedModels: event.target.checked ? [...activeDraft.selectedModels, model] : activeDraft.selectedModels.filter((item) => item !== model) })} className="h-4 w-4 accent-amber-300" />
                {model}<span className="ml-auto text-[11px] text-slate-500">{settings.variantIds[model] ? 'variant set' : 'configure ID'}</span>
              </label>)}
            </div>
          </section>

          <details className="border-t border-slate-800 pt-4">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-300"><Settings2 className="h-4 w-4" /> Listing settings and default variants</summary>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-slate-300">Default selling price<input type="number" min="0.01" step="0.01" value={settings.defaultPrice} onChange={(event) => updateSettings({ defaultPrice: event.target.value })} className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" /></label>
              <label className="text-xs text-slate-300">Default Blueprint_ID<input value={settings.blueprintId} onChange={(event) => updateSettings({ blueprintId: event.target.value })} className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" /></label>
              <label className="text-xs text-slate-300 sm:col-span-2">Default Print_Provider_ID<input value={settings.printProviderId} onChange={(event) => updateSettings({ printProviderId: event.target.value })} className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" /></label>
            </div>
            <div className="mt-4 grid gap-x-4 gap-y-2 sm:grid-cols-2">
              {PHONE_MODELS.map((model) => <label key={model} className="text-xs text-slate-300">{model} Variant_ID<input value={settings.variantIds[model] || ''} onChange={(event) => updateSettings({ variantIds: { ...settings.variantIds, [model]: event.target.value } })} className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" /></label>)}
            </div>
          </details>

          <section className="border-t border-slate-800 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h4 className="text-xs font-semibold uppercase tracking-wide text-slate-300">Google Sheets</h4><p className="mt-1 text-xs text-slate-500">OAuth access is held in memory for this session.</p></div>
              {!googleToken ? <button type="button" onClick={connectSheets} disabled={googleBusy || !GOOGLE_CLIENT_ID} className="rounded-md border border-slate-700 px-3 py-2 text-xs font-medium text-slate-200 hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50">{googleBusy ? 'Connecting...' : 'Connect Google Sheets'}</button> : <div className="flex items-center gap-3 text-xs text-emerald-300"><span>Connected: {googleEmail}</span><button type="button" onClick={() => { setGoogleToken(null); setGoogleEmail(''); setSpreadsheets([]); setWorksheets([]); }} className="text-slate-400 underline hover:text-white">Disconnect</button></div>}
            </div>
            {!GOOGLE_CLIENT_ID && <p className="mt-2 text-xs text-amber-200">Set VITE_GOOGLE_CLIENT_ID in the server environment to enable OAuth.</p>}
            {googleToken && <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="text-xs text-slate-300">Google Drive<select value={driveId} onChange={(event) => changeDrive(event.target.value)} className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white">{drives.map((drive) => <option key={drive.id} value={drive.id}>{drive.name}</option>)}</select></label>
              <label className="text-xs text-slate-300">Spreadsheet<select value={spreadsheetId} onChange={(event) => changeSpreadsheet(event.target.value)} className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"><option value="">Select spreadsheet</option>{spreadsheets.map((sheet) => <option key={sheet.id} value={sheet.id}>{sheet.name}</option>)}</select></label>
              <label className="text-xs text-slate-300">Worksheet<select value={worksheetTitle} onChange={(event) => setWorksheetTitle(event.target.value)} disabled={!worksheets.length} className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white disabled:opacity-50"><option value="">Select worksheet</option>{worksheets.map((sheet) => <option key={sheet.id} value={sheet.title}>{sheet.title}</option>)}</select></label>
            </div>}
            {googleError && <p role="alert" className="mt-3 text-sm text-rose-300">{googleError}</p>}
            {googleToken && <label className="mt-4 flex items-start gap-2 text-xs text-slate-400"><input type="checkbox" checked={allowPublicDriveLinks} onChange={(event) => setAllowPublicDriveLinks(event.target.checked)} className="mt-0.5 h-4 w-4 accent-amber-300" /><span>Allow uploaded design/mockup files to be shared as anyone-with-link view URLs so Make.com can read them.</span></label>}
          </section>

          {activeDraft.primaryKeywords.length > 0 && <details className="border-t border-slate-800 pt-4">
            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-slate-300">AI keyword notes</summary>
            <div className="mt-3 grid gap-4 text-sm text-slate-400 sm:grid-cols-2"><p><strong className="text-slate-300">Primary:</strong> {activeDraft.primaryKeywords.join(', ')}</p><p><strong className="text-slate-300">Long-tail:</strong> {activeDraft.longTailKeywords.join(', ')}</p><p><strong className="text-slate-300">Search intent:</strong> {activeDraft.searchIntent.join(' ')}</p><p><strong className="text-slate-300">Rationale:</strong> {activeDraft.keywordRationale}</p></div>
          </details>}

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-800 pt-4">
            <label className="text-xs text-slate-400">Status<select value={activeDraft.status} onChange={(event) => updateActiveDraft({ status: event.target.value as ListingStatus })} className="ml-2 rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white">{(['DRAFT', 'READY', 'PROCESSING', 'PUBLISHED', 'ERROR', 'PAUSED'] as ListingStatus[]).map((status) => <option key={status}>{status}</option>)}</select></label>
            <span className="mr-auto text-xs text-slate-500">Drafts are stored in this browser.</span>
            <button type="button" onClick={saveActiveListing} className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500">Save Listing</button>
            <button type="button" onClick={() => exportBatch(selectedDesignIds.filter((id) => designs.some((item) => item.id === id)))} disabled={isExporting || !googleToken} className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"><ExternalLink className="h-4 w-4" />{isExporting ? 'Exporting...' : selectedCount > 1 ? 'Export Selected to Google Sheets' : 'Export to Google Sheets'}</button>
          </div>
        </div>
      )}

      {pendingDuplicate && <div role="dialog" aria-modal="true" aria-labelledby="duplicate-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 p-5 shadow-2xl">
          <h4 id="duplicate-title" className="text-base font-semibold text-white">Product already exists.</h4>
          <p className="mt-2 text-sm text-slate-300">{drafts[pendingDuplicate.designId]?.productId} is already in this worksheet. Choose how to continue.</p>
          <div className="mt-5 flex flex-wrap justify-end gap-2"><button type="button" onClick={() => resolveDuplicate('cancel')} className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300">Cancel</button><button type="button" onClick={() => resolveDuplicate('new-id')} className="rounded-md border border-slate-600 px-3 py-2 text-sm text-slate-200">Create new Product ID</button><button type="button" onClick={() => resolveDuplicate('update')} className="rounded-md bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-950">Update existing row</button></div>
        </div>
      </div>}
    </section>
  );
};
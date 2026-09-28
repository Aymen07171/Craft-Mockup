import React, { useState, useEffect } from 'react';
import {
  Sheet,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  FolderOpen,
  ArrowRight,
  Database,
  Layers,
} from 'lucide-react';
import { UnifiedProductRecord } from '../types/unifiedWorkflow';
import {
  listSpreadsheets,
  listWorksheets,
  ensureUnifiedSheetHeaders,
  findProductRowInSheet,
  writeOrUpdateProductRow,
  productRecordToSheetRow,
  GoogleSpreadsheetRef,
  GoogleWorksheetRef,
} from '../services/unifiedGoogleService';
import { validateProductForExport } from '../services/productWorkflowManager';

interface SheetsExportWorkspaceProps {
  product: UnifiedProductRecord;
  googleToken: string | null;
  onConnectGoogle: () => void;
  onUpdateProduct: (updated: UnifiedProductRecord) => void;
  onStartNewProduct: () => void;
}

export const SheetsExportWorkspace: React.FC<SheetsExportWorkspaceProps> = ({
  product,
  googleToken,
  onConnectGoogle,
  onUpdateProduct,
  onStartNewProduct,
}) => {
  const [spreadsheets, setSpreadsheets] = useState<GoogleSpreadsheetRef[]>([]);
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState<string>('');
  const [worksheets, setWorksheets] = useState<GoogleWorksheetRef[]>([]);
  const [selectedWorksheetTitle, setSelectedWorksheetTitle] = useState<string>('');
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const [existingRowNumber, setExistingRowNumber] = useState<number | null>(null);

  // Load spreadsheets when googleToken is available
  useEffect(() => {
    if (!googleToken) return;

    const fetchSpreadsheets = async () => {
      setIsLoadingSheets(true);
      try {
        const list = await listSpreadsheets(googleToken, 'my-drive');
        setSpreadsheets(list);
        if (list.length > 0 && !selectedSpreadsheetId) {
          setSelectedSpreadsheetId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to list spreadsheets:', err);
      } finally {
        setIsLoadingSheets(false);
      }
    };

    fetchSpreadsheets();
  }, [googleToken]);

  // Load worksheets when selectedSpreadsheetId changes
  useEffect(() => {
    if (!googleToken || !selectedSpreadsheetId) return;

    const fetchWorksheets = async () => {
      setIsLoadingSheets(true);
      try {
        const sheets = await listWorksheets(googleToken, selectedSpreadsheetId);
        setWorksheets(sheets);
        if (sheets.length > 0) {
          setSelectedWorksheetTitle(sheets[0].title);
        }
      } catch (err) {
        console.error('Failed to list worksheets:', err);
      } finally {
        setIsLoadingSheets(false);
      }
    };

    fetchWorksheets();
  }, [googleToken, selectedSpreadsheetId]);

  // Run preflight validation
  const validation = validateProductForExport(product);

  const handleExportToSheets = async () => {
    if (!googleToken) {
      setExportError('Please connect your Google account first.');
      return;
    }

    if (!selectedSpreadsheetId || !selectedWorksheetTitle) {
      setExportError('Please select a Google Spreadsheet and Worksheet.');
      return;
    }

    const { valid, errors } = validateProductForExport(product);
    if (!valid) {
      setValidationIssues(errors);
      setExportError(`Product ${product.productId} cannot be exported until all required items are ready.`);
      return;
    }

    setIsExporting(true);
    setExportProgress('Ensuring spreadsheet headers...');
    setExportError(null);
    setExportSuccess(null);
    setValidationIssues([]);

    try {
      // 1. Ensure exact 45-column headers match requirements
      await ensureUnifiedSheetHeaders(googleToken, selectedSpreadsheetId, selectedWorksheetTitle);

      // 2. Check for duplicate row with this Product_ID
      setExportProgress(`Checking whether ${product.productId} already exists in sheet...`);
      const existingRow = await findProductRowInSheet(
        googleToken,
        selectedSpreadsheetId,
        selectedWorksheetTitle,
        product.productId
      );

      // 3. Prepare row with Status = READY
      const rowData = productRecordToSheetRow(product, 'READY');

      setExportProgress(`Writing product row with Status = READY...`);
      const rowNum = await writeOrUpdateProductRow(
        googleToken,
        selectedSpreadsheetId,
        selectedWorksheetTitle,
        rowData,
        existingRow || undefined
      );

      // 4. Update internal product status
      const updatedProduct: UnifiedProductRecord = {
        ...product,
        automation: {
          ...product.automation,
          status: 'READY',
          error: '',
          publishedDate: '',
        },
      };
      onUpdateProduct(updatedProduct);

      setExportSuccess(
        existingRow
          ? `Product ${product.productId} updated in Row ${rowNum} with Status: READY.`
          : `Product ${product.productId} appended to Row ${rowNum} with Status: READY.`
      );
    } catch (err: any) {
      console.error('Sheets export error:', err);
      setExportError(err.message || 'Failed to export product to Google Sheets.');

      // Mark status as ERROR if export failed
      onUpdateProduct({
        ...product,
        automation: {
          ...product.automation,
          status: 'ERROR',
          error: err.message || 'Export error',
        },
      });
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Export to Google Sheets (Make.com Automation)</h2>
              <p className="text-xs text-slate-400">
                Transfers canonical Google Drive asset URLs and Etsy listing metadata into one central spreadsheet row
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!googleToken ? (
              <button
                type="button"
                onClick={onConnectGoogle}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition shadow-md shadow-indigo-950 cursor-pointer"
              >
                <Sheet className="h-4 w-4" />
                <span>Connect Google Sheets</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleExportToSheets}
                disabled={isExporting || !selectedSpreadsheetId || !selectedWorksheetTitle}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 text-xs font-semibold text-white transition shadow-md shadow-emerald-950 cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Exporting Row...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Export to Google Sheets</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Progress Alert */}
        {exportProgress && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-indigo-700/50 bg-indigo-950/40 p-3 text-xs text-indigo-200 animate-pulse">
            <RefreshCw className="h-4 w-4 animate-spin shrink-0 text-indigo-400" />
            <span>{exportProgress}</span>
          </div>
        )}

        {/* Success Alert */}
        {exportSuccess && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-800/60 bg-emerald-950/40 p-3.5 text-xs text-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-emerald-100">
                ✓ Product {product.productId} is ready for automation.
              </p>
              <p>{exportSuccess}</p>
              <p className="text-[11px] text-emerald-300/80">
                Status is set to <span className="font-mono font-bold bg-emerald-900/60 px-1 rounded">READY</span>. Make.com will detect this row to trigger Printify and publish to Etsy.
              </p>
            </div>
          </div>
        )}

        {/* Export / Validation Errors */}
        {exportError && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-800/60 bg-rose-950/40 p-3 text-xs text-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="font-semibold">{exportError}</p>
              {validationIssues.length > 0 && (
                <ul className="mt-1 list-disc pl-4 space-y-0.5">
                  {validationIssues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Spreadsheet Target Selection & Automation Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Target Google Sheet & Worksheet (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Target Google Sheet</h3>
              </div>
              <span className="text-[11px] text-slate-500">Row 1 Headers Verified</span>
            </div>

            {googleToken ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Select Spreadsheet</label>
                  <select
                    value={selectedSpreadsheetId}
                    onChange={(e) => setSelectedSpreadsheetId(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    {spreadsheets.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Select Worksheet</label>
                  <select
                    value={selectedWorksheetTitle}
                    onChange={(e) => setSelectedWorksheetTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    {worksheets.map((w) => (
                      <option key={w.id} value={w.title}>
                        {w.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/80 text-[11px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Exporting Product ID:</span>
                    <span className="font-mono text-indigo-300 font-bold">{product.productId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Initial Automation Status:</span>
                    <span className="font-mono text-emerald-400 font-bold">READY</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                <p>Connect Google Drive & Sheets to choose your spreadsheet.</p>
                <button
                  type="button"
                  onClick={onConnectGoogle}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs text-white"
                >
                  Connect Google Account
                </button>
              </div>
            )}
          </div>

          {/* Make.com Flow Summary Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Make.com Automation Pipeline
            </h3>
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 font-mono text-[10px] text-indigo-300">
                  1
                </span>
                <span>CaseCraft appends row with <b className="text-emerald-400">Status = READY</b></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 font-mono text-[10px] text-indigo-300">
                  2
                </span>
                <span>Make.com watches for new READY rows</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 font-mono text-[10px] text-indigo-300">
                  3
                </span>
                <span>Make.com downloads canonical Drive assets & creates Printify item</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 font-mono text-[10px] text-indigo-300">
                  4
                </span>
                <span>Printify publishes to Etsy store with 13 tags</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 font-mono text-[10px] text-indigo-300">
                  5
                </span>
                <span>Make.com updates Google Sheets row to <b className="text-indigo-400">PUBLISHED</b></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Complete Record Preflight Verification (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-white">Preflight Record Inspection</h3>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium border ${
                  validation.valid
                    ? 'border-emerald-500/40 bg-emerald-950/50 text-emerald-300'
                    : 'border-rose-500/40 bg-rose-950/50 text-rose-300'
                }`}
              >
                {validation.valid ? 'Ready to Export' : 'Fix Issues Before Export'}
              </span>
            </div>

            <div className="max-h-96 overflow-y-auto pr-1 space-y-3 text-xs font-mono">
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 space-y-1">
                <div className="text-slate-400">Product_ID: <span className="text-indigo-300 font-bold">{product.productId}</span></div>
                <div className="text-slate-400">Design_Name: <span className="text-white">{product.designName}</span></div>
                <div className="text-slate-400 truncate">Title: <span className="text-slate-200">{product.listing.title || 'Missing'}</span></div>
                <div className="text-slate-400">Tags Count: <span className={product.listing.tags.filter(t => t.trim()).length === 13 ? 'text-emerald-400' : 'text-rose-400'}>{product.listing.tags.filter(t => t.trim()).length}/13</span></div>
                <div className="text-slate-400">SKU / Price: <span className="text-slate-200">{product.product.sku} / ${product.product.price}</span></div>
              </div>

              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 space-y-1">
                <p className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">Canonical Drive Links</p>
                <div className="text-slate-400 truncate">
                  Design_File_ID: <span className="text-slate-200">{product.design.fileId || 'Not uploaded to Drive'}</span>
                </div>
                <div className="text-slate-400 truncate">
                  Design_File_URL: <span className="text-slate-200">{product.design.fileUrl || 'Not uploaded to Drive'}</span>
                </div>
                {Array.from({ length: 6 }, (_, i) => {
                  const m = product.mockups.find(item => item.slotIndex === i);
                  return (
                    <div key={i} className="text-slate-400 truncate">
                      Mockup_0{i + 1}_ID / URL:{' '}
                      <span className="text-slate-200">
                        {m?.fileId ? `${m.fileId.slice(0, 10)}...` : 'None'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 space-y-1">
                <p className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">Printify Specification</p>
                <div className="text-slate-400">Blueprint_ID: <span className="text-slate-200">{product.printify.blueprintId}</span></div>
                <div className="text-slate-400">Print_Provider_ID: <span className="text-slate-200">{product.printify.printProviderId}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onStartNewProduct}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-200 transition cursor-pointer"
        >
          <span>Create Another Product (New Product ID)</span>
        </button>

        {exportSuccess && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            <span>Product {product.productId} successfully queued for Make.com!</span>
          </div>
        )}
      </div>
    </div>
  );
};

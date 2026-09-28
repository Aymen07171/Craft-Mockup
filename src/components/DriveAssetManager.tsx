import React, { useState } from 'react';
import {
  FolderUp,
  FolderTree,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  FileCheck,
  ShieldCheck,
  Image as ImageIcon,
  ArrowRight,
  Upload,
} from 'lucide-react';
import { UnifiedProductRecord } from '../types/unifiedWorkflow';
import {
  ensureProductFolders,
  uploadFileToFolder,
  verifyDriveFile,
  urlToBlob,
} from '../services/unifiedGoogleService';

interface DriveAssetManagerProps {
  product: UnifiedProductRecord;
  googleToken: string | null;
  onConnectGoogle: () => void;
  onUpdateProduct: (updated: UnifiedProductRecord) => void;
  onContinueToListing: () => void;
}

export const DriveAssetManager: React.FC<DriveAssetManagerProps> = ({
  product,
  googleToken,
  onConnectGoogle,
  onUpdateProduct,
  onContinueToListing,
}) => {
  const [rootFolderName, setRootFolderName] = useState('Etsy Products');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Upload or re-upload a single asset (Design or individual Mockup)
  const handleUploadSingleAsset = async (target: 'design' | { mockupSlot: number }) => {
    if (!googleToken) {
      setUploadError('Please connect your Google Drive account first.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setSuccessMessage(null);

    try {
      setUploadProgress(`Ensuring Google Drive folder hierarchy for ${product.productId}...`);
      const folders = await ensureProductFolders(googleToken, product.productId, rootFolderName);

      let updatedProduct = { ...product };

      if (target === 'design') {
        if (!product.design.localUrl) {
          throw new Error('No design image available to upload. Generate or pick artwork first.');
        }

        setUploadProgress(`Uploading design to ${rootFolderName}/${product.productId}/Design/...`);
        const fileBlob = await urlToBlob(product.design.localUrl);
        const fileName = `${product.productId}-design.png`;

        // Upload with duplicate prevention (uses existing fileId if present)
        const meta = await uploadFileToFolder(
          googleToken,
          fileBlob,
          fileName,
          folders.designFolderId,
          product.design.fileId || undefined
        );

        setUploadProgress('Verifying design file accessibility in Google Drive...');
        const verifyRes = await verifyDriveFile(googleToken, meta.id);

        updatedProduct = {
          ...updatedProduct,
          design: {
            ...updatedProduct.design,
            fileId: meta.id,
            fileUrl: verifyRes.downloadUrl,
            webContentLink: meta.webContentLink,
            verified: verifyRes.verified,
          },
        };
        setSuccessMessage(`Design successfully stored in Google Drive: ${fileName}`);
      } else {
        const slotIdx = target.mockupSlot;
        const mockupItem = product.mockups.find((m) => m.slotIndex === slotIdx);
        if (!mockupItem || !mockupItem.localUrl) {
          throw new Error(`Mockup slot ${slotIdx + 1} does not have an image to upload.`);
        }

        const fileName = `${product.productId}-mockup-${String(slotIdx + 1).padStart(2, '0')}.jpg`;
        setUploadProgress(`Uploading ${fileName} to ${rootFolderName}/${product.productId}/Mockups/...`);

        const fileBlob = await urlToBlob(mockupItem.localUrl);
        const meta = await uploadFileToFolder(
          googleToken,
          fileBlob,
          fileName,
          folders.mockupsFolderId,
          mockupItem.fileId || undefined
        );

        setUploadProgress(`Verifying ${fileName} in Google Drive...`);
        const verifyRes = await verifyDriveFile(googleToken, meta.id);

        const updatedMockups = updatedProduct.mockups.map((m) =>
          m.slotIndex === slotIdx
            ? {
                ...m,
                fileId: meta.id,
                fileUrl: verifyRes.downloadUrl,
                webContentLink: meta.webContentLink,
                verified: verifyRes.verified,
                status: 'uploaded' as const,
              }
            : m
        );

        updatedProduct = {
          ...updatedProduct,
          mockups: updatedMockups,
        };
        setSuccessMessage(`Mockup ${slotIdx + 1} stored in Google Drive: ${fileName}`);
      }

      onUpdateProduct(updatedProduct);
    } catch (err: any) {
      console.error('Error during asset upload:', err);
      setUploadError(err.message || 'Failed to upload asset to Google Drive.');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  // Upload ALL pending assets (Design + all Mockups) in batch
  const handleUploadAllAssets = async () => {
    if (!googleToken) {
      setUploadError('Please connect your Google Drive account first.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setSuccessMessage(null);

    try {
      setUploadProgress(`Organizing folders in Google Drive: "${rootFolderName}/${product.productId}/"...`);
      const folders = await ensureProductFolders(googleToken, product.productId, rootFolderName);

      let currentProduct = { ...product };

      // 1. Upload Design File
      if (currentProduct.design.localUrl) {
        const designFileName = `${product.productId}-design.png`;
        setUploadProgress(`Uploading ${designFileName} to Design folder...`);
        const designBlob = await urlToBlob(currentProduct.design.localUrl);
        const designMeta = await uploadFileToFolder(
          googleToken,
          designBlob,
          designFileName,
          folders.designFolderId,
          currentProduct.design.fileId || undefined
        );
        const verifyDesign = await verifyDriveFile(googleToken, designMeta.id);

        currentProduct = {
          ...currentProduct,
          design: {
            ...currentProduct.design,
            fileId: designMeta.id,
            fileUrl: verifyDesign.downloadUrl,
            webContentLink: designMeta.webContentLink,
            verified: verifyDesign.verified,
          },
        };
        onUpdateProduct(currentProduct);
      }

      // 2. Upload All Generated Mockups
      const updatedMockups = [...currentProduct.mockups];
      for (let i = 0; i < updatedMockups.length; i++) {
        const m = updatedMockups[i];
        if (m.localUrl) {
          const mockupFileName = `${product.productId}-mockup-${String(m.slotIndex + 1).padStart(2, '0')}.jpg`;
          setUploadProgress(`Uploading mockup (${i + 1}/${updatedMockups.length}): ${mockupFileName}...`);

          const mockupBlob = await urlToBlob(m.localUrl);
          const meta = await uploadFileToFolder(
            googleToken,
            mockupBlob,
            mockupFileName,
            folders.mockupsFolderId,
            m.fileId || undefined
          );
          const verifyMock = await verifyDriveFile(googleToken, meta.id);

          updatedMockups[i] = {
            ...m,
            fileId: meta.id,
            fileUrl: verifyMock.downloadUrl,
            webContentLink: meta.webContentLink,
            verified: verifyMock.verified,
            status: 'uploaded',
          };

          currentProduct = {
            ...currentProduct,
            mockups: [...updatedMockups],
          };
          onUpdateProduct(currentProduct);
        }
      }

      setSuccessMessage(`All assets for ${product.productId} successfully synced & verified in Google Drive!`);
    } catch (err: any) {
      console.error('Batch Drive upload error:', err);
      setUploadError(err.message || 'Batch asset upload to Google Drive failed.');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const isDesignUploaded = Boolean(product.design.fileId && product.design.fileUrl);
  const uploadedMockupsCount = product.mockups.filter((m) => m.fileId && m.fileUrl).length;
  const totalMockupsCount = product.mockups.length;
  const allAssetsReady = isDesignUploaded && totalMockupsCount > 0 && uploadedMockupsCount === totalMockupsCount;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <FolderTree className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Google Drive Canonical Asset Storage</h2>
              <p className="text-xs text-slate-400">
                Organized under <span className="font-mono text-indigo-300">{rootFolderName}/{product.productId}/</span>
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
                <FolderUp className="h-4 w-4" />
                <span>Connect Google Drive</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleUploadAllAssets}
                disabled={isUploading || (!product.design.localUrl && totalMockupsCount === 0)}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 text-xs font-semibold text-white transition shadow-md shadow-indigo-950 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Uploading to Drive...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Sync All Assets to Drive</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Status Alerts */}
        {uploadProgress && (
          <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-indigo-700/50 bg-indigo-950/40 p-3 text-xs text-indigo-200 animate-pulse">
            <RefreshCw className="h-4 w-4 animate-spin shrink-0 text-indigo-400" />
            <span>{uploadProgress}</span>
          </div>
        )}

        {uploadError && (
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-rose-800/60 bg-rose-950/40 p-3 text-xs text-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="font-semibold">Upload issue:</p>
              <p>{uploadError}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-emerald-800/60 bg-emerald-950/40 p-3 text-xs text-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Folder Hierarchy Breadcrumb Representation */}
        <div className="mt-6 rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Target Drive Folder Hierarchy
          </p>
          <div className="font-mono text-xs text-slate-300 space-y-1">
            <div className="flex items-center gap-2 text-indigo-300">
              <span>📁</span>
              <span>{rootFolderName}/</span>
            </div>
            <div className="flex items-center gap-2 pl-4 text-indigo-200">
              <span>📁</span>
              <span>{product.productId}/</span>
            </div>
            <div className="flex items-center gap-2 pl-8 text-slate-400">
              <span>📁 Design/</span>
              <span className="text-[11px] text-slate-500">→ {product.productId}-design.png</span>
            </div>
            <div className="flex items-center gap-2 pl-8 text-slate-400">
              <span>📁 Mockups/</span>
              <span className="text-[11px] text-slate-500">→ {product.productId}-mockup-01.jpg .. 06.jpg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assets Table / Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Print-Ready Design Asset Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">Print-Ready Design Asset</h3>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium border ${
                  isDesignUploaded
                    ? 'border-emerald-500/40 bg-emerald-950/50 text-emerald-300'
                    : 'border-amber-500/40 bg-amber-950/50 text-amber-300'
                }`}
              >
                {isDesignUploaded ? 'Verified in Drive' : 'Pending Upload'}
              </span>
            </div>

            <div className="flex gap-4">
              <div className="h-28 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-700 bg-black">
                {product.design.localUrl ? (
                  <img
                    src={product.design.localUrl}
                    alt={product.design.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-slate-600">
                    No image
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1.5 text-xs text-slate-300 min-w-0">
                <p className="font-semibold text-white truncate">{product.design.title}</p>
                <p className="text-slate-400 truncate">File: {product.productId}-design.png</p>
                {product.design.fileId && (
                  <div className="space-y-1 pt-1">
                    <p className="text-[11px] text-slate-400">
                      Drive File ID: <span className="font-mono text-indigo-300">{product.design.fileId}</span>
                    </p>
                    <a
                      href={product.design.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline"
                    >
                      <span>Open Drive Asset URL</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Printify canonical artwork</span>
            <button
              type="button"
              disabled={isUploading || !product.design.localUrl || !googleToken}
              onClick={() => handleUploadSingleAsset('design')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition cursor-pointer disabled:opacity-40"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>{isDesignUploaded ? 'Update in Drive' : 'Upload to Drive'}</span>
            </button>
          </div>
        </div>

        {/* 2. Mockups Assets Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">
                  Mockup Scene Assets ({uploadedMockupsCount}/{totalMockupsCount} Uploaded)
                </h3>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium border ${
                  totalMockupsCount > 0 && uploadedMockupsCount === totalMockupsCount
                    ? 'border-emerald-500/40 bg-emerald-950/50 text-emerald-300'
                    : 'border-amber-500/40 bg-amber-950/50 text-amber-300'
                }`}
              >
                {uploadedMockupsCount === totalMockupsCount && totalMockupsCount > 0
                  ? 'All in Drive'
                  : 'Action Needed'}
              </span>
            </div>

            {totalMockupsCount === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No mockups generated yet. Go to Step 2 to generate lifestyle case mockups.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {product.mockups.map((m) => {
                  const isUploaded = Boolean(m.fileId && m.fileUrl);
                  return (
                    <div
                      key={m.slotIndex}
                      className="group relative rounded-lg border border-slate-800 bg-slate-950 p-2 text-center"
                    >
                      <div className="aspect-4/3 overflow-hidden rounded bg-slate-900 mb-1.5">
                        {m.localUrl ? (
                          <img
                            src={m.localUrl}
                            alt={m.modelName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center text-[10px] text-slate-500">
                            N/A
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-white truncate" title={m.modelName}>
                        Slot {m.slotIndex + 1}: {m.modelName}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {isUploaded ? (
                          <span className="text-emerald-400 flex items-center justify-center gap-1">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Uploaded
                          </span>
                        ) : (
                          <span className="text-amber-400">Pending</span>
                        )}
                      </p>

                      {/* Hover action to re-upload single mockup */}
                      <button
                        type="button"
                        disabled={isUploading || !googleToken}
                        onClick={() => handleUploadSingleAsset({ mockupSlot: m.slotIndex })}
                        className="mt-1 w-full text-[10px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 py-0.5 rounded cursor-pointer transition"
                      >
                        {isUploaded ? 'Re-upload' : 'Upload'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Slots 01 to 06 reserved for Etsy & Google Sheets</span>
            {totalMockupsCount > 0 && uploadedMockupsCount < totalMockupsCount && googleToken && (
              <button
                type="button"
                onClick={handleUploadAllAssets}
                disabled={isUploading}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
              >
                Upload Remaining
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Downstream Make.com and Printify automations require verified Google Drive file links.</span>
        </div>

        <button
          type="button"
          onClick={onContinueToListing}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition shadow-md cursor-pointer"
        >
          <span>Continue to Listing Generation</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

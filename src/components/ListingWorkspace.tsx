import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Tag,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { UnifiedProductRecord } from '../types/unifiedWorkflow';

interface ListingWorkspaceProps {
  product: UnifiedProductRecord;
  onUpdateProduct: (updated: UnifiedProductRecord) => void;
  onContinueToExport: () => void;
}

export const ListingWorkspace: React.FC<ListingWorkspaceProps> = ({
  product,
  onUpdateProduct,
  onContinueToExport,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Check whether assets have been uploaded to Drive
  const hasDriveDesign = Boolean(product.design.fileId && product.design.fileUrl);
  const hasDriveMockups = product.mockups.some((m) => m.fileId && m.fileUrl);
  const assetsReady = hasDriveDesign && hasDriveMockups;

  // Generate complete Etsy listing information with AI
  const handleGenerateListing = async () => {
    if (!product.design.localUrl) {
      setError('A design artwork is required before generating the Etsy listing.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // Use design artwork for visual analysis
      const res = await fetch('/design-api/generate-etsy-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: product.design.prompt || 'Phone case artwork',
          imageDataUrl: product.design.localUrl,
          designTitle: product.design.title || product.designName,
          niche: product.design.niche || 'Phone Case Art',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.listing) {
        throw new Error(data.error || 'Failed to generate Etsy listing from visual analysis.');
      }

      const l = data.listing;
      const updatedProduct: UnifiedProductRecord = {
        ...product,
        listing: {
          title: l.productTitle || `${product.designName} Tough Phone Case`,
          description: l.productDescription || '',
          tags: Array.isArray(l.etsyTags) ? l.etsyTags.slice(0, 13) : Array(13).fill(''),
          category: l.category || 'Electronics Cases',
          primaryColor: l.primaryColor || '',
          secondaryColor: l.secondaryColor || '',
          style: Array.isArray(l.designStyle) ? l.designStyle.join(', ') : (l.designStyle || ''),
          occasion: l.occasion || '',
          recipient: Array.isArray(l.targetCustomer) ? l.targetCustomer.join(', ') : (l.targetCustomer || ''),
          primaryKeywords: l.primaryKeywords || [],
          longTailKeywords: l.longTailKeywords || [],
          searchIntent: l.searchIntent || [],
          keywordRationale: l.keywordRationale || '',
        },
      };

      onUpdateProduct(updatedProduct);
      setSuccessMsg('Etsy listing generated and linked with Product ID and Google Drive assets.');
    } catch (err: any) {
      console.error('Error generating listing:', err);
      setError(err.message || 'Error communicating with AI listing service.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateField = (field: keyof UnifiedProductRecord['listing'], val: any) => {
    onUpdateProduct({
      ...product,
      listing: {
        ...product.listing,
        [field]: val,
      },
    });
  };

  const handleUpdateTag = (index: number, val: string) => {
    const nextTags = [...product.listing.tags];
    nextTags[index] = val;
    handleUpdateField('tags', nextTags);
  };

  const handleCopyText = async () => {
    const text = [
      `PRODUCT ID: ${product.productId}`,
      `TITLE: ${product.listing.title}`,
      `\nDESCRIPTION:\n${product.listing.description}`,
      `\nTAGS (13):\n${product.listing.tags.map((t, i) => `${i + 1}. ${t}`).join('\n')}`,
      `\nDRIVE DESIGN URL: ${product.design.fileUrl}`,
      ...product.mockups.map((m, i) => `DRIVE MOCKUP 0${i + 1}: ${m.fileUrl || 'N/A'}`),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Generate Etsy Listing Information</h2>
              <p className="text-xs text-slate-400">
                Associated with <span className="font-mono text-indigo-300">{product.productId}</span> and verified Google Drive asset links
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGenerateListing}
              disabled={isGenerating || !product.design.localUrl}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 text-xs font-semibold text-white transition shadow-md shadow-indigo-950 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Analyzing Artwork & Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Complete Listing with AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Warning if drive assets are not uploaded yet */}
        {!assetsReady && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-700/50 bg-amber-950/40 p-3 text-xs text-amber-200">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>
              Tip: For canonical automation, make sure to sync your assets to Google Drive in Step 3 so Google Drive URLs are ready for Google Sheets.
            </span>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-800/60 bg-rose-950/40 p-3 text-xs text-rose-200">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="font-semibold">Listing generation error:</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-800/60 bg-emerald-950/40 p-3 text-xs text-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Main Listing Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Title, Description, Metadata (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Etsy Product Title <span className="text-rose-400">*</span>
                </label>
                <span
                  className={`text-[11px] font-mono ${
                    product.listing.title.length > 140
                      ? 'text-rose-400 font-bold'
                      : 'text-slate-500'
                  }`}
                >
                  {product.listing.title.length}/140 chars
                </span>
              </div>
              <input
                type="text"
                value={product.listing.title}
                onChange={(e) => handleUpdateField('title', e.target.value)}
                placeholder="e.g. Mystical Celestial Fox Phone Case iPhone 16 15 Pro Max Samsung S25 Ultra Tough Case"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Etsy Product Description <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  {product.listing.description.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                rows={8}
                value={product.listing.description}
                onChange={(e) => handleUpdateField('description', e.target.value)}
                placeholder="Customer-facing description highlighting artwork motifs, style, durable case construction, and gift ideas..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none leading-relaxed font-sans"
              />
            </div>

            {/* Taxonomy & Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Category</label>
                <input
                  type="text"
                  value={product.listing.category}
                  onChange={(e) => handleUpdateField('category', e.target.value)}
                  className="w-full rounded border border-slate-800 bg-slate-950 p-1.5 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Primary Color</label>
                <input
                  type="text"
                  value={product.listing.primaryColor}
                  onChange={(e) => handleUpdateField('primaryColor', e.target.value)}
                  className="w-full rounded border border-slate-800 bg-slate-950 p-1.5 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Secondary Color</label>
                <input
                  type="text"
                  value={product.listing.secondaryColor}
                  onChange={(e) => handleUpdateField('secondaryColor', e.target.value)}
                  className="w-full rounded border border-slate-800 bg-slate-950 p-1.5 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Style</label>
                <input
                  type="text"
                  value={product.listing.style}
                  onChange={(e) => handleUpdateField('style', e.target.value)}
                  className="w-full rounded border border-slate-800 bg-slate-950 p-1.5 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Occasion</label>
                <input
                  type="text"
                  value={product.listing.occasion}
                  onChange={(e) => handleUpdateField('occasion', e.target.value)}
                  className="w-full rounded border border-slate-800 bg-slate-950 p-1.5 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Recipient</label>
                <input
                  type="text"
                  value={product.listing.recipient}
                  onChange={(e) => handleUpdateField('recipient', e.target.value)}
                  className="w-full rounded border border-slate-800 bg-slate-950 p-1.5 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 13 Etsy Tags & Linked Drive URLs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 13 Tags Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">Etsy Search Tags (13 Required)</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {product.listing.tags.filter((t) => t.trim().length > 0).length}/13
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {Array.from({ length: 13 }, (_, i) => {
                const tag = product.listing.tags[i] || '';
                const isOverLength = tag.length > 20;

                return (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-500 w-5 shrink-0 text-right">
                      {i + 1}.
                    </span>
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => handleUpdateTag(i, e.target.value)}
                      placeholder={`Tag ${i + 1}`}
                      className={`w-full rounded border bg-slate-950 px-2 py-1 text-xs text-white placeholder-slate-700 focus:outline-none ${
                        isOverLength
                          ? 'border-rose-500'
                          : tag.trim()
                          ? 'border-slate-700'
                          : 'border-slate-800'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Connected Drive URLs & Identifiers Preview */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-sm font-semibold text-white">Canonical Google Drive Asset Links</h3>
              <button
                type="button"
                onClick={handleCopyText}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied' : 'Copy Record'}</span>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950 font-mono text-[11px] space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Product ID:</span>
                  <span className="text-indigo-300 font-semibold">{product.productId}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Design Drive File:</span>
                  <span className="truncate max-w-[200px] text-slate-200" title={product.design.fileUrl || 'Not uploaded yet'}>
                    {product.design.fileId ? `${product.design.fileId.slice(0, 14)}...` : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Mockup Files in Drive:</span>
                  <span className="text-emerald-300">
                    {product.mockups.filter((m) => m.fileId).length} / {product.mockups.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Listing validation checks: 140 char title limit, 13 tags limit (max 20 chars each).</span>
        </div>

        <button
          type="button"
          onClick={onContinueToExport}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition shadow-md cursor-pointer"
        >
          <span>Continue to Google Sheets & Make.com Export</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

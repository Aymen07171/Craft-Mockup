import React, { useRef } from 'react';
import { Upload, Sparkles, Check, Download, Copy, Smartphone, Trash2 } from 'lucide-react';
import { GeneratedDesign } from '../types';

interface DesignGalleryProps {
  designs: GeneratedDesign[];
  activeDesignId: string;
  onSelectDesign: (design: GeneratedDesign) => void;
  onUploadDesign: (design: GeneratedDesign) => void;
  onDeleteDesign?: (id: string) => void;
  onOpenMockupStudio: () => void;
}

export const DesignGallery: React.FC<DesignGalleryProps> = ({
  designs,
  activeDesignId,
  onSelectDesign,
  onUploadDesign,
  onDeleteDesign,
  onOpenMockupStudio,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const uploadedDesign: GeneratedDesign = {
        id: `upload-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        prompt: 'User uploaded custom artwork',
        imageUrl: dataUrl,
        niche: 'Custom Upload',
        createdAt: Date.now(),
        placeholders: {},
      };
      onUploadDesign(uploadedDesign);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8">
      {/* Upload Callout Hero Box */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-sky-950/60 border border-indigo-500/30 rounded-2xl p-8 shadow-2xl">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-2.5 py-0.5 rounded border border-indigo-800/60">
              Direct Mockup Pipeline
            </span>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Automatic iPhone + Samsung Transformation
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Upload Your Artwork & Instantly Generate Cases
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Upload your graphic, illustration, or brand artwork. The system preserves your design
            100% without modification, applying it to physical iPhone and Samsung case dimensions,
            curvatures, and camera modules.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Artwork & Generate Cases</span>
            </button>
            <span className="text-xs text-slate-400">
              Supports PNG, JPG, WebP • Portrait 9:16 recommended
            </span>
          </div>
        </div>
      </div>

      {/* Gallery Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-white">Your Artwork Collection</h3>
          <p className="text-xs text-slate-400">Select any artwork below to automatically generate iPhone and Samsung mockups.</p>
        </div>
      </div>

      {/* Grid of Designs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {designs.map((design) => {
          const isActive = design.id === activeDesignId;

          return (
            <div
              key={design.id}
              className={`bg-slate-900/90 rounded-2xl overflow-hidden border transition-all flex flex-col ${
                isActive
                  ? 'border-indigo-500 shadow-xl shadow-indigo-950/50 ring-1 ring-indigo-500'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Image Preview Container (9:16 aspect ratio) */}
              <div className="relative aspect-[9/16] w-full overflow-hidden bg-slate-950">
                <img
                  src={design.imageUrl}
                  alt={design.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover select-none"
                />

                {/* Active Indicator Badge */}
                {isActive && (
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-indigo-600/90 text-[10px] font-semibold text-white flex items-center gap-1 shadow-md">
                    <Check className="w-3 h-3" />
                    <span>Active on Case</span>
                  </div>
                )}

                {/* Niche Tag */}
                <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-medium text-slate-300 border border-slate-700/60">
                  {design.niche}
                </div>

                {/* Quick Action Overlay on hover */}
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-2.5 p-4 backdrop-blur-[2px]">
                  <button
                    onClick={() => {
                      onSelectDesign(design);
                      onOpenMockupStudio();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg transition cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Apply to Mockups</span>
                  </button>

                  <a
                    href={design.imageUrl}
                    download={`${design.title}.png`}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Image</span>
                  </a>
                </div>
              </div>

              {/* Card Meta Footer */}
              <div className="p-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                <div className="overflow-hidden pr-2">
                  <h3 className="text-xs font-semibold text-white truncate">{design.title}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(design.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {!isActive && (
                  <button
                    onClick={() => onSelectDesign(design)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
                  >
                    Select
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

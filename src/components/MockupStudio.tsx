import React, { useState, useEffect } from 'react';
import {
  Download,
  RefreshCw,
  Sparkles,
  Smartphone,
  Shield,
  Layers,
  Check,
  Eye,
  Sliders,
} from 'lucide-react';
import { DeviceType, CaseType, GeneratedDesign } from '../types';
import { CASE_TYPE_OPTIONS, FRAME_COLORS } from '../data/presets';
import { PhoneCaseRenderer } from './PhoneCaseRenderer';
import { generateProductMockupCanvas, triggerDownload } from '../utils/exportMockup';

interface MockupStudioProps {
  activeDesign: GeneratedDesign;
  onUploadNew?: () => void;
}

export const MockupStudio: React.FC<MockupStudioProps> = ({ activeDesign }) => {
  // Global Case Type selection (Slim, Clear, Tough, Silicone, Protective)
  const [selectedCaseType, setSelectedCaseType] = useState<CaseType>('slim');
  const activeCaseOption =
    CASE_TYPE_OPTIONS.find((c) => c.id === selectedCaseType) || CASE_TYPE_OPTIONS[0];

  // Frame bezel color
  const [frameColorId, setFrameColorId] = useState<string>('obsidian-black');
  const [showMagsafe, setShowMagsafe] = useState<boolean>(false);
  const [glossIntensity, setGlossIntensity] = useState<number>(80);

  // Regeneration state
  const [regeneratingDevice, setRegeneratingDevice] = useState<DeviceType | null>(null);
  const [downloadingDevice, setDownloadingDevice] = useState<DeviceType | null>(null);

  // Zoom / Art shift per device
  const [artZoom, setArtZoom] = useState<number>(1.0);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Track key to force animation or re-render when regenerating
  const [iphoneKey, setIphoneKey] = useState<number>(Date.now());
  const [samsungKey, setSamsungKey] = useState<number>(Date.now() + 1);

  // When active design changes, animate reload
  useEffect(() => {
    setIphoneKey(Date.now());
    setSamsungKey(Date.now() + 1);
  }, [activeDesign.id]);

  // Handle Regenerate for a device
  const handleRegenerate = (device: DeviceType) => {
    setRegeneratingDevice(device);
    setTimeout(() => {
      if (device === 'iphone-16-pro') {
        setIphoneKey(Date.now());
      } else {
        setSamsungKey(Date.now());
      }
      setRegeneratingDevice(null);
    }, 450);
  };

  // Handle Download for a device
  const handleDownload = async (device: DeviceType) => {
    setDownloadingDevice(device);
    try {
      const dataUrl = await generateProductMockupCanvas(
        {
          artworkUrl: activeDesign.imageUrl,
          device,
          finish: activeCaseOption.finish,
          frameColorId,
          showMagsafe,
          glossIntensity,
        },
        1400,
        1600
      );

      const deviceName = device === 'iphone-16-pro' ? 'iphone-16-pro' : 'samsung-s25-ultra';
      const filename = `${deviceName}-${selectedCaseType}-case-${Date.now()}.png`;
      triggerDownload(dataUrl, filename);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloadingDevice(null);
    }
  };

  // Download Both Platforms
  const handleDownloadBoth = async () => {
    await handleDownload('iphone-16-pro');
    setTimeout(() => {
      handleDownload('samsung-s25-ultra');
    }, 300);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner: Workflow Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-950/70 px-2.5 py-0.5 rounded border border-indigo-800/60">
              Automatic Multi-Platform Mockup
            </span>
            <span className="text-xs text-slate-400 font-medium">
              iPhone 16 Pro + Samsung S25 Ultra
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Generated Phone Case Mockups
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Your uploaded artwork is mapped directly to authentic iPhone and Samsung case geometries
            with camera cutouts, natural reflections, and material shaders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              showSettings
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Case Customization</span>
          </button>

          <button
            onClick={handleDownloadBoth}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-900/30 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Both (PNG)</span>
          </button>
        </div>
      </div>

      {/* Case Type Bar: Slim, Clear, Tough, Silicone, Protective */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              Select Case Type
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Switch physical case construction without affecting the original uploaded artwork.
            </p>
          </div>
          <span className="text-xs text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 self-start sm:self-auto">
            Active: <strong className="text-indigo-300 font-semibold">{activeCaseOption.name}</strong> ({activeCaseOption.description})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
          {CASE_TYPE_OPTIONS.map((opt) => {
            const isSelected = opt.id === selectedCaseType;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedCaseType(opt.id)}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-indigo-950/70 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
                    {opt.badge}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
                <h4 className="text-xs font-semibold text-white">{opt.name}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                  {opt.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Customization Panel (Bezel, MagSafe, Gloss) */}
      {showSettings && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Finishing & Hardware Adjustments
            </h3>
            <span className="text-xs text-slate-400">Applies to both mockups</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Bezel / Bumper Color */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-2">
                Bumper / Frame Tone
              </label>
              <div className="flex items-center gap-2">
                {FRAME_COLORS.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => setFrameColorId(col.id)}
                    className={`w-7 h-7 rounded-full border-2 transition cursor-pointer relative flex items-center justify-center ${
                      frameColorId === col.id
                        ? 'border-indigo-400 ring-2 ring-indigo-500/50 scale-110'
                        : 'border-slate-700 hover:border-slate-500'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  >
                    {frameColorId === col.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* MagSafe Toggle */}
            <div className="flex flex-col justify-center">
              <label className="text-xs font-medium text-slate-300 block mb-2">
                MagSafe Magnetic Ring
              </label>
              <button
                onClick={() => setShowMagsafe(!showMagsafe)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer w-fit ${
                  showMagsafe
                    ? 'bg-indigo-950 border-indigo-500 text-indigo-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                    showMagsafe ? 'bg-indigo-600 border-indigo-500' : 'border-slate-600'
                  }`}
                >
                  {showMagsafe && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                <span>Show MagSafe Ring</span>
              </button>
            </div>

            {/* Specular Sheen Intensity */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Reflective Sheen</span>
                <span className="text-indigo-400 font-mono">{glossIntensity}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={glossIntensity}
                onChange={(e) => setGlossIntensity(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Side-by-Side Results Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* ========================================================================= */}
        {/* 1. iPhone Case Mockup Card */}
        {/* ========================================================================= */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          {/* Card Header */}
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-indigo-400 font-bold text-xs">
                iOS
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  iPhone 16 Pro Case Mockup
                </h3>
                <p className="text-[11px] text-slate-400">
                  {activeCaseOption.name} • 3-Lens Plateau Geometry
                </p>
              </div>
            </div>

            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
              Photorealistic
            </span>
          </div>

          {/* Visual Mockup Stage (Neutral Studio Background) */}
          <div className="relative aspect-[4/5] sm:aspect-square w-full bg-gradient-to-b from-slate-900 via-slate-950 to-[#07080a] flex items-center justify-center p-8 overflow-hidden select-none">
            {/* Subtle Studio Lighting Spotlight */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent pointer-events-none" />

            {/* Rendered iPhone Case */}
            <div
              key={iphoneKey}
              className={`transition-all duration-300 transform ${
                regeneratingDevice === 'iphone-16-pro' ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
              }`}
            >
              <PhoneCaseRenderer
                artworkUrl={activeDesign.imageUrl}
                device="iphone-16-pro"
                finish={activeCaseOption.finish}
                frameColorId={frameColorId}
                showMagsafe={showMagsafe}
                glossIntensity={glossIntensity}
                showHands={false}
                width={270}
              />
            </div>

            {/* Bottom Floating Tag */}
            <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>iPhone 16 Pro • Full Bleed Wrap</span>
            </div>
          </div>

          {/* Card Footer Actions */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={() => handleRegenerate('iphone-16-pro')}
              disabled={regeneratingDevice === 'iphone-16-pro'}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-slate-800 transition cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${regeneratingDevice === 'iphone-16-pro' ? 'animate-spin' : ''}`}
              />
              <span>Regenerate</span>
            </button>

            <button
              onClick={() => handleDownload('iphone-16-pro')}
              disabled={downloadingDevice === 'iphone-16-pro'}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-950/30 transition cursor-pointer"
            >
              {downloadingDevice === 'iphone-16-pro' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Rendering PNG...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download iPhone Mockup</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. Samsung Case Mockup Card */}
        {/* ========================================================================= */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          {/* Card Header */}
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-700/60 flex items-center justify-center text-sky-400 font-bold text-xs">
                S25
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Samsung Galaxy S25 Ultra Case Mockup
                </h3>
                <p className="text-[11px] text-slate-400">
                  {activeCaseOption.name} • Floating Vertical Camera Array
                </p>
              </div>
            </div>

            <span className="text-[10px] font-semibold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/60">
              Samsung Layout
            </span>
          </div>

          {/* Visual Mockup Stage (Neutral Studio Background) */}
          <div className="relative aspect-[4/5] sm:aspect-square w-full bg-gradient-to-b from-slate-900 via-slate-950 to-[#07080a] flex items-center justify-center p-8 overflow-hidden select-none">
            {/* Subtle Studio Lighting Spotlight */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-900/10 via-transparent to-transparent pointer-events-none" />

            {/* Rendered Samsung Case */}
            <div
              key={samsungKey}
              className={`transition-all duration-300 transform ${
                regeneratingDevice === 'samsung-s25-ultra' ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
              }`}
            >
              <PhoneCaseRenderer
                artworkUrl={activeDesign.imageUrl}
                device="samsung-s25-ultra"
                finish={activeCaseOption.finish}
                frameColorId={frameColorId}
                showMagsafe={showMagsafe}
                glossIntensity={glossIntensity}
                showHands={false}
                width={270}
              />
            </div>

            {/* Bottom Floating Tag */}
            <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>Samsung S25 Ultra • Sharp Corner Profile</span>
            </div>
          </div>

          {/* Card Footer Actions */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={() => handleRegenerate('samsung-s25-ultra')}
              disabled={regeneratingDevice === 'samsung-s25-ultra'}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-slate-800 transition cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${regeneratingDevice === 'samsung-s25-ultra' ? 'animate-spin' : ''}`}
              />
              <span>Regenerate</span>
            </button>

            <button
              onClick={() => handleDownload('samsung-s25-ultra')}
              disabled={downloadingDevice === 'samsung-s25-ultra'}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-950/30 transition cursor-pointer"
            >
              {downloadingDevice === 'samsung-s25-ultra' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Rendering PNG...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Samsung Mockup</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Design Source Info Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-9 h-14 rounded overflow-hidden bg-black border border-slate-700 flex-shrink-0">
            <img
              src={activeDesign.imageUrl}
              alt="Source artwork"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-slate-300 font-semibold block">{activeDesign.title}</span>
            <span className="text-slate-500 text-[11px]">
              Uploaded Source Artwork • Preserved 100% without modification
            </span>
          </div>
        </div>

        <a
          href={activeDesign.imageUrl}
          download={`${activeDesign.title}-original.png`}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 self-start sm:self-auto transition"
        >
          Download Original Artwork
        </a>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Header } from './components/Header';
import { DesignStudio } from './components/DesignStudio';
import { GeneratedDesign } from './types';

const INITIAL_VITRAIL_DESIGN: GeneratedDesign = {
  id: 'preset-sample-vitrail-01',
  title: 'Woodland Fox & Sunburst (Stained Glass)',
  prompt: `Masterpiece authentic cathedral stained glass window (vitrail), symmetrical arched vertical composition.

In the center, a peaceful sleeping red fox curled in a tight circle with fluffy tail wrapped around its body.

Directly behind the subject is a radiant segmented sunburst halo with glowing amber and golden glass rays, with a golden crescent moon and twinkling stars in the upper arch.

Framed and grounded along the base and sides by red fly agaric mushrooms with white dots, golden chanterelles, acorns, autumn oak leaves, forest berries, and woodland fern fronds, and accompanied by subtle glowing woodland sprites and tiny sleeping dormice tucked among the leaves.

Rich translucent jewel-tone color palette of warm amber gold, fiery autumn orange, deep russet red, forest moss green, deep teal indigo, and dark leaded came metallic outlines.

Enclosed within an intricate Art Nouveau cathedral arched stained-glass frame with curving leadline came tracery, amber glass cabochons, and decorative border tiles.

Authentic leaded came solder outlines, segmented colored glass panes, translucent backlit stained glass radiance, Louis Comfort Tiffany stained glass style, fine Art Nouveau botanical tracery, subtle glass textures and beveled leadlines.

Pure 2D flat-lay graphic art print, vertical 9:16 aspect ratio, clean full-bleed decorative art piece, sharp fine details, high-end collector print.

Do not include: phone, phone case, mockup, device, realistic photography, 3D render, modern clutter, shadows.`,
  imageUrl: '/src/assets/images/sample_vitrail_pure2d_1790462384613.jpg',
  niche: 'Woodland Fox & Sunburst (Stained Glass)',
  createdAt: Date.now(),
  placeholders: {
    SUBJECT_POSE:
      'a peaceful sleeping red fox curled in a tight circle with fluffy tail wrapped around its body',
    HALO_BACKGROUND:
      'a radiant segmented sunburst halo with glowing amber and golden glass rays, with a golden crescent moon and twinkling stars in the upper arch',
    BOTANICAL:
      'red fly agaric mushrooms with white dots, golden chanterelles, acorns, autumn oak leaves, forest berries, and woodland fern fronds',
    COMPANION:
      'subtle glowing woodland sprites and tiny sleeping dormice tucked among the leaves',
    COLOR_PALETTE:
      'warm amber gold, fiery autumn orange, deep russet red, forest moss green, deep teal indigo, and dark leaded came metallic outlines',
    BORDER_THEME:
      'Art Nouveau cathedral arched stained-glass frame with curving leadline came tracery, amber glass cabochons, and decorative border tiles',
  },
  isPreset: true,
  aspectRatio: '9:16',
};

export default function App() {
  const [designs, setDesigns] = useState<GeneratedDesign[]>([INITIAL_VITRAIL_DESIGN]);
  const [activeDesign, setActiveDesign] = useState<GeneratedDesign | null>(INITIAL_VITRAIL_DESIGN);
  const [resetKey, setResetKey] = useState<number>(0);

  const handleDesignGenerated = (newDesign: GeneratedDesign) => {
    setDesigns((prev) => [newDesign, ...prev]);
    setActiveDesign(newDesign);
  };

  const handleSelectDesign = (design: GeneratedDesign) => {
    setActiveDesign(design);
  };

  const handleDeleteDesign = (id: string) => {
    setDesigns((prev) => {
      const filtered = prev.filter((d) => d.id !== id);
      if (activeDesign?.id === id) {
        setActiveDesign(filtered.length > 0 ? filtered[0] : null);
      }
      return filtered;
    });
  };

  const handleReset = () => {
    setResetKey((prev) => prev + 1);
  };

  const handleDownloadCurrent = () => {
    if (!activeDesign) return;
    const link = document.createElement('a');
    link.href = activeDesign.imageUrl;
    link.download = `${activeDesign.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        onReset={handleReset}
        onDownloadCurrent={activeDesign ? handleDownloadCurrent : undefined}
        hasArtwork={Boolean(activeDesign)}
        activeDesignTitle={activeDesign?.title}
      />

      {/* Main Design Studio Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DesignStudio
          key={resetKey}
          activeDesign={activeDesign}
          designs={designs}
          onSelectDesign={handleSelectDesign}
          onDeleteDesign={handleDeleteDesign}
          onDesignGenerated={handleDesignGenerated}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <p>
          CaseCraft Design Studio • Powered by{' '}
          <a
            href="https://pollinations.ai"
            target="_blank"
            rel="noreferrer"
            className="text-indigo-400 hover:underline"
          >
            Pollinations API
          </a>
        </p>
      </footer>
    </div>
  );
}

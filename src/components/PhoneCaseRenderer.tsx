import React from 'react';
import { DeviceType, CaseFinish, FrameColor, SkinTone } from '../types';
import { FRAME_COLORS } from '../data/presets';
import { HandGripOverlay } from './HandGripOverlay';

interface PhoneCaseRendererProps {
  artworkUrl: string;
  device: DeviceType;
  finish: CaseFinish;
  frameColorId: string;
  showMagsafe?: boolean;
  glossIntensity?: number; // 0 to 100
  artworkZoom?: number; // 0.8 to 1.5
  artworkShiftY?: number; // px
  ambientTint?: string;
  showHands?: boolean;
  skinTone?: SkinTone;
  gripStyle?: 'two-hand' | 'single-right' | 'single-left' | 'table-grip' | 'none';
  blendMode?: 'normal' | 'multiply' | 'overlay' | 'soft-light';
  interactive?: boolean;
  className?: string;
  width?: number;
}

export const PhoneCaseRenderer: React.FC<PhoneCaseRendererProps> = ({
  artworkUrl,
  device,
  finish,
  frameColorId,
  showMagsafe = false,
  glossIntensity = 75,
  artworkZoom = 1,
  artworkShiftY = 0,
  ambientTint,
  showHands = true,
  skinTone = 'honey',
  gripStyle = 'two-hand',
  blendMode = 'normal',
  className = '',
  width = 280,
}) => {
  const frameColor: FrameColor =
    FRAME_COLORS.find((c) => c.id === frameColorId) || FRAME_COLORS[0];

  // Dimensions based on device
  const isIphone = device === 'iphone-16-pro';
  const aspectRatio = isIphone ? 574 / 280 : 588 / 280;
  const height = width * aspectRatio;
  const borderRadius = isIphone ? Math.round(width * 0.16) : Math.round(width * 0.05);

  return (
    <div
      className={`relative select-none ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        filter: 'drop-shadow(0 20px 28px rgba(0, 0, 0, 0.45)) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.3))',
      }}
    >
      {/* Outer Phone Frame / Bumper Rim */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          borderRadius: `${borderRadius}px`,
          backgroundColor: frameColor.hex,
          border: `2.5px solid ${frameColor.accentHex}88`,
          boxShadow: `
            inset 0 0 0 2px rgba(255, 255, 255, 0.25),
            inset 0 0 10px rgba(0, 0, 0, 0.6)
          `,
        }}
      >
        {/* Tough Armor Bumper Accents if selected */}
        {finish === 'tough-armor' && (
          <>
            <div className="absolute top-0 left-0 w-8 h-8 rounded-tl-2xl bg-black/40 border-t-2 border-l-2 border-white/20 z-30" />
            <div className="absolute top-0 right-0 w-8 h-8 rounded-tr-2xl bg-black/40 border-t-2 border-r-2 border-white/20 z-30" />
            <div className="absolute bottom-0 left-0 w-8 h-8 rounded-bl-2xl bg-black/40 border-b-2 border-l-2 border-white/20 z-30" />
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-br-2xl bg-black/40 border-b-2 border-r-2 border-white/20 z-30" />
            {/* Grip Ridges */}
            <div className="absolute left-0 top-1/3 bottom-1/3 w-1.5 flex flex-col justify-around py-2 z-30">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-full h-1 bg-black/50 rounded-r" />
              ))}
            </div>
            <div className="absolute right-0 top-1/3 bottom-1/3 w-1.5 flex flex-col justify-around py-2 z-30">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-full h-1 bg-black/50 rounded-l" />
              ))}
            </div>
          </>
        )}

        {/* Clear Hybrid edge border */}
        {finish === 'clear-hybrid' && (
          <div
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              border: `6px solid ${frameColor.hex}99`,
              borderRadius: `${borderRadius}px`,
              backdropFilter: 'blur(4px)',
            }}
          />
        )}

        {/* Inner Case Backplate with Artwork */}
        <div
          className="absolute inset-[3px] overflow-hidden"
          style={{
            borderRadius: `${Math.max(borderRadius - 3, 4)}px`,
            backgroundColor: '#0a0a0c',
          }}
        >
          {/* Render the Artwork */}
          <div
            className="w-full h-full relative transition-transform duration-200"
            style={{
              transform: `scale(${artworkZoom}) translateY(${artworkShiftY}px)`,
              transformOrigin: 'center center',
            }}
          >
            {artworkUrl ? (
              <img
                src={artworkUrl}
                alt="Case Design Print"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover select-none pointer-events-none"
                style={{
                  mixBlendMode: blendMode && blendMode !== 'normal' ? blendMode : undefined,
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-indigo-950 via-purple-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center text-white/50">
                <p className="text-xs font-medium">No artwork selected</p>
              </div>
            )}
          </div>

          {/* MagSafe Ring Overlay */}
          {showMagsafe && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-15">
              <div
                className="rounded-full border-2 border-white/40 shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                style={{
                  width: `${width * 0.44}px`,
                  height: `${width * 0.44}px`,
                }}
              />
              <div
                className="w-1.5 bg-white/40 rounded-full mt-1.5 shadow-[0_0_6px_rgba(255,255,255,0.2)]"
                style={{ height: `${width * 0.1}px` }}
              />
            </div>
          )}

          {/* Liquid Gloss Specular Sheen */}
          {finish === 'liquid-gloss' && (
            <div
              className="absolute inset-0 pointer-events-none z-20"
              style={{
                background: `linear-gradient(
                  125deg,
                  rgba(255, 255, 255, ${(glossIntensity / 100) * 0.55}) 0%,
                  rgba(255, 255, 255, ${(glossIntensity / 100) * 0.2}) 22%,
                  rgba(255, 255, 255, 0) 38%,
                  rgba(255, 255, 255, 0) 65%,
                  rgba(255, 255, 255, ${(glossIntensity / 100) * 0.15}) 85%,
                  rgba(255, 255, 255, 0) 100%
                )`,
                mixBlendMode: 'screen',
              }}
            />
          )}

          {/* Velvet Matte Diffuse Shading */}
          {finish === 'velvet-matte' && (
            <div
              className="absolute inset-0 pointer-events-none z-20"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 30%, rgba(255, 255, 255, 0.08) 0%, rgba(0, 0, 0, 0.25) 100%)',
                backdropFilter: 'contrast(97%) brightness(98%)',
              }}
            />
          )}

          {/* Environmental Ambient Light Tint */}
          {ambientTint && (
            <div
              className="absolute inset-0 pointer-events-none z-22"
              style={{
                backgroundColor: ambientTint,
                mixBlendMode: 'color-dodge',
              }}
            />
          )}

          {/* Case Perimeter Rim Shadow & Inner Bevel */}
          <div
            className="absolute inset-0 pointer-events-none z-25"
            style={{
              borderRadius: `${Math.max(borderRadius - 3, 4)}px`,
              boxShadow: `
                inset 0 0 10px rgba(0, 0, 0, 0.55),
                inset 1px 1px 2px rgba(255, 255, 255, 0.35),
                inset -1px -1px 2px rgba(0, 0, 0, 0.45)
              `,
            }}
          />
        </div>

        {/* ----------------- CAMERA MODULE ----------------- */}
        {isIphone ? (
          /* iPhone 16 Pro Triple Lens Plateau */
          <div
            className="absolute top-3.5 left-3.5 z-40"
            style={{
              width: `${width * 0.41}px`,
              height: `${width * 0.44}px`,
              borderRadius: `${width * 0.11}px`,
              backgroundColor: frameColor.hex,
              boxShadow: `
                0 4px 10px rgba(0, 0, 0, 0.55),
                inset 0 1px 1px rgba(255, 255, 255, 0.4),
                inset 0 -1px 2px rgba(0, 0, 0, 0.6)
              `,
              border: `1.5px solid ${frameColor.accentHex}99`,
            }}
          >
            {/* Plateau Glass Tint */}
            <div
              className="absolute inset-1 rounded-[24px] opacity-70"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(0,0,0,0.5) 100%)',
              }}
            />

            {/* Lens 1: Top-Left */}
            <div
              className="absolute top-2 left-2 rounded-full flex items-center justify-center"
              style={{
                width: `${width * 0.155}px`,
                height: `${width * 0.155}px`,
                backgroundColor: '#111317',
                border: `2px solid ${frameColor.accentHex}`,
                boxShadow: '0 2px 5px rgba(0,0,0,0.7), inset 0 0 4px #000',
              }}
            >
              <div className="w-2/3 h-2/3 rounded-full bg-slate-950 border border-cyan-500/30 relative overflow-hidden">
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-300/60 blur-[0.5px]" />
                <div className="absolute bottom-1 left-1 w-1 h-1 rounded-full bg-blue-500/50" />
              </div>
            </div>

            {/* Lens 2: Bottom-Left */}
            <div
              className="absolute bottom-2 left-2 rounded-full flex items-center justify-center"
              style={{
                width: `${width * 0.155}px`,
                height: `${width * 0.155}px`,
                backgroundColor: '#111317',
                border: `2px solid ${frameColor.accentHex}`,
                boxShadow: '0 2px 5px rgba(0,0,0,0.7), inset 0 0 4px #000',
              }}
            >
              <div className="w-2/3 h-2/3 rounded-full bg-slate-950 border border-cyan-500/30 relative overflow-hidden">
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-300/60 blur-[0.5px]" />
                <div className="absolute bottom-1 left-1 w-1 h-1 rounded-full bg-blue-500/50" />
              </div>
            </div>

            {/* Lens 3: Center-Right (Telephoto) */}
            <div
              className="absolute top-[28%] right-2 rounded-full flex items-center justify-center"
              style={{
                width: `${width * 0.155}px`,
                height: `${width * 0.155}px`,
                backgroundColor: '#111317',
                border: `2px solid ${frameColor.accentHex}`,
                boxShadow: '0 2px 5px rgba(0,0,0,0.7), inset 0 0 4px #000',
              }}
            >
              <div className="w-2/3 h-2/3 rounded-full bg-slate-950 border border-cyan-500/30 relative overflow-hidden">
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-300/60 blur-[0.5px]" />
                <div className="absolute bottom-1 left-1 w-1 h-1 rounded-full bg-blue-500/50" />
              </div>
            </div>

            {/* TrueTone Flash (Top-Right) */}
            <div
              className="absolute top-2.5 right-3.5 rounded-full flex items-center justify-center bg-amber-100 border border-amber-300 shadow-[0_0_4px_rgba(251,191,36,0.5)]"
              style={{ width: `${width * 0.052}px`, height: `${width * 0.052}px` }}
            >
              <div className="w-1 h-1 bg-amber-400 rounded-full" />
            </div>

            {/* LiDAR Scanner (Bottom-Right) */}
            <div
              className="absolute bottom-3 right-3.5 rounded-full bg-neutral-900 border border-neutral-700 shadow-inner"
              style={{ width: `${width * 0.055}px`, height: `${width * 0.055}px` }}
            />

            {/* Mic hole */}
            <div
              className="absolute bottom-8 right-2.5 w-1 h-1 rounded-full bg-black border border-white/20"
            />
          </div>
        ) : (
          /* Samsung Galaxy S25 / S24 Ultra Floating Lens Array */
          <div className="absolute top-3 left-3 z-40 flex gap-2">
            {/* Main Vertical Lens Column (3 Primary Lenses) */}
            <div className="flex flex-col gap-2.5">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className="rounded-full flex items-center justify-center"
                  style={{
                    width: `${width * 0.145}px`,
                    height: `${width * 0.145}px`,
                    backgroundColor: '#0c0d10',
                    border: `2px solid ${frameColor.accentHex}`,
                    boxShadow: `
                      0 3px 6px rgba(0,0,0,0.65),
                      inset 0 1px 2px rgba(255,255,255,0.4)
                    `,
                  }}
                >
                  <div className="w-2/3 h-2/3 rounded-full bg-neutral-950 border border-cyan-400/40 relative overflow-hidden">
                    <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-300/70 blur-[0.5px]" />
                    <div className="absolute bottom-0.5 left-0.5 w-1 h-1 rounded-full bg-indigo-500/50" />
                  </div>
                </div>
              ))}
            </div>

            {/* Secondary Column: Flash + Laser AF + Telephoto */}
            <div className="flex flex-col gap-3 pt-1">
              {/* LED Flash */}
              <div
                className="rounded-full bg-amber-100 border border-amber-300 shadow-[0_0_4px_rgba(251,191,36,0.6)] flex items-center justify-center"
                style={{ width: `${width * 0.05}px`, height: `${width * 0.05}px` }}
              >
                <div className="w-1 h-1 bg-amber-400 rounded-full" />
              </div>

              {/* Laser AF Sensor */}
              <div
                className="rounded-full bg-red-950 border border-red-800 flex items-center justify-center shadow-inner"
                style={{ width: `${width * 0.065}px`, height: `${width * 0.065}px` }}
              >
                <div className="w-1 h-1 bg-red-600 rounded-full animate-pulse" />
              </div>

              {/* 3x Periscope Telephoto */}
              <div
                className="rounded-full flex items-center justify-center"
                style={{
                  width: `${width * 0.11}px`,
                  height: `${width * 0.11}px`,
                  backgroundColor: '#0c0d10',
                  border: `1.5px solid ${frameColor.accentHex}`,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.6)',
                }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-cyan-500/30" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Realistic In-Hand Grip Overlay (Fingers wrapping naturally over edges) */}
      {showHands && gripStyle && gripStyle !== 'none' && (
        <HandGripOverlay
          gripStyle={gripStyle}
          skinTone={skinTone}
          phoneWidth={width}
          phoneHeight={height}
        />
      )}
    </div>
  );
};

import React from 'react';

export type SkinTone = 'fair' | 'honey' | 'bronze' | 'deep';

export interface SkinToneConfig {
  id: SkinTone;
  label: string;
  baseColor: string;
  gradientStart: string;
  gradientEnd: string;
  shadowColor: string;
  nailColor: string;
}

export const SKIN_TONES: Record<SkinTone, SkinToneConfig> = {
  fair: {
    id: 'fair',
    label: 'Fair / Ivory',
    baseColor: '#f1cbb2',
    gradientStart: '#ffd9c2',
    gradientEnd: '#d89e82',
    shadowColor: 'rgba(102, 45, 23, 0.45)',
    nailColor: '#f7d3c6',
  },
  honey: {
    id: 'honey',
    label: 'Warm Honey / Olive',
    baseColor: '#d69e6b',
    gradientStart: '#e8b584',
    gradientEnd: '#aa6d3d',
    shadowColor: 'rgba(84, 43, 14, 0.5)',
    nailColor: '#e0b28e',
  },
  bronze: {
    id: 'bronze',
    label: 'Warm Bronze / Tan',
    baseColor: '#a8653a',
    gradientStart: '#ba7a4b',
    gradientEnd: '#773e1c',
    shadowColor: 'rgba(56, 25, 8, 0.6)',
    nailColor: '#b37750',
  },
  deep: {
    id: 'deep',
    label: 'Deep Espresso',
    baseColor: '#5c3826',
    gradientStart: '#704630',
    gradientEnd: '#3d2214',
    shadowColor: 'rgba(25, 12, 5, 0.65)',
    nailColor: '#633d2a',
  },
};

interface HandGripOverlayProps {
  gripStyle: 'two-hand' | 'single-right' | 'single-left' | 'table-grip';
  skinTone: SkinTone;
  phoneWidth: number;
  phoneHeight: number;
}

export const HandGripOverlay: React.FC<HandGripOverlayProps> = ({
  gripStyle,
  skinTone,
  phoneWidth,
  phoneHeight,
}) => {
  const tone = SKIN_TONES[skinTone] || SKIN_TONES.honey;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-30"
      style={{ width: `${phoneWidth}px`, height: `${phoneHeight}px` }}
    >
      <svg
        className="w-full h-full overflow-visible"
        viewBox={`0 0 ${phoneWidth} ${phoneHeight}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Skin Gradient for fingers */}
          <linearGradient id={`skinGrad-${skinTone}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={tone.gradientStart} />
            <stop offset="60%" stopColor={tone.baseColor} />
            <stop offset="100%" stopColor={tone.gradientEnd} />
          </linearGradient>

          {/* Contact Shadow Filter for fingers onto phone case */}
          <filter id="fingerShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow
              dx="-3"
              dy="4"
              stdDeviation="3"
              floodColor="rgba(0, 0, 0, 0.55)"
            />
          </filter>

          <filter id="leftFingerShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow
              dx="3"
              dy="3"
              stdDeviation="3"
              floodColor="rgba(0, 0, 0, 0.55)"
            />
          </filter>
        </defs>

        {/* ================= STYLE: TWO-HAND OR SINGLE-RIGHT ================= */}
        {(gripStyle === 'two-hand' || gripStyle === 'single-right') && (
          <g>
            {/* Right Side: Index Finger wrapping over edge */}
            <g filter="url(#fingerShadow)">
              <path
                d={`M ${phoneWidth + 10} ${phoneHeight * 0.32}
                    C ${phoneWidth + 2} ${phoneHeight * 0.32}, ${phoneWidth - 14} ${phoneHeight * 0.33}, ${phoneWidth - 14} ${phoneHeight * 0.37}
                    C ${phoneWidth - 14} ${phoneHeight * 0.40}, ${phoneWidth + 4} ${phoneHeight * 0.40}, ${phoneWidth + 12} ${phoneHeight * 0.39}
                    Z`}
                fill={`url(#skinGrad-${skinTone})`}
              />
              {/* Nail */}
              <ellipse
                cx={phoneWidth - 8}
                cy={phoneHeight * 0.36}
                rx="3.5"
                ry="5"
                fill={tone.nailColor}
                opacity="0.8"
                transform={`rotate(-15 ${phoneWidth - 8} ${phoneHeight * 0.36})`}
              />
            </g>

            {/* Right Side: Middle Finger wrapping over edge */}
            <g filter="url(#fingerShadow)">
              <path
                d={`M ${phoneWidth + 12} ${phoneHeight * 0.42}
                    C ${phoneWidth + 3} ${phoneHeight * 0.42}, ${phoneWidth - 16} ${phoneHeight * 0.43}, ${phoneWidth - 16} ${phoneHeight * 0.48}
                    C ${phoneWidth - 16} ${phoneHeight * 0.51}, ${phoneWidth + 5} ${phoneHeight * 0.51}, ${phoneWidth + 14} ${phoneHeight * 0.50}
                    Z`}
                fill={`url(#skinGrad-${skinTone})`}
              />
              {/* Nail */}
              <ellipse
                cx={phoneWidth - 9}
                cy={phoneHeight * 0.47}
                rx="4"
                ry="5.5"
                fill={tone.nailColor}
                opacity="0.8"
                transform={`rotate(-12 ${phoneWidth - 9} ${phoneHeight * 0.47})`}
              />
            </g>

            {/* Right Side: Ring Finger wrapping over edge */}
            <g filter="url(#fingerShadow)">
              <path
                d={`M ${phoneWidth + 10} ${phoneHeight * 0.53}
                    C ${phoneWidth + 2} ${phoneHeight * 0.53}, ${phoneWidth - 13} ${phoneHeight * 0.54}, ${phoneWidth - 13} ${phoneHeight * 0.58}
                    C ${phoneWidth - 13} ${phoneHeight * 0.61}, ${phoneWidth + 4} ${phoneHeight * 0.61}, ${phoneWidth + 12} ${phoneHeight * 0.60}
                    Z`}
                fill={`url(#skinGrad-${skinTone})`}
              />
              {/* Nail */}
              <ellipse
                cx={phoneWidth - 7.5}
                cy={phoneHeight * 0.57}
                rx="3.5"
                ry="4.5"
                fill={tone.nailColor}
                opacity="0.8"
                transform={`rotate(-10 ${phoneWidth - 7.5} ${phoneHeight * 0.57})`}
              />
            </g>
          </g>
        )}

        {/* ================= LEFT SIDE: THUMB WRAPPING OVER EDGE ================= */}
        {(gripStyle === 'two-hand' || gripStyle === 'single-left' || gripStyle === 'single-right') && (
          <g filter="url(#leftFingerShadow)">
            {/* Left Thumb Pad resting on rim */}
            <path
              d={`M -12 ${phoneHeight * 0.52}
                  C -4 ${phoneHeight * 0.50}, ${phoneWidth * 0.08} ${phoneHeight * 0.51}, ${phoneWidth * 0.08} ${phoneHeight * 0.56}
                  C ${phoneWidth * 0.08} ${phoneHeight * 0.60}, -2 ${phoneHeight * 0.62}, -14 ${phoneHeight * 0.61}
                  Z`}
              fill={`url(#skinGrad-${skinTone})`}
            />
            {/* Thumb Nail */}
            <ellipse
              cx={phoneWidth * 0.045}
              cy={phoneHeight * 0.55}
              rx="4.5"
              ry="6"
              fill={tone.nailColor}
              opacity="0.75"
              transform={`rotate(20 ${phoneWidth * 0.045} ${phoneHeight * 0.55})`}
            />
          </g>
        )}

        {/* ================= BOTTOM SUPPORT: PINKY / PALM HEEL ================= */}
        {gripStyle === 'single-right' && (
          <g filter="url(#fingerShadow)">
            <path
              d={`M ${phoneWidth * 0.25} ${phoneHeight + 10}
                  C ${phoneWidth * 0.32} ${phoneHeight - 4}, ${phoneWidth * 0.55} ${phoneHeight - 4}, ${phoneWidth * 0.62} ${phoneHeight + 10}
                  Z`}
              fill={`url(#skinGrad-${skinTone})`}
            />
          </g>
        )}

        {/* ================= TABLE-REST GRIP (CAFE / DESK) ================= */}
        {gripStyle === 'table-grip' && (
          <g filter="url(#fingerShadow)">
            {/* Thumb resting on left lower edge */}
            <path
              d={`M -10 ${phoneHeight * 0.68}
                  C -2 ${phoneHeight * 0.66}, ${phoneWidth * 0.06} ${phoneHeight * 0.67}, ${phoneWidth * 0.06} ${phoneHeight * 0.73}
                  C ${phoneWidth * 0.06} ${phoneHeight * 0.77}, -2 ${phoneHeight * 0.78}, -10 ${phoneHeight * 0.77}
                  Z`}
              fill={`url(#skinGrad-${skinTone})`}
            />
            {/* Index finger resting along right rim */}
            <path
              d={`M ${phoneWidth + 10} ${phoneHeight * 0.55}
                  C ${phoneWidth + 2} ${phoneHeight * 0.55}, ${phoneWidth - 10} ${phoneHeight * 0.57}, ${phoneWidth - 10} ${phoneHeight * 0.62}
                  C ${phoneWidth - 10} ${phoneHeight * 0.65}, ${phoneWidth + 2} ${phoneHeight * 0.65}, ${phoneWidth + 10} ${phoneHeight * 0.64}
                  Z`}
              fill={`url(#skinGrad-${skinTone})`}
            />
          </g>
        )}
      </svg>
    </div>
  );
};

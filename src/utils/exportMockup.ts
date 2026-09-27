import { DeviceType, CaseFinish, FrameColor } from '../types';
import { FRAME_COLORS } from '../data/presets';

interface RenderProductMockupOptions {
  artworkUrl: string;
  device: DeviceType;
  finish: CaseFinish;
  frameColorId: string;
  showMagsafe?: boolean;
  glossIntensity?: number;
}

/**
 * Loads an image with CORS handling
 */
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};

/**
 * Draws rounded rectangle path
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Draws the high-detail phone case directly onto a canvas context
 */
export async function drawPhoneCaseProduct(
  ctx: CanvasRenderingContext2D,
  artworkImg: HTMLImageElement,
  x: number,
  y: number,
  targetWidth: number,
  device: DeviceType,
  finish: CaseFinish,
  frameColorId: string,
  showMagsafe = false,
  glossIntensity = 75
) {
  const isIphone = device === 'iphone-16-pro';
  const aspectRatio = isIphone ? 574 / 280 : 588 / 280;
  const targetHeight = targetWidth * aspectRatio;
  const borderRadius = isIphone ? targetWidth * 0.16 : targetWidth * 0.05;
  const frameColor: FrameColor =
    FRAME_COLORS.find((c) => c.id === frameColorId) || FRAME_COLORS[0];

  ctx.save();
  ctx.translate(x, y);

  // Outer Phone Frame
  ctx.save();
  roundRect(ctx, 0, 0, targetWidth, targetHeight, borderRadius);
  ctx.fillStyle = frameColor.hex;
  ctx.fill();
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = frameColor.accentHex;
  ctx.stroke();

  // Armor Corner Bumpers
  if (finish === 'tough-armor') {
    const bumperSize = targetWidth * 0.12;
    ctx.fillStyle = 'rgba(15, 17, 23, 0.9)';
    roundRect(ctx, 0, 0, bumperSize, bumperSize, borderRadius * 0.8);
    ctx.fill();
    roundRect(ctx, targetWidth - bumperSize, 0, bumperSize, bumperSize, borderRadius * 0.8);
    ctx.fill();
    roundRect(ctx, 0, targetHeight - bumperSize, bumperSize, bumperSize, borderRadius * 0.8);
    ctx.fill();
    roundRect(ctx, targetWidth - bumperSize, targetHeight - bumperSize, bumperSize, bumperSize, borderRadius * 0.8);
    ctx.fill();
  }

  // Clip for inner backplate and artwork
  const innerInset = finish === 'clear-hybrid' ? 6 : 3;
  roundRect(
    ctx,
    innerInset,
    innerInset,
    targetWidth - innerInset * 2,
    targetHeight - innerInset * 2,
    Math.max(borderRadius - innerInset, 4)
  );
  ctx.clip();

  // Background for backplate
  ctx.fillStyle = '#0a0a0c';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // Draw Artwork covering the case back
  const artRatio = artworkImg.width / artworkImg.height;
  const caseRatio = targetWidth / targetHeight;
  let sWidth = artworkImg.width;
  let sHeight = artworkImg.height;
  let sx = 0;
  let sy = 0;

  if (artRatio > caseRatio) {
    sWidth = artworkImg.height * caseRatio;
    sx = (artworkImg.width - sWidth) / 2;
  } else {
    sHeight = artworkImg.width / caseRatio;
    sy = (artworkImg.height - sHeight) / 2;
  }

  ctx.drawImage(
    artworkImg,
    sx,
    sy,
    sWidth,
    sHeight,
    innerInset,
    innerInset,
    targetWidth - innerInset * 2,
    targetHeight - innerInset * 2
  );

  // Clear Hybrid translucency overlay
  if (finish === 'clear-hybrid') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  // MagSafe Ring
  if (showMagsafe) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(targetWidth / 2, targetHeight / 2, targetWidth * 0.22, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    roundRect(
      ctx,
      targetWidth / 2 - 2,
      targetHeight / 2 + targetWidth * 0.22 + 4,
      4,
      targetWidth * 0.1,
      2
    );
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fill();
    ctx.restore();
  }

  // Specular Gloss or Velvet Matte Sheen
  if (finish === 'liquid-gloss') {
    const glossGrad = ctx.createLinearGradient(0, 0, targetWidth, targetHeight);
    const intensity = (glossIntensity / 100) * 0.55;
    glossGrad.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
    glossGrad.addColorStop(0.22, `rgba(255, 255, 255, ${intensity * 0.35})`);
    glossGrad.addColorStop(0.38, 'rgba(255, 255, 255, 0)');
    glossGrad.addColorStop(0.68, 'rgba(255, 255, 255, 0)');
    glossGrad.addColorStop(0.85, `rgba(255, 255, 255, ${intensity * 0.2})`);
    glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = glossGrad;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  } else if (finish === 'velvet-matte') {
    const matteGrad = ctx.createRadialGradient(
      targetWidth * 0.5,
      targetHeight * 0.3,
      10,
      targetWidth * 0.5,
      targetHeight * 0.5,
      targetWidth * 0.7
    );
    matteGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    matteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.22)');
    ctx.fillStyle = matteGrad;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  // Inner Edge Bevel Shadow
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
  roundRect(
    ctx,
    innerInset,
    innerInset,
    targetWidth - innerInset * 2,
    targetHeight - innerInset * 2,
    Math.max(borderRadius - innerInset, 4)
  );
  ctx.stroke();
  ctx.restore(); // restore clip

  // ----------------- CAMERA CUTOUT RENDERING -----------------
  if (isIphone) {
    // iPhone 16 Pro Triple-Lens Camera Plateau
    const pWidth = targetWidth * 0.41;
    const pHeight = targetWidth * 0.44;
    const pRadius = targetWidth * 0.11;
    const px = targetWidth * 0.05;
    const py = targetWidth * 0.05;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    roundRect(ctx, px, py, pWidth, pHeight, pRadius);
    ctx.fillStyle = frameColor.hex;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = `${frameColor.accentHex}bb`;
    ctx.stroke();
    ctx.restore();

    // 3 Lenses
    const lensRadius = targetWidth * 0.077;
    const drawLens = (cx: number, cy: number) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, lensRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#111317';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = frameColor.accentHex;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, lensRadius * 0.65, 0, Math.PI * 2);
      ctx.fillStyle = '#06080c';
      ctx.fill();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx + 2, cy - 2, lensRadius * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fill();
      ctx.restore();
    };

    drawLens(px + lensRadius + 6, py + lensRadius + 6);
    drawLens(px + lensRadius + 6, py + pHeight - lensRadius - 6);
    drawLens(px + pWidth - lensRadius - 6, py + pHeight / 2);
  } else {
    // Samsung Galaxy S25 Ultra floating vertical lens column
    const sLensRadius = targetWidth * 0.072;
    const sx = targetWidth * 0.05;
    let sy = targetWidth * 0.05;

    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 3;
      ctx.beginPath();
      ctx.arc(sx + sLensRadius, sy + sLensRadius, sLensRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#0c0d10';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = frameColor.accentHex;
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(sx + sLensRadius + 2, sy + sLensRadius - 2, sLensRadius * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.fill();

      sy += sLensRadius * 2 + 10;
    }

    // Secondary sensor and flash
    const secX = sx + sLensRadius * 2 + 12;
    // Flash
    ctx.beginPath();
    ctx.arc(secX + targetWidth * 0.025, targetWidth * 0.065, targetWidth * 0.025, 0, Math.PI * 2);
    ctx.fillStyle = '#fef3c7';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Laser AF
    ctx.beginPath();
    ctx.arc(secX + targetWidth * 0.03, targetWidth * 0.14, targetWidth * 0.03, 0, Math.PI * 2);
    ctx.fillStyle = '#450a0a';
    ctx.fill();
    ctx.strokeStyle = '#dc2626';
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Generates an isolated clean studio product mockup on transparent or cyclorama background
 */
export async function generateProductMockupCanvas(
  options: RenderProductMockupOptions,
  width = 1200,
  height = 1400
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Studio Cyclorama Gradient (Neutral high-end commercial backdrop)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#1c1f26');
  bgGrad.addColorStop(0.5, '#13151b');
  bgGrad.addColorStop(1, '#0b0c10');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Soft Studio Spotlight
  const spotGrad = ctx.createRadialGradient(
    width / 2,
    height * 0.42,
    width * 0.05,
    width / 2,
    height * 0.45,
    width * 0.55
  );
  spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.06)');
  spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = spotGrad;
  ctx.fillRect(0, 0, width, height);

  // Load Artwork
  const artworkImg = await loadImage(options.artworkUrl);

  const phoneW = Math.round(width * 0.44);
  const isIphone = options.device === 'iphone-16-pro';
  const phoneH = phoneW * (isIphone ? 574 / 280 : 588 / 280);

  const phoneX = (width - phoneW) / 2;
  const phoneY = (height - phoneH) / 2 - 20;

  // Contact Shadow under device
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(
    width / 2,
    phoneY + phoneH + 18,
    phoneW * 0.48,
    phoneW * 0.08,
    0,
    0,
    Math.PI * 2
  );
  const shadowGrad = ctx.createRadialGradient(
    width / 2,
    phoneY + phoneH + 18,
    10,
    width / 2,
    phoneY + phoneH + 18,
    phoneW * 0.48
  );
  shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  shadowGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.35)');
  shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.fill();
  ctx.restore();

  // Draw Case
  await drawPhoneCaseProduct(
    ctx,
    artworkImg,
    phoneX,
    phoneY,
    phoneW,
    options.device,
    options.finish,
    options.frameColorId,
    options.showMagsafe ?? false,
    options.glossIntensity ?? 80
  );

  return canvas.toDataURL('image/png');
}

/**
 * Downloads a data URL as a file
 */
export function triggerDownload(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

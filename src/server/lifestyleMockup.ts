import { GoogleGenAI } from '@google/genai';

export interface LifestyleMockupRequest {
  designImageUrl?: string;
  productMockupUrl?: string;
  sceneReferenceImages?: string[];
  userScenePrompt?: string;
  styleDirection?: string;
  modelName?: string;
  brand?: string;
  caseType?: string;
  dimensions?: {
    pixelWidth: number;
    pixelHeight: number;
    mmWidth: number;
    mmHeight: number;
  };
  caseShapeDesc?: string;
  cameraCutoutDesc?: string;
  variationIndex?: number;
}

export class LifestyleMockupError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'LifestyleMockupError';
    this.statusCode = statusCode;
  }
}

const toInlineImage = async (url: string) => {
  const dataUrl = url.match(/^data:(image\/(?:png|jpe?g|webp));base64,([A-Za-z0-9+/]+=*)$/i);
  if (dataUrl) {
    const byteLength = Buffer.from(dataUrl[2], 'base64').byteLength;
    if (byteLength > 12 * 1024 * 1024) {
      throw new LifestyleMockupError('A reference image is too large. Use images smaller than 12 MB.', 413);
    }
    return { inlineData: { mimeType: dataUrl[1], data: dataUrl[2] }, byteLength };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new LifestyleMockupError('Reference images must be uploaded image data or HTTPS image URLs.', 400);
  }
  if (parsedUrl.protocol !== 'https:') {
    throw new LifestyleMockupError('Reference image URLs must use HTTPS.', 400);
  }

  const response = await fetch(parsedUrl, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) {
    throw new LifestyleMockupError(`Could not load a reference image (${response.status}).`, 400);
  }
  const mimeType = response.headers.get('content-type')?.split(';')[0] || '';
  if (!/^image\/(png|jpe?g|webp)$/i.test(mimeType)) {
    throw new LifestyleMockupError('A reference URL did not return a PNG, JPEG, or WebP image.', 400);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.byteLength > 12 * 1024 * 1024) {
    throw new LifestyleMockupError('A reference image is too large. Use images smaller than 12 MB.', 413);
  }
  return { inlineData: { mimeType, data: bytes.toString('base64') }, byteLength: bytes.byteLength };
};

export async function generateLifestyleMockup(input: LifestyleMockupRequest): Promise<string> {
  if (!input.designImageUrl) {
    throw new LifestyleMockupError('Design artwork image is required.', 400);
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.startsWith('your_')) {
    throw new LifestyleMockupError(
      'Gemini is not configured. Set GEMINI_API_KEY in your environment and restart the app.',
      503
    );
  }

  const brandName =
    input.brand === 'apple'
      ? 'Apple iPhone'
      : input.brand === 'samsung'
        ? 'Samsung phone'
        : 'phone shown in the reference image';
  const dimensionInfo = input.dimensions
    ? `${input.dimensions.pixelWidth}x${input.dimensions.pixelHeight}px (${input.dimensions.mmWidth}mm x ${input.dimensions.mmHeight}mm)`
    : 'follow the proportions visible in the product reference image';
  const cameraDescription =
    input.cameraCutoutDesc || 'the exact camera opening visible in the product reference image';
  const sceneReferenceStartIndex = input.productMockupUrl ? 3 : 2;
  const sourceImageInstructions = [
    'Image 1 is the immutable case artwork.',
    input.productMockupUrl ? 'Image 2 is the product reference for this exact selected model.' : '',
    ...(input.sceneReferenceImages ?? []).map(
      (_, index) => `Image ${sceneReferenceStartIndex + index} is a scene-only reference for environment, props, lighting, or mood.`
    ),
  ].filter(Boolean).join('\n');
  const productGeometryInstruction = input.productMockupUrl
    ? 'Preserve the physical case shape, materials, finish, edges, buttons, camera opening, proportions, and cutouts shown in Image 2. Do not substitute another case or model.'
    : `Reconstruct the named catalog model using the physical geometry, dimensions, camera opening, and features specified below. Do not substitute another case or model.`;
  const prompt = `[PRODUCT AND ARTWORK PRESERVATION]:
Create one photorealistic commercial lifestyle photograph using the user's original case artwork and the exact catalog model specifications below.
${sourceImageInstructions}

PRODUCT MUST REMAIN FIXED:
- ${productGeometryInstruction}
- Device: ${input.modelName || 'the selected catalog phone case'} (${brandName}).
- Case construction: ${input.caseType || 'as specified by the selected catalog model'}.
- Reference dimensions: ${dimensionInfo}.
- Physical case shape and features: ${input.caseShapeDesc || 'follow the exact named catalog model and its standard physical design'}.
- Camera opening: ${cameraDescription}.
- Image 1 is the immutable artwork source. Reproduce its exact design, colors, layout, and details on the case; do not redraw, reinterpret, recolor, crop, mirror, or replace any part of it.
- Image 1 is the immutable artwork source. Reproduce its exact design, colors, layout, and details on the case; do not redraw, reinterpret, recolor, crop, mirror, or replace any part of it.
- Keep the complete case-back artwork sharp, flat, correctly aligned, and unobstructed. Nothing may cross over the artwork.
- Match the artwork placement and scale to the product reference when supplied; otherwise fit it to the selected model specifications. Do not invent graphics, text, logos, or watermarks.

ENVIRONMENT IS CREATIVE:
- Scene: "${input.userScenePrompt || 'A premium product photograph with the case back facing the camera.'}"
- Follow the scene's specified setting, lighting, and composition.
- Additional styling direction: "${input.styleDirection || 'Use subtle cues from the artwork itself; do not override the specified scene composition.'}"
- Follow the scene's specified camera angle, phone placement, orientation, environment, and presence or absence of a person. Do not default to a handheld composition.
${input.sceneReferenceImages?.length ? '- Use scene-only references to guide the background and styling; never copy their phone, case, or artwork into this result.' : ''}
- Use premium commercial product photography, realistic materials and contact shadows, and natural depth of field. If hands are present, show anatomically natural hands with fingers only on the case edges.
- This is a real product photograph, not a 3D render, illustration, collage, or image with text.
- Variation: #${input.variationIndex ?? 1}.

Return a single photorealistic image.`;

  let imageParts;
  try {
    const imageUrls = [
      input.designImageUrl,
      ...(input.productMockupUrl ? [input.productMockupUrl] : []),
      ...(input.sceneReferenceImages ?? []),
    ];
    imageParts = await Promise.all(imageUrls.map(toInlineImage));
    const totalBytes = imageParts.reduce((total, part) => total + part.byteLength, 0);
    if (totalBytes > 20 * 1024 * 1024) {
      throw new LifestyleMockupError('The combined reference images are too large. Use images totaling less than 20 MB.', 413);
    }
  } catch (error) {
    if (error instanceof LifestyleMockupError) throw error;
    throw new LifestyleMockupError('Could not load the reference images for Gemini.', 502);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [...imageParts.map(({ inlineData }) => ({ inlineData })), { text: prompt }],
      },
      config: { imageConfig: { aspectRatio: '16:9' } },
    });
    const generatedImage = response.candidates?.[0]?.content?.parts?.find((part) => part.inlineData);
    if (!generatedImage?.inlineData?.data) {
      throw new LifestyleMockupError(response.text || 'Gemini did not return a lifestyle image.', 502);
    }
    return `data:${generatedImage.inlineData.mimeType || 'image/png'};base64,${generatedImage.inlineData.data}`;
  } catch (error) {
    if (error instanceof LifestyleMockupError) throw error;
    const status = Number((error as { status?: number })?.status);
    if (status === 401 || status === 403) {
      throw new LifestyleMockupError('Gemini rejected the API key. Check GEMINI_API_KEY.', 401);
    }
    if (status === 429) {
      throw new LifestyleMockupError('Gemini API quota is unavailable. Check your Google AI quota or try again later.', 429);
    }
    console.error('Gemini lifestyle image generation failed:', error);
    throw new LifestyleMockupError('Gemini could not generate the lifestyle image. Check server logs for details.', 502);
  }
}

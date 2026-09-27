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
  constructor(
    message: string,
    readonly statusCode: number
  ) {
    super(message);
    this.name = 'LifestyleMockupError';
  }
}

export async function generateLifestyleMockup(input: LifestyleMockupRequest): Promise<string> {
  if (!input.designImageUrl) {
    throw new LifestyleMockupError('Design artwork image is required.', 400);
  }
  const apiKey = process.env.POLLINATIONS_API_KEY;
  if (!apiKey) {
    throw new LifestyleMockupError(
      'Pollinations API key is missing. Set POLLINATIONS_API_KEY in your Netlify environment variables.',
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

  let response: Response;
  try {
    response = await fetch('https://gen.pollinations.ai/v1/images/edits', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-image-2',
        prompt,
        image: [
          { image_url: input.designImageUrl },
          ...(input.productMockupUrl ? [{ image_url: input.productMockupUrl }] : []),
          ...(input.sceneReferenceImages ?? []).map((imageUrl) => ({ image_url: imageUrl })),
        ],
        size: '1536x1024',
        response_format: 'b64_json',
      }),
    });
  } catch {
    throw new LifestyleMockupError('Could not reach Pollinations. Please try again.', 502);
  }

  const result = (await response.json().catch(() => null)) as {
    data?: Array<{ b64_json?: string; media_type?: string }>;
    error?: string | { message?: string };
  } | null;

  if (!response.ok) {
    const providerMessage =
      typeof result?.error === 'string' ? result.error : result?.error?.message;
    if (response.status === 401) {
      throw new LifestyleMockupError(
        'Pollinations rejected the API key. Check POLLINATIONS_API_KEY in your Netlify environment variables.',
        401
      );
    }
    if (response.status === 402) {
      throw new LifestyleMockupError(
        'Pollinations credits are exhausted. Check your available Pollen balance.',
        402
      );
    }
    if (response.status === 429) {
      throw new LifestyleMockupError(
        'Pollinations rate limit reached. Please wait before trying again.',
        429
      );
    }
    throw new LifestyleMockupError(providerMessage || 'Pollinations image editing failed.', 502);
  }

  const generatedImage = result?.data?.[0];
  if (!generatedImage?.b64_json) {
    throw new LifestyleMockupError('Pollinations returned no generated image data.', 502);
  }

  return `data:${generatedImage.media_type || 'image/png'};base64,${generatedImage.b64_json}`;
}
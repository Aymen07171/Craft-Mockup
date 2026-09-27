export interface LifestyleMockupRequest {
  designImageUrl?: string;
  productMockupUrl?: string;
  userScenePrompt?: string;
  modelName?: string;
  brand?: string;
  caseType?: string;
  dimensions?: {
    pixelWidth: number;
    pixelHeight: number;
    mmWidth: number;
    mmHeight: number;
  };
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
  if (!input.productMockupUrl) {
    throw new LifestyleMockupError('A product reference image is required to preserve the case appearance.', 400);
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
  const prompt = `[PRODUCT AND ARTWORK PRESERVATION]:
Create one photorealistic commercial lifestyle photograph using two separate source images:
Image 1 is the user's original case artwork. Image 2 is the authoritative phone-case product reference.

PRODUCT MUST REMAIN FIXED:
- Preserve the physical case shape, materials, finish, edges, buttons, camera opening, proportions, and cutouts shown in Image 2. Do not substitute another case or model.
- Device: ${input.modelName || 'the phone shown in Image 2'} (${brandName}).
- Case construction: ${input.caseType || 'as shown in Image 2'}.
- Reference dimensions: ${dimensionInfo}.
- Camera opening: ${cameraDescription}.
- Keep the exact original artwork from Image 1 on the back of the case. Do not redraw, recolor, restyle, crop, or replace it. Keep it sharp, full-bleed, and clearly recognizable.
- Show the back of the phone prominently, held naturally without fingers covering the artwork.

ENVIRONMENT IS CREATIVE:
- Scene: "${input.userScenePrompt || 'A person casually holding their phone, with the back of the phone case facing the camera.'}"
- Create a natural person, setting, lighting, and composition appropriate to that scene.
- Commercial lifestyle photography, realistic hand anatomy, natural contact shadows, and photorealistic depth of field.
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
          { image_url: input.productMockupUrl },
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
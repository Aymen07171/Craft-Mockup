import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));

// Shared Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API: Generate Design Artwork
app.post('/api/generate-design', async (req, res) => {
  try {
    const { prompt, aspectRatio = '9:16' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is missing. Set GEMINI_API_KEY in your local .env file and restart the server, or configure it in your deployment secrets.',
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as '9:16' | '1:1' | '3:4' | '4:3' | '16:9',
        },
      },
    });

    let imageUrl: string | null = null;
    let descriptionText = '';

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        } else if (part.text) {
          descriptionText += part.text;
        }
      }
    }

    if (!imageUrl) {
      return res.status(500).json({
        error: 'Model did not return image data.',
        detail: descriptionText,
      });
    }

    return res.json({ imageUrl, text: descriptionText });
  } catch (error: any) {
    console.error('Error generating design:', error);
    const msg = error?.message || 'Failed to generate design';
    let userMsg = msg;
    if (msg.includes('401') || msg.includes('UNAUTHENTICATED') || msg.includes('authentication credential')) {
      userMsg = 'Invalid authentication credentials. Please select or verify your API key in the AI Studio Secrets panel.';
    }
    return res.status(500).json({
      error: userMsg,
      details: error?.toString(),
    });
  }
});

// Helper to encode image to base64
async function encodeImagePart(imageUrl: string) {
  let base64Data = '';
  let mimeType = 'image/png';

  if (imageUrl.startsWith('data:')) {
    const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      mimeType = match[1];
      base64Data = match[2];
    }
  } else if (imageUrl.startsWith('/')) {
    try {
      const fs = await import('fs');
      const localPath = path.join(__dirname, imageUrl);
      if (fs.existsSync(localPath)) {
        const buf = fs.readFileSync(localPath);
        base64Data = buf.toString('base64');
        mimeType = imageUrl.endsWith('.png') ? 'image/png' : 'image/jpeg';
      }
    } catch (e) {
      console.error('Error reading local file:', e);
    }
  }

  if (base64Data) {
    return {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    };
  }
  return null;
}

// API: Generate AI Lifestyle Scene using Printify Reference Mockup & Preserved Artwork
app.post('/api/generate-lifestyle-scene', async (req, res) => {
  try {
    const {
      designImageUrl,
      productMockupUrl,
      userScenePrompt,
      modelName = 'iPhone 15 Pro',
      brand = 'unspecified',
      caseType = 'phone case shown in product reference',
      dimensions,
      cameraCutoutDesc,
      variationIndex = 1,
    } = req.body;

    if (!designImageUrl) {
      return res.status(400).json({ error: 'Design artwork image is required' });
    }
    if (!productMockupUrl) {
      return res.status(400).json({ error: 'A product reference image is required to preserve the case appearance' });
    }

    const apiKey = process.env.POLLINATIONS_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'Pollinations API key is missing. Set POLLINATIONS_API_KEY in your local .env file and restart the server.',
      });
    }

    // Keep the source artwork and physical case reference as separate edit inputs.
    const cameraDesc = cameraCutoutDesc || 'the exact camera opening visible in the product reference image';
    const dimensionInfo = dimensions ? `${dimensions.pixelWidth}x${dimensions.pixelHeight}px (${dimensions.mmWidth}mm x ${dimensions.mmHeight}mm)` : 'follow the proportions visible in the product reference image';
    const brandName = brand === 'apple' ? 'Apple iPhone' : brand === 'samsung' ? 'Samsung phone' : 'phone shown in the reference image';

    const systemInstructions = `[CRITICAL PRODUCT & ARTWORK PRESERVATION INSTRUCTIONS]:
  You are a commercial lifestyle product photographer creating a scene around a Printify phone case.
  You are given two source images: the user's original artwork (Image 1) and the authoritative physical product reference (Image 2).

PRIMARY MANDATES:
1. PRESERVE THE USER'S ARTWORK EXACTLY:
   - Do NOT redesign, regenerate, alter, re-color, add elements to, or replace the artwork.
   - The artwork on the back of the case must be an exact, sharp, full-bleed print reproduction of the provided design.
2. PRESERVE THE PHYSICAL PHONE CASE GEOMETRY:
  - Device: ${modelName} (${brandName}).
  - Case construction: ${caseType}. Follow the physical shape, material, finish, edges, buttons, and camera opening shown in Image 2; do not substitute another model or case style.
  - Reference dimensions: ${dimensionInfo}.
   - Camera module cutout: ${cameraDesc}.
  - Preserve the proportions and cutouts shown in Image 2.
3. THE BACK OF THE PHONE MUST BE PROMINENTLY VISIBLE:
   - The phone must be positioned naturally in the person's hand, facing the camera so the back case art is clearly visible, sharp, and recognizable.
   - Realistic hand anatomy: natural grip around the sides, authentic thumb/finger placement on the perimeter bumper without obscuring the artwork.
4. LIFESTYLE ENVIRONMENT & CONTEXT:
   - Scene: "${userScenePrompt || 'A person talking with a friend while casually holding their phone, with the back of the phone case facing the camera.'}"
   - Style: Professional 35mm f/2.0 commercial lifestyle photography, cinematic natural lighting, realistic contact shadows, subtle reflections on the glossy/matte case surface, photorealistic depth of field.
   - Variation: #${variationIndex}. Ensure unique natural pose and lighting nuance.

OUTPUT: A single photorealistic photograph.`;

    const response = await fetch('https://gen.pollinations.ai/v1/images/edits', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-image-2',
        prompt: systemInstructions,
        image: [{ image_url: designImageUrl }, { image_url: productMockupUrl }],
        size: '1536x1024',
        response_format: 'b64_json',
      }),
    });
    const result = (await response.json().catch(() => null)) as {
      data?: Array<{ b64_json?: string; media_type?: string; url?: string }>;
      error?: string | { message?: string };
    } | null;

    if (!response.ok) {
      const providerMessage =
        typeof result?.error === 'string' ? result.error : result?.error?.message;
      const errorMessage =
        response.status === 402
          ? 'Pollinations credits are exhausted. Check your available Quest Pollen balance.'
          : response.status === 429
            ? 'Pollinations rate limit reached. Please wait before trying again.'
            : response.status === 401
              ? 'Pollinations rejected the API key. Check POLLINATIONS_API_KEY in your local .env file.'
              : providerMessage || 'Pollinations image editing failed.';
      return res.status(response.status === 401 || response.status === 402 || response.status === 429 ? response.status : 502).json({
        error: errorMessage,
      });
    }

    const generatedImage = result?.data?.[0];
    if (!generatedImage?.b64_json) {
      return res.status(502).json({ error: 'Pollinations returned no generated image data.' });
    }

    const imageUrl = `data:${generatedImage.media_type || 'image/png'};base64,${generatedImage.b64_json}`;
    return res.json({ imageUrl });
  } catch (error: any) {
    console.error('Error generating lifestyle scene:', error);
    const msg = error?.message || 'Failed to generate lifestyle scene';
    let userMsg = msg;
    if (msg.includes('401') || msg.includes('UNAUTHENTICATED') || msg.includes('authentication credential')) {
      userMsg = 'Invalid authentication credentials. Please select or verify your API key in the AI Studio Secrets panel.';
    }
    return res.status(500).json({
      error: userMsg,
    });
  }
});

app.post('/api/generate-case-mockup', async (req, res) => {
  try {
    const { designDescription, designImageUrl, device = 'iphone-16-pro', caseType = 'slim' } = req.body;
    if (!designDescription && !designImageUrl) {
      return res.status(400).json({ error: 'Design description or image is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is missing. Set GEMINI_API_KEY in your local .env file and restart the server, or configure it in your deployment secrets.',
      });
    }

    const parts: any[] = [];

    // If design image provided, pass as inline image part for in-context rendering
    if (designImageUrl) {
      let base64Data = '';
      let mimeType = 'image/png';

      if (designImageUrl.startsWith('data:')) {
        const match = designImageUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          base64Data = match[2];
        }
      } else if (designImageUrl.startsWith('/')) {
        try {
          const fs = await import('fs');
          const localPath = path.join(__dirname, designImageUrl);
          if (fs.existsSync(localPath)) {
            const buf = fs.readFileSync(localPath);
            base64Data = buf.toString('base64');
            mimeType = designImageUrl.endsWith('.png') ? 'image/png' : 'image/jpeg';
          }
        } catch (e) {
          console.error('Error reading local artwork file:', e);
        }
      }

      if (base64Data) {
        parts.push({
          inlineData: {
            mimeType,
            data: base64Data,
          },
        });
      }
    }

    const isIphone = device.toLowerCase().includes('iphone');
    const deviceName = isIphone ? 'Apple iPhone 16 Pro' : 'Samsung Galaxy S25 Ultra';
    const cameraDesc = isIphone
      ? 'square rounded camera plateau with triple triangular lenses in top-left'
      : 'floating vertical column of circular camera lenses in top-left';

    const promptText = `A crisp, photorealistic commercial product photograph of a modern ${deviceName} phone case (${caseType} edition) standing centered upright against a seamless studio cyclorama backdrop.
The back surface of the phone case has the exact provided artwork seamlessly printed across it with crisp edge-to-edge full bleed wrap.
Accurately render the ${deviceName} physical geometry: ${cameraDesc}, precise case rounded corners, tactile side buttons, natural surface curvature, soft studio floor contact drop shadow, subtle specular gloss highlights along the perimeter bevel.
Clean e-commerce product catalog shot. No hands, no people, no lifestyle background clutter.`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts,
      },
      config: {
        imageConfig: {
          aspectRatio: '1:1',
        },
      },
    });

    let imageUrl: string | null = null;
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      return res.status(500).json({ error: 'Failed to generate case mockup' });
    }

    return res.json({ imageUrl });
  } catch (error: any) {
    console.error('Error generating case mockup:', error);
    const msg = error?.message || 'Failed to generate case mockup';
    let userMsg = msg;
    if (msg.includes('401') || msg.includes('UNAUTHENTICATED') || msg.includes('authentication credential')) {
      userMsg = 'Invalid authentication credentials. Please select or verify your API key in the AI Studio Secrets panel.';
    }
    return res.status(500).json({
      error: userMsg,
    });
  }
});

// API: AI Placeholder Value Suggestions
app.post('/api/suggest-values', async (req, res) => {
  try {
    const { placeholder, niche, currentPrompt } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({ suggestions: [] });
    }

    const prompt = `You are a master creative director for phone case graphic design.
Given the placeholder tag "${placeholder}" for niche "${niche}" within prompt context:
"${currentPrompt}"

Provide 6 creative, evocative, visually vivid options to fill this placeholder.
Return ONLY a JSON array of 6 short strings (e.g. ["option 1", "option 2", ...]).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let suggestions: string[] = [];
    try {
      suggestions = JSON.parse(response.text || '[]');
    } catch {
      suggestions = [];
    }

    return res.json({ suggestions });
  } catch (error: any) {
    console.error('Error suggesting values:', error);
    return res.status(500).json({ suggestions: [] });
  }
});

// Setup Vite or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();

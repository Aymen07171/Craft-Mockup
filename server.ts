import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import designStudioApi from './src/server/designStudioApi';
import {
  generateLifestyleMockup,
  LifestyleMockupError,
  LifestyleMockupRequest,
} from './src/server/lifestyleMockup';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));
app.use('/design-api', designStudioApi);

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
    const imageUrl = await generateLifestyleMockup(req.body as LifestyleMockupRequest);
    return res.json({ imageUrl });
  } catch (error) {
    if (error instanceof LifestyleMockupError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('Error generating lifestyle scene:', error);
    return res.status(500).json({
      error: 'Failed to generate lifestyle scene.',
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

import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
const router = express.Router();

// API: Generate design artwork with Gemini image generation
router.post('/generate-design', async (req, res) => {
  try {
    const { prompt, aspectRatio = '9:16', seed } = req.body;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.startsWith('your_')) {
      return res.status(503).json({
        error: 'Image generation is not configured. Add your Gemini API key as GEMINI_API_KEY in .env and restart the app.',
      });
    }

    const allowedRatios = ['9:16', '1:1', '3:4', '4:3', '16:9'] as const;
    const requestedRatio = String(aspectRatio);
    const ratio = (allowedRatios as readonly string[]).includes(requestedRatio)
      ? requestedRatio as (typeof allowedRatios)[number]
      : '9:16';
    const variation = Number.isFinite(Number(seed)) ? Number(seed) : Math.floor(Math.random() * 1_000_000_000);
    const dimensions: Record<(typeof allowedRatios)[number], { width: number; height: number }> = {
      '9:16': { width: 768, height: 1344 },
      '1:1': { width: 1024, height: 1024 },
      '3:4': { width: 768, height: 1024 },
      '4:3': { width: 1024, height: 768 },
      '16:9': { width: 1344, height: 768 },
    };
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: `Create original, polished phone-case artwork from this brief. Make the artwork edge-to-edge, visually clear, and free of text, logos, watermarks, mockup devices, or borders unless explicitly requested.\n\n${prompt.trim()}\n\nComposition variation: ${variation}.`,
      config: { imageConfig: { aspectRatio: ratio } },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find((part) => part.inlineData);
    if (!imagePart?.inlineData?.data) {
      throw new Error(response.text || 'Gemini did not return image data.');
    }
    const dataUrl = `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`;
    const { width, height } = dimensions[ratio];

    return res.json({
      imageUrl: dataUrl,
      seed: variation,
      width,
      height,
      aspectRatio: ratio,
    });
  } catch (error: any) {
    console.error('Error generating design with Gemini:', error);
    const status = Number(error?.status || error?.statusCode);
    const userError = status === 401 || status === 403
      ? 'Gemini rejected the API key. Check GEMINI_API_KEY in .env.'
      : status === 429
        ? 'Gemini API quota is unavailable. Check your Google AI quota or try again later.'
        : error?.message || 'Failed to generate artwork with Gemini.';
    return res.status(status === 429 ? 429 : 502).json({ error: userError });
  }
});

// Fallback curated suggestions per common placeholder tag
const FALLBACK_SUGGESTIONS: Record<string, string[]> = {
  SUBJECT_POSE: [
    'celestial kitsune blade dancer soaring through golden clouds',
    'armored cyber samurai preparing an unsheathing strike',
    'ancient forest guardian stag crowned with blooming wisteria',
    'moonlit valkyrie warrior brandishing a spear of pure starlight',
    'neon streetwear ronin standing on a rain-drenched neon overpass',
    'winged anime oracle clutching a glowing celestial astrolabe',
  ],
  BOTANICAL: [
    'cherry blossoms dancing across swirling iridescent wind trails',
    'delicate spider lilies with creeping thorny vines',
    'golden ginkgo leaves descending into a radiant pool of starlight',
    'bioluminescent neon moss entwined with weeping willow fronds',
    'art nouveau lotus blossoms with serpentine gilded stems',
    'cascading midnight jasmine and deep indigo bellflowers',
  ],
  COMPANION: [
    'spirit fox with nine swirling azure flame tails',
    'cybernetic scout falcon with glowing geometric wings',
    'ethereal jade koi gliding effortlessly through mid-air stardust',
    'golden scarab beetle with wings encrusted in luminous lapis',
    'shadow dragon whelp curling softly around a celestial orb',
    'crystallized origami crane with faint prism light trails',
  ],
  COLOR_PALETTE: [
    'deep sapphire indigo, molten gold, crimson scarlet, and ethereal cyan',
    'neon magenta, electric cyan, midnight charcoal, and acid yellow',
    'burnished antique gold, velvety sage green, and obsidian black',
    'pastel sunset peach, lavender dusk, warm cream, and iridescent opal',
    'deep emerald pine, champagne bronze, and rich burgundy wine',
    'monochrome graphite with radiant liquid gold accents',
  ],
  BORDER_THEME: [
    'ornate art nouveau brass filigree with constellation charts',
    'tactical holographic telemetry frame with neon corner brackets',
    'gothic cathedral pointed stained-glass arch with trefoil relief',
    'infinite synthwave perspective wireframe horizon with retro grids',
    'celestial zodiac wheel with gilded lunar phase cycles',
    'clean modern double-line gold leaf border with crosshair corners',
  ],
};

// API: Placeholder suggestions with Gemini and curated fallbacks
router.post('/suggest-values', async (req, res) => {
  try {
    const { placeholder, niche, currentPrompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && !apiKey.startsWith('your_')) {
      try {
        const promptContent = `You are a creative director for graphic illustration and print artwork.
For the placeholder tag "${placeholder}" in the niche "${niche}" (context: "${currentPrompt || ''}"):
Provide 6 vivid, creative, unique options to fill this placeholder.
Return ONLY a valid JSON array of 6 short strings, for example: ["option 1", "option 2", "option 3", "option 4", "option 5", "option 6"]. Do not include any other markdown or commentary.`;
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptContent,
          config: { responseMimeType: 'application/json', temperature: 0.8 },
        });
        const parsed = JSON.parse((response.text || '[]').replace(/```json\s*|```/gi, '').trim());
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleanSuggestions = parsed
            .map((item) => (typeof item === 'string' ? item : item.idea || item.title || JSON.stringify(item)))
            .filter(Boolean)
            .slice(0, 6);
          if (cleanSuggestions.length > 0) {
            return res.json({ suggestions: cleanSuggestions });
          }
        }
      } catch (err) {
        console.warn('Gemini suggestions failed; using curated fallback suggestions:', err);
      }
    }

    // Default curated fallback if API call fails
    const key = (placeholder || '').toUpperCase().trim();
    const suggestions = FALLBACK_SUGGESTIONS[key] || [
      `radiant ${placeholder} infused with celestial energy`,
      `intricate dynamic ${placeholder} with fine details`,
      `ethereal glowing ${placeholder} in motion`,
      `stylized minimalist ${placeholder} with bold lines`,
      `ornate vintage ${placeholder} with gilded accents`,
      `cybernetic high-tech ${placeholder} with neon pulses`,
    ];

    return res.json({ suggestions });
  } catch (error: any) {
    console.error('Error suggesting values:', error);
    return res.status(500).json({ suggestions: [] });
  }
});

router.post('/generate-etsy-listing', async (req, res) => {
  const { prompt, imageDataUrl, designTitle, niche } = req.body;
  if (typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'The original image-generation prompt is required.' });
  }
  if (
    typeof imageDataUrl !== 'string' ||
    !/^data:image\/(?:png|jpe?g|webp);base64,[A-Za-z0-9+/]+=*$/i.test(imageDataUrl)
  ) {
    return res.status(400).json({ error: 'A valid design image is required for visual analysis.' });
  }
  if (imageDataUrl.length > 20_000_000) {
    return res.status(413).json({ error: 'The design image is too large to analyze.' });
  }

  const apiKey = process.env.GEMINI_API_KEY || '';
  try {
    if (!apiKey || apiKey.startsWith('your_')) {
      return res.status(503).json({
        error: 'Listing generation is not configured. Add GEMINI_API_KEY to .env and restart the app.',
      });
    }

    const imageMatch = imageDataUrl.match(/^data:(image\/(?:png|jpe?g|webp));base64,(.+)$/i);
    if (!imageMatch) {
      return res.status(400).json({ error: 'The design image data could not be read.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            text: `You are an Etsy listing specialist. Analyze the attached artwork directly; the image is the source of truth and the generation prompt is secondary. Describe only motifs clearly visible in the image. Return a natural, specific phone-case title of at most 140 characters without subjective filler or keyword stuffing. Write a customer-ready description with a short introduction, visible design details, aesthetic, likely recipient/occasion, and cautious product/order information. Do not invent materials, protection, exact dimensions, compatibility, personalization, shipping, or production claims. Return only valid JSON with keys productTitle, productDescription, primaryKeywords, longTailKeywords, etsyTags, category, primaryColor, secondaryColor, designStyle, occasion, targetCustomer, searchIntent, and keywordRationale. Provide exactly 13 distinct, relevant Etsy tags using only letters, numbers, spaces, and hyphens; each must be at most 20 characters. Avoid repeated keywords and unrelated trends. Use arrays of concise strings for list fields. Ensure every claim matches the artwork and supplied context.\n\nCreate a complete Etsy listing for a phone case. Structure the description with a design-specific introduction, visible design and style, suitable recipient or gift occasion when supported, and brief ordering/product notes that avoid unverified claims. Do not claim exact phone compatibility, materials, protection, dimensions, or production details.\n\nDesign title: ${typeof designTitle === 'string' ? designTitle : ''}\nDesign category: ${typeof niche === 'string' ? niche : ''}\nOriginal image-generation prompt (secondary context):\n${prompt.trim()}`,
          },
          { inlineData: { mimeType: imageMatch[1], data: imageMatch[2] } },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productTitle: { type: Type.STRING },
            productDescription: { type: Type.STRING },
            primaryKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            longTailKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            etsyTags: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: '13', maxItems: '13' },
            category: { type: Type.STRING },
            primaryColor: { type: Type.STRING },
            secondaryColor: { type: Type.STRING },
            designStyle: { type: Type.ARRAY, items: { type: Type.STRING } },
            occasion: { type: Type.STRING },
            targetCustomer: { type: Type.ARRAY, items: { type: Type.STRING } },
            searchIntent: { type: Type.ARRAY, items: { type: Type.STRING } },
            keywordRationale: { type: Type.STRING },
          },
          required: [
            'productTitle', 'productDescription', 'primaryKeywords', 'longTailKeywords', 'etsyTags',
            'category', 'primaryColor', 'secondaryColor', 'designStyle', 'occasion',
            'targetCustomer', 'searchIntent', 'keywordRationale',
          ],
        },
        temperature: 0.4,
      },
    });

    const rawContent = response.text;
    if (typeof rawContent !== 'string' || !rawContent.trim()) {
      throw new Error('The AI returned an empty listing.');
    }

    const jsonContent = rawContent
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();
    const parsed = JSON.parse(jsonContent);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('The AI returned an invalid listing object.');
    }
    const parsedFields = Object.fromEntries(
      Object.entries(parsed).map(([key, value]) => [key.replace(/[^a-z0-9]/gi, '').toLowerCase(), value])
    );
    const getText = (key: string, fallback = '') => {
      const value = parsedFields[key.toLowerCase()];
      return typeof value === 'string' && value.trim() ? value.trim() : fallback;
    };
    const getOptionalText = (key: string) => {
      const value = parsedFields[key.toLowerCase()];
      return typeof value === 'string' ? value.trim() : '';
    };
    const getStringList = (key: string, limit: number, fallback: string[] = []) => {
      const value = parsedFields[key.toLowerCase()];
      if (!Array.isArray(value)) {
        if (fallback.length > 0) return fallback.slice(0, limit);
        return fallback;
      }
      const items = value
        .filter((item) => typeof item === 'string')
        .map((item) => item.trim())
        .filter((item) => item.length > 0 && (key !== 'etsyTags' || item.length <= 20))
        .slice(0, limit);
      return items.length > 0 ? items : fallback.slice(0, limit);
    };

    const titleSeed = [designTitle, niche, prompt].filter((part) => typeof part === 'string').join(' ');
    const titleWords = titleSeed.toLowerCase().replace(/[^a-z0-9 -]/gi, ' ').split(/\s+/).filter((word) => word.length > 2);
    const uniqueTitleWords = [...new Set(titleWords)];
    const basePhrase = uniqueTitleWords.slice(0, 4).join(' ') || 'art phone case';
    const primaryKeywords = getStringList('primaryKeywords', 12, [basePhrase, 'art phone case', 'illustrated phone case']);
    const longTailKeywords = getStringList('longTailKeywords', 15, [`${basePhrase} phone case`, `${basePhrase} art gift`]);
    const targetCustomer = getStringList('targetCustomer', 10, ['art and nature lovers', 'phone case collectors']);
    const designStyle = getStringList('designStyle', 10, ['illustrated', 'decorative']);
    const searchIntent = getStringList('searchIntent', 10, [
      `Shoppers searching for "${primaryKeywords[0]}" want a case featuring the visible artwork.`,
      `The long-tail phrase "${longTailKeywords[0]}" narrows the search to this design's specific subject and style.`,
    ]);
    const etsyTags: string[] = [];
    const addEtsyTag = (tag: string) => {
      const words = tag.replace(/[^a-z0-9 -]/gi, '').trim().toLowerCase().split(/\s+/).filter(Boolean);
      while (words.join(' ').length > 20) words.pop();
      const normalizedTag = words.join(' ');
      if (normalizedTag && !etsyTags.includes(normalizedTag)) {
        etsyTags.push(normalizedTag);
      }
    };
    [
      ...getStringList('etsyTags', 30), ...primaryKeywords, ...longTailKeywords,
      `${basePhrase} case`, `${basePhrase} art`, 'phone case gift', 'unique phone case',
      'art lover gift', 'illustrated case', 'colorful phone case', 'nature art gift',
      'decorative phone case', 'original artwork', 'gift for her', 'gift for him',
    ].forEach(addEtsyTag);
    uniqueTitleWords.forEach((word) => {
      addEtsyTag(`${word} phone case`);
      addEtsyTag(`${word} art gift`);
    });
    [
      'woodland phone case', 'fox lover gift', 'stained glass art', 'sunburst artwork',
      'nature lover gift', 'forest animal art', 'colorful case design', 'illustrated art',
      'decorative phone case', 'unique art gift', 'original phone case', 'wildlife artwork',
      'artistic phone case', 'gift for artists', 'creative phone case',
    ].forEach(addEtsyTag);

    const rationale = [parsedFields.keywordrationale, parsedFields.rationale, parsedFields.keywordstrategy]
      .find((value) => typeof value === 'string' && value.trim());
    const rawTitle = getText('productTitle', `${typeof designTitle === 'string' ? designTitle : 'Original Artwork'} Phone Case`);
    const productTitle = rawTitle.length <= 140
      ? rawTitle
      : rawTitle.slice(0, 140).replace(/\s+\S*$/, '').trim();
    const listing = {
      productTitle,
      productDescription: getText(
        'productDescription',
        `${typeof designTitle === 'string' ? designTitle : 'This original artwork'} brings a distinctive illustrated look to a phone case. The design features ${basePhrase}, with a decorative style suited to everyday use or gifting.`,
      ),
      primaryKeywords,
      longTailKeywords,
      etsyTags: etsyTags.slice(0, 13),
      category: getOptionalText('category'),
      primaryColor: getOptionalText('primaryColor'),
      secondaryColor: getOptionalText('secondaryColor'),
      occasion: getOptionalText('occasion'),
      targetCustomer,
      designStyle,
      searchIntent,
      keywordRationale:
        typeof rationale === 'string'
          ? rationale.trim()
          : `"${primaryKeywords[0]}" targets the core design and product search, while "${longTailKeywords[0]}" narrows it to shoppers seeking this specific subject or style.`,
    };

    return res.json({ listing });
  } catch (error) {
    console.error('Error generating Etsy listing:', error);
    const status = Number((error as { status?: number })?.status);
    if (status === 401 || status === 403) {
      return res.status(503).json({
        error: 'Gemini rejected the API key. Check GEMINI_API_KEY in .env and restart the app.',
      });
    }
    if (status === 429) {
      return res.status(503).json({
        error: 'Gemini API quota is temporarily unavailable. Check the key’s quota or try again later.',
      });
    }
    const detail = error instanceof Error ? error.message : String(error);
    const safeDetail = apiKey ? detail.replaceAll(apiKey, '[redacted API key]') : detail;
    return res.status(502).json({
      error: `Gemini listing generation failed: ${safeDetail}`,
    });
  }
});

export default router;

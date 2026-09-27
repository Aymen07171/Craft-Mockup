import express from 'express';
const router = express.Router();

// Pollinations API Key from environment or user-provided configuration
const getPollinationsKey = (): string => {
  return process.env.POLLINATIONS_API_KEY || 'sk_7hxiVgx2Ngtoc3coIgOT3NPPKNzHkc3j';
};

// API: Generate Design Artwork using Pollinations API
router.post('/generate-design', async (req, res) => {
  try {
    const { prompt, aspectRatio = '9:16', seed, model = 'flux' } = req.body;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Determine dimensions based on aspect ratio
    let width = 768;
    let height = 1344; // 9:16 vertical canvas
    if (aspectRatio === '1:1') {
      width = 1024;
      height = 1024;
    } else if (aspectRatio === '3:4') {
      width = 768;
      height = 1024;
    } else if (aspectRatio === '4:3') {
      width = 1024;
      height = 768;
    } else if (aspectRatio === '16:9') {
      width = 1344;
      height = 768;
    } else if (aspectRatio === '9:16') {
      width = 768;
      height = 1344;
    }

    const randomSeed =
      seed !== undefined && seed !== null && !isNaN(Number(seed))
        ? Number(seed)
        : Math.floor(Math.random() * 1000000000);

    const cleanPrompt = prompt.trim();
    const encodedPrompt = encodeURIComponent(cleanPrompt);
    const apiKey = getPollinationsKey();

    // Build Pollinations API image URL with API key
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${randomSeed}&nologo=true&model=${encodeURIComponent(model)}&key=${encodeURIComponent(apiKey)}`;

    console.log(`[Pollinations API] Generating image: model=${model}, width=${width}, height=${height}, seed=${randomSeed}`);

    // Fetch the image from Pollinations API with Bearer token authentication
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(pollinationsUrl, {
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'User-Agent': 'Mozilla/5.0 (compatible; CaseCraftStudio/1.0)',
        Accept: 'image/jpeg,image/png,image/*;q=0.9',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Pollinations API returned status ${response.status}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:${contentType};base64,${base64}`;

    return res.json({
      imageUrl: dataUrl,
      sourceUrl: pollinationsUrl,
      seed: randomSeed,
      width,
      height,
      aspectRatio,
      model,
    });
  } catch (error: any) {
    console.error('Error generating design via Pollinations API:', error);
    const msg = error?.message || 'Failed to generate design with Pollinations API';
    return res.status(500).json({
      error: msg,
      details: error?.toString(),
    });
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

// API: Placeholder Value Suggestions using Pollinations Text/Chat API
router.post('/suggest-values', async (req, res) => {
  try {
    const { placeholder, niche, currentPrompt } = req.body;
    const apiKey = getPollinationsKey();

    if (apiKey) {
      try {
        const promptContent = `You are a creative director for graphic illustration and print artwork.
For the placeholder tag "${placeholder}" in the niche "${niche}" (context: "${currentPrompt || ''}"):
Provide 6 vivid, creative, unique options to fill this placeholder.
Return ONLY a valid JSON array of 6 short strings, for example: ["option 1", "option 2", "option 3", "option 4", "option 5", "option 6"]. Do not include any other markdown or commentary.`;

        const chatResponse = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'openai',
            messages: [{ role: 'user', content: promptContent }],
            temperature: 0.8,
          }),
        });

        if (chatResponse.ok) {
          const chatData = await chatResponse.json();
          let rawContent = chatData.choices?.[0]?.message?.content || '';

          // Strip markdown code fences if present
          rawContent = rawContent.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();

          const parsed = JSON.parse(rawContent);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const cleanSuggestions = parsed
              .map((item) => (typeof item === 'string' ? item : item.idea || item.title || JSON.stringify(item)))
              .filter(Boolean);
            if (cleanSuggestions.length > 0) {
              return res.json({ suggestions: cleanSuggestions });
            }
          }
        }
      } catch (err) {
        console.warn('[Pollinations API] Chat suggestions fallback triggered:', err);
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

  try {
    const apiKey = getPollinationsKey();
    const chatResponse = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'openai',
        temperature: 0.4,
        messages: [
          {
            role: 'system',
            content:
              'You are an Etsy listing specialist. Analyze the attached artwork directly; the image is the source of truth and the generation prompt is secondary. Describe only motifs clearly visible in the image. Return a natural, specific phone-case title of at most 140 characters without subjective filler or keyword stuffing. Write a customer-ready description with a short introduction, visible design details, aesthetic, likely recipient/occasion, and cautious product/order information. Do not invent materials, protection, exact dimensions, compatibility, personalization, shipping, or production claims. Return only valid JSON with keys productTitle, productDescription, primaryKeywords, longTailKeywords, etsyTags, category, primaryColor, secondaryColor, designStyle, occasion, targetCustomer, searchIntent, and keywordRationale. Provide exactly 13 distinct, relevant Etsy tags using only letters, numbers, spaces, and hyphens; each must be at most 20 characters. Avoid repeated keywords and unrelated trends. Use arrays of concise strings for list fields. Ensure every claim matches the artwork and supplied context.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Create a complete Etsy listing for a phone case. Structure the description with a design-specific introduction, visible design and style, suitable recipient or gift occasion when supported, and brief ordering/product notes that avoid unverified claims. Do not claim exact phone compatibility, materials, protection, dimensions, or production details.\n\nDesign title: ${typeof designTitle === 'string' ? designTitle : ''}\nDesign category: ${typeof niche === 'string' ? niche : ''}\nOriginal image-generation prompt (secondary context):\n${prompt.trim()}`,
              },
              {
                type: 'image_url',
                image_url: { url: imageDataUrl },
              },
            ],
          },
        ],
      }),
    });

    if (!chatResponse.ok) {
      console.error(`[Pollinations API] Etsy listing generation failed: ${chatResponse.status}`);
      return res.status(502).json({ error: 'The AI listing service could not analyze this design. Please try again.' });
    }

    const chatData = await chatResponse.json();
    const messageContent = chatData.choices?.[0]?.message?.content;
    const rawContent = Array.isArray(messageContent)
      ? messageContent.map((part) => part.text || '').join('\n')
      : messageContent;
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
    const getRequiredText = (key: string) => {
      const value = parsedFields[key.toLowerCase()];
      if (typeof value !== 'string' || !value.trim()) {
        throw new Error(`The AI listing is missing ${key}.`);
      }
      return value.trim();
    };
    const getOptionalText = (key: string) => {
      const value = parsedFields[key.toLowerCase()];
      return typeof value === 'string' ? value.trim() : '';
    };
    const getStringList = (key: string, limit: number, fallback: string[] = []) => {
      const value = parsedFields[key.toLowerCase()];
      if (!Array.isArray(value)) {
        if (fallback.length > 0) return fallback.slice(0, limit);
        throw new Error(`The AI listing is missing ${key}.`);
      }
      const items = value
        .filter((item) => typeof item === 'string')
        .map((item) => item.trim())
        .filter((item) => item.length > 0 && (key !== 'etsyTags' || item.length <= 20))
        .slice(0, limit);
      if (items.length === 0) {
        if (fallback.length > 0) return fallback.slice(0, limit);
        throw new Error(`The AI listing has no usable ${key}.`);
      }
      return items;
    };

    const primaryKeywords = getStringList('primaryKeywords', 12);
    const longTailKeywords = getStringList('longTailKeywords', 15);
    const targetCustomer = getStringList('targetCustomer', 10);
    const designStyle = getStringList('designStyle', 10);
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
    [...getStringList('etsyTags', 30), ...primaryKeywords, ...longTailKeywords].forEach(addEtsyTag);
    if (etsyTags.length < 13) {
      throw new Error('The AI listing did not produce 13 distinct valid Etsy tags. Please regenerate it.');
    }

    const rationale = [parsedFields.keywordrationale, parsedFields.rationale, parsedFields.keywordstrategy]
      .find((value) => typeof value === 'string' && value.trim());
    const rawTitle = getRequiredText('productTitle');
    const productTitle = rawTitle.length <= 140
      ? rawTitle
      : rawTitle.slice(0, 140).replace(/\s+\S*$/, '').trim();
    const listing = {
      productTitle,
      productDescription: getRequiredText('productDescription'),
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
    return res.status(502).json({
      error: 'The AI could not produce a valid listing for this design. Please try again.',
    });
  }
});

export default router;

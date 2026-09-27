import {
  generateLifestyleMockup,
  LifestyleMockupError,
  LifestyleMockupRequest,
} from '../../src/server/lifestyleMockup';

export default async (request: Request) => {
  if (request.method !== 'POST') {
    return Response.json(
      { error: 'Method not allowed.' },
      { status: 405, headers: { Allow: 'POST' } }
    );
  }

  let input: LifestyleMockupRequest;
  try {
    input = (await request.json()) as LifestyleMockupRequest;
  } catch {
    return Response.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  try {
    const imageUrl = await generateLifestyleMockup(input);
    return Response.json({ imageUrl });
  } catch (error) {
    if (error instanceof LifestyleMockupError) {
      return Response.json({ error: error.message }, { status: error.statusCode });
    }
    return Response.json({ error: 'Failed to generate lifestyle scene.' }, { status: 500 });
  }
};

export const config = {
  path: '/api/generate-lifestyle-scene',
  method: 'POST',
};
import express from 'express';
import serverless from 'serverless-http';
import designStudioApi from '../../src/server/designStudioApi';

const app = express();
app.use(express.json({ limit: '25mb' }));
app.use('/design-api', designStudioApi);

const expressHandler = serverless(app);

export default async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const body = await request.arrayBuffer();
  const now = new Date();
  const event = {
    version: '2.0',
    routeKey: `${request.method} ${url.pathname}`,
    rawPath: url.pathname,
    rawQueryString: url.search.slice(1),
    headers: Object.fromEntries(request.headers.entries()),
    queryStringParameters: Object.fromEntries(url.searchParams.entries()),
    body: Buffer.from(body).toString('base64'),
    isBase64Encoded: true,
    requestContext: {
      accountId: 'netlify',
      apiId: 'netlify',
      domainName: url.host,
      domainPrefix: 'netlify',
      http: {
        method: request.method,
        path: url.pathname,
        protocol: 'HTTP/1.1',
        sourceIp: '127.0.0.1',
        userAgent: request.headers.get('user-agent') || '',
      },
      requestId: crypto.randomUUID(),
      routeKey: `${request.method} ${url.pathname}`,
      stage: '$default',
      time: now.toISOString(),
      timeEpoch: now.getTime(),
    },
  };
  const result = await expressHandler(event as never, {} as never) as {
    statusCode: number;
    headers?: Record<string, string>;
    multiValueHeaders?: Record<string, string[]>;
    body?: string;
    isBase64Encoded?: boolean;
  };
  const headers = new Headers(result.headers);
  Object.entries(result.multiValueHeaders || {}).forEach(([name, values]) => {
    headers.delete(name);
    values.forEach((value) => headers.append(name, value));
  });
  const responseBody = result.isBase64Encoded
    ? Buffer.from(result.body || '', 'base64')
    : result.body || null;
  return new Response(responseBody, { status: result.statusCode, headers });
};

export const config = {
  path: '/design-api/*',
  method: 'POST',
};
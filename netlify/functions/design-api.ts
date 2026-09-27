import express from 'express';
import serverless from 'serverless-http';
import designStudioApi from '../../src/server/designStudioApi';

const app = express();
app.use(express.json({ limit: '25mb' }));
app.use('/design-api', designStudioApi);

export const handler = serverless(app);

export const config = {
  path: '/design-api/*',
  method: 'POST',
};
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ffab6dc2-a9ce-46c8-98cd-6bb2ed928736

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and fill in the API keys and Google OAuth client ID. See [Google Drive and Sheets setup](GOOGLE_SHEETS_SETUP.md).
3. Start the local development server with `npm run dev` and open `http://localhost:3000`.

For a production build, run `npm run build` and then `npm start`. The build creates the browser assets and bundles the TypeScript server for Node.js.

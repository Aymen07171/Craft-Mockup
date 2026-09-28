# Google Drive and Sheets Setup

Drive and Sheets access uses Google's browser OAuth flow. The app does not ask for or store a Google client secret.

1. Create or select a project in Google Cloud Console.
2. Enable the Google Drive API and Google Sheets API for that project.
3. Configure the OAuth consent screen and add test users if the app is still in testing.
4. Create an OAuth client ID with application type **Web application**. Under **Authorized JavaScript origins**, add `http://localhost` and `http://localhost:3000` for local development, plus any other exact origin you use (for example `http://127.0.0.1:3000`). Add your deployed HTTPS origin separately. Do not put these in **Authorized redirect URIs**; the app uses the popup token flow. If Google says `no registered origin`, the page's exact scheme, host, and port is missing from this list.
5. Copy `.env.example` to `.env` in the project folder, then set the client ID and your own API keys:

   ```env
   GEMINI_API_KEY="your-Gemini-API-key"
   VITE_GOOGLE_CLIENT_ID="your-web-client-id.apps.googleusercontent.com"
   ```

   The client ID is public configuration, not a private credential. Do not add a client secret to browser environment variables. Gemini powers artwork, listing, suggestions, case mockups, and lifestyle image generation.
6. Install dependencies and start the app from this folder:

   ```powershell
   npm install
   npm run dev
   ```

7. Open `http://localhost:3000`, connect your Google account, and select a Drive, spreadsheet, and worksheet. If Google reports `origin_mismatch`, add the exact origin shown in the browser address bar to the OAuth client. If it reports `access_denied`, check the OAuth consent screen and add your Google account as a test user while the app is in testing.

The first row of an empty worksheet is populated with the Make.com column schema. A worksheet with a different header row is rejected rather than overwritten. The worksheet is expanded to 41 columns when needed.

OAuth access tokens are kept in memory and must be renewed after a page reload. When local images or mockup files need hosting, the panel asks permission before uploading them to Drive and creating anyone-with-the-link view URLs for Make.com. Existing public image URLs are not re-shared.

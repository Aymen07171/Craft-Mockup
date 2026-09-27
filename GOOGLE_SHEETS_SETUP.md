# Google Sheets Setup

The Etsy listing panel uses Google's browser OAuth flow. It does not ask for or store a Google client secret.

1. Create or select a project in Google Cloud Console.
2. Enable the Google Drive API and Google Sheets API for that project.
3. Configure the OAuth consent screen and add test users if the app is still in testing.
4. Create an OAuth client ID with application type **Web application**. Add the exact app origins under **Authorized JavaScript origins**, such as `http://localhost:3000`, `http://localhost:3101`, and the deployed app origin. A redirect URI is not used by the popup token flow.
5. Set the client ID in the server project's `.env` file:

   ```env
   VITE_GOOGLE_CLIENT_ID="your-web-client-id.apps.googleusercontent.com"
   ```

   The client ID is public configuration, not a private credential. Do not add a client secret to browser environment variables.
6. Restart the application, generate or select a design, then connect Google Sheets and select a Drive, spreadsheet, and worksheet.

The first row of an empty worksheet is populated with the Make.com column schema. A worksheet with a different header row is rejected rather than overwritten. The worksheet is expanded to 41 columns when needed.

OAuth access tokens are kept in memory and must be renewed after a page reload. When local images or mockup files need hosting, the panel asks permission before uploading them to Drive and creating anyone-with-the-link view URLs for Make.com. Existing public image URLs are not re-shared.
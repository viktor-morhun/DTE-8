# Google Sheets Integration Setup

## 1. Install Dependencies

```bash
npm install google-spreadsheet google-auth-library
```

## 2. Create Google Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sheets API:
   - Go to APIs & Services > Library
   - Search for "Google Sheets API"
   - Click Enable

4. Create Service Account:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "Service Account"
   - Fill in the details and create
   - Click on the created service account
   - Go to "Keys" tab > "Add Key" > "Create new key" > JSON
   - Download the JSON file

## 3. Setup Google Sheet

1. Create a new Google Sheet
2. Copy the Sheet ID from URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
3. Share the sheet with your service account email (from the JSON file)
4. Give "Editor" permissions

## 4. Environment Variables

Add to your `.env.local`:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project-name.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your_google_sheet_id_here
```

## 5. Vercel Deployment

Add the same environment variables to your Vercel project:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add each variable

**Important**: For the private key in Vercel, make sure to:
- Wrap it in quotes
- Keep the `\n` characters as literal `\n` (not actual newlines)

## 6. Test the Integration

The API will:
- Try to save to Google Sheets if credentials are available
- Fall back to console logging if Google Sheets fails
- Always return success to avoid breaking the user experience

## 7. Production Monitoring

Check your Vercel function logs to see:
- Successful Google Sheets saves
- Any authentication errors
- Fallback logging when needed
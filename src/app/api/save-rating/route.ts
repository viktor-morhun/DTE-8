import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export async function POST(request: NextRequest) {
  console.log('API Route called - save-rating');
  
  try {
    console.log('Parsing request body...');
    const data = await request.json();
    console.log('Request data parsed:', data);
    
    // Validate required fields
    if (!data.helpfulRating || !data.engagingRating) {
      console.log('Validation failed - missing required fields');
      return NextResponse.json(
        { error: 'Missing required rating fields' },
        { status: 400 }
      );
    }

    console.log('Validation passed');

    // Prepare rating data
    const ratingData = {
      timestamp: new Date().toISOString(),
      helpfulRating: data.helpfulRating,
      engagingRating: data.engagingRating,
      lengthFeedback: data.lengthFeedback || '',
      daysPerWeek: data.daysPerWeek !== null ? data.daysPerWeek : '',
      additionalFeedback: data.additionalFeedback || '',
      userName: data.userName || ''
    };

    console.log('Rating data prepared:', ratingData);

    // Check if Google Sheets credentials are available
    const googleServiceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const googlePrivateKey = process.env.GOOGLE_PRIVATE_KEY;
    const googleSheetId = process.env.GOOGLE_SHEET_ID;

    if (!googleServiceEmail || !googlePrivateKey || !googleSheetId) {
      console.log('Google Sheets credentials not found, logging data only');
      console.log('Missing credentials:', {
        email: !!googleServiceEmail,
        key: !!googlePrivateKey,
        sheetId: !!googleSheetId
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Rating saved successfully (logged to console - Google Sheets not configured)',
        data: ratingData
      });
    }

    try {
      console.log('Initializing Google Sheets connection...');
      
      // Initialize Google Sheets authentication
      const serviceAccountAuth = new JWT({
        email: googleServiceEmail,
        key: googlePrivateKey.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      // Initialize Google Spreadsheet
      const doc = new GoogleSpreadsheet(googleSheetId, serviceAccountAuth);
      console.log('Loading document info...');
      await doc.loadInfo();
      console.log('Document loaded:', doc.title);

      // Get or create the ratings sheet
      let sheet = doc.sheetsByTitle['DTE-8'];
      
      if (!sheet) {
        console.log('Creating new DTE-8 sheet...');
        sheet = await doc.addSheet({
          title: 'DTE-8',
          headerValues: [
            'Timestamp',
            'Helpful Rating',
            'Engaging Rating', 
            'Length Feedback',
            'Days Per Week',
            'Additional Feedback',
            'User Name'
          ]
        });
        console.log('New sheet created');
      } else {
        console.log('Using existing DTE-8 sheet');
        // Load headers to ensure they exist
        await sheet.loadHeaderRow();
      }

      // Prepare row data for Google Sheets
      const rowData = {
        'Timestamp': ratingData.timestamp,
        'Helpful Rating': ratingData.helpfulRating.toString(),
        'Engaging Rating': ratingData.engagingRating.toString(),
        'Length Feedback': ratingData.lengthFeedback,
        'Days Per Week': ratingData.daysPerWeek.toString(),
        'Additional Feedback': ratingData.additionalFeedback,
        'User Name': ratingData.userName
      };

      console.log('Adding row to sheet...');
      await sheet.addRow(rowData);
      console.log('Row added successfully');

      return NextResponse.json({ 
        success: true, 
        message: 'Rating saved successfully to Google Sheets',
        sheetTitle: doc.title,
        data: ratingData
      });

    } catch (googleError) {
      console.error('Google Sheets error:', googleError);
      
      // Fall back to logging if Google Sheets fails
      console.log('Falling back to console logging due to Google Sheets error');
      console.log('Rating data (fallback):', ratingData);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Rating saved successfully (logged to console - Google Sheets error)',
        error: googleError instanceof Error ? googleError.message : 'Unknown Google Sheets error',
        data: ratingData
      });
    }

  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save rating data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
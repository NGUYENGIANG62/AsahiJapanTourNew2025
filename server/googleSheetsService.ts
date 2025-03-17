import { google, sheets_v4 } from 'googleapis';

// Google Sheets configuration
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_NAME = 'AsahiJapanTours';

// This will store our cached spreadsheet ID
let spreadsheetId: string | null = null;

/**
 * Authorize with Google using OAuth2
 */
async function authorize() {
  try {
    // Kiểm tra và ghi log tất cả các biến môi trường liên quan đến Google Sheets
    console.log('ENV variables check:');
    console.log('GOOGLE_SPREADSHEET_URL:', process.env.GOOGLE_SPREADSHEET_URL);
    console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
    console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✓ exists' : 'missing');
    console.log('GOOGLE_REFRESH_TOKEN:', process.env.GOOGLE_REFRESH_TOKEN ? '✓ exists' : 'missing');
    
    // Lấy đường dẫn trực tiếp tới Google Sheets từ biến môi trường hoặc sử dụng mặc định
    const defaultSpreadsheetUrl = "https://docs.google.com/spreadsheets/d/1DQ1e6k4I65O5NxmX8loJ_SKUI7aoIj3WCu5BMLUCznw/edit?usp=drive_link";
    const spreadsheetUrl = process.env.GOOGLE_SPREADSHEET_URL || defaultSpreadsheetUrl;
    
    console.log('Using spreadsheet URL:', spreadsheetUrl);
    
    // Trích xuất ID từ URL
    const urlMatch = spreadsheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (urlMatch && urlMatch[1]) {
      spreadsheetId = urlMatch[1];
      console.log('Using spreadsheet ID:', spreadsheetId);
    } else {
      console.warn('Could not extract spreadsheet ID from URL. Will attempt to find by name.');
    }
    
    // Get credentials from environment variables
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    
    // Kiểm tra xem có đầy đủ thông tin đăng nhập không
    if (!clientId || !clientSecret || !refreshToken) {
      console.error('Missing required OAuth2.0 credentials:');
      if (!clientId) console.error('- GOOGLE_CLIENT_ID is missing');
      if (!clientSecret) console.error('- GOOGLE_CLIENT_SECRET is missing');
      if (!refreshToken) console.error('- GOOGLE_REFRESH_TOKEN is missing');
      
      throw new Error('Missing required Google OAuth credentials');
    }
    
    console.log('Setting up OAuth2 client with provided credentials');
    
    // Khởi tạo OAuth2 client
    const oAuth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'https://developers.google.com/oauthplayground' // Redirect URI không quan trọng khi sử dụng refresh token
    );
    
    // Thiết lập thông tin xác thực sử dụng refresh token
    oAuth2Client.setCredentials({
      refresh_token: refreshToken
    });
    
    // Mở rộng thời gian hết hạn của token
    oAuth2Client.on('tokens', (tokens) => {
      if (tokens.refresh_token) {
        console.log('New refresh token received, consider updating your .env file');
      }
    });
    
    // Tạo đối tượng API sheets sử dụng thông tin xác thực đã được thiết lập
    return google.sheets({ 
      version: 'v4', 
      auth: oAuth2Client 
    });
  } catch (error) {
    console.error('Authorization error:', error);
    throw error;
  }
}

/**
 * Find the spreadsheet ID based on name
 */
async function findSpreadsheetId(sheetsApi: sheets_v4.Sheets): Promise<string> {
  // If we already have the ID cached, return it
  if (spreadsheetId) {
    return spreadsheetId;
  }

  try {
    // List user's files to find the spreadsheet
    const drive = google.drive({ version: 'v3', auth: sheetsApi.context._options.auth });
    const response = await drive.files.list({
      q: `name='${SPREADSHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet'`,
      fields: 'files(id, name)',
    });

    const files = response.data.files;
    if (!files || files.length === 0) {
      throw new Error(`Spreadsheet "${SPREADSHEET_NAME}" not found.`);
    }

    // Cache and return the ID
    spreadsheetId = files[0].id || '';
    return spreadsheetId;
  } catch (error) {
    console.error('Error finding spreadsheet:', error);
    throw error;
  }
}

/**
 * Create a new spreadsheet if it doesn't exist
 */
async function createSpreadsheet(sheetsApi: sheets_v4.Sheets): Promise<string> {
  try {
    // Create a new spreadsheet
    const response = await sheetsApi.spreadsheets.create({
      requestBody: {
        properties: {
          title: SPREADSHEET_NAME,
        },
        sheets: [
          { properties: { title: 'Tours' } },
          { properties: { title: 'Vehicles' } },
          { properties: { title: 'Hotels' } },
          { properties: { title: 'Guides' } },
          { properties: { title: 'Seasons' } },
        ],
      },
    });

    if (!response.data.spreadsheetId) {
      throw new Error('Failed to create spreadsheet');
    }

    // Initialize the spreadsheet with headers
    await initializeSheets(sheetsApi, response.data.spreadsheetId);

    // Cache and return the ID
    spreadsheetId = response.data.spreadsheetId;
    return spreadsheetId;
  } catch (error) {
    console.error('Error creating spreadsheet:', error);
    throw error;
  }
}

/**
 * Initialize sheets with headers
 */
async function initializeSheets(sheetsApi: sheets_v4.Sheets, sheetId: string) {
  const updates = [
    {
      range: 'Tours!A1:J1',
      values: [['id', 'name', 'code', 'location', 'description', 'durationDays', 'basePrice', 'imageUrl', 'nameJa', 'nameZh']],
    },
    {
      range: 'Vehicles!A1:E1',
      values: [['id', 'name', 'seats', 'luggageCapacity', 'pricePerDay', 'driverCostPerDay']],
    },
    {
      range: 'Hotels!A1:I1',
      values: [['id', 'name', 'location', 'stars', 'singleRoomPrice', 'doubleRoomPrice', 'tripleRoomPrice', 'breakfastPrice', 'imageUrl']],
    },
    {
      range: 'Guides!A1:D1',
      values: [['id', 'name', 'languages', 'pricePerDay']],
    },
    {
      range: 'Seasons!A1:E1',
      values: [['id', 'name', 'startMonth', 'endMonth', 'description', 'priceMultiplier', 'nameJa', 'nameZh']],
    },
  ];

  for (const update of updates) {
    await sheetsApi.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: update.range,
      valueInputOption: 'RAW',
      requestBody: {
        values: update.values,
      },
    });
  }
}

/**
 * Get the spreadsheet
 */
export async function getSpreadsheet(): Promise<{ sheetsApi: sheets_v4.Sheets, spreadsheetId: string }> {
  try {
    const sheetsApi = await authorize();
    
    // If spreadsheetId is already set from the direct URL, use it
    if (spreadsheetId) {
      return { sheetsApi, spreadsheetId };
    }
    
    try {
      // Try to find existing spreadsheet by name
      const id = await findSpreadsheetId(sheetsApi);
      return { sheetsApi, spreadsheetId: id };
    } catch (error) {
      // If not found, create a new one
      console.log('Spreadsheet not found, creating new one...');
      const id = await createSpreadsheet(sheetsApi);
      return { sheetsApi, spreadsheetId: id };
    }
  } catch (error) {
    console.error('Failed to get spreadsheet:', error);
    throw error;
  }
}

/**
 * Get all data from a sheet
 */
export async function getSheetData(sheetName: string): Promise<any[]> {
  try {
    const { sheetsApi, spreadsheetId } = await getSpreadsheet();
    
    const response = await sheetsApi.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:Z1000`,
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) {
      // Only header row exists, return empty array
      return [];
    }

    // Extract header row
    const headers = rows[0];
    
    // Convert the data to objects
    return rows.slice(1).map(row => {
      const item: Record<string, any> = {};
      headers.forEach((header, index) => {
        item[header] = row[index];
      });
      return item;
    });
  } catch (error) {
    console.error(`Error getting ${sheetName} data:`, error);
    throw error;
  }
}

/**
 * Update or add an item to a sheet
 */
export async function updateSheetItem(sheetName: string, item: any): Promise<void> {
  try {
    const { sheetsApi, spreadsheetId } = await getSpreadsheet();
    
    // First, get all the data to find the row index
    const response = await sheetsApi.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:Z1000`,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      throw new Error(`Sheet ${sheetName} has no header row`);
    }

    // Extract header row
    const headers = rows[0];
    
    // Create a row of values in the correct order
    const values = headers.map(header => item[header] || '');
    
    // Find if this item already exists (by ID)
    const rowIndex = rows.findIndex((row, index) => index > 0 && row[0] === item.id.toString());
    
    if (rowIndex > 0) {
      // Update existing row
      await sheetsApi.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A${rowIndex + 1}:${String.fromCharCode(65 + headers.length - 1)}${rowIndex + 1}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [values],
        },
      });
    } else {
      // Append new row
      await sheetsApi.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A1:Z1`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [values],
        },
      });
    }
  } catch (error) {
    console.error(`Error updating ${sheetName} item:`, error);
    throw error;
  }
}

/**
 * Delete an item from a sheet
 */
export async function deleteSheetItem(sheetName: string, id: number): Promise<void> {
  try {
    const { sheetsApi, spreadsheetId } = await getSpreadsheet();
    
    // First, get all the data to find the row index
    const response = await sheetsApi.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:Z1000`,
    });

    const rows = response.data.values || [];
    
    // Find the row with the matching ID
    const rowIndex = rows.findIndex((row, index) => index > 0 && row[0] === id.toString());
    
    if (rowIndex > 0) {
      // Get the sheet ID
      const sheetsResponse = await sheetsApi.spreadsheets.get({
        spreadsheetId,
        ranges: [sheetName],
      });
      
      const sheet = sheetsResponse.data.sheets?.find(s => 
        s.properties?.title === sheetName
      );
      
      if (!sheet || !sheet.properties?.sheetId) {
        throw new Error(`Sheet ${sheetName} not found`);
      }
      
      // Delete the row
      await sheetsApi.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: sheet.properties.sheetId,
                  dimension: 'ROWS',
                  startIndex: rowIndex,
                  endIndex: rowIndex + 1,
                },
              },
            },
          ],
        },
      });
    } else {
      throw new Error(`Item with ID ${id} not found in ${sheetName}`);
    }
  } catch (error) {
    console.error(`Error deleting ${sheetName} item:`, error);
    throw error;
  }
}

/**
 * Sync data from Google Sheets to local storage
 */
export async function syncDataFromSheets(storage: any) {
  try {
    // Sync Tours
    const tours = await getSheetData('Tours');
    for (const tour of tours) {
      await storage.createOrUpdateTour(tour);
    }
    
    // Sync Vehicles
    const vehicles = await getSheetData('Vehicles');
    for (const vehicle of vehicles) {
      await storage.createOrUpdateVehicle(vehicle);
    }
    
    // Sync Hotels
    const hotels = await getSheetData('Hotels');
    for (const hotel of hotels) {
      await storage.createOrUpdateHotel(hotel);
    }
    
    // Sync Guides
    const guides = await getSheetData('Guides');
    for (const guide of guides) {
      await storage.createOrUpdateGuide(guide);
    }
    
    // Sync Seasons
    const seasons = await getSheetData('Seasons');
    for (const season of seasons) {
      await storage.createOrUpdateSeason(season);
    }
    
    console.log('Data sync from Google Sheets completed successfully');
    return true;
  } catch (error) {
    console.error('Error syncing data from sheets:', error);
    throw error;
  }
}

/**
 * Sync data from local storage to Google Sheets
 */
export async function syncDataToSheets(storage: any) {
  try {
    // Sync Tours
    const tours = await storage.getAllTours();
    for (const tour of tours) {
      await updateSheetItem('Tours', tour);
    }
    
    // Sync Vehicles
    const vehicles = await storage.getAllVehicles();
    for (const vehicle of vehicles) {
      await updateSheetItem('Vehicles', vehicle);
    }
    
    // Sync Hotels
    const hotels = await storage.getAllHotels();
    for (const hotel of hotels) {
      await updateSheetItem('Hotels', hotel);
    }
    
    // Sync Guides
    const guides = await storage.getAllGuides();
    for (const guide of guides) {
      await updateSheetItem('Guides', guide);
    }
    
    // Sync Seasons
    const seasons = await storage.getAllSeasons();
    for (const season of seasons) {
      await updateSheetItem('Seasons', season);
    }
    
    console.log('Data sync to Google Sheets completed successfully');
    return true;
  } catch (error) {
    console.error('Error syncing data to sheets:', error);
    throw error;
  }
}
import { google, sheets_v4 } from 'googleapis';
import { JWT } from 'google-auth-library';
import { User, SYNC_SETTINGS } from '@shared/schema';

/**
 * Hàm tiện ích để lấy tên sheet an toàn khi truy vấn Google Sheets API
 * Tránh lỗi "Unable to parse range" bằng cách chỉ sử dụng tên sheet
 */
function getSafeSheetName(sheetName: string): string {
  // Trả về chỉ tên sheet, không thêm phạm vi A:Z
  return sheetName;
}

// Google Sheets configuration
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive'
];
const SPREADSHEET_NAME = 'AsahiJapanTours';

interface SpreadsheetInfo {
  id: string;
  auth: JWT | null;
  sheetsApi: sheets_v4.Sheets | null;
}

let spreadsheetInfo: SpreadsheetInfo = {
  id: '',
  auth: null,
  sheetsApi: null
};

/**
 * Lấy spreadsheet ID từ URL hoặc môi trường
 */
function getSpreadsheetIdFromUrl(url: string): string | null {
  try {
    const regex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting spreadsheet ID from URL:', error);
    return null;
  }
}

/**
 * Authorize with Google using Service Account or API Key
 * Service Account allows both read and write access
 * API Key allows only read access
 * 
 * @param customSpreadsheetUrl URL tùy chỉnh cho các đại lý
 */
async function authorize(customSpreadsheetUrl?: string) {
  try {
    // Ưu tiên sử dụng URL tùy chỉnh nếu có
    const spreadsheetUrl = customSpreadsheetUrl || process.env.GOOGLE_SPREADSHEET_URL;
    console.log(`ENV variables check:\nGOOGLE_SPREADSHEET_URL: ${process.env.GOOGLE_SPREADSHEET_URL}`);
    
    if (!spreadsheetUrl) {
      throw new Error('GOOGLE_SPREADSHEET_URL environment variable not found');
    }
    
    console.log(`Using spreadsheet URL: ${spreadsheetUrl}`);
    
    // Extract spreadsheet ID from URL
    const spreadsheetId = getSpreadsheetIdFromUrl(spreadsheetUrl);
    if (!spreadsheetId) {
      throw new Error('Could not extract spreadsheet ID from URL');
    }
    
    console.log(`Using spreadsheet ID: ${spreadsheetId}`);
    
    // Kiểm tra loại xác thực
    if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
      console.log('Using Service Account for full access (read & write)');
      
      // Sử dụng Service Account (hỗ trợ đọc và ghi)
      const auth = new google.auth.JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: SCOPES
      });
      
      await auth.authorize();
      const sheetsApi = google.sheets({ version: 'v4', auth });
      
      spreadsheetInfo = {
        id: spreadsheetId,
        auth,
        sheetsApi
      };
    } else if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
      console.log('Using OAuth2 for full access (read & write)');
      
      // Sử dụng OAuth2 (hỗ trợ đọc và ghi)
      const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      
      auth.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
      });
      
      const sheetsApi = google.sheets({ version: 'v4', auth });
      
      spreadsheetInfo = {
        id: spreadsheetId,
        auth: null, // Không sử dụng JWT trong trường hợp này
        sheetsApi
      };
    } else if (process.env.GOOGLE_API_KEY) {
      console.log('Using API Key for read-only access');
      
      // Sử dụng API Key (chỉ hỗ trợ đọc)
      const auth = null; // Không có JWT
      const sheetsApi = google.sheets({
        version: 'v4',
        auth: process.env.GOOGLE_API_KEY
      });
      
      spreadsheetInfo = {
        id: spreadsheetId,
        auth,
        sheetsApi
      };
    } else {
      throw new Error('No Google authentication method found. Please set either GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY, or GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REFRESH_TOKEN, or GOOGLE_API_KEY');
    }
    
    return spreadsheetInfo;
  } catch (error) {
    console.error('Error authorizing with Google:', error);
    throw error;
  }
}

// Rest of your existing functions would go here...

export async function getSheetData(sheetName: string, user?: User | null, specificSource?: string): Promise<any[]> {
  try {
    const { sheetsApi, spreadsheetId } = await getSpreadsheetForUser(user, specificSource);
    
    // Kiểm tra và tạo sheet nếu cần thiết
    await createSheetIfNotExist(sheetsApi, spreadsheetId, sheetName);
    
    // Get data from sheet
    console.log(`Getting data from sheet: ${sheetName}`);
    
    // Format tên sheet theo đúng định dạng API
    // Sử dụng định dạng đơn giản không có phạm vi A:Z để tránh lỗi
    const safeSheetName = getSafeSheetName(sheetName);
    console.log(`Requesting sheet with range: ${safeSheetName}`);
    const response = await sheetsApi.spreadsheets.values.get({
      spreadsheetId,
      range: safeSheetName,
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
        let value = row[index];
        
        // Convert numeric values where appropriate
        if (header === 'id' || 
            header === 'seats' || 
            header === 'luggageCapacity' || 
            header === 'stars' || 
            header === 'durationDays' ||
            header === 'startMonth' ||
            header === 'endMonth' ||
            header === 'experience' ||
            header === 'age') {
          value = value ? parseInt(value) : 0;
        } else if (header === 'pricePerDay' || 
                   header === 'driverCostPerDay' || 
                   header === 'singleRoomPrice' || 
                   header === 'doubleRoomPrice' || 
                   header === 'tripleRoomPrice' || 
                   header === 'breakfastPrice' ||
                   header === 'basePrice' ||
                   header === 'priceMultiplier') {
          value = value ? parseFloat(value) : 0;
        } else if (header === 'hasInternationalLicense') {
          // Convert to boolean
          value = value === 'TRUE' || value === 'true' || value === '1';
        } else if (header === 'languages') {
          // Convert comma-separated list to array
          value = value ? value.split(',').map((lang: string) => lang.trim()) : [];
        }
        
        item[header] = value;
      });
      return item;
    });
  } catch (error: any) {
    console.error(`Error getting sheet data for '${sheetName}':`, error.message || error);
    
    if (error.message && error.message.includes('parse range')) {
      console.log(`Không thể lấy dữ liệu sheet ${sheetName}, trả về mảng rỗng để tiếp tục hoạt động.`);
    }
    
    // Return empty array to prevent application crashes
    return [];
  }
}

// Implement remaining functions, but with the same getSafeSheetName usage pattern
// ...export functions from original file...

// Export your getSpreadsheetForUser, getSpreadsheet, createSheetIfNotExist, etc.
export { getSpreadsheetForUser, getSpreadsheet };
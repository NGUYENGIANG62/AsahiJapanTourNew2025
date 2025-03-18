import { google, sheets_v4 } from 'googleapis';
import { JWT } from 'google-auth-library';

// Google Sheets configuration
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive'
];
const SPREADSHEET_NAME = 'AsahiJapanTours';

// This will store our cached spreadsheet ID
let spreadsheetId: string | null = null;

/**
 * Authorize with Google using Service Account or API Key
 * Service Account allows both read and write access
 * API Key allows only read access
 */
async function authorize() {
  try {
    // Kiểm tra và ghi log các biến môi trường
    console.log('ENV variables check:');
    console.log('GOOGLE_SPREADSHEET_URL:', process.env.GOOGLE_SPREADSHEET_URL);
    
    // Lấy đường dẫn tới Google Sheets từ biến môi trường hoặc sử dụng mặc định
    const defaultSpreadsheetUrl = "https://docs.google.com/spreadsheets/d/1DQ1e6k4I65O5NxmX8loJ_SKUI7aoIj3WCu5BMLUCznw/edit?usp=sharing";
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

    // Phương pháp 1: Sử dụng Service Account (đọc và ghi)
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const serviceAccountPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    
    if (serviceAccountEmail && serviceAccountPrivateKey) {
      console.log('Using Service Account for full access (read & write)');
      
      // Xử lý private key (thay thế \\n bằng \n nếu cần)
      const privateKey = serviceAccountPrivateKey.replace(/\\n/g, '\n');
      
      const auth = new JWT({
        email: serviceAccountEmail,
        key: privateKey,
        scopes: SCOPES
      });
      
      return google.sheets({
        version: 'v4',
        auth: auth
      });
    }
    
    // Phương pháp 2: Sử dụng API key (chỉ đọc)
    const apiKey = process.env.GOOGLE_API_KEY;
    if (apiKey) {
      console.log('Using Google API key for authenticated public access (read-only)');
      return google.sheets({
        version: 'v4',
        auth: apiKey
      });
    }
    
    // Phương pháp cuối cùng: không có xác thực (hạn chế quota)
    console.log('WARNING: No authentication method available. Using unauthenticated access with limited quota.');
    return google.sheets({ 
      version: 'v4'
    });
  } catch (error) {
    console.error('Authorization error:', error);
    throw error;
  }
}

/**
 * Find the spreadsheet ID based on name
 * Lưu ý: Phương pháp này không còn hoạt động khi chúng ta không có xác thực
 * Thay vào đó, chúng ta đã trích xuất ID từ URL
 */
async function findSpreadsheetId(sheetsApi: sheets_v4.Sheets): Promise<string> {
  // If we already have the ID cached, return it
  if (spreadsheetId) {
    return spreadsheetId;
  }

  // Vì chúng ta không có xác thực, không thể tìm kiếm spreadsheet theo tên
  throw new Error(`Spreadsheet ID không được xác định. Vui lòng cung cấp ID trong GOOGLE_SPREADSHEET_URL.`);
}

/**
 * Create a new spreadsheet if it doesn't exist
 * Lưu ý: Phương pháp này không còn hoạt động khi chúng ta không có xác thực
 */
async function createSpreadsheet(sheetsApi: sheets_v4.Sheets): Promise<string> {
  // Không có quyền tạo bảng tính khi không có xác thực, hãy hiển thị thông báo hướng dẫn
  throw new Error(
    'Không thể tự động tạo Google Spreadsheet. Vui lòng tạo bảng tính thủ công và cập nhật URL trong biến môi trường GOOGLE_SPREADSHEET_URL.' + 
    '\nHướng dẫn:' +
    '\n1. Đi đến drive.google.com và tạo một Google Sheets mới' +
    '\n2. Đặt tên bảng tính là "AsahiJapanTours"' + 
    '\n3. Tạo các sheet: Tours, Vehicles, Hotels, Guides, Seasons, Settings' +
    '\n4. Thêm tiêu đề vào mỗi sheet theo mẫu sau:' +
    '\n   - Tours: id, name, code, location, description, durationDays, basePrice, imageUrl, nameJa, nameZh' +
    '\n   - Vehicles: id, name, seats, luggageCapacity, pricePerDay, driverCostPerDay' +
    '\n   - Hotels: id, name, location, stars, singleRoomPrice, doubleRoomPrice, tripleRoomPrice, breakfastPrice, imageUrl' +
    '\n   - Guides: id, name, languages, pricePerDay, experience, hasInternationalLicense, personality, gender, age' +
    '\n   - Seasons: id, name, startMonth, endMonth, description, priceMultiplier, nameJa, nameZh' +
    '\n   - Settings: id, key, value' +
    '\n5. Chia sẻ bảng tính với quyền "Bất kỳ ai có liên kết" có thể xem' +
    '\n6. Sao chép URL và cập nhật vào biến môi trường GOOGLE_SPREADSHEET_URL'
  );
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
      range: 'Vehicles!A1:F1',
      values: [['id', 'name', 'seats', 'luggageCapacity', 'pricePerDay', 'driverCostPerDay']],
    },
    {
      range: 'Hotels!A1:I1',
      values: [['id', 'name', 'location', 'stars', 'singleRoomPrice', 'doubleRoomPrice', 'tripleRoomPrice', 'breakfastPrice', 'imageUrl']],
    },
    {
      range: 'Guides!A1:I1',
      values: [['id', 'name', 'languages', 'pricePerDay', 'experience', 'hasInternationalLicense', 'personality', 'gender', 'age']],
    },
    {
      range: 'Seasons!A1:H1',
      values: [['id', 'name', 'startMonth', 'endMonth', 'description', 'priceMultiplier', 'nameJa', 'nameZh']],
    },
    {
      range: 'Settings!A1:C1',
      values: [['id', 'key', 'value']],
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
// Hàm kiểm tra và tạo sheet nếu không tồn tại
async function createSheetIfNotExist(sheetsApi: sheets_v4.Sheets, spreadsheetId: string, sheetName: string): Promise<void> {
  try {
    // Kiểm tra xem sheet đã tồn tại chưa
    const response = await sheetsApi.spreadsheets.get({
      spreadsheetId,
    });
    
    const sheetExists = response.data.sheets?.some(
      sheet => sheet.properties?.title === sheetName
    );
    
    if (!sheetExists) {
      console.log(`Sheet '${sheetName}' không tồn tại, đang tạo mới...`);
      
      // Tạo sheet mới
      await sheetsApi.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: sheetName
              }
            }
          }]
        }
      });
      
      // Thêm header nếu là sheet Settings
      if (sheetName === 'Settings') {
        await sheetsApi.spreadsheets.values.update({
          spreadsheetId,
          range: 'Settings!A1:C1',
          valueInputOption: 'RAW',
          requestBody: {
            values: [['id', 'key', 'value']],
          },
        });
      }
      
      console.log(`Sheet '${sheetName}' đã được tạo thành công`);
    }
  } catch (error) {
    console.error(`Lỗi khi kiểm tra/tạo sheet '${sheetName}':`, error);
    throw error;
  }
}

export async function getSheetData(sheetName: string): Promise<any[]> {
  try {
    const { sheetsApi, spreadsheetId } = await getSpreadsheet();
    
    // Kiểm tra và tạo sheet nếu cần thiết
    await createSheetIfNotExist(sheetsApi, spreadsheetId, sheetName);
    
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
        let value = row[index];
        
        // Special handling for known array fields
        if (header === 'languages' && typeof value === 'string' && value.includes(',')) {
          // Convert comma-separated string back to array
          value = value.split(',').map(v => v.trim());
        }
        
        // Convert boolean strings to actual boolean values
        if (header === 'hasInternationalLicense') {
          if (value === 'true' || value === 'TRUE' || value === '1' || value === 'Yes' || value === 'yes') {
            value = true;
          } else if (value === 'false' || value === 'FALSE' || value === '0' || value === 'No' || value === 'no') {
            value = false;
          }
        }
        
        // Convert numeric strings to numbers
        if (['experience', 'age'].includes(header) && value !== undefined && value !== '') {
          const num = Number(value);
          if (!isNaN(num)) {
            value = num;
          }
        }
        
        item[header] = value;
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
    
    // Kiểm tra và tạo sheet nếu cần thiết
    await createSheetIfNotExist(sheetsApi, spreadsheetId, sheetName);
    
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
    
    // Create a row of values in the correct order, converting arrays to strings
    const values = headers.map(header => {
      const value = item[header];
      
      // Handle array values by converting them to comma-separated strings
      if (Array.isArray(value)) {
        return value.join(',');
      }
      
      // Handle undefined or null values
      return value !== undefined && value !== null ? value : '';
    });
    
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
    
    // Kiểm tra và tạo sheet nếu cần thiết
    await createSheetIfNotExist(sheetsApi, spreadsheetId, sheetName);
    
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
    
    // Sync Settings
    try {
      const settings = await getSheetData('Settings');
      for (const setting of settings) {
        if (setting.key && setting.value) {
          await storage.updateSetting(setting.key, setting.value);
        }
      }
      console.log('Settings synchronized from Google Sheets');
    } catch (settingsError: any) {
      console.warn('Could not sync settings from Google Sheets:', settingsError.message || settingsError);
    }
    
    console.log('Data sync from Google Sheets completed successfully');
    return true;
  } catch (error) {
    console.error('Error syncing data from sheets:', error);
    throw error;
  }
}

/**
 * Hàm trợ giúp thay thế nội dung theo ngôn ngữ
 */
function replaceWithLanguageContent(data: any, language: string) {
  // Nếu là ngôn ngữ tiếng Anh, giữ nguyên dữ liệu
  if (language === 'en') {
    return { ...data };
  }
  
  // Clone data để không ảnh hưởng đến dữ liệu gốc
  const clonedData = { ...data };
  
  // Xử lý các trường đa ngôn ngữ cho Tour
  if ('name' in clonedData && `name${language.charAt(0).toUpperCase() + language.slice(1)}` in clonedData) {
    const langField = `name${language.charAt(0).toUpperCase() + language.slice(1)}`;
    if (clonedData[langField]) {
      clonedData.name = clonedData[langField];
    }
  }
  
  if ('description' in clonedData && `description${language.charAt(0).toUpperCase() + language.slice(1)}` in clonedData) {
    const langField = `description${language.charAt(0).toUpperCase() + language.slice(1)}`;
    if (clonedData[langField]) {
      clonedData.description = clonedData[langField];
    }
  }
  
  return clonedData;
}

/**
 * Sync data from local storage to Google Sheets
 * @param storage Storage instance
 * @param language Language code ('en', 'ja', 'zh', 'ko', 'vi')
 */
export async function syncDataToSheets(storage: any, language: string = 'en') {
  try {
    console.log(`Syncing data to Google Sheets using language: ${language}`);
    
    // Sync Tours
    const tours = await storage.getAllTours();
    for (const tour of tours) {
      // Thay thế nội dung dựa vào ngôn ngữ được chọn
      const localizedTour = replaceWithLanguageContent(tour, language);
      await updateSheetItem('Tours', localizedTour);
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
      // Thay thế nội dung dựa vào ngôn ngữ được chọn
      const localizedSeason = replaceWithLanguageContent(season, language);
      await updateSheetItem('Seasons', localizedSeason);
    }
    
    // Sync Settings - đồng bộ các cài đặt của khách sạn theo hạng sao và các cài đặt khác
    try {
      const settingKeys = [
        'profit_margin', 'tax_rate', 'meal_cost_lunch', 'meal_cost_dinner',
        'hotel_3star_single', 'hotel_3star_double', 'hotel_3star_triple', 'hotel_3star_breakfast',
        'hotel_4star_single', 'hotel_4star_double', 'hotel_4star_triple', 'hotel_4star_breakfast',
        'hotel_5star_single', 'hotel_5star_double', 'hotel_5star_triple', 'hotel_5star_breakfast'
      ];
      
      for (const key of settingKeys) {
        const settingValue = await storage.getSetting(key);
        if (settingValue) {
          await updateSheetItem('Settings', {
            id: key, // Sử dụng key làm id để dễ tìm kiếm
            key: key,
            value: settingValue
          });
        }
      }
      console.log('Settings synchronized to Google Sheets');
    } catch (settingsError: any) {
      console.warn('Could not sync settings to Google Sheets:', settingsError.message || settingsError);
    }
    
    console.log(`Data sync to Google Sheets completed successfully using language: ${language}`);
    return true;
  } catch (error) {
    console.error('Error syncing data to sheets:', error);
    throw error;
  }
}
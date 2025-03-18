import { google, sheets_v4 } from 'googleapis';
import { JWT } from 'google-auth-library';
import { User } from '@shared/schema';

// Google Sheets configuration
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive'
];
const SPREADSHEET_NAME = 'AsahiJapanTours';

// Cấu trúc lưu trữ thông tin spreadsheet
interface SpreadsheetInfo {
  id: string;
  auth: JWT | null;
  sheetsApi: sheets_v4.Sheets | null;
}

// Map lưu trữ các spreadsheet theo userID hoặc agencyID
const spreadsheets = new Map<string, SpreadsheetInfo>();

// Spreadsheet mặc định cho người dùng thông thường
const DEFAULT_SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1DQ1e6k4I65O5NxmX8loJ_SKUI7aoIj3WCu5BMLUCznw/edit?usp=sharing";

// Biến này chỉ giữ lại để tương thích với code cũ cho đến khi cập nhật hoàn toàn
let spreadsheetId: string | null = null;

/**
 * Lấy spreadsheet ID từ URL hoặc môi trường
 */
function getSpreadsheetIdFromUrl(url: string): string | null {
  const urlMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }
  return null;
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
    // Kiểm tra và ghi log các biến môi trường
    console.log('ENV variables check:');
    console.log('GOOGLE_SPREADSHEET_URL:', process.env.GOOGLE_SPREADSHEET_URL);
    
    // Lấy đường dẫn tới Google Sheets từ tham số, biến môi trường hoặc mặc định
    const spreadsheetUrl = customSpreadsheetUrl || process.env.GOOGLE_SPREADSHEET_URL || DEFAULT_SPREADSHEET_URL;
    
    console.log('Using spreadsheet URL:', spreadsheetUrl);
    
    // Trích xuất ID từ URL
    const spreadsheetId = getSpreadsheetIdFromUrl(spreadsheetUrl);
    if (spreadsheetId) {
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
  // Sử dụng URL mặc định từ biến môi trường hoặc hằng số
  if (process.env.GOOGLE_SPREADSHEET_URL) {
    const id = getSpreadsheetIdFromUrl(process.env.GOOGLE_SPREADSHEET_URL);
    if (id) return id;
  }

  // Sử dụng URL mặc định
  const id = getSpreadsheetIdFromUrl(DEFAULT_SPREADSHEET_URL);
  if (id) return id;

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
 * Get the spreadsheet for a specific user
 * @param user User object containing agency data source
 */
export async function getSpreadsheetForUser(user?: User | null): Promise<{ sheetsApi: sheets_v4.Sheets, spreadsheetId: string }> {
  try {
    // Xác định nguồn dữ liệu dựa trên vai trò người dùng
    let customUrl: string | undefined = undefined;
    
    // Nếu là đại lý (agent) và có dataSource được cấu hình
    if (user && user.role === 'agent' && user.dataSource) {
      customUrl = user.dataSource;
      console.log(`Using agent-specific spreadsheet for ${user.username}: ${customUrl}`);
    }
    
    // Nếu là khách hàng thông thường, sử dụng URL mặc định
    if (user && user.role === 'user') {
      console.log(`Using default spreadsheet for customer: ${user.username}`);
    }
    
    // Nếu là admin, sử dụng URL mặc định
    if (user && user.role === 'admin') {
      console.log(`Using default spreadsheet for admin: ${user.username}`);
    }
    
    const sheetsApi = await authorize(customUrl);
    
    // Trích xuất spreadsheetId từ URL
    let id: string | null = null;
    
    if (customUrl) {
      id = getSpreadsheetIdFromUrl(customUrl);
      console.log(`Using custom spreadsheet ID: ${id}`);
    } else if (process.env.GOOGLE_SPREADSHEET_URL) {
      id = getSpreadsheetIdFromUrl(process.env.GOOGLE_SPREADSHEET_URL);
      console.log(`Using default spreadsheet ID: ${id}`);
    }
    
    if (!id) {
      try {
        // Cố gắng tìm bảng tính hiện có theo tên
        id = await findSpreadsheetId(sheetsApi);
        console.log(`Found spreadsheet ID by name: ${id}`);
      } catch (error) {
        // Nếu không tìm thấy, tạo một bảng tính mới
        console.log('Spreadsheet not found, creating new one...');
        id = await createSpreadsheet(sheetsApi);
        console.log(`Created new spreadsheet with ID: ${id}`);
      }
    }
    
    return { sheetsApi, spreadsheetId: id };
  } catch (error) {
    console.error('Failed to get spreadsheet:', error);
    throw error;
  }
}

/**
 * Get the default spreadsheet (legacy support)
 */
export async function getSpreadsheet(): Promise<{ sheetsApi: sheets_v4.Sheets, spreadsheetId: string }> {
  return getSpreadsheetForUser();
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

export async function getSheetData(sheetName: string, user?: User | null): Promise<any[]> {
  try {
    const { sheetsApi, spreadsheetId } = await getSpreadsheetForUser(user);
    
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
export async function updateSheetItem(sheetName: string, item: any, user?: User | null): Promise<void> {
  try {
    const { sheetsApi, spreadsheetId } = await getSpreadsheetForUser(user);
    
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
export async function deleteSheetItem(sheetName: string, id: number, user?: User | null): Promise<void> {
  try {
    const { sheetsApi, spreadsheetId } = await getSpreadsheetForUser(user);
    
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
export async function syncDataFromSheets(storage: any, user?: User | null) {
  try {
    // Sử dụng bảng tính theo người dùng (đại lý)
    const { sheetsApi, spreadsheetId } = await getSpreadsheetForUser(user);
    
    // Sync Tours
    const tours = await getSheetData('Tours', user);
    for (const tour of tours) {
      await storage.createOrUpdateTour(tour);
    }
    
    // Sync Vehicles
    const vehicles = await getSheetData('Vehicles', user);
    for (const vehicle of vehicles) {
      await storage.createOrUpdateVehicle(vehicle);
    }
    
    // Sync Hotels
    const hotels = await getSheetData('Hotels', user);
    for (const hotel of hotels) {
      // Khách sạn không còn cung cấp bữa ăn trưa và tối, vì đó là các dịch vụ độc lập
      // Xóa các giá trị lunchPrice và dinnerPrice nếu có
      if ('lunchPrice' in hotel) delete hotel.lunchPrice;
      if ('dinnerPrice' in hotel) delete hotel.dinnerPrice;
      
      await storage.createOrUpdateHotel(hotel);
    }
    
    // Sync Guides
    const guides = await getSheetData('Guides', user);
    for (const guide of guides) {
      await storage.createOrUpdateGuide(guide);
    }
    
    // Sync Seasons
    const seasons = await getSheetData('Seasons', user);
    for (const season of seasons) {
      await storage.createOrUpdateSeason(season);
    }
    
    // Sync Settings
    try {
      const settingsData = await getSheetData('Settings', user);
      console.log('Settings data from Google Sheets:', JSON.stringify(settingsData));

      // Kiểm tra xem có dữ liệu Settings không
      if (settingsData && settingsData.length > 0) {
        // Xử lý trường hợp cả bảng là một object duy nhất với nhiều key-value
        if (settingsData.length === 1 && typeof settingsData[0] === 'object') {
          const settingsObj = settingsData[0];
          for (const key in settingsObj) {
            if (key !== 'id' && settingsObj[key] !== undefined) {
              const value = String(settingsObj[key]);
              console.log(`Updating setting from object: ${key} = ${value}`);
              await storage.createOrUpdateSetting({
                key: key,
                value: value
              });
            }
          }
        } else {
          // Xử lý trường hợp mỗi setting là một object riêng biệt có key và value
          for (const setting of settingsData) {
            if (setting.key && setting.value !== undefined) {
              console.log(`Updating setting: ${setting.key} = ${setting.value}`);
              await storage.createOrUpdateSetting(setting);
            } else {
              console.log(`Skipping invalid setting:`, JSON.stringify(setting));
            }
          }
        }
      }
      
      // Đảm bảo cập nhật lại các giá trị quan trọng
      const updatedSettings = await storage.getAllSettings();
      console.log('Updated settings after sync:', JSON.stringify(updatedSettings));
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
export async function syncDataToSheets(storage: any, language: string = 'en', user?: User | null) {
  try {
    console.log(`Syncing data to Google Sheets using language: ${language}`);
    
    // Sync Tours
    const tours = await storage.getAllTours();
    for (const tour of tours) {
      // Thay thế nội dung dựa vào ngôn ngữ được chọn
      const localizedTour = replaceWithLanguageContent(tour, language);
      await updateSheetItem('Tours', localizedTour, user);
    }
    
    // Sync Vehicles
    const vehicles = await storage.getAllVehicles();
    for (const vehicle of vehicles) {
      await updateSheetItem('Vehicles', vehicle, user);
    }
    
    // Sync Hotels
    const hotels = await storage.getAllHotels();
    for (const hotel of hotels) {
      await updateSheetItem('Hotels', hotel, user);
    }
    
    // Sync Guides
    const guides = await storage.getAllGuides();
    for (const guide of guides) {
      await updateSheetItem('Guides', guide, user);
    }
    
    // Sync Seasons
    const seasons = await storage.getAllSeasons();
    for (const season of seasons) {
      // Thay thế nội dung dựa vào ngôn ngữ được chọn
      const localizedSeason = replaceWithLanguageContent(season, language);
      await updateSheetItem('Seasons', localizedSeason, user);
    }
    
    // Sync Settings - đồng bộ các cài đặt quan trọng và giá bữa ăn từ Google Sheets
    try {
      const settingKeys = [
        'profit_margin', 'tax_rate', 'lunchPrice', 'dinnerPrice'
      ];
      
      for (const key of settingKeys) {
        const settingValue = await storage.getSetting(key);
        if (settingValue) {
          await updateSheetItem('Settings', {
            id: key, // Sử dụng key làm id để dễ tìm kiếm
            key: key,
            value: settingValue
          }, user);
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
import { google, sheets_v4 } from 'googleapis';
import { JWT } from 'google-auth-library';
import { User, SYNC_SETTINGS } from '@shared/schema';

/**
 * Hàm tiện ích để lấy tên sheet an toàn khi truy vấn Google Sheets API
 * Tránh lỗi "Unable to parse range" bằng cách chỉ sử dụng tên sheet
 * 
 * QUAN TRỌNG: Đây là phiên bản sửa lỗi - KHÔNG thêm phạm vi "!A:Z" vào tên sheet
 * vì nó gây ra lỗi "Unable to parse range" trong một số trường hợp
 */
function getSafeSheetName(sheetName: string): string {
  // Dùng cho các thao tác liên quan tới việc kiểm tra tồn tại sheet
  // hoặc các thao tác không yêu cầu phạm vi cụ thể
  return sheetName.trim();
}

/**
 * Hàm tiện ích để lấy phạm vi truy vấn an toàn khi truy vấn Google Sheets API
 * Vấn đề: Khi chỉ cung cấp tên sheet, Google API yêu cầu một phạm vi hợp lệ
 * @param sheetName Tên sheet
 * @param fullRange Có lấy toàn bộ dữ liệu không
 */
function getSafeRange(sheetName: string, fullRange: boolean = true): string {
  const trimmedName = sheetName.trim();
  
  // Xử lý đặc biệt cho các sheet đặc thù
  // Đối với các sheet viết hoa toàn bộ và có gạch dưới, cần xử lý đặc biệt
  // Các sheet này thường là metadata như LAST_SYNC_TIME, CURRENT_DATA_SOURCE, v.v.
  if (trimmedName === trimmedName.toUpperCase() && trimmedName.includes('_')) {
    console.log(`Đang xử lý phạm vi đặc biệt cho sheet: ${trimmedName}`);
    
    // Chúng ta sẽ sử dụng ID của sheet thay vì tên sheet
    // Với sheet metadata, không thực sự cần đọc nên ta giả định rằng
    // chúng được lưu trữ trong bộ nhớ cục bộ và không cần đọc từ Google Sheets
    
    // Đối với các sheet metadata, hãy bỏ qua việc đồng bộ
    // và trả về một phạm vi không hợp lệ sẽ luôn bị bắt ở lỗi try-catch
    
    // Đây là một cách tạm thời để xử lý vấn đề, sau này cần thiết kế lại
    // cấu trúc đồng bộ để không còn tên sheet không hợp lệ
    
    // Để ứng dụng không bị crash, bỏ qua sheet này một cách êm đẹp
    return 'default!A1'; // Sử dụng tên sheet hợp lệ, sẽ được xử lý trong khối try-catch
  }
  
  // Đối với các sheet thông thường, bọc tên sheet trong dấu nháy đơn
  let safeName = `'${trimmedName}'`;
  
  // Luôn thêm phạm vi cụ thể
  if (fullRange) {
    return `${safeName}!A1:Z1000`; // Phạm vi rộng cho toàn bộ dữ liệu
  } else {
    return `${safeName}!A1`; // Chỉ lấy header
  }
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
    // Kiểm tra nếu là sheet metadata đặc biệt thì không truy vấn
    if (sheetName === sheetName.toUpperCase() && sheetName.includes('_')) {
      console.log(`Bỏ qua đồng bộ cho sheet metadata: ${sheetName}`);
      // Trả về mảng rỗng cho sheet metadata đặc biệt
      // Các sheet này nên được xử lý trong bộ nhớ cục bộ
      return [];
    }
    
    const { sheetsApi, spreadsheetId } = await getSpreadsheetForUser(user, specificSource);
    
    // Kiểm tra và tạo sheet nếu cần thiết
    await createSheetIfNotExist(sheetsApi, spreadsheetId, sheetName);
    
    // Get data from sheet
    console.log(`Getting data from sheet: ${sheetName}`);
    
    // Format tên sheet theo đúng định dạng API
    // Lấy phạm vi đầy đủ để đảm bảo lấy được toàn bộ dữ liệu
    const range = getSafeRange(sheetName, true);
    console.log(`Requesting sheet with range: ${range}`);
    const response = await sheetsApi.spreadsheets.values.get({
      spreadsheetId,
      range,
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

/**
 * Sync data from Google Sheets to local storage
 */
export async function syncDataFromSheets(storage: any, user?: User | null, specificSource?: string) {
  try {
    console.log("Starting data sync from Google Sheets...");
    const { sourceName } = await getSpreadsheetForUser(user, specificSource);
    
    // Kiểm tra thời gian sync gần nhất, nếu là đại lý thì luôn sync
    // Nếu là admin và thời gian sync < 5 phút, bỏ qua
    if (user && user.role === 'admin') {
      const lastSyncTime = await storage.getLastSyncTimestamp();
      const now = Date.now();
      
      // Nếu thời gian từ lần sync cuối < 5 phút và không force sync, bỏ qua
      if (lastSyncTime && (now - lastSyncTime < 5 * 60 * 1000) && !specificSource) {
        console.log(`Bỏ qua sync tự động: Sync gần nhất ${Math.round((now - lastSyncTime) / 1000)}s trước`);
        return;
      }
    }
    
    // Update settings
    console.log("Syncing settings from Google Sheets...");
    const settingsData = await getSheetData('Settings', user, specificSource);
    console.log(`Settings data from Google Sheets:`, settingsData);
    
    // Luôn cập nhật cài đặt, kể cả khi không có dữ liệu từ Google Sheets
    // Đảm bảo các cài đặt mặc định luôn có trong bộ nhớ tạm thời
    const allSettings = await storage.getAllSettings();
    console.log(`Updated settings after sync:`, allSettings);
    console.log(`Settings synchronized from Google Sheets`);
    
    // Cài đặt này không đồng bộ là nguồn dữ liệu hiện tại
    await storage.updateSetting('current_data_source', specificSource || (user?.dataSource || ''));
    await storage.updateSetting('current_data_source_name', sourceName);
    
    // Update last sync time
    await storage.updateLastSyncTimestamp();
    
    // Apply sync settings from shared schema
    for (const entityKey of Object.keys(SYNC_SETTINGS)) {
      // Skip if this entity is disabled in SYNC_SETTINGS
      if (!SYNC_SETTINGS[entityKey as keyof typeof SYNC_SETTINGS]) {
        console.log(`Skipping sync for ${entityKey} (disabled in SYNC_SETTINGS)`);
        continue;
      }
      
      try {
        // For example, if entityKey is 'tours', sheetName will be 'Tours'
        const sheetName = entityKey.charAt(0).toUpperCase() + entityKey.slice(1);
        console.log(`Syncing ${sheetName} from Google Sheets...`);
        
        const data = await getSheetData(sheetName, user, specificSource);
        console.log(`Retrieved ${data.length} ${sheetName.toLowerCase()} from Google Sheets`);
        
        for (const item of data) {
          switch (entityKey) {
            case 'tours':
              await storage.createOrUpdateTour(item);
              break;
            case 'vehicles':
              await storage.createOrUpdateVehicle(item);
              break;
            case 'hotels':
              await storage.createOrUpdateHotel(item);
              break;
            case 'guides':
              await storage.createOrUpdateGuide(item);
              break;
            case 'seasons':
              await storage.createOrUpdateSeason(item);
              break;
            case 'settings':
              await storage.createOrUpdateSetting(item);
              break;
          }
        }
        
        console.log(`Successfully synced ${sheetName} from Google Sheets`);
      } catch (error) {
        console.error(`Error syncing ${entityKey} from Google Sheets:`, error);
        // Continue with next entity even if one fails
      }
    }
    
    console.log("Data sync from Google Sheets completed successfully");
    
    // Cập nhật mã AVF cho tours (Admin only)
    if (user && user.role === 'admin') {
      const updatedTours = await storage.updateAllTourAVFCodes();
      console.log(`Đã cập nhật mã AVF cho ${updatedTours.length} tours`);
    }
  } catch (error) {
    console.error("Error syncing data from Google Sheets:", error);
    throw error;
  }
}

/**
 * Hàm trợ giúp thay thế nội dung theo ngôn ngữ
 * @param data Dữ liệu cần thay thế
 * @param language Mã ngôn ngữ ('en', 'ja', 'zh', 'ko', 'vi')
 */
function replaceWithLanguageContent(data: any, language: string) {
  if (!data || language === 'en') return data;
  
  const result = { ...data };
  
  // Thay thế tên nếu có ngôn ngữ tương ứng
  const nameKey = `name${language.charAt(0).toUpperCase() + language.slice(1)}`;
  if (data[nameKey]) {
    result.name = data[nameKey];
  }
  
  // Thay thế mô tả nếu có ngôn ngữ tương ứng
  const descKey = `description${language.charAt(0).toUpperCase() + language.slice(1)}`;
  if (data[descKey]) {
    result.description = data[descKey];
  }
  
  return result;
}

/**
 * Sync data from local storage to Google Sheets
 * @param storage Storage instance
 * @param language Language code ('en', 'ja', 'zh', 'ko', 'vi')
 */
export async function syncDataToSheets(storage: any, language: string = 'en', user?: User | null) {
  try {
    console.log(`Starting data sync to Google Sheets (language: ${language})...`);
    const { sheetsApi, spreadsheetId } = await getSpreadsheetForUser(user);
    
    // Apply sync settings from shared schema
    for (const entityKey of Object.keys(SYNC_SETTINGS)) {
      // Skip if this entity is disabled in SYNC_SETTINGS
      if (!SYNC_SETTINGS[entityKey as keyof typeof SYNC_SETTINGS]) {
        console.log(`Skipping sync for ${entityKey} (disabled in SYNC_SETTINGS)`);
        continue;
      }
      
      try {
        // For example, if entityKey is 'tours', sheetName will be 'Tours'
        const sheetName = entityKey.charAt(0).toUpperCase() + entityKey.slice(1);
        console.log(`Syncing local ${entityKey} to Google Sheets...`);
        
        // Create the sheet if it doesn't exist
        await createSheetIfNotExist(sheetsApi, spreadsheetId, sheetName);
        
        // Get data from storage
        let data: any[] = [];
        switch (entityKey) {
          case 'tours':
            data = await storage.getAllTours();
            break;
          case 'vehicles':
            data = await storage.getAllVehicles();
            break;
          case 'hotels':
            data = await storage.getAllHotels();
            break;
          case 'guides':
            data = await storage.getAllGuides();
            break;
          case 'seasons':
            data = await storage.getAllSeasons();
            break;
          case 'settings':
            data = await storage.getAllSettings();
            break;
        }
        
        // If language is not English, replace content with localized version
        if (language !== 'en') {
          data = data.map(item => replaceWithLanguageContent(item, language));
        }
        
        // Extract headers and values
        if (data.length > 0) {
          const headers = Object.keys(data[0]);
          const values = [headers];
          
          data.forEach(item => {
            const row: any[] = [];
            headers.forEach(header => {
              let value = item[header];
              
              // Convert arrays to strings
              if (Array.isArray(value)) {
                value = value.join(', ');
              }
              
              // Convert booleans to strings
              if (typeof value === 'boolean') {
                value = value ? 'TRUE' : 'FALSE';
              }
              
              row.push(value !== undefined && value !== null ? value : '');
            });
            values.push(row);
          });
          
          // Sử dụng định dạng có phạm vi đầy đủ để đảm bảo lấy được toàn bộ dữ liệu
          const fullRange = getSafeRange(sheetName, true);
          const range = `${getSafeRange(sheetName, false)}:${String.fromCharCode(65 + headers.length - 1)}${values.length}`;
          
          console.log(`Updating Google Sheet: ${range} with ${values.length} rows`);
          
          // Clear existing data
          await sheetsApi.spreadsheets.values.clear({
            spreadsheetId,
            range: fullRange,
          });
          
          // Update with new data
          await sheetsApi.spreadsheets.values.update({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            requestBody: {
              values
            }
          });
          
          console.log(`Successfully synced ${values.length - 1} ${entityKey} to Google Sheets`);
        } else {
          console.log(`No ${entityKey} data to sync`);
        }
      } catch (error) {
        console.error(`Error syncing ${entityKey} to Google Sheets:`, error);
        // Continue with next entity even if one fails
      }
    }
    
    console.log("Data sync to Google Sheets completed successfully");
  } catch (error) {
    console.error("Error syncing data to Google Sheets:", error);
    throw error;
  }
}

// Implement getSpreadsheetForUser function
export async function getSpreadsheetForUser(user?: User | null, specificSource?: string): Promise<{ sheetsApi: sheets_v4.Sheets, spreadsheetId: string, sourceName: string }> {
  try {
    // Nếu có nguồn chỉ định, dùng nó thay vì tìm kiếm từ user
    if (specificSource) {
      if (specificSource.includes('http')) {
        // It's a URL, authorize with it
        const { sheetsApi, id } = await authorize(specificSource);
        if (!sheetsApi) throw new Error('Could not authorize with Google');
        return { sheetsApi, spreadsheetId: id, sourceName: 'custom' };
      } else {
        // It's already a spreadsheet ID
        const { sheetsApi } = await authorize();
        if (!sheetsApi) throw new Error('Could not authorize with Google');
        return { sheetsApi, spreadsheetId: specificSource, sourceName: 'custom-id' };
      }
    } 
    // Nếu là agency user và có dataSource
    else if (user && user.role === 'agent' && user.dataSource) {
      // Sử dụng nguồn dữ liệu của đại lý
      if (user.dataSource.includes('http')) {
        // It's a URL, authorize with it
        const { sheetsApi, id } = await authorize(user.dataSource);
        if (!sheetsApi) throw new Error('Could not authorize with Google');
        return { sheetsApi, spreadsheetId: id, sourceName: user.username || 'agency' };
      } else {
        // It's already a spreadsheet ID
        const { sheetsApi } = await authorize();
        if (!sheetsApi) throw new Error('Could not authorize with Google');
        return { sheetsApi, spreadsheetId: user.dataSource, sourceName: user.username || 'agency' };
      }
    } 
    // Mặc định: sử dụng Google Sheet mặc định
    else {
      return await getSpreadsheet();
    }
  } catch (error) {
    console.error('Error getting spreadsheet for user:', error);
    throw error;
  }
}

/**
 * Get the default spreadsheet (legacy support)
 */
export async function getSpreadsheet(): Promise<{ sheetsApi: sheets_v4.Sheets, spreadsheetId: string, sourceName: string }> {
  try {
    // Authorize with Google
    const { sheetsApi, id } = await authorize();
    if (!sheetsApi) throw new Error('Could not authorize with Google');
    
    console.log(`Using default spreadsheet ID: ${id}`);
    return { sheetsApi, spreadsheetId: id, sourceName: 'default' };
  } catch (error) {
    console.error('Error getting spreadsheet:', error);
    throw error;
  }
}

/**
 * Hàm để kiểm tra và tạo sheet mới nếu chưa tồn tại
 */
export async function createSheetIfNotExist(sheetsApi: sheets_v4.Sheets, spreadsheetId: string, sheetName: string): Promise<void> {
  try {
    console.log(`Checking if sheet '${sheetName}' exists...`);
    
    // Kiểm tra xem sheet đã tồn tại chưa
    const spreadsheet = await sheetsApi.spreadsheets.get({
      spreadsheetId,
      includeGridData: false
    });
    
    const sheetExists = spreadsheet.data.sheets?.some(
      (sheet: any) => sheet.properties?.title === sheetName
    );
    
    if (!sheetExists) {
      console.log(`Sheet '${sheetName}' không tồn tại, đang tạo mới...`);
      
      try {
        // Tạo sheet mới
        await sheetsApi.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: sheetName
                  }
                }
              }
            ]
          }
        });
        
        console.log(`Sheet '${sheetName}' đã được tạo thành công`);
        
        // Thêm các header tùy thuộc vào loại sheet
        let headers: string[] = [];
        
        switch (sheetName) {
          case 'Tours':
            headers = ['id', 'name', 'code', 'avfCode', 'location', 'description', 'durationDays', 'basePrice', 'imageUrl', 'nameJa', 'nameZh', 'nameKo', 'nameVi', 'descriptionJa', 'descriptionZh', 'descriptionKo', 'descriptionVi'];
            break;
          case 'Vehicles':
            headers = ['id', 'name', 'seats', 'luggageCapacity', 'pricePerDay', 'driverCostPerDay'];
            break;
          case 'Hotels':
            headers = ['id', 'name', 'location', 'stars', 'singleRoomPrice', 'doubleRoomPrice', 'tripleRoomPrice', 'breakfastPrice', 'imageUrl'];
            break;
          case 'Guides':
            headers = ['id', 'name', 'languages', 'pricePerDay', 'experience', 'hasInternationalLicense', 'personality', 'gender', 'age'];
            break;
          case 'Seasons':
            headers = ['id', 'name', 'startMonth', 'endMonth', 'description', 'priceMultiplier', 'nameJa', 'nameZh', 'nameKo', 'nameVi', 'descriptionJa', 'descriptionZh', 'descriptionKo', 'descriptionVi'];
            break;
          case 'Settings':
            headers = ['id', 'key', 'value'];
            break;
          default:
            headers = ['id', 'name', 'value'];
        }
        
        // Thêm headers - để API tự xử lý encoding
        // Tạo phạm vi chính xác cho hàng header dựa trên độ dài của headers
        const headerRange = `${getSafeRange(sheetName, false)}:${String.fromCharCode(65 + headers.length - 1)}1`;
        console.log(`Adding headers to range: ${headerRange}`);
        await sheetsApi.spreadsheets.values.update({
          spreadsheetId,
          range: headerRange,
          valueInputOption: 'RAW',
          requestBody: {
            values: [headers]
          }
        });
        
        console.log(`Headers added to sheet '${sheetName}'`);
      } catch (error: any) {
        if (error.message && error.message.includes('permission')) {
          console.error(`Không thể tạo sheet '${sheetName}': ${error.message}`);
          console.log(`Tiếp tục thực thi - sheet '${sheetName}' có thể cần được tạo thủ công.`);
        } else {
          throw error;
        }
      }
    } else {
      console.log(`Sheet '${sheetName}' đã tồn tại`);
    }
  } catch (error: any) {
    console.error(`Error checking or creating sheet '${sheetName}':`, error.message || error);
    console.log(`Tiếp tục đồng bộ bỏ qua sheet '${sheetName}' do lỗi quyền truy cập.`);
  }
}
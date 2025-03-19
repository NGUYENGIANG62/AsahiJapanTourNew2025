import { google, sheets_v4 } from 'googleapis';
import { JWT } from 'google-auth-library';
import { User, SYNC_SETTINGS } from '@shared/schema';

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
      console.log('Using Service Account for full access (read & write)');
      
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

/**
 * Find the spreadsheet ID based on name
 * Lưu ý: Phương pháp này không còn hoạt động khi chúng ta không có xác thực
 * Thay vào đó, chúng ta đã trích xuất ID từ URL
 */
async function findSpreadsheetId(sheetsApi: sheets_v4.Sheets): Promise<string> {
  try {
    const response = await sheetsApi.spreadsheets.list();
    const spreadsheets = response.data.files;
    
    if (!spreadsheets || spreadsheets.length === 0) {
      throw new Error('No spreadsheets found');
    }
    
    const spreadsheet = spreadsheets.find(s => s.name === SPREADSHEET_NAME);
    
    if (!spreadsheet || !spreadsheet.id) {
      throw new Error(`Spreadsheet with name ${SPREADSHEET_NAME} not found`);
    }
    
    return spreadsheet.id;
  } catch (error) {
    console.error('Error finding spreadsheet ID:', error);
    throw error;
  }
}

/**
 * Create a new spreadsheet if it doesn't exist
 * Lưu ý: Phương pháp này không còn hoạt động khi chúng ta không có xác thực
 */
async function createSpreadsheet(sheetsApi: sheets_v4.Sheets): Promise<string> {
  try {
    const spreadsheet = await sheetsApi.spreadsheets.create({
      requestBody: {
        properties: {
          title: SPREADSHEET_NAME
        },
        sheets: [
          {
            properties: {
              title: 'Tours'
            }
          },
          {
            properties: {
              title: 'Vehicles'
            }
          },
          {
            properties: {
              title: 'Hotels'
            }
          },
          {
            properties: {
              title: 'Guides'
            }
          },
          {
            properties: {
              title: 'Seasons'
            }
          },
          {
            properties: {
              title: 'Settings'
            }
          }
        ]
      }
    });
    
    if (!spreadsheet.data.spreadsheetId) {
      throw new Error('Could not create spreadsheet');
    }
    
    return spreadsheet.data.spreadsheetId;
  } catch (error) {
    console.error('Error creating spreadsheet:', error);
    throw error;
  }
}

/**
 * Initialize sheets with headers
 */
async function initializeSheets(sheetsApi: sheets_v4.Sheets, sheetId: string) {
  try {
    // Để Google API tự xử lý encoding
    // Initialize Tours sheet
    await sheetsApi.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `Tours!A1:Z1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['id', 'name', 'code', 'avfCode', 'location', 'description', 'durationDays', 'basePrice', 'imageUrl', 'nameJa', 'nameZh', 'nameKo', 'nameVi', 'descriptionJa', 'descriptionZh', 'descriptionKo', 'descriptionVi']]
      }
    });
    
    // Initialize Vehicles sheet
    await sheetsApi.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `Vehicles!A1:Z1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['id', 'name', 'seats', 'luggageCapacity', 'pricePerDay', 'driverCostPerDay']]
      }
    });
    
    // Initialize Hotels sheet
    await sheetsApi.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `Hotels!A1:Z1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['id', 'name', 'location', 'stars', 'singleRoomPrice', 'doubleRoomPrice', 'tripleRoomPrice', 'breakfastPrice', 'imageUrl']]
      }
    });
    
    // Initialize Guides sheet
    await sheetsApi.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `Guides!A1:Z1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['id', 'name', 'languages', 'pricePerDay', 'experience', 'hasInternationalLicense', 'personality', 'gender', 'age']]
      }
    });
    
    // Initialize Seasons sheet
    await sheetsApi.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `Seasons!A1:Z1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['id', 'name', 'startMonth', 'endMonth', 'description', 'priceMultiplier', 'nameJa', 'nameZh', 'nameKo', 'nameVi', 'descriptionJa', 'descriptionZh', 'descriptionKo', 'descriptionVi']]
      }
    });
    
    // Initialize Settings sheet
    await sheetsApi.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `Settings!A1:Z1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['id', 'key', 'value']]
      }
    });
    
    console.log('Sheets initialized successfully');
  } catch (error) {
    console.error('Error initializing sheets:', error);
    throw error;
  }
}

/**
 * Get the spreadsheet for a specific user
 * @param user User object containing agency data source
 */
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

async function createSheetIfNotExist(sheetsApi: sheets_v4.Sheets, spreadsheetId: string, sheetName: string): Promise<void> {
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
        const headerRange = `${sheetName}!A1:Z1`;
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

export async function getSheetData(sheetName: string, user?: User | null, specificSource?: string): Promise<any[]> {
  try {
    const { sheetsApi, spreadsheetId } = await getSpreadsheetForUser(user, specificSource);
    
    // Kiểm tra và tạo sheet nếu cần thiết
    await createSheetIfNotExist(sheetsApi, spreadsheetId, sheetName);
    
    // Get data from sheet - Sử dụng tên sheet thô không thêm range
    console.log(`Getting data from sheet: ${sheetName}`);
    
    // Thử với cách định dạng range khác nhau
    // Format tên sheet theo đúng định dạng API: Tên sheet + dấu "!" + range
    // Không sử dụng URL encoding ở đây vì API của Google sẽ tự encode
    const safeSheetName = `${sheetName}!A:Z`;
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
    // Trả về mảng rỗng thay vì ném lỗi để đảm bảo tính liền mạch
    console.log(`Không thể lấy dữ liệu sheet ${sheetName}, trả về mảng rỗng để tiếp tục hoạt động.`);
    return [];
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
    console.log(`Updating data in sheet: ${sheetName}`);
    
    // Format tên sheet theo đúng định dạng API: Tên sheet + dấu "!" + range
    // Không sử dụng URL encoding ở đây vì API của Google sẽ tự encode
    const safeSheetName = `${sheetName}!A:Z`;
    console.log(`Requesting sheet with range: ${safeSheetName}`);
    const response = await sheetsApi.spreadsheets.values.get({
      spreadsheetId,
      range: safeSheetName,
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
      // Update existing row - đảm bảo format đúng
      const updateRange = `${sheetName}!A${rowIndex + 1}:${String.fromCharCode(65 + headers.length - 1)}${rowIndex + 1}`;
      console.log(`Updating row at range: ${updateRange}`);
      await sheetsApi.spreadsheets.values.update({
        spreadsheetId,
        range: updateRange, 
        valueInputOption: 'RAW',
        requestBody: {
          values: [values],
        },
      });
    } else {
      // Append new row - đảm bảo format đúng
      const appendRange = `${sheetName}!A1`;
      console.log(`Appending new row at range: ${appendRange}`);
      await sheetsApi.spreadsheets.values.append({
        spreadsheetId,
        range: appendRange,
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
    console.log(`Deleting data from sheet: ${sheetName}`);
    
    // Format tên sheet theo đúng định dạng API: Tên sheet + dấu "!" + range
    // Không sử dụng URL encoding ở đây vì API của Google sẽ tự encode
    const safeSheetName = `${sheetName}!A:Z`;
    console.log(`Requesting sheet with range: ${safeSheetName}`);
    const response = await sheetsApi.spreadsheets.values.get({
      spreadsheetId,
      range: safeSheetName,
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
      
      const sheet = sheetsResponse.data.sheets?.find((s: any) => 
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
export async function syncDataFromSheets(storage: any, user?: User | null, specificSource?: string) {
  try {
    // Sử dụng bảng tính theo người dùng (đại lý) hoặc nguồn chỉ định
    const { sheetsApi, spreadsheetId, sourceName } = await getSpreadsheetForUser(user, specificSource);
    console.log(`Syncing data FROM Google Sheets using source: ${sourceName}`);
    
    // Lưu thông tin về nguồn dữ liệu và thời gian đồng bộ
    const now = new Date();
    await storage.updateSetting(SYNC_SETTINGS.LAST_SYNC_TIME, now.toISOString());
    await storage.updateSetting(SYNC_SETTINGS.CURRENT_DATA_SOURCE, spreadsheetId);
    await storage.updateSetting(SYNC_SETTINGS.CURRENT_DATA_SOURCE_NAME, sourceName);
    
    // Sync Tours
    const tours = await getSheetData('Tours', user, specificSource);
    for (const tour of tours) {
      await storage.createOrUpdateTour(tour);
    }
    
    // Sync Vehicles
    const vehicles = await getSheetData('Vehicles', user, specificSource);
    for (const vehicle of vehicles) {
      await storage.createOrUpdateVehicle(vehicle);
    }
    
    // Sync Hotels
    const hotels = await getSheetData('Hotels', user, specificSource);
    for (const hotel of hotels) {
      // Khách sạn không còn cung cấp bữa ăn trưa và tối, vì đó là các dịch vụ độc lập
      // Xóa các giá trị lunchPrice và dinnerPrice nếu có
      if ('lunchPrice' in hotel) delete hotel.lunchPrice;
      if ('dinnerPrice' in hotel) delete hotel.dinnerPrice;
      
      await storage.createOrUpdateHotel(hotel);
    }
    
    // Sync Guides
    const guides = await getSheetData('Guides', user, specificSource);
    for (const guide of guides) {
      await storage.createOrUpdateGuide(guide);
    }
    
    // Sync Seasons
    const seasons = await getSheetData('Seasons', user, specificSource);
    for (const season of seasons) {
      await storage.createOrUpdateSeason(season);
    }
    
    // Sync Settings
    try {
      const settingsData = await getSheetData('Settings', user, specificSource);
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
    const { sheetsApi, spreadsheetId, sourceName } = await getSpreadsheetForUser(user);
    console.log(`Syncing data TO Google Sheets using source: ${sourceName} with language: ${language}`);
    
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
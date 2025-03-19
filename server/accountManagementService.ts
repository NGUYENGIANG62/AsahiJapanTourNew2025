/**
 * Account Management Service
 * Service này sử dụng Google Sheet để quản lý tài khoản người dùng
 * Cho phép tạo và xác thực tài khoản người dùng từ một nguồn dữ liệu trung tâm
 */

import { JWT } from 'google-auth-library';
import { sheets_v4, google } from 'googleapis';
import { User } from '@shared/schema';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// Interface cho thông tin tài khoản từ Google Sheet
interface AccountInfo {
  id: number;
  username: string;
  password: string;
  role: 'admin' | 'user' | 'agent';
  agencyId: string | null;
  dataSource: string | null;
}

// Thông tin cơ bản về Google Sheet
interface SheetInfo {
  sheetsApi: sheets_v4.Sheets;
  spreadsheetId: string;
}

// Cache dữ liệu để tránh gọi API quá nhiều
let accountsCache: AccountInfo[] = [];
let lastCacheUpdate: Date | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 phút

/**
 * Lấy Google Sheets API và ID của Account Sheet
 */
async function getAccountSheet(): Promise<SheetInfo> {
  // Lấy thông tin xác thực từ biến môi trường
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  const spreadsheetUrl = process.env.ACCOUNT_MANAGEMENT_SHEET_URL;

  // Trường hợp không tìm thấy thông tin xác thực Service Account
  // vẫn cho phép sử dụng storage nội bộ mà không gây lỗi
  // Admin user sẽ luôn được xác thực qua internal storage
  if (!email || !key || !spreadsheetUrl) {
    console.warn('GoogleSheet không khả dụng: Thiếu thông tin xác thực hoặc URL Sheet');
    // Thay vì ném lỗi, tạo một đối tượng fake để tránh lỗi khi gọi API
    // Khi này, các API khác sẽ fallback về storage nội bộ
    return {
      sheetsApi: {} as any,
      spreadsheetId: 'fake-spreadsheet-id'
    };
  }

  try {
    // Xác thực với Google API
    const auth = new JWT({
      email,
      key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Khởi tạo Sheets API
    const sheetsApi = google.sheets({ version: 'v4', auth });

    // Trích xuất ID từ URL
    const spreadsheetId = getSpreadsheetIdFromUrl(spreadsheetUrl);
    if (!spreadsheetId) {
      throw new Error('Invalid spreadsheet URL');
    }

    return { sheetsApi, spreadsheetId };
  } catch (error) {
    console.error('Error initializing Google Sheets API:', error);
    throw new Error('Failed to connect to Google Sheets');
  }
}

/**
 * Lấy ID Sheet từ URL
 */
function getSpreadsheetIdFromUrl(url: string): string | null {
  const regex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * Hàm để lấy dữ liệu từ sheet tài khoản
 */
async function fetchAccountsFromSheet(): Promise<AccountInfo[]> {
  // Kiểm tra cache
  if (lastCacheUpdate && (new Date().getTime() - lastCacheUpdate.getTime() < CACHE_TTL)) {
    return accountsCache;
  }

  try {
    // Lấy thông tin API và ID
    const { sheetsApi, spreadsheetId } = await getAccountSheet();

    // Đọc dữ liệu từ sheet
    // Kiểm tra nếu đang sử dụng sheetsApi giả hoặc không có phương thức cần thiết
    if (!sheetsApi.spreadsheets || !sheetsApi.spreadsheets.values || !sheetsApi.spreadsheets.values.get) {
      console.warn('AccountSheet: Sử dụng sheetsApi giả, bỏ qua lấy dữ liệu từ sheet');
      return [];
    }
    
    let valuesData: any[][] = [];
    
    try {
      const response = await sheetsApi.spreadsheets.values.get({
        spreadsheetId,
        range: 'Admin_account!A1:D100',
      });
      
      valuesData = response?.data?.values || [];
      
      if (valuesData.length <= 1) {
        // Chỉ có header hoặc không có dữ liệu
        return [];
      }
    } catch (error) {
      console.warn('Lỗi khi lấy dữ liệu từ sheet Admin_account:', error);
      return [];
    }
    
    // Parse dữ liệu, bỏ qua hàng header
    const accounts: AccountInfo[] = [];
    for (let i = 1; i < valuesData.length; i++) {
      const rowData = valuesData[i];
      if (rowData && rowData[0] && rowData[1]) { // phải có ít nhất username và password
        accounts.push({
          id: i,
          username: rowData[0],
          password: rowData[1],
          role: (rowData[2] || 'user') as 'admin' | 'user' | 'agent',
          dataSource: rowData[3] || null,
          agencyId: null, // Để null vì chưa có trong sheet
        });
      }
    }

    // Cập nhật cache
    accountsCache = accounts;
    lastCacheUpdate = new Date();

    return accounts;
  } catch (error) {
    console.error('Error fetching accounts from sheet:', error);
    // Trả về cache cũ nếu có lỗi
    return accountsCache.length > 0 ? accountsCache : [];
  }
}

/**
 * Thêm tài khoản mới vào sheet
 */
async function addAccountToSheet(account: {
  username: string;
  password: string;
  role: 'admin' | 'user' | 'agent';
  dataSource?: string | null;
}): Promise<AccountInfo> {
  try {
    // Lấy thông tin API và ID
    const { sheetsApi, spreadsheetId } = await getAccountSheet();

    // Lưu mật khẩu gốc vào Google Sheet
    // Mật khẩu trong Google Sheet được lưu ở dạng gốc (không hash)
    // để dễ đọc và quản lý. Khi import vào hệ thống sẽ hash
    
    // Chuẩn bị dữ liệu hàng mới
    const rowData = [
      account.username,
      account.password, // Lưu mật khẩu gốc
      account.role,
      account.dataSource || ''
    ];

    // Thêm vào sheet
    await sheetsApi.spreadsheets.values.append({
      spreadsheetId,
      range: 'Admin_account!A:D',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData]
      }
    });

    // Làm mới cache
    const accounts = await fetchAccountsFromSheet();
    
    // Tìm tài khoản mới thêm vào
    const newAccount = accounts.find(a => a.username === account.username);
    if (!newAccount) {
      throw new Error('Failed to create account');
    }

    return newAccount;
  } catch (error) {
    console.error('Error adding account to sheet:', error);
    throw new Error('Failed to create account');
  }
}

/**
 * Cập nhật mật khẩu tài khoản
 */
async function updateAccountPassword(username: string, newPassword: string): Promise<boolean> {
  try {
    // Không cho phép thay đổi mật khẩu của tài khoản admin từ Google Sheet
    if (username === 'AsahiVietLifeJapanTour') {
      console.log('Cannot update admin password from Google Sheet. Admin account is protected.');
      return false;
    }

    // Lấy danh sách tài khoản
    const accounts = await fetchAccountsFromSheet();
    const accountIndex = accounts.findIndex(a => a.username === username);
    if (accountIndex === -1) {
      return false;
    }

    // Lấy thông tin API và ID
    const { sheetsApi, spreadsheetId } = await getAccountSheet();

    // Lưu mật khẩu gốc trong Google Sheet (không hash)
    // Quan trọng: Mật khẩu được lưu ở định dạng gốc trong Google Sheet
    // nhưng hệ thống storage sẽ lưu dưới dạng hashed
    
    // Cập nhật mật khẩu (sheet index bắt đầu từ 1 và có header, nên +2)
    await sheetsApi.spreadsheets.values.update({
      spreadsheetId,
      range: `Admin_account!B${accountIndex + 2}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[newPassword]] // Lưu mật khẩu gốc trong sheet để dễ đọc
      }
    });

    // Làm mới cache
    await fetchAccountsFromSheet();
    
    return true;
  } catch (error) {
    console.error('Error updating account password:', error);
    return false;
  }
}

/**
 * Xóa tài khoản
 */
async function deleteAccount(username: string): Promise<boolean> {
  try {
    // Không cho phép xóa tài khoản admin từ Google Sheet
    if (username === 'AsahiVietLifeJapanTour') {
      console.log('Cannot delete admin account from Google Sheet. Admin account is protected.');
      return false;
    }
    
    // Lấy danh sách tài khoản
    const accounts = await fetchAccountsFromSheet();
    const accountIndex = accounts.findIndex(a => a.username === username);
    if (accountIndex === -1) {
      return false;
    }

    // Lấy thông tin API và ID
    const { sheetsApi, spreadsheetId } = await getAccountSheet();

    // Xóa hàng (cần thực hiện batchUpdate thay vì đơn giản là clear cell)
    await sheetsApi.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0, // Giả sử Admin_account là sheet đầu tiên
                dimension: 'ROWS',
                startIndex: accountIndex + 1, // +1 vì có header
                endIndex: accountIndex + 2 // +2 vì endIndex là exclusive
              }
            }
          }
        ]
      }
    });

    // Làm mới cache
    await fetchAccountsFromSheet();
    
    return true;
  } catch (error) {
    console.error('Error deleting account:', error);
    return false;
  }
}

/**
 * Hàm hash mật khẩu
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

/**
 * Hàm so sánh mật khẩu
 */
export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

/**
 * API chính để xác thực người dùng từ sheet
 */
export async function validateCredentials(username: string, password: string): Promise<User | null> {
  try {
    // Đặc biệt xử lý tài khoản admin
    if (username === 'AsahiVietLifeJapanTour') {
      console.log("Detected admin login attempt, using internal authentication only");
      // Tài khoản admin chỉ được xác thực trong storage nội bộ
      return null;
    }
    
    // Lấy danh sách tài khoản
    const accounts = await fetchAccountsFromSheet();
    
    // Tìm tài khoản theo username
    const account = accounts.find(a => a.username === username);
    if (!account) {
      return null;
    }

    // Kiểm tra mật khẩu
    // Trong Google Sheets, mật khẩu được lưu ở dạng gốc, nên đối chiếu trực tiếp
    // Nếu mật khẩu bao gồm dấu "." thì có thể là mật khẩu đã hash, 
    // thì dùng comparePasswords
    const isPasswordHashed = account.password.includes('.');
    
    let isValid = false;
    if (isPasswordHashed) {
      isValid = await comparePasswords(password, account.password);
    } else {
      // Mật khẩu lưu dạng gốc, so sánh trực tiếp
      isValid = (password === account.password);
    }
    
    if (!isValid) {
      return null;
    }

    // Trả về thông tin user (bao gồm trường password để tương thích với User type)
    return {
      id: account.id,
      username: account.username,
      password: account.password, // Thêm password để tương thích với type User
      role: account.role,
      agencyId: account.agencyId || null,
      dataSource: account.dataSource || null,
    };
  } catch (error) {
    console.error('Error validating credentials:', error);
    return null;
  }
}

/**
 * Lấy danh sách tất cả tài khoản
 */
export async function getAllAccounts(): Promise<User[]> {
  const accounts = await fetchAccountsFromSheet();
  
  // Loại bỏ tài khoản admin khỏi danh sách kết quả
  // để không cập nhật tài khoản admin từ Google Sheet
  const filteredAccounts = accounts.filter(account => 
    account.username !== 'AsahiVietLifeJapanTour'
  );
  
  return filteredAccounts.map(account => ({
    id: account.id,
    username: account.username,
    password: account.password, // Thêm password để tương thích với type User
    role: account.role,
    agencyId: account.agencyId || null,
    dataSource: account.dataSource || null,
  }));
}

/**
 * Tạo tài khoản mới
 */
export async function createAccount(userData: {
  username: string;
  password: string;
  role: 'admin' | 'user' | 'agent';
  agencyId?: string | null;
  dataSource?: string | null;
}): Promise<User | null> {
  try {
    // Không cho phép tạo tài khoản admin từ Google Sheet
    if (userData.username === 'AsahiVietLifeJapanTour' || userData.role === 'admin') {
      if (userData.username === 'AsahiVietLifeJapanTour') {
        throw new Error('Cannot create admin account. Admin account is protected.');
      }
      // Tài khoản admin khác, cần xác nhận thêm
      console.warn('Warning: Attempting to create admin account', userData.username);
    }
    
    // Kiểm tra tài khoản đã tồn tại chưa
    const accounts = await fetchAccountsFromSheet();
    const existingAccount = accounts.find(a => a.username === userData.username);
    if (existingAccount) {
      throw new Error('Username already exists');
    }

    // Thêm tài khoản mới
    const newAccount = await addAccountToSheet(userData);
    
    // Ép kiểu về interface User để tương thích
    const user: User = {
      id: newAccount.id,
      username: newAccount.username,
      password: newAccount.password,
      role: newAccount.role,
      agencyId: newAccount.agencyId || null,
      dataSource: newAccount.dataSource || null,
    };
    
    return user;
  } catch (error) {
    console.error('Error creating account:', error);
    return null;
  }
}

/**
 * Cập nhật thông tin tài khoản (ngoại trừ mật khẩu)
 * Hiện tại chưa hỗ trợ vì cần thêm cột trong sheet
 */
export async function updateAccount(
  username: string, 
  data: Partial<{ role: 'user' | 'agent'; agencyId: string | null; dataSource: string | null; }>
): Promise<User | null> {
  // Chưa triển khai
  return null;
}

/**
 * Đổi mật khẩu tài khoản
 */
export async function changePassword(username: string, newPassword: string): Promise<boolean> {
  return await updateAccountPassword(username, newPassword);
}

/**
 * Xóa tài khoản
 */
export async function removeAccount(username: string): Promise<boolean> {
  return await deleteAccount(username);
}

/**
 * Kiểm tra sheet tài khoản đã sẵn sàng chưa
 */
export async function isAccountSheetReady(): Promise<boolean> {
  try {
    await getAccountSheet();
    return true;
  } catch (error) {
    return false;
  }
}

// Khởi tạo cache khi bắt đầu
fetchAccountsFromSheet().catch(err => {
  console.error('Failed to initialize account cache:', err);
});
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

  if (!email || !key) {
    throw new Error('Missing Google Service Account credentials');
  }

  if (!spreadsheetUrl) {
    throw new Error('Missing Account Management Sheet URL');
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
    const response = await sheetsApi.spreadsheets.values.get({
      spreadsheetId,
      range: 'Admin_account!A1:D100',
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) {
      // Chỉ có header hoặc không có dữ liệu
      return [];
    }

    // Parse dữ liệu, bỏ qua hàng header
    const accounts: AccountInfo[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[0] && row[1]) { // phải có ít nhất username và password
        accounts.push({
          id: i,
          username: row[0],
          password: row[1],
          role: (row[2] || 'user') as 'admin' | 'user' | 'agent',
          dataSource: row[3] || null,
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

    // Hash mật khẩu nếu chưa được hash
    let hashedPassword = account.password;
    if (!hashedPassword.includes('.')) {
      hashedPassword = await hashPassword(account.password);
    }

    // Chuẩn bị dữ liệu hàng mới
    const rowData = [
      account.username,
      hashedPassword,
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
    // Lấy danh sách tài khoản
    const accounts = await fetchAccountsFromSheet();
    const accountIndex = accounts.findIndex(a => a.username === username);
    if (accountIndex === -1) {
      return false;
    }

    // Lấy thông tin API và ID
    const { sheetsApi, spreadsheetId } = await getAccountSheet();

    // Hash mật khẩu mới
    const hashedPassword = await hashPassword(newPassword);

    // Cập nhật mật khẩu (sheet index bắt đầu từ 1 và có header, nên +2)
    await sheetsApi.spreadsheets.values.update({
      spreadsheetId,
      range: `Admin_account!B${accountIndex + 2}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[hashedPassword]]
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
    // Lấy danh sách tài khoản
    const accounts = await fetchAccountsFromSheet();
    
    // Tìm tài khoản theo username
    const account = accounts.find(a => a.username === username);
    if (!account) {
      return null;
    }

    // Kiểm tra mật khẩu
    const isValid = await comparePasswords(password, account.password);
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
  return accounts.map(account => ({
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
    // Kiểm tra tài khoản đã tồn tại chưa
    const accounts = await fetchAccountsFromSheet();
    const existingAccount = accounts.find(a => a.username === userData.username);
    if (existingAccount) {
      throw new Error('Username already exists');
    }

    // Thêm tài khoản mới
    const newAccount = await addAccountToSheet(userData);
    
    return {
      id: newAccount.id,
      username: newAccount.username,
      password: newAccount.password, // Thêm password để tương thích với type User
      role: newAccount.role,
      agencyId: newAccount.agencyId || null,
      dataSource: newAccount.dataSource || null,
    };
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
import bcrypt from 'bcrypt';
import { storage } from './storage';
import { User } from '@shared/schema';
import { syncDataFromSheets } from './googleSheetsServiceFixed';
import * as accountService from './accountManagementService';

/**
 * Xác thực thông tin đăng nhập
 * Sẽ kiểm tra từ dịch vụ quản lý tài khoản trước, nếu không thành công sẽ kiểm tra từ storage
 */
export async function validateCredentials(username: string, password: string): Promise<User | null> {
  try {
    // Trước tiên, thử xác thực từ Google Sheet cho tất cả tài khoản (kể cả admin)
    // Vì người dùng muốn quản lý tất cả tài khoản qua Google Sheet
    const accountUser = await accountService.validateCredentials(username, password);
    if (accountUser) {
      console.log(`User '${username}' authenticated via Google Sheet`);
      return accountUser;
    }
    
    // Nếu không tìm thấy trong Google Sheet, thử xác thực từ storage nội bộ
    console.log(`Attempting to authenticate user '${username}' from internal storage`);
    const user = await storage.getUserByUsername(username);
    if (!user) {
      console.log(`User '${username}' not found in internal storage`);
      return null;
    }
    
    // Kiểm tra mật khẩu - giữ nguyên dạng gốc
    const isValid = (password === user.password);
    if (!isValid) {
      console.log(`Invalid password for user '${username}'`);
      return null;
    }
    
    console.log(`User '${username}' authenticated via internal storage`);
    return user;
  } catch (error) {
    console.error('Authentication error:', error);
    
    // Fallback để luôn thử storage nếu Account Service có lỗi
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) return null;
      
      // Kiểm tra mật khẩu dạng gốc thay vì dùng bcrypt
      const isValid = (password === user.password);
      if (!isValid) return null;
      
      console.log(`User '${username}' authenticated via legacy storage (fallback)`);
      return user;
    } catch (error) {
      console.error('Legacy authentication error:', error);
      return null;
    }
  }
}

export function isAdmin(user: User): boolean {
  return user.role === 'admin';
}

// Middleware function to check if user is authenticated
export function isAuthenticated(req: any, res: any, next: any): void {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
}

// Middleware function to check if user is admin
export function isAdminUser(req: any, res: any, next: any): void {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  res.status(403).json({ message: "Not authorized" });
}

// Kiểm tra xem người dùng có quyền đại lý hay không
export function isAgentUser(req: any, res: any, next: any): void {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  if (req.user && req.user.role === 'agent') {
    return next();
  }
  
  res.status(403).json({ message: "Not authorized" });
}

// Middleware kiểm tra người dùng có quyền đại lý hoặc quản trị viên
export function isAdminOrAgentUser(req: any, res: any, next: any): void {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  if (req.user && (req.user.role === 'admin' || req.user.role === 'agent')) {
    return next();
  }
  
  res.status(403).json({ message: "Not authorized" });
}

// Hàm tự động đồng bộ dữ liệu khi người dùng đăng nhập
export function syncOnLogin(user?: User) {
  if (!user) return;
  
  // Nếu là người dùng có vai trò cụ thể, tiến hành đồng bộ từ nguồn dữ liệu tương ứng
  try {
    console.log(`Auto-syncing data for user ${user.username} (${user.role})`);
    
    // Thực hiện đồng bộ dữ liệu từ Google Sheets
    if (user.role === 'agent' || user.role === 'user') {
      // Đồng bộ bất đồng bộ để không làm chậm quá trình đăng nhập
      setTimeout(async () => {
        try {
          if (user.role === 'agent' && user.dataSource) {
            console.log(`Auto-syncing agent data for ${user.username} from source: ${user.dataSource}`);
            await syncDataFromSheets(storage, user);
          } else if (user.role === 'user') {
            console.log(`Auto-syncing customer data for ${user.username} from default source`);
            // Sử dụng nguồn dữ liệu mặc định cho khách hàng thông thường
            await syncDataFromSheets(storage, { ...user, dataSource: null });
          }
          console.log(`Auto-sync completed for ${user.username}`);
        } catch (error) {
          console.error(`Auto-sync failed for ${user.role === 'agent' ? 'agent' : 'customer'}:`, error);
        }
      }, 100);
    }
  } catch (error) {
    console.error("Error in syncOnLogin:", error);
  }
}

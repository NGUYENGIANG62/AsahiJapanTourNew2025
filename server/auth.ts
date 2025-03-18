import bcrypt from 'bcrypt';
import { storage } from './storage';
import { User } from '@shared/schema';
import { syncDataFromSheets } from './googleSheetsService';

export async function validateCredentials(username: string, password: string): Promise<User | null> {
  const user = await storage.getUserByUsername(username);
  if (!user) return null;
  
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return null;
  
  return user;
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

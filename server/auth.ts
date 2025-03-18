import bcrypt from 'bcrypt';
import { storage } from './storage';
import { User } from '@shared/schema';

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

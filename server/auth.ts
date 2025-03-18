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

// Middleware function version of isAuthenticated
export function isAuthenticated(req: any, res: any, next: any): void {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
}

export function isAdminUser(req: any, res: any, next: any): void {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  res.status(403).json({ message: "Not authorized" });
}

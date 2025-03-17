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

export function isAuthenticated(req: any): boolean {
  return req.isAuthenticated && req.isAuthenticated();
}

export function isAdminUser(req: any): boolean {
  return isAuthenticated(req) && req.user && req.user.role === 'admin';
}

import { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

type LoginResult = {
  success: boolean;
  errorMessage?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
};

// Default context value
const defaultContextValue: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
  checkAuth: async () => {},
};

// Create context
export const AuthContext = createContext<AuthContextType>(defaultContextValue);

// Auth provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<LoginResult> => {
    try {
      setIsLoading(true);
      const response = await apiRequest('POST', '/api/auth/login', { username, password });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        return { success: true };
      } else {
        let errorMessage: string;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || 'Invalid credentials';
        } catch (e) {
          // If the response is not valid JSON
          errorMessage = response.status === 401 
            ? 'Invalid ID or password'
            : `Server error (${response.status})`;
        }
        
        // Don't show toast here - let LoginForm handle error display
        
        return { 
          success: false, 
          errorMessage 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = 'A network error occurred. Please try again later.';
      
      // Don't show toast here - let LoginForm handle error display
      
      return { 
        success: false, 
        errorMessage 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await apiRequest('POST', '/api/auth/logout', {});
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = isAuthenticated && user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

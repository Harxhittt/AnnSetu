import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'donor' | 'volunteer' | 'warehouse' | 'receiver' | null;

interface User {
  id: string;
  phone: string;
  role: UserRole;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (phone: string, otp: string) => Promise<{ success: boolean; isNewUser: boolean }>;
  selectRole: (role: UserRole) => Promise<void>;
  logout: () => void;
  sendOTP: (phone: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('annSetu_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const sendOTP = async (phone: string): Promise<boolean> => {
    // Mock API call - simulate sending OTP
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`OTP sent to ${phone}: 123456`);
        resolve(true);
      }, 1000);
    });
  };

  const login = async (phone: string, otp: string): Promise<{ success: boolean; isNewUser: boolean }> => {
    // Mock API call - simulate OTP verification
    return new Promise((resolve) => {
      setTimeout(() => {
        // Check if user exists (mock check)
        const existingUsers = JSON.parse(localStorage.getItem('annSetu_users') || '[]');
        const existingUser = existingUsers.find((u: User) => u.phone === phone);

        if (existingUser) {
          setUser(existingUser);
          setIsAuthenticated(true);
          localStorage.setItem('annSetu_user', JSON.stringify(existingUser));
          resolve({ success: true, isNewUser: false });
        } else {
          // New user - needs role selection
          resolve({ success: true, isNewUser: true });
        }
      }, 1500);
    });
  };

  const selectRole = async (role: UserRole): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          phone: user?.phone || '',
          role,
          name: `User ${Math.floor(Math.random() * 1000)}`,
        };

        // Save to mock database
        const existingUsers = JSON.parse(localStorage.getItem('annSetu_users') || '[]');
        existingUsers.push(newUser);
        localStorage.setItem('annSetu_users', JSON.stringify(existingUsers));

        setUser(newUser);
        setIsAuthenticated(true);
        localStorage.setItem('annSetu_user', JSON.stringify(newUser));
        resolve();
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('annSetu_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, selectRole, logout, sendOTP }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

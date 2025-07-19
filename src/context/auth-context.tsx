
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { User, AuthContextType, RegisterFormValues, Role } from '@/lib/types';
import { users as mockUsers } from '@/lib/data';

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [users, setUsers] = React.useState<User[]>(mockUsers);
  const router = useRouter();

  React.useEffect(() => {
    // In a real app, you'd verify a token from localStorage or a cookie
    // For this mock, we'll check if a user is in localStorage.
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
        // If no user is logged in, and we are not on public pages, redirect to login
        if (typeof window !== 'undefined' && !['/login', '/register', '/'].includes(window.location.pathname)) {
            router.push('/login');
        }
    }
  }, [router]);

  const login = async (email: string, password: string): Promise<User> => {
    // In a real app, this would be a POST request to your API
    // and you'd use bcrypt.compare(password, user.passwordHash)
    console.log(`Attempting to log in with email: ${email}`);
    const foundUser = users.find((u) => u.email === email);

    if (foundUser) {
      // Mock password check
      if (password === 'password123' || (foundUser.email === 'admin@cryptotaxpro.com' && password === 'admin123')) {
        console.log('Login successful for:', foundUser.name);
        setUser(foundUser);
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        return foundUser;
      }
    }
    console.log('Login failed: Invalid email or password');
    throw new Error('Invalid email or password.');
  };

  const register = async (data: RegisterFormValues): Promise<User> => {
    // In a real app, this would be a POST request to your API
    // which would hash the password and create the user in the DB.
    if (users.some((u) => u.email === data.email)) {
      throw new Error('An account with this email already exists.');
    }

    const role: Role = data.isTaxConsultant ? 'TaxConsultant' : 'Client';

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      passwordHash: 'mock_hashed_password', // In a real app, you'd never store this on the client
      avatarUrl: `https://i.pravatar.cc/150?u=${data.email}`,
      createdAt: new Date().toISOString(),
      role,
    };

    setUsers(prevUsers => [...prevUsers, newUser]);
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    router.push('/login');
  };

  const value = { user, login, logout, register };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

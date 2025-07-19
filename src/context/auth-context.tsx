
'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { User, AuthContextType, RegisterFormValues, Role, EditUserFormValues } from '@/lib/types';
import { users as mockUsers } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [users, setUsers] = React.useState<User[]>(mockUsers);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  React.useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    let currentUser: User | null = null;
    if (storedUser) {
      currentUser = JSON.parse(storedUser);
      setUser(currentUser);
    }

    const publicPages = ['/login', '/register', '/'];
    const isPublicPage = publicPages.includes(pathname);
    
    if (!currentUser && !isPublicPage) {
        router.push('/login');
        return;
    }
    
    // Role-based route protection
    if (currentUser) {
        if (pathname.startsWith('/admin') && currentUser.role !== 'Developer') {
            // Redirect non-developers from admin pages
            router.push('/dashboard'); 
        }
    }

  }, [pathname, router]);

  const login = async (email: string, password: string): Promise<User> => {
    console.log(`Attempting to log in with email: ${email}`);
    const foundUser = users.find((u) => u.email === email);

    if (foundUser) {
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
    if (users.some((u) => u.email === data.email)) {
      throw new Error('An account with this email already exists.');
    }

    const role: Role = data.isTaxConsultant ? 'TaxConsultant' : 'Client';

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      passwordHash: 'mock_hashed_password',
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
  
  const updateUserRole = (userId: string, newRole: Role) => {
    setUsers(prevUsers =>
      prevUsers.map(u => (u.id === userId ? { ...u, role: newRole } : u))
    );
    toast({
        title: "Role Updated",
        description: `User role has been successfully changed to ${newRole}.`
    });
  };

  const deleteUser = (userId: string) => {
    // Prevent deleting yourself - This is also handled by disabling the button in the UI.
    if (user?.id === userId) {
        toast({
            title: "Action Forbidden",
            description: "You cannot delete your own account.",
            variant: "destructive",
        });
        return;
    }
    setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
     toast({
        title: "User Deleted",
        description: `The user has been successfully deleted.`
    });
  };
  
  const updateUser = (userId: string, data: EditUserFormValues) => {
    setUsers(prevUsers =>
      prevUsers.map(u => (u.id === userId ? { ...u, name: data.name, email: data.email } : u))
    );
    // If the updated user is the current user, update the user state as well
    if(user?.id === userId) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
    toast({
      title: "User Updated",
      description: "User details have been successfully updated.",
    });
  };


  const value = { user, users, login, logout, register, updateUserRole, deleteUser, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

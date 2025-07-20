
'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { User, AuthContextType, RegisterFormValues, Role, EditUserFormValues, Invitation } from '@/lib/types';
import { users as mockUsers, invitations as mockInvitations } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [users, setUsers] = React.useState<User[]>(mockUsers);
  const [invitations, setInvitations] = React.useState<Invitation[]>(mockInvitations);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  React.useEffect(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      const storedUsers = localStorage.getItem('users');
      const storedInvitations = localStorage.getItem('invitations');

      let currentUser: User | null = null;
      if (storedUser) {
        currentUser = JSON.parse(storedUser);
        setUser(currentUser);
      }
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        setUsers(mockUsers);
      }
      if (storedInvitations) {
        setInvitations(JSON.parse(storedInvitations));
      } else {
        setInvitations(mockInvitations);
      }

      const publicPages = ['/login', '/register', '/'];
      const isPublicPage = publicPages.includes(pathname);
      
      if (!currentUser && !isPublicPage) {
        router.push('/login');
        return;
      }
      
      if (currentUser) {
        if (pathname.startsWith('/admin') && currentUser.role !== 'Developer') {
          router.push('/dashboard'); 
        }
        if (pathname.startsWith('/staff') && currentUser.role !== 'Developer' && currentUser.role !== 'Staff') {
          router.push('/dashboard');
        }
        if (pathname.startsWith('/consultant') && currentUser.role !== 'TaxConsultant') {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error("Failed to parse auth data from localStorage", error);
      setUser(null);
      setUsers(mockUsers);
      setInvitations(mockInvitations);
    }
  }, [pathname, router]);
  
  React.useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  React.useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  React.useEffect(() => {
    localStorage.setItem('invitations', JSON.stringify(invitations));
  }, [invitations]);

  const login = async (email: string, password: string): Promise<User> => {
    const foundUser = users.find((u) => u.email === email);

    if (foundUser) {
      if (password === 'password123' || (foundUser.email === 'admin@cryptotaxpro.com' && password === 'admin123')) {
        setUser(foundUser);
        return foundUser;
      }
    }
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
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
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
    if (user?.id === userId) {
      toast({ title: "Action Forbidden", description: "You cannot delete your own account.", variant: "destructive" });
      return;
    }
    setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
    toast({ title: "User Deleted", description: `The user has been successfully deleted.` });
  };
  
  const updateUser = (userId: string, data: EditUserFormValues) => {
    let updatedUser: User | undefined;
    const newUsers = users.map(u => {
      if (u.id === userId) {
        updatedUser = { ...u, ...data };
        return updatedUser;
      }
      return u;
    });
    setUsers(newUsers);

    if(user?.id === userId && updatedUser) {
      setUser(updatedUser);
    }
    toast({ title: "User Updated", description: "User details have been successfully updated." });
  };
  
  const removeConsultantAccess = (clientId: string) => {
    const newUsers = JSON.parse(JSON.stringify(users));
    
    const clientIndex = newUsers.findIndex((u: User) => u.id === clientId);
    if (clientIndex === -1) return;

    const client = newUsers[clientIndex];
    const consultantId = client.linkedConsultantId;
    if (!consultantId) return;

    const consultantIndex = newUsers.findIndex((u: User) => u.id === consultantId);

    delete client.linkedConsultantId;

    if (consultantIndex !== -1) {
      const consultant = newUsers[consultantIndex];
      consultant.linkedClientIds = (consultant.linkedClientIds || []).filter(
        (id: string) => id !== clientId
      );
    }
    
    setUsers(newUsers);
    
    // Also update the currently logged-in user object if it's the client
    if (user?.id === clientId) {
      const updatedCurrentUser = { ...user };
      delete updatedCurrentUser.linkedConsultantId;
      setUser(updatedCurrentUser);
    }

    toast({ title: "Consultant Unlinked", description: "Access has been successfully removed." });
  };
  
  const sendInvitation = (consultantEmail: string) => {
    if (!user || user.role !== 'Client') throw new Error("Only clients can send invitations.");
    
    const consultant = users.find(u => u.email === consultantEmail && u.role === 'TaxConsultant');
    if (!consultant) throw new Error("No tax consultant found with this email.");
    if (user.linkedConsultantId === consultant.id) throw new Error("You are already linked with this consultant.");

    if (invitations.some(inv => inv.fromClientId === user.id && inv.toConsultantEmail === consultantEmail && inv.status === 'pending')) {
      throw new Error("You already have a pending invitation for this consultant.");
    }

    const newInvitation: Invitation = {
      id: `inv-${Date.now()}`,
      fromClientId: user.id,
      toConsultantEmail: consultantEmail,
      status: 'pending',
    };
    setInvitations(prev => [...prev, newInvitation]);
    
    const newUsers = JSON.parse(JSON.stringify(users));
    const userIndex = newUsers.findIndex((u: User) => u.id === user.id);
    if (userIndex !== -1) {
      const clientUser = newUsers[userIndex];
      clientUser.sentInvites = [...(clientUser.sentInvites || []), { consultantEmail, status: 'pending' }];
      setUsers(newUsers);
      setUser(clientUser);
    }
  };
  
  const acceptInvitation = (invitationId: string) => {
    const invitation = invitations.find(inv => inv.id === invitationId);
    if (!invitation || !user || user.role !== 'TaxConsultant') return;

    const newUsers = JSON.parse(JSON.stringify(users));
    
    const clientIndex = newUsers.findIndex((u: User) => u.id === invitation.fromClientId);
    const consultantIndex = newUsers.findIndex((u: User) => u.id === user.id);

    if (clientIndex === -1 || consultantIndex === -1) return;

    const client = newUsers[clientIndex];
    const consultant = newUsers[consultantIndex];

    client.linkedConsultantId = user.id;
    client.sentInvites = (client.sentInvites || []).filter(
      (si: any) => si.consultantEmail !== invitation.toConsultantEmail
    );

    consultant.linkedClientIds = [...(consultant.linkedClientIds || []), invitation.fromClientId];

    setUsers(newUsers);
    setUser(consultant);
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
  };
  
  const rejectInvitation = (invitationId: string) => {
    const invitation = invitations.find(inv => inv.id === invitationId);
    if (!invitation || !user) return;
    
    const newUsers = JSON.parse(JSON.stringify(users));
    const clientIndex = newUsers.findIndex((u: User) => u.id === invitation.fromClientId);
    
    if (clientIndex !== -1) {
      const client = newUsers[clientIndex];
      client.sentInvites = (client.sentInvites || []).filter(
        (si: any) => si.consultantEmail !== invitation.toConsultantEmail
      );
      
      setUsers(newUsers);
      
      if (user.id === invitation.fromClientId) {
        setUser(client);
      }
    }
    
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
  };

  const value = { user, users, invitations, login, logout, register, updateUserRole, deleteUser, updateUser, removeConsultantAccess, sendInvitation, acceptInvitation, rejectInvitation };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

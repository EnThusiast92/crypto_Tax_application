
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
    // Load state from localStorage on mount
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
            setUsers(mockUsers); // Initialize if not present
        }
        if (storedInvitations) {
            setInvitations(JSON.parse(storedInvitations));
        } else {
            setInvitations(mockInvitations); // Initialize if not present
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
        // Reset to defaults if localStorage is corrupt
        setUser(null);
        setUsers(mockUsers);
        setInvitations(mockInvitations);
    }
  }, [pathname, router]);
  
  // Persist state to localStorage whenever it changes
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
    localStorage.clear(); // Clear all app state on logout
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
    setUsers(prevUsers =>
      prevUsers.map(u => {
        if (u.id === userId) {
            updatedUser = { ...u, ...data };
            return updatedUser;
        }
        return u;
      })
    );
    if(user?.id === userId && updatedUser) {
        setUser(updatedUser);
    }
    toast({ title: "User Updated", description: "User details have been successfully updated." });
  };
  
  const removeConsultantAccess = (clientId: string) => {
    let consultantId: string | undefined;

    const newUsers = users.map(u => {
      // Find the client and get their linked consultant's ID
      if (u.id === clientId) {
        consultantId = u.linkedConsultantId;
        const { linkedConsultantId, ...restOfUser } = u; // Remove the link
        return restOfUser;
      }
      return u;
    }).map(u => {
      // Find the consultant and remove the client's ID from their list
      if (u.id === consultantId) {
        return { ...u, linkedClientIds: u.linkedClientIds?.filter(id => id !== clientId) };
      }
      return u;
    });
    
    // Update the main users list first
    setUsers(newUsers);

    // If the currently logged-in user is the client who took the action, update their local state
    if (user?.id === clientId) {
        const updatedCurrentUser = newUsers.find(u => u.id === clientId);
        if (updatedCurrentUser) {
            setUser(updatedCurrentUser);
        }
    }
    
    toast({ title: "Consultant Unlinked", description: "Access has been successfully removed." });
  };
  
  const sendInvitation = (consultantEmail: string) => {
    if (!user || user.role !== 'Client') throw new Error("Only clients can send invitations.");
    
    const consultant = users.find(u => u.email === consultantEmail && u.role === 'TaxConsultant');
    if (!consultant) throw new Error("No tax consultant found with this email.");
    if (user.linkedConsultantId === consultant.id) throw new Error("You are already linked with this consultant.");

    // Check for existing pending invites to the same consultant
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
    
    const updatedUser = { ...user, sentInvites: [...(user.sentInvites || []), { consultantEmail, status: 'pending' }] };
    setUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
  };
  
  const acceptInvitation = (invitationId: string) => {
    const invitation = invitations.find(inv => inv.id === invitationId);
    if (!invitation || !user || user.role !== 'TaxConsultant') return;

    // 1. Update invitation status
    setInvitations(prev => prev.map(inv => inv.id === invitationId ? { ...inv, status: 'accepted' } : inv).filter(inv => inv.id !== invitationId));
    
    // 2. Atomically update the users array for both client and consultant
    let updatedConsultant: User | undefined;
    const newUsers = users.map(u => {
      // Link client to consultant
      if (u.id === invitation.fromClientId) {
        return { 
            ...u, 
            linkedConsultantId: user.id, 
            sentInvites: u.sentInvites?.filter(si => si.consultantEmail !== invitation.toConsultantEmail) // Remove invite from client's list
        };
      }
      // Link consultant to client
      if (u.id === user.id) {
        updatedConsultant = { ...u, linkedClientIds: [...(u.linkedClientIds || []), invitation.fromClientId] };
        return updatedConsultant;
      }
      return u;
    });

    // 3. Set the new state
    setUsers(newUsers);

    // 4. Update the current user's state if they are the consultant
    if (updatedConsultant) {
        setUser(updatedConsultant);
    }
  };
  
  const rejectInvitation = (invitationId: string) => {
    const invitation = invitations.find(inv => inv.id === invitationId);
    if (!invitation || !user) return;
    
    // 1. Remove invitation from the central list
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));

    // 2. Remove the sent invite from the client's user object
    const newUsers = users.map(u => {
        if (u.id === invitation.fromClientId) {
            const clientUser = { ...u, sentInvites: u.sentInvites?.filter(si => si.consultantEmail !== invitation.toConsultantEmail) };
            // If the current user is this client, update their local state too
            if (user.id === invitation.fromClientId) {
                setUser(clientUser);
            }
            return clientUser;
        }
        return u;
    });
    setUsers(newUsers);
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

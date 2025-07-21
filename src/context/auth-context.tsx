
'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { User, AuthContextType, RegisterFormValues, Role, EditUserFormValues, Invitation } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  runTransaction,
  arrayUnion,
  arrayRemove,
  getDoc,
} from 'firebase/firestore';

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [users, setUsers] = React.useState<User[]>([]);
  const [invitations, setInvitations] = React.useState<Invitation[]>([]);
  const [loading, setLoading] = React.useState(true); // Add loading state
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const allUsers = usersSnapshot.docs.map(doc => doc.data() as User);
        setUsers(allUsers);
        
        const invitationsSnapshot = await getDocs(collection(db, 'invitations'));
        const allInvitations = invitationsSnapshot.docs.map(doc => doc.data() as Invitation);
        setInvitations(allInvitations);

      } catch (error) {
        console.error("Failed to fetch initial data from Firestore", error);
        toast({ title: 'Error', description: 'Could not connect to the database.', variant: 'destructive' });
      }
    };
    
    fetchInitialData();
  }, [toast]);
  
  React.useEffect(() => {
    // This effect handles authentication state and routing
    const storedUser = localStorage.getItem('currentUser');
    let currentUser: User | null = null;
    if (storedUser) {
      currentUser = JSON.parse(storedUser);
      setUser(currentUser);
    }
    setLoading(false); // Finished loading user from local storage

    const publicPages = ['/login', '/register', '/'];
    const isPublicPage = publicPages.includes(pathname);

    if (!currentUser && !isPublicPage) {
      router.push('/login');
    }

    if (currentUser) {
      if (pathname.startsWith('/admin') && currentUser.role !== 'Developer') router.push('/dashboard');
      if (pathname.startsWith('/staff') && currentUser.role !== 'Developer' && currentUser.role !== 'Staff') router.push('/dashboard');
      if (pathname.startsWith('/consultant') && currentUser.role !== 'TaxConsultant') router.push('/dashboard');
    }
  }, [pathname, router]);

  const login = async (email: string, password: string): Promise<User> => {
    // This is a mock login. In a real app, use Firebase Auth.
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('Invalid email or password.');
    }

    const foundUser = querySnapshot.docs[0].data() as User;

    if (password === 'password123' || (foundUser.email === 'admin@cryptotaxpro.com' && password === 'admin123')) {
        setUser(foundUser);
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        return foundUser;
    }
    throw new Error('Invalid email or password.');
  };

  const register = async (data: RegisterFormValues): Promise<User> => {
    // Check if user exists
    const q = query(collection(db, "users"), where("email", "==", data.email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      throw new Error('An account with this email already exists.');
    }

    const role: Role = data.isTaxConsultant ? 'TaxConsultant' : 'Client';
    const newUserId = `user-${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      name: data.name,
      email: data.email,
      passwordHash: 'mock_hashed_password',
      avatarUrl: `https://i.pravatar.cc/150?u=${data.email}`,
      createdAt: new Date().toISOString(),
      role,
    };
    
    await setDoc(doc(db, "users", newUserId), newUser);
    setUsers(prev => [...prev, newUser]);
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    router.push('/login');
  };

  const updateUserRole = async (userId: string, newRole: Role) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role: newRole });
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
    toast({ title: "Role Updated", description: `User role changed to ${newRole}.` });
  };

  const deleteUser = async (userId: string) => {
    if (user?.id === userId) {
      toast({ title: "Action Forbidden", description: "You cannot delete your own account.", variant: "destructive" });
      return;
    }
    await deleteDoc(doc(db, "users", userId));
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast({ title: "User Deleted", description: "The user has been deleted." });
  };

  const updateUser = async (userId: string, data: EditUserFormValues) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
    const updatedUser = { ...users.find(u => u.id === userId)!, ...data };
    setUsers(prev => prev.map(u => (u.id === userId ? updatedUser : u)));

    if(user?.id === userId) {
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
    toast({ title: "User Updated", description: "User details have been updated." });
  };

  const sendInvitation = async (consultantEmail: string) => {
    if (!user || user.role !== 'Client') throw new Error("Only clients can send invitations.");
    
    const q = query(collection(db, "users"), where("email", "==", consultantEmail), where("role", "==", "TaxConsultant"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) throw new Error("No tax consultant found with this email.");
    
    const consultant = snapshot.docs[0].data() as User;
    if (user.linkedConsultantId === consultant.id) throw new Error("You are already linked with this consultant.");

    const invQ = query(collection(db, 'invitations'), where('fromClientId', '==', user.id), where('toConsultantEmail', '==', consultantEmail), where('status', '==', 'pending'));
    const invSnapshot = await getDocs(invQ);
    if (!invSnapshot.empty) throw new Error("You already have a pending invitation for this consultant.");

    const newInvitationId = `inv-${Date.now()}`;
    const newInvitation: Invitation = {
      id: newInvitationId,
      fromClientId: user.id,
      toConsultantEmail: consultantEmail,
      status: 'pending',
    };
    
    await setDoc(doc(db, 'invitations', newInvitationId), newInvitation);
    setInvitations(prev => [...prev, newInvitation]);

    toast({ title: "Success", description: `Invitation sent to ${consultantEmail}.` });
  };

  const acceptInvitation = async (invitationId: string) => {
    if (!user || user.role !== 'TaxConsultant') return;
    
    await runTransaction(db, async (transaction) => {
      const invRef = doc(db, 'invitations', invitationId);
      const invDoc = await transaction.get(invRef);
      if (!invDoc.exists()) throw new Error("Invitation not found!");
      
      const invitation = invDoc.data() as Invitation;
      const clientRef = doc(db, 'users', invitation.fromClientId);
      const consultantRef = doc(db, 'users', user.id);

      // Update client and consultant docs
      transaction.update(clientRef, { linkedConsultantId: user.id });
      transaction.update(consultantRef, { linkedClientIds: arrayUnion(invitation.fromClientId) });
      
      // Delete the invitation
      transaction.delete(invRef);
    });
    
    // Update local state
    const acceptedInvitation = invitations.find(inv => inv.id === invitationId)!;
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));

    const updatedUsers = users.map(u => {
      if (u.id === user.id) return { ...u, linkedClientIds: [...(u.linkedClientIds || []), acceptedInvitation.fromClientId] };
      if (u.id === acceptedInvitation.fromClientId) return { ...u, linkedConsultantId: user.id };
      return u;
    });
    setUsers(updatedUsers);
    
    const updatedCurrentUser = updatedUsers.find(u => u.id === user.id)!;
    setUser(updatedCurrentUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));

    toast({ title: "Invitation Accepted", description: "Client has been added." });
  };

  const rejectInvitation = async (invitationId: string) => {
    await deleteDoc(doc(db, 'invitations', invitationId));
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    toast({ title: 'Invitation Rejected' });
  };

  const removeConsultantAccess = async (clientId: string) => {
      if (!user) return;
      
      await runTransaction(db, async (transaction) => {
          const clientRef = doc(db, "users", clientId);
          const clientDoc = await transaction.get(clientRef);
          if (!clientDoc.exists()) throw new Error("Client not found!");

          const clientData = clientDoc.data() as User;
          const consultantId = clientData.linkedConsultantId;
          if (!consultantId) return;

          const consultantRef = doc(db, "users", consultantId);
          
          transaction.update(clientRef, { linkedConsultantId: '' });
          transaction.update(consultantRef, { linkedClientIds: arrayRemove(clientId) });
      });

      // Update local state
      const consultantId = user.linkedConsultantId!;
      const updatedUsers = users.map(u => {
          if (u.id === clientId) return { ...u, linkedConsultantId: undefined };
          if (u.id === consultantId) return { ...u, linkedClientIds: u.linkedClientIds?.filter(id => id !== clientId) };
          return u;
      });
      setUsers(updatedUsers);
      
      const updatedCurrentUser = updatedUsers.find(u => u.id === user.id)!;
      setUser(updatedCurrentUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));

      toast({ title: "Consultant Unlinked", description: "Access has been removed." });
  };

  const value = { user, users, invitations, loading, login, logout, register, updateUserRole, deleteUser, updateUser, removeConsultantAccess, sendInvitation, acceptInvitation, rejectInvitation };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

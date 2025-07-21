
'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { User, AuthContextType, RegisterFormValues, Role, EditUserFormValues, Invitation } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { db, auth } from '@/lib/firebase';
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
  onSnapshot,
} from 'firebase/firestore';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from 'firebase/auth';

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [users, setUsers] = React.useState<User[]>([]);
  const [invitations, setInvitations] = React.useState<Invitation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  React.useEffect(() => {
    // Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, get our custom user data from Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUser({ id: userSnap.id, ...userSnap.data() } as User);
        } else {
          // This case might happen if a user is in auth but not in firestore
           setUser(null);
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    // Fetch all users and invitations when the component mounts
    // This could be restricted based on roles in a real app
    const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
        setUsers(snapshot.docs.map(doc => doc.data() as User));
    });

    const invitationsUnsubscribe = onSnapshot(collection(db, 'invitations'), (snapshot) => {
        setInvitations(snapshot.docs.map(doc => doc.data() as Invitation));
    });

    return () => {
        usersUnsubscribe();
        invitationsUnsubscribe();
    }
  }, []);

  React.useEffect(() => {
    if (loading) return; // Don't run routing logic until auth state is determined

    const publicPages = ['/login', '/register', '/'];
    const isPublicPage = publicPages.includes(pathname);

    if (!user && !isPublicPage) {
      router.push('/login');
    }

    if (user) {
        if (isPublicPage || pathname === '/login' || pathname === '/register') {
            switch (user.role) {
                case 'Developer': router.push('/admin/dashboard'); break;
                case 'TaxConsultant': router.push('/consultant/dashboard'); break;
                case 'Staff': router.push('/staff/dashboard'); break;
                default: router.push('/dashboard'); break;
            }
        }
    }
  }, [user, loading, pathname, router]);


  const login = async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
        throw new Error("User data not found in Firestore.");
    }
    return userDoc.data() as User;
  };

  const register = async (data: RegisterFormValues): Promise<User> => {
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const { user: firebaseUser } = userCredential;

    const role: Role = data.isTaxConsultant ? 'TaxConsultant' : 'Client';
    const newUser: User = {
      id: firebaseUser.uid,
      name: data.name,
      email: data.email,
      passwordHash: 'hidden', // Don't store this
      avatarUrl: `https://i.pravatar.cc/150?u=${data.email}`,
      createdAt: new Date().toISOString(),
      role,
    };
    
    await setDoc(doc(db, "users", firebaseUser.uid), newUser);
    return newUser;
  };

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const updateUserRole = async (userId: string, newRole: Role) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role: newRole });
    toast({ title: "Role Updated", description: `User role changed to ${newRole}.` });
  };

  const deleteUser = async (userId: string) => {
    if (auth.currentUser?.uid === userId) {
      toast({ title: "Action Forbidden", description: "You cannot delete your own account.", variant: "destructive" });
      return;
    }
    await deleteDoc(doc(db, "users", userId));
    // Firestore listener will update the local state automatically
    toast({ title: "User Deleted", description: "The user has been deleted." });
  };

  const updateUser = async (userId: string, data: EditUserFormValues) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
     // Firestore listener will update the local state automatically
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
    // The local state will be updated by the listener.

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

      transaction.update(clientRef, { linkedConsultantId: user.id });
      transaction.update(consultantRef, { linkedClientIds: arrayUnion(invitation.fromClientId) });
      
      // Update invitation status to accepted instead of deleting
      transaction.update(invRef, { status: 'accepted' });
    });
    
    toast({ title: "Invitation Accepted", description: "Client has been added." });
  };

  const rejectInvitation = async (invitationId: string) => {
    // Instead of deleting, we can update the status to 'rejected'
    const invRef = doc(db, 'invitations', invitationId);
    await updateDoc(invRef, { status: 'rejected' });
    toast({ title: 'Invitation Rejected' });
  };

  const removeConsultantAccess = async (clientId: string) => {
    if (!user || (user.role !== 'Client' && user.role !== 'Developer')) return;
      
    await runTransaction(db, async (transaction) => {
        const clientRef = doc(db, "users", clientId);
        const clientDoc = await transaction.get(clientRef);
        if (!clientDoc.exists()) throw new Error("Client not found!");

        const clientData = clientDoc.data() as User;
        const consultantId = clientData.linkedConsultantId;
        if (!consultantId) return; // No consultant to remove

        const consultantRef = doc(db, "users", consultantId);
        
        transaction.update(clientRef, { linkedConsultantId: '' }); // Or use deleteField()
        transaction.update(consultantRef, { linkedClientIds: arrayRemove(clientId) });
    });

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

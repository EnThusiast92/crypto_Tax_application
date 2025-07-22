
'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { User, AuthContextType, RegisterFormValues, Role, EditUserFormValues, Invitation } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
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
  Timestamp,
} from 'firebase/firestore';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = { id: userSnap.id, ...userSnap.data() } as User;
            setUser(userData);
          } else {
             console.warn("User exists in Auth, but not in Firestore. Forcing sign out.");
             await signOut(auth);
             setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
          console.error("Auth state change error:", error);
          setUser(null);
      } finally {
          setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (loading) return; 

    const publicPages = ['/login', '/register', '/'];
    const isPublicPage = publicPages.includes(pathname);

    if (!user && !isPublicPage) {
      router.push('/login');
    }

    if (user && (isPublicPage || pathname === '/login' || pathname === '/register')) {
        switch (user.role) {
            case 'Developer': router.push('/admin/dashboard'); break;
            case 'TaxConsultant': router.push('/consultant/dashboard'); break;
            case 'Staff': router.push('/staff/dashboard'); break;
            default: router.push('/dashboard'); break;
        }
    }
  }, [user, loading, pathname, router]);

  // Data fetching listeners that only run when a user is logged in
  React.useEffect(() => {
    if (!user) {
        setUsers([]);
        setInvitations([]);
        return;
    };
    
    // Developer or Staff get all users and invites
    if (user.role === 'Developer' || user.role === 'Staff') {
        const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
            setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
        });
        const invitationsUnsubscribe = onSnapshot(collection(db, 'invitations'), (snapshot) => {
            setInvitations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invitation)));
        });
        return () => { usersUnsubscribe(); invitationsUnsubscribe(); };
    } 
    // Tax Consultant gets their clients and relevant invites
    else if (user.role === 'TaxConsultant') {
        const clientsQuery = query(collection(db, 'users'), where('linkedConsultantId', '==', user.id));
        const clientsUnsubscribe = onSnapshot(clientsQuery, (snapshot) => {
             setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
        });

        const invQuery = query(collection(db, 'invitations'), where('toConsultantEmail', '==', user.email));
        const invUnsubscribe = onSnapshot(invQuery, (snapshot) => {
             setInvitations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invitation)));
        });
        
        return () => { clientsUnsubscribe(); invUnsubscribe(); };
    }
    // Client gets their invites and can see all users (for picking a consultant)
    else if (user.role === 'Client') {
        const invQuery = query(collection(db, 'invitations'), where('fromClientId', '==', user.id));
        const invUnsubscribe = onSnapshot(invQuery, (snapshot) => {
             setInvitations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invitation)));
        });
        
        const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
            setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
        });

        return () => { invUnsubscribe(); usersUnsubscribe(); };
    }
  }, [user]);


  const login = async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      await signOut(auth);
      throw new Error("Login successful, but user data not found in database.");
    }
    const loggedInUser = { id: userDoc.id, ...userDoc.data() } as User;
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (data: RegisterFormValues): Promise<User> => {
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const { user: firebaseUser } = userCredential;
    const role: Role = data.isTaxConsultant ? 'TaxConsultant' : 'Client';
    
    const newUser: Omit<User, 'id'> = {
      name: data.name,
      email: data.email,
      role,
      avatarUrl: `https://i.pravatar.cc/150?u=${data.email}`,
      createdAt: Timestamp.now(),
      linkedClientIds: [],
      linkedConsultantId: '',
    };
    
    await setDoc(doc(db, "users", firebaseUser.uid), newUser);
    const userWithId: User = { ...newUser, id: firebaseUser.uid };
    setUser(userWithId);
    return userWithId;
  };
  
  const signInWithGoogle = async (): Promise<User> => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    let userData: User;

    if (userDoc.exists()) {
      userData = { id: userDoc.id, ...userDoc.data() } as User;
    } else {
      const newUser: Omit<User, 'id'> = {
        name: firebaseUser.displayName || 'Google User',
        email: firebaseUser.email!,
        role: 'Client',
        avatarUrl: firebaseUser.photoURL || `https://i.pravatar.cc/150?u=${firebaseUser.email}`,
        createdAt: Timestamp.now(),
        linkedClientIds: [],
        linkedConsultantId: '',
      };
      await setDoc(userDocRef, newUser);
      userData = { ...newUser, id: firebaseUser.uid };
    }
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
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
    toast({ title: "User Deleted", description: "The user has been deleted from Firestore." });
  };

  const updateUser = async (userId: string, data: EditUserFormValues) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
    if (user?.id === userId) {
        setUser(prev => prev ? {...prev, ...data} : null);
    }
    toast({ title: "User Updated", description: "User details have been updated." });
  };

  const sendInvitation = async (consultantEmail: string) => {
    if (!user || user.role !== 'Client') throw new Error("Only clients can send invitations.");
    
    const q = query(collection(db, "users"), where("email", "==", consultantEmail), where("role", "==", "TaxConsultant"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) throw new Error("No tax consultant found with this email.");
    
    const consultantDoc = snapshot.docs[0];
    const consultantId = consultantDoc.id;

    if (user.linkedConsultantId === consultantId) throw new Error("You are already linked with this consultant.");

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
      transaction.update(invRef, { status: 'accepted' });
    });
    
    toast({ title: "Invitation Accepted", description: "Client has been added." });
  };

  const rejectInvitation = async (invitationId: string) => {
    const invRef = doc(db, 'invitations', invitationId);
    await updateDoc(invRef, { status: 'rejected' });
    toast({ title: 'Invitation Rejected' });
  };

  const removeConsultantAccess = async (clientId: string) => {
      if (!user) return;
    try {
        await runTransaction(db, async (transaction) => {
            const clientRef = doc(db, "users", clientId);
            const clientDoc = await transaction.get(clientRef);
            if (!clientDoc.exists()) throw new Error("Client not found!");

            const clientData = clientDoc.data() as User;
            const consultantId = clientData.linkedConsultantId;
            if (!consultantId) return;

            const consultantRef = doc(db, "users", consultantId);
            
            transaction.update(clientRef, { linkedConsultantId: "" });
            transaction.update(consultantRef, { linkedClientIds: arrayRemove(clientId) });
        });
        
        if (user.id === clientId) {
          setUser(prev => prev ? { ...prev, linkedConsultantId: '' } : null);
        }

        toast({ title: "Consultant Unlinked", description: "Access has been removed." });
    } catch (error) {
        console.error("Failed to remove consultant access:", error);
        toast({ title: "Error", description: "Failed to remove consultant access.", variant: "destructive" });
    }
  };

  const value = { user, users, invitations, loading, login, logout, register, updateUserRole, deleteUser, updateUser, removeConsultantAccess, sendInvitation, acceptInvitation, rejectInvitation, signInWithGoogle };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

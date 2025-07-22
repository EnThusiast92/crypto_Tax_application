
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { User, AuthContextType, RegisterFormValues, Role, EditUserFormValues, Invitation, AppSettings } from '@/lib/types';
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
  documentId,
} from 'firebase/firestore';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    User as FirebaseUser,
} from 'firebase/auth';

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [users, setUsers] = React.useState<User[]>([]);
  const [invitations, setInvitations] = React.useState<Invitation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = { id: userSnap.id, ...userSnap.data() } as User;
            setUser(userData);
          } else {
             console.log("User authenticated, but Firestore doc not found yet. It will be created shortly.");
          }
        } catch (error) {
           console.error("Auth state change error:", error);
           setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  React.useEffect(() => {
    if (!user) {
        setUsers([]);
        setInvitations([]);
        return;
    }

    const unsubscribes: (() => void)[] = [];

    // --- Role-based Data Fetching ---
    
    // Fetch users based on role
    if (user.role === 'Developer' || user.role === 'Staff') {
        const usersUnsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
            setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
        });
        unsubscribes.push(usersUnsubscribe);
    } else if (user.role === 'TaxConsultant' && user.linkedClientIds.length > 0) {
        const usersQuery = query(collection(db, "users"), where(documentId(), "in", user.linkedClientIds));
        const usersUnsubscribe = onSnapshot(usersQuery, (snapshot) => {
            setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
        });
        unsubscribes.push(usersUnsubscribe);
    } else if (user.role === 'Client' && user.linkedConsultantId) {
        const usersQuery = query(collection(db, "users"), where(documentId(), "==", user.linkedConsultantId));
        const usersUnsubscribe = onSnapshot(usersQuery, (snapshot) => {
            setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
        });
        unsubscribes.push(usersUnsubscribe);
    } else {
        // If user is a Client or Consultant with no links, or another role, clear users.
        setUsers([]);
    }

    // Fetch invitations based on role
    if (user.role === 'Developer' || user.role === 'Staff') {
        const invitesUnsubscribe = onSnapshot(collection(db, "invitations"), (snapshot) => {
            setInvitations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invitation)));
        });
        unsubscribes.push(invitesUnsubscribe);
    } else if (user.role === 'TaxConsultant') {
        const invitesQuery = query(collection(db, "invitations"), where("toConsultantEmail", "==", user.email));
        const invitesUnsubscribe = onSnapshot(invitesQuery, (snapshot) => {
            setInvitations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invitation)));
        });
        unsubscribes.push(invitesUnsubscribe);
    } else if (user.role === 'Client') {
        const invitesQuery = query(collection(db, "invitations"), where("fromClientId", "==", user.id));
        const invitesUnsubscribe = onSnapshot(invitesQuery, (snapshot) => {
            setInvitations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invitation)));
        });
        unsubscribes.push(invitesUnsubscribe);
    }

    return () => {
        unsubscribes.forEach(unsub => unsub());
    };
  }, [user]);

  const fetchAndSetUser = async (firebaseUser: FirebaseUser): Promise<User | null> => {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
          const userData = { id: userDoc.id, ...userDoc.data() } as User;
          setUser(userData);
          return userData;
      }
      return null;
  }

  const login = async (email: string, password: string): Promise<User | null> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return await fetchAndSetUser(userCredential.user);
  };
  
   const signInWithGoogle = async (): Promise<User | null> => {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
          const newUser: Omit<User, 'id'> = {
              name: firebaseUser.displayName || 'Google User',
              email: firebaseUser.email!,
              role: 'Client', // Always default to client
              avatarUrl: firebaseUser.photoURL || `https://i.pravatar.cc/150?u=${firebaseUser.email}`,
              createdAt: Timestamp.now(),
              linkedClientIds: [],
              linkedConsultantId: '',
          };
          await setDoc(userDocRef, newUser);
      }
      return await fetchAndSetUser(firebaseUser);
  };

  const register = async (data: RegisterFormValues): Promise<User | null> => {
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const { user: firebaseUser } = userCredential;

    const newUserRef = doc(db, 'users', firebaseUser.uid);
    const newUserDoc: Omit<User, 'id'> = {
      name: data.name,
      email: data.email,
      role: data.isTaxConsultant ? 'TaxConsultant' : 'Client',
      avatarUrl: `https://i.pravatar.cc/150?u=${data.email}`,
      createdAt: Timestamp.now(),
      linkedClientIds: [],
      linkedConsultantId: '',
    };
    
    await setDoc(newUserRef, newUserDoc);
    return await fetchAndSetUser(firebaseUser);
  };
  
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    router.push('/login');
  };
  
  const updateUserRole = async (userId: string, newRole: Role) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role: newRole });
  };

  const deleteUser = async (userId: string) => {
    await deleteDoc(doc(db, "users", userId));
  };

  const updateUser = async (userId: string, data: EditUserFormValues) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
  };
  
  const sendInvitation = async (consultantEmail: string) => {
    if (!user || user.role !== 'Client') throw new Error("Only clients can send invitations.");
    
    const q = query(collection(db, "users"), where("email", "==", consultantEmail), where("role", "==", "TaxConsultant"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) throw new Error("No tax consultant found with this email.");
    
    const consultantId = snapshot.docs[0].id;
    if (user.linkedConsultantId === consultantId) throw new Error("You are already linked with this consultant.");

    const invQ = query(collection(db, 'invitations'), where('fromClientId', '==', user.id), where('toConsultantEmail', '==', consultantEmail), where('status', '==', 'pending'));
    const invSnapshot = await getDocs(invQ);
    if (!invSnapshot.empty) throw new Error("You already have a pending invitation for this consultant.");

    const newInvitation: Omit<Invitation, 'id'> = {
      fromClientId: user.id,
      toConsultantEmail: consultantEmail,
      status: 'pending',
    };
    
    const newDocRef = doc(collection(db, 'invitations'));
    await setDoc(newDocRef, newInvitation);
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
  };

  const rejectInvitation = async (invitationId: string) => {
    const invRef = doc(db, 'invitations', invitationId);
    await updateDoc(invRef, { status: 'rejected' });
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
        
        transaction.update(clientRef, { linkedConsultantId: "" });
        transaction.update(consultantRef, { linkedClientIds: arrayRemove(clientId) });
    });
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

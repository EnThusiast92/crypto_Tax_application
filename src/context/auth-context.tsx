
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
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
  documentId,
  writeBatch,
  addDoc,
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

function useUserData(user: User | null) {
  const [users, setUsers] = React.useState<User[]>([]);
  const [invitations, setInvitations] = React.useState<Invitation[]>([]);

  React.useEffect(() => {
    if (!user) {
      setUsers([]);
      setInvitations([]);
      return;
    }

    const unsubs: (() => void) = [];

    // Listener for invitations
    const invitationsQuery = user.role === 'Client'
      ? query(collection(db, "invitations"), where("fromClientId", "==", user.id))
      : query(collection(db, "invitations"), where("toConsultantEmail", "==", user.email));
      
    const invsUnsub = onSnapshot(invitationsQuery, (snapshot) => {
        const fetchedInvitations = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Invitation));
        setInvitations(fetchedInvitations);

        // This part needs to run inside the invitation listener to react to new invites
        let userIdsToFetch = new Set<string>([user.id]);
        if (user.role === 'Client' && user.linkedConsultantId) {
            userIdsToFetch.add(user.linkedConsultantId);
        }
        if (user.role === 'TaxConsultant' && user.linkedClientIds?.length > 0) {
            user.linkedClientIds.forEach(id => userIdsToFetch.add(id));
        }
        if(user.role === 'TaxConsultant') {
            fetchedInvitations.forEach(inv => {
                if(inv.status === 'pending') userIdsToFetch.add(inv.fromClientId)
            });
        }
        
        let usersQuery;
        if (user.role === 'Developer' || user.role === 'Staff') {
            usersQuery = query(collection(db, 'users'));
        } else {
            const finalUserIds = Array.from(userIdsToFetch).filter(Boolean);
            if (finalUserIds.length > 0) {
                usersQuery = query(collection(db, 'users'), where(documentId(), 'in', finalUserIds));
            }
        }
        
        if (usersQuery) {
            const usersUnsub = onSnapshot(usersQuery, (userSnapshot) => {
                const fetchedUsers = userSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as User));
                setUsers(fetchedUsers);
            }, (error) => {
                console.error("Error fetching users snapshot:", error);
                if (user) setUsers([user]);
            });
            unsubs.push(usersUnsub);
        } else if(user) {
          setUsers([user]);
        }

    }, (error) => {
        console.error("Error fetching invitations:", error);
    });
    unsubs.push(invsUnsub);
      
    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [user]);

  return { users, invitations };
}


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const { users, invitations } = useUserData(user);
  
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUser({ id: userSnap.id, ...userSnap.data() } as User);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Error fetching user document:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
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
    const role: Role = data.isTaxConsultant ? 'TaxConsultant' : 'Client';
    
    const newUserDoc: Omit<User, 'id'> = {
      name: data.name,
      email: data.email,
      role: role,
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
    if (!user || user.role !== 'Client') {
      throw new Error("Only clients can send invitations.");
    }
    
    // Check if consultant exists
    const consultantQuery = query(collection(db, 'users'), where('email', '==', consultantEmail), where('role', '==', 'TaxConsultant'));
    const consultantSnapshot = await getDocs(consultantQuery);
    if(consultantSnapshot.empty) {
        throw new Error("No tax consultant found with this email.");
    }

    const invitationsRef = collection(db, 'invitations');
    
    const q = query(
        invitationsRef,
        where('fromClientId', '==', user.id),
        where('status', '==', 'pending')
    );
    const existingInviteSnapshot = await getDocs(q);
    if (!existingInviteSnapshot.empty) {
        throw new Error("You already have a pending invitation.");
    }
    
    const newInvitation: Omit<Invitation, 'id'> = {
        fromClientId: user.id,
        toConsultantEmail: consultantEmail,
        status: 'pending',
        createdAt: Timestamp.now(),
    };
    await addDoc(invitationsRef, newInvitation);
  };
  
  const acceptInvitation = async (invitationId: string) => {
    if (!user || user.role !== 'TaxConsultant') {
        throw new Error("Only consultants can accept invitations.");
    }
    
    const invRef = doc(db, 'invitations', invitationId);
    
    await runTransaction(db, async (transaction) => {
        const invDoc = await transaction.get(invRef);
        if (!invDoc.exists() || invDoc.data().status !== 'pending') {
            throw new Error("This invitation is no longer valid or has already been actioned.");
        }
      
        const invitation = invDoc.data() as Invitation;
        const clientRef = doc(db, 'users', invitation.fromClientId);
        const consultantRef = doc(db, 'users', user.id);

        const clientDoc = await transaction.get(clientRef);
        if (!clientDoc.exists() || clientDoc.data().linkedConsultantId) {
            throw new Error("Client is not available or already linked to another consultant.");
        }

        transaction.update(clientRef, { linkedConsultantId: user.id });
        transaction.update(consultantRef, { linkedClientIds: arrayUnion(invitation.fromClientId) });
        transaction.update(invRef, { status: 'accepted' });
    });
  };

  const rejectInvitation = async (invitationId: string) => {
    const invRef = doc(db, 'invitations', invitationId);
    await deleteDoc(invRef);
  };

  const cancelInvitation = async (invitationId: string) => {
      const invRef = doc(db, 'invitations', invitationId);
      await deleteDoc(invRef);
  };
  
  const removeConsultantAccess = async (clientId: string) => {
      if (!user || user.role !== 'Client' || clientId !== user.id) {
          throw new Error("You do not have permission to perform this action.");
      }
      
      const consultantId = user.linkedConsultantId;
      
      if (!consultantId) {
          throw new Error("No linked consultant found to remove.");
      }

      const clientRef = doc(db, "users", clientId);
      const consultantRef = doc(db, "users", consultantId);
      
      const batch = writeBatch(db);
      batch.update(clientRef, { linkedConsultantId: "" });
      batch.update(consultantRef, { linkedClientIds: arrayRemove(clientId) });
      
      const invitationsRef = collection(db, 'invitations');
      const q = query(
          invitationsRef,
          where('fromClientId', '==', clientId),
          where('status', '==', 'accepted')
      );
      const acceptedInvites = await getDocs(q);
      acceptedInvites.forEach(d => batch.delete(d.ref));

      await batch.commit();
  };


  const value = { user, users, invitations, loading, login, logout, register, updateUserRole, deleteUser, updateUser, removeConsultantAccess, sendInvitation, acceptInvitation, rejectInvitation, signInWithGoogle, cancelInvitation };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

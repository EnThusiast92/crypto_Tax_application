
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
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userUnsubscribe = onSnapshot(userRef, (userSnap) => {
          if (userSnap.exists()) {
            const userData = { id: userSnap.id, ...userSnap.data() } as User;
            setUser(userData);
          } else {
            setUser(null);
          }
           setLoading(false);
        }, (error) => {
           console.error("User snapshot error:", error);
           setUser(null);
           setLoading(false);
        });
        return () => userUnsubscribe();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);
  
  React.useEffect(() => {
    if (!user) {
      setUsers([]);
      setInvitations([]);
      return;
    }

    let unsubs: (() => void)[] = [];

    const setupListeners = (currentUser: User) => {
      // Listener for invitations
      const invitationsQuery = currentUser.role === 'Client'
        ? query(collection(db, "invitations"), where("fromClientId", "==", currentUser.id))
        : query(collection(db, "invitations"), where("toConsultantEmail", "==", currentUser.email));

      const invsUnsub = onSnapshot(invitationsQuery, (snapshot) => {
        const invs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invitation));
        setInvitations(invs);
      });
      unsubs.push(invsUnsub);
      
      // Listener for users
      // This part fetches users linked to the current user.
      const userIdsToFetch = new Set<string>([currentUser.id]);
      if (currentUser.role === 'Developer' || currentUser.role === 'Staff') {
          // Devs/Staff can see everyone
          const allUsersUnsub = onSnapshot(collection(db, "users"), (snapshot) => {
              const allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
              setUsers(allUsers);
          });
          unsubs.push(allUsersUnsub);
          return; // Exit early
      }

      // For clients and consultants, we derive who to fetch based on links and invitations
      const relatedIdsQuery = currentUser.role === 'Client'
        ? query(collection(db, "invitations"), where("fromClientId", "==", currentUser.id))
        : query(collection(db, "invitations"), where("toConsultantEmail", "==", currentUser.email));
      
      const relatedIdsUnsub = onSnapshot(relatedIdsQuery, async (invsSnapshot) => {
          const fetchedInvitations = invsSnapshot.docs.map(doc => doc.data() as Invitation);
          
          if(currentUser.linkedConsultantId) userIdsToFetch.add(currentUser.linkedConsultantId);
          currentUser.linkedClientIds?.forEach(id => userIdsToFetch.add(id));
          fetchedInvitations.forEach(inv => {
              if (currentUser.role === 'Client') {
                  // Fetch the consultant's profile if we find their email in users collection
                  // This part is tricky without a direct query, so we might need a cloud function in a real app
              } else { // I am a consultant
                  userIdsToFetch.add(inv.fromClientId);
              }
          });
          
          const finalUserIds = Array.from(userIdsToFetch).filter(Boolean);
          if (finalUserIds.length > 0) {
              const usersQuery = query(collection(db, 'users'), where(documentId(), 'in', finalUserIds));
              const usersUnsub = onSnapshot(usersQuery, (usersSnapshot) => {
                   const fetchedUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
                   setUsers(fetchedUsers);
              });
              unsubs.push(usersUnsub);
          } else {
            setUsers([currentUser]);
          }
      });
      unsubs.push(relatedIdsUnsub);

    };

    setupListeners(user);

    return () => {
      unsubs.forEach(unsub => unsub());
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
      acceptedInvites.forEach(doc => batch.delete(doc.ref));

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

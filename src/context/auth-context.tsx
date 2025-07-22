
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
        // Set up a snapshot listener for the user's document
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userUnsubscribe = onSnapshot(userRef, (userSnap) => {
          if (userSnap.exists()) {
            const userData = { id: userSnap.id, ...userSnap.data() } as User;
            setUser(userData);
          } else {
            console.log("User authenticated, but Firestore doc not found yet.");
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

    let unsubscribes: (() => void)[] = [];
    
    // --- Invitations Fetching ---
    let invitesQuery;
    if (user.role === 'Developer' || user.role === 'Staff') {
        invitesQuery = query(collection(db, "invitations"));
    } else if (user.role === 'TaxConsultant') {
        invitesQuery = query(collection(db, "invitations"), where("toConsultantEmail", "==", user.email));
    } else if (user.role === 'Client') {
        invitesQuery = query(collection(db, "invitations"), where("fromClientId", "==", user.id));
    }

    if (invitesQuery) {
        const invitesUnsubscribe = onSnapshot(invitesQuery, async (snapshot) => {
            const receivedInvitations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invitation));
            setInvitations(receivedInvitations);

            // --- User Data Fetching based on Invitations and Links ---
            const clientIdsFromInvites = receivedInvitations.map(inv => inv.fromClientId);
            const linkedClientIds = user.linkedClientIds || [];
            const linkedConsultantId = user.linkedConsultantId ? [user.linkedConsultantId] : [];

            const allUserIdsToFetch = [...new Set([
                user.id, 
                ...clientIdsFromInvites, 
                ...linkedClientIds,
                ...linkedConsultantId
            ])].filter(Boolean); // Remove any null/undefined IDs

            if (allUserIdsToFetch.length > 0) {
                 // Firestore 'in' queries are limited to 30 elements. Chunk if necessary.
                const userDocsPromises = [];
                for (let i = 0; i < allUserIdsToFetch.length; i += 30) {
                    const chunk = allUserIdsToFetch.slice(i, i + 30);
                    const usersQuery = query(collection(db, "users"), where(documentId(), "in", chunk));
                    userDocsPromises.push(getDocs(usersQuery));
                }

                try {
                    const userDocsSnapshots = await Promise.all(userDocsPromises);
                    const fetchedUsers: User[] = [];
                    userDocsSnapshots.forEach(snap => {
                        snap.docs.forEach(doc => {
                             fetchedUsers.push({ id: doc.id, ...doc.data() } as User);
                        })
                    });
                    
                    // For Staff/Devs, we want to show all users, so we'll do a separate fetch for that.
                    if (user.role === 'Developer' || user.role === 'Staff') {
                        const allUsersQuery = query(collection(db, "users"));
                        const allUsersSnapshot = await getDocs(allUsersQuery);
                        const allUsers = allUsersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
                        setUsers(allUsers);
                    } else {
                        setUsers(fetchedUsers);
                    }

                } catch (error) {
                    console.error("Error fetching user documents:", error);
                }

            } else {
                // Still need to load the current user's own data
                const userDoc = await getDoc(doc(db, 'users', user.id));
                if (userDoc.exists()) {
                    setUsers([{ id: userDoc.id, ...userDoc.data() } as User]);
                }
            }
        }, (error) => console.error("Invitations snapshot error:", error));
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
    
    const invitationsRef = collection(db, 'invitations');
    
    const q = query(
        invitationsRef,
        where('fromClientId', '==', user.id),
        where('toConsultantEmail', '==', consultantEmail),
        where('status', '==', 'pending')
    );
    const existingInviteSnapshot = await getDocs(q);
    if (!existingInviteSnapshot.empty) {
        throw new Error("You already have a pending invitation for this consultant.");
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

        // Perform the writes
        transaction.update(clientRef, { linkedConsultantId: user.id });
        transaction.update(consultantRef, { linkedClientIds: arrayUnion(invitation.fromClientId) });
        transaction.update(invRef, { status: 'accepted' });
    });
  };

  const rejectInvitation = async (invitationId: string) => {
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
      
      // Also delete any "accepted" invitations between them to clean up
      const invitationsRef = collection(db, 'invitations');
      const q = query(
          invitationsRef,
          where('fromClientId', '==', clientId),
          where('toConsultantEmail', '==', user.email),
          where('status', '==', 'accepted')
      );
      const acceptedInvites = await getDocs(q);
      acceptedInvites.forEach(doc => batch.delete(doc.ref));

      await batch.commit();
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

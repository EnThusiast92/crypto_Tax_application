
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
    
    let usersQuery;
    // For Developers or Staff, fetch all users.
    if (user.role === 'Developer' || user.role === 'Staff') {
        usersQuery = query(collection(db, "users"));
    } 
    // For Tax Consultants, fetch only their linked clients.
    else if (user.role === 'TaxConsultant' && user.linkedClientIds && user.linkedClientIds.length > 0) {
        usersQuery = query(collection(db, "users"), where(documentId(), "in", user.linkedClientIds));
    } 
    // For Clients, fetch only their linked consultant.
    else if (user.role === 'Client' && user.linkedConsultantId) {
        const consultantRef = doc(db, "users", user.linkedConsultantId);
        const usersUnsubscribe = onSnapshot(consultantRef, (doc) => {
            if (doc.exists()) {
                setUsers([{ id: doc.id, ...doc.data() } as User]);
            } else {
                setUsers([]);
            }
        }, (error) => console.error("Consultant snapshot error:", error));
        unsubscribes.push(usersUnsubscribe);
    }

    if (usersQuery) {
        const usersUnsubscribe = onSnapshot(usersQuery, (snapshot) => {
            setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
        }, (error) => console.error("Users snapshot error:", error));
        unsubscribes.push(usersUnsubscribe);
    } else if (user.role === 'Client' && !user.linkedConsultantId) {
       setUsers([]); // Clear users if client has no consultant
    }


    // Fetch invitations based on role
    let invitesQuery;
    // For Developers or Staff, fetch all invitations.
    if (user.role === 'Developer' || user.role === 'Staff') {
        invitesQuery = query(collection(db, "invitations"));
    } 
    // For Tax Consultants, fetch invitations sent to them.
    else if (user.role === 'TaxConsultant') {
        invitesQuery = query(collection(db, "invitations"), where("toConsultantEmail", "==", user.email));
    } 
    // For Clients, fetch invitations they sent.
    else if (user.role === 'Client') {
        invitesQuery = query(collection(db, "invitations"), where("fromClientId", "==", user.id));
    }

    if (invitesQuery) {
        const invitesUnsubscribe = onSnapshot(invitesQuery, (snapshot) => {
            setInvitations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invitation)));
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
    if (!user || user.role !== 'Client') throw new Error("Only clients can send invitations.");

    try {
        await runTransaction(db, async (transaction) => {
            // 1. Find the consultant by email.
            const usersRef = collection(db, 'users');
            const consultantQuery = query(usersRef, where("email", "==", consultantEmail), where("role", "==", "TaxConsultant"));
            const consultantSnapshot = await getDocs(consultantQuery);

            if (consultantSnapshot.empty) {
                throw new Error("No tax consultant found with this email.");
            }
            const consultantDoc = consultantSnapshot.docs[0];
            const consultantId = consultantDoc.id;

            if (user.linkedConsultantId === consultantId) {
                throw new Error("You are already linked with this consultant.");
            }

            // 2. Check for existing pending invitations to prevent duplicates.
            const invitationsRef = collection(db, 'invitations');
            const invQuery = query(invitationsRef, 
                where('fromClientId', '==', user.id), 
                where('toConsultantEmail', '==', consultantEmail), 
                where('status', '==', 'pending')
            );
            const invSnapshot = await getDocs(invQuery);
            if (!invSnapshot.empty) {
                throw new Error("You already have a pending invitation for this consultant.");
            }

            // 3. Create the new invitation document.
            const newInvitationRef = doc(collection(db, 'invitations'));
            const newInvitation: Omit<Invitation, 'id'> = {
                fromClientId: user.id,
                toConsultantEmail: consultantEmail,
                status: 'pending',
                createdAt: Timestamp.now(),
            };
            transaction.set(newInvitationRef, newInvitation);
        });
    } catch (e) {
        console.error("Invitation transaction failed: ", e);
        if (e instanceof Error) {
           throw e; // rethrow error to be caught by the component
        }
        throw new Error("An unknown error occurred during the invitation process.");
    }
  };
  
  const acceptInvitation = async (invitationId: string) => {
    if (!user || user.role !== 'TaxConsultant') return;
    
    const invRef = doc(db, 'invitations', invitationId);
    
    await runTransaction(db, async (transaction) => {
      const invDoc = await transaction.get(invRef);
      if (!invDoc.exists()) throw new Error("Invitation not found!");
      
      const invitation = invDoc.data() as Invitation;
      const clientRef = doc(db, 'users', invitation.fromClientId);
      const consultantRef = doc(db, 'users', user.id);

      // Perform the updates within the transaction
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
      if (!user || user.role !== 'Client' || clientId !== user.id) {
          throw new Error("You do not have permission to perform this action.");
      }

      const clientRef = doc(db, "users", clientId);
      
      await runTransaction(db, async (transaction) => {
          const clientDoc = await transaction.get(clientRef);
          if (!clientDoc.exists()) throw new Error("Client document not found!");
          
          const clientData = clientDoc.data() as User;
          const consultantId = clientData.linkedConsultantId;
          
          if (!consultantId) return; // No consultant to remove

          const consultantRef = doc(db, "users", consultantId);

          // Client removes consultant's ID from their own document
          transaction.update(clientRef, { linkedConsultantId: "" });
          
          // Client removes their own ID from the consultant's document
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

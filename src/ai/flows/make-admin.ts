
'use server';

/**
 * @fileOverview A flow to promote a user to Developer and initialize app settings.
 * This is a secure way to set up the first administrator account.
 *
 * - makeAdmin - The main function to promote a user.
 * - MakeAdminInput - The input type for the makeAdmin function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';
import { AppSettings } from '@/lib/types';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const MakeAdminInputSchema = z.object({
  email: z.string().email().describe('The email address of the user to promote to Developer.'),
});
export type MakeAdminInput = z.infer<typeof MakeAdminInputSchema>;

export async function makeAdmin(input: MakeAdminInput): Promise<{success: boolean; message: string}> {
  return makeAdminFlow(input);
}

const makeAdminFlow = ai.defineFlow(
  {
    name: 'makeAdminFlow',
    inputSchema: MakeAdminInputSchema,
    outputSchema: z.object({
        success: z.boolean(),
        message: z.string(),
    }),
  },
  async ({ email }) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { success: false, message: `User with email ${email} not found.` };
      }

      const batch = writeBatch(db);
      const userDoc = querySnapshot.docs[0];

      // 1. Promote the user to Developer
      batch.update(userDoc.ref, { role: 'Developer' });

      // 2. Create the default app settings document
      const settingsRef = doc(db, 'app', 'settings');
      const defaultSettings: AppSettings = {
        toggles: {
          csvImport: true,
          taxReport: true,
          apiSync: false,
        },
        permissions: {
          canManageUsers: true,
          canViewAllTx: true,
        },
        config: {
          logoUrl: '',
          taxRules: 'Standard UK tax regulations apply.',
        },
      };
      batch.set(settingsRef, defaultSettings, { merge: true });

      await batch.commit();

      return { success: true, message: `Successfully promoted ${email} to Developer and initialized app settings.` };
    } catch (error) {
        console.error("makeAdminFlow error:", error);
        return { success: false, message: (error as Error).message };
    }
  }
);

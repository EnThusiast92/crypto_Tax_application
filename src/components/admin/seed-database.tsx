
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, doc, writeBatch, Timestamp, setDoc } from 'firebase/firestore';
import type { Transaction, AppSettings, User } from '@/lib/types';
import { useAuth } from '@/context/auth-context';

export function SeedDatabase() {
    const [isSeeding, setIsSeeding] = React.useState(false);
    const { toast } = useToast();
    const { user } = useAuth();

    const seedDatabase = async () => {
        if (!user || user.role !== 'Developer') {
            toast({
                title: 'Error',
                description: 'You must be logged in as a developer to seed the database.',
                variant: 'destructive',
            });
            return;
        }

        setIsSeeding(true);
        try {
            console.log('🟡 Seeding started...');
            
            const batch = writeBatch(db);

            // 1. Seed App Settings
            const settingsRef = doc(db, 'app', 'settings');
            const defaultSettings: AppSettings = {
              toggles: {
                csvImport: true,
                taxReport: true,
                apiSync: false,
              },
              permissions: {
                canManageUsers: false,
                canViewAllTx: true,
              },
              config: {
                logoUrl: '',
                taxRules: 'Standard UK tax regulations apply.',
              },
            };
            batch.set(settingsRef, defaultSettings, { merge: true });
            console.log('🟡 App settings prepared for seeding.');
            
            // 2. Seed Sample Users (Client and Consultant)
            // Note: We use setDoc with a specific ID to avoid conflicts if the user later registers with these emails.
            // The auth records for these users must be created manually via registration if you want to log in as them.
            const clientUserId = 'sample-client-satoshi';
            const consultantUserId = 'sample-consultant-charles';

            const satoshiRef = doc(db, 'users', clientUserId);
            const satoshiData: Omit<User, 'id'> = {
                name: 'Satoshi Nakamoto',
                email: 'satoshi@gmx.com',
                avatarUrl: `https://i.pravatar.cc/150?u=satoshi@gmx.com`,
                createdAt: Timestamp.now(),
                role: 'Client',
                linkedClientIds: [],
                linkedConsultantId: '',
            };
            batch.set(satoshiRef, satoshiData, { merge: true });

            const charlesRef = doc(db, 'users', consultantUserId);
            const charlesData: Omit<User, 'id'> = {
                 name: 'Charles Hoskinson',
                 email: 'charles@iohk.io',
                 avatarUrl: `https://i.pravatar.cc/150?u=charles@iohk.io`,
                 createdAt: Timestamp.now(),
                 role: 'TaxConsultant',
                 linkedClientIds: [],
                 linkedConsultantId: '',
            };
            batch.set(charlesRef, charlesData, { merge: true });

            console.log('🟡 Sample users prepared for seeding.');

            // Commit the first batch to ensure users exist before adding subcollections
            await batch.commit();
            console.log('✅ Settings and Users seeding complete!');

            // 3. Seed Transactions for the sample client
            const transactionsBatch = writeBatch(db);
            const transactionsCol = collection(db, `users/${clientUserId}/transactions`);
            const sampleTransactions: Omit<Transaction, 'id' | 'value'>[] = [
                { date: '2023-10-26', type: 'Buy', asset: 'BTC', quantity: 0.5, price: 34000, fee: 15, exchange: 'Coinbase', classification: 'Capital Purchase' },
                { date: '2023-11-15', type: 'Sell', asset: 'ETH', quantity: 2, price: 2000, fee: 8, exchange: 'Binance', classification: 'Capital Disposal' },
                { date: '2024-01-10', type: 'Buy', asset: 'SOL', quantity: 10, price: 95, fee: 5, exchange: 'Coinbase', classification: 'Capital Purchase' },
                { date: '2024-02-20', type: 'Staking', asset: 'ADA', quantity: 1000, price: 0.55, fee: 0, exchange: 'Self-custody', classification: 'Income' },
                { date: '2024-03-01', type: 'Swap', asset: 'BTC', quantity: 0.1, price: 45000, fee: 10, exchange: 'Coinbase', classification: 'Capital Disposal/Purchase', toAsset: 'ETH', toQuantity: 1.5 },
            ];
            
            sampleTransactions.forEach(txData => {
                const txRef = doc(transactionsCol); // Auto-generate ID
                const txWithVal = {...txData, value: txData.price * txData.quantity};
                transactionsBatch.set(txRef, txWithVal);
            });
            
            await transactionsBatch.commit();
            console.log('✅ Transactions seeding for sample client complete!');

            toast({
                title: 'Seed Complete',
                description: 'Database has been seeded with settings and sample data.',
            });

        } catch (error) {
            console.error('❌ Seeding error:', error);
            toast({
                title: 'Seed Failed',
                description: error instanceof Error ? error.message : 'An unknown error occurred.',
                variant: 'destructive',
            });
        } finally {
            setIsSeeding(false);
        }
    }

    return (
         <Card className="border-destructive/50">
            <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                    This action will populate your Firestore database with initial data.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    Clicking this will overwrite or create:
                </p>
                <ul className="text-sm text-muted-foreground list-disc pl-5 mt-2">
                    <li>The main application settings document.</li>
                    <li>A sample Client user ('Satoshi Nakamoto').</li>
                    <li>A sample Tax Consultant user ('Charles Hoskinson').</li>
                    <li>Sample transactions for the 'Satoshi Nakamoto' user.</li>
                </ul>
                 <p className="text-sm text-muted-foreground mt-2">
                    This is safe to run multiple times. It will add more transactions to the sample client each time.
                </p>
            </CardContent>
            <CardFooter>
                 <Button variant="destructive" onClick={seedDatabase} disabled={isSeeding}>
                    {isSeeding ? 'Seeding...' : 'Seed Database'}
                </Button>
            </CardFooter>
        </Card>
    )
}

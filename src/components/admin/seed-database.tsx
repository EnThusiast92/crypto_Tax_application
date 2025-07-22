
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, doc, writeBatch, Timestamp, setDoc } from 'firebase/firestore';
import type { User, Transaction, AppSettings } from '@/lib/types';

export function SeedDatabase() {
    const [isSeeding, setIsSeeding] = React.useState(false);
    const { toast } = useToast();

    const seedDatabase = async () => {
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
            batch.set(settingsRef, defaultSettings);
            console.log('🟡 App settings prepared for seeding.');


            // 2. Seed Users
            const usersCol = collection(db, 'users');

            // NOTE: Seeding won't create auth entries. These users can't log in unless created via UI.
            // This seed is for DATA only. You should have already registered your main admin user.
            
            const clientUserRef = doc(usersCol, 'user-client-satoshi');
            const clientUserData: Omit<User, 'id'> = {
                name: 'Satoshi Nakamoto',
                email: 'satoshi@gmx.com',
                avatarUrl: 'https://i.pravatar.cc/150?u=satoshi@gmx.com',
                createdAt: Timestamp.now(),
                role: 'Client',
                linkedClientIds: [],
                linkedConsultantId: 'user-consultant-charles',
            };
            batch.set(clientUserRef, clientUserData);
            
            const consultantUserRef = doc(usersCol, 'user-consultant-charles');
            const consultantUserData: Omit<User, 'id'> = {
                name: 'Charles Hoskinson',
                email: 'charles@iohk.io',
                avatarUrl: 'https://i.pravatar.cc/150?u=charles@iohk.io',
                createdAt: Timestamp.now(),
                role: 'TaxConsultant',
                linkedClientIds: ['user-client-satoshi'],
                linkedConsultantId: '',
            };
            batch.set(consultantUserRef, consultantUserData);

            const staffUserRef = doc(usersCol, 'user-staff-vitalik');
            const staffUserData: Omit<User, 'id'> = {
                name: 'Vitalik Buterin',
                email: 'vitalik@ethereum.org',
                avatarUrl: 'https://i.pravatar.cc/150?u=vitalik@ethereum.org',
                createdAt: Timestamp.now(),
                role: 'Staff',
                linkedClientIds: [],
                linkedConsultantId: '',
            };
            batch.set(staffUserRef, staffUserData);
            console.log('🟡 Users prepared for seeding.');

            // 3. Seed Transactions for the client
            const transactionsCol = collection(db, `users/${clientUserRef.id}/transactions`);
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
                batch.set(txRef, txWithVal);
            });
            console.log('🟡 Transactions prepared for seeding.');


            // Commit the batch
            await batch.commit();
            console.log('✅ Seeding complete!');

            toast({
                title: 'Seed Complete',
                description: 'Database has been seeded with sample settings, users and transactions.',
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
                    This action will populate your Firestore database with sample data.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    Clicking this will overwrite or create:
                </p>
                <ul className="text-sm text-muted-foreground list-disc pl-5 mt-2">
                    <li>The main application settings document.</li>
                    <li>Sample Client, Consultant, and Staff users.</li>
                    <li>Sample transactions for the Client user.</li>
                </ul>
                 <p className="text-sm text-muted-foreground mt-2">
                    This is useful for testing, but it will not create user logins (Auth records). You must still register users through the UI to log in as them.
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

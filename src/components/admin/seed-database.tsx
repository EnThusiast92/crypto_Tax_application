
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, doc, writeBatch, Timestamp } from 'firebase/firestore';
import type { User, Transaction } from '@/lib/types';

export function SeedDatabase() {
    const [isSeeding, setIsSeeding] = React.useState(false);
    const { toast } = useToast();

    const seedDatabase = async () => {
        setIsSeeding(true);
        try {
            console.log('🟡 Seeding started...');
            const batch = writeBatch(db);
            const usersCol = collection(db, 'users');

            // 1. Developer User (This assumes you have created this user via the app's registration)
            // Note: Seeding won't create auth entries, so these users can't log in unless created via UI.
            // This seed is for DATA only. You should have already registered 'admin@taxwise.com'.
            
            // 2. Client User
            const clientUserRef = doc(usersCol, 'user-client-satoshi');
            const clientUserData: Omit<User, 'id'> = {
                name: 'Satoshi Nakamoto',
                email: 'satoshi@gmx.com',
                avatarUrl: 'https://i.pravatar.cc/150?u=satoshi@gmx.com',
                createdAt: Timestamp.now(),
                role: 'Client',
                linkedClientIds: [],
                linkedConsultantId: '',
            };
            batch.set(clientUserRef, clientUserData);
            
            // 3. Tax Consultant User
            const consultantUserRef = doc(usersCol, 'user-consultant-charles');
            const consultantUserData: Omit<User, 'id'> = {
                name: 'Charles Hoskinson',
                email: 'charles@iohk.io',
                avatarUrl: 'https://i.pravatar.cc/150?u=charles@iohk.io',
                createdAt: Timestamp.now(),
                role: 'TaxConsultant',
                linkedClientIds: [],
                linkedConsultantId: '',
            };
            batch.set(consultantUserRef, consultantUserData);

            // 4. Staff User
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


            // Commit users first
            await batch.commit();
            console.log('✅ Users seeded successfully!');
            
            // Now seed transactions for the client
            const txBatch = writeBatch(db);
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
                txBatch.set(txRef, txWithVal);
            });

            await txBatch.commit();
            console.log('✅ Transactions seeded successfully!');

            toast({
                title: 'Seed Complete',
                description: 'Database has been seeded with sample users and transactions.',
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
                    This action will populate your database with sample data. It will not create user logins.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    Clicking the button will add sample Client, Consultant, and Staff users to your 'users' collection, along with sample transactions for the Client. This is useful for testing the application's features without manually entering data.
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

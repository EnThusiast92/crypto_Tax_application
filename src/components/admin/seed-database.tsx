
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

            // 1. Developer User
            const devUserRef = doc(usersCol, 'user-dev-admin');
            const devUserData: Omit<User, 'id'> = {
                name: 'Admin Developer',
                email: 'admin@taxwise.com',
                avatarUrl: 'https://i.pravatar.cc/150?u=admin@taxwise.com',
                createdAt: Timestamp.now(),
                role: 'Developer',
                linkedClientIds: [],
                linkedConsultantId: '',
            };
            batch.set(devUserRef, devUserData);

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

            // Commit users first
            await batch.commit();
            console.log('✅ Users seeded successfully!');
            
            // Now seed transactions for the client
            const txBatch = writeBatch(db);
            const transactionsCol = collection(db, `users/${clientUserRef.id}/transactions`);
            const sampleTransactions: Omit<Transaction, 'id'>[] = [
                { date: '2023-10-26', type: 'Buy', asset: 'BTC', quantity: 0.5, price: 34000, fee: 15, value: 17000, exchange: 'Coinbase', classification: 'Capital Purchase' },
                { date: '2023-11-15', type: 'Sell', asset: 'ETH', quantity: 2, price: 2000, fee: 8, value: 4000, exchange: 'Binance', classification: 'Capital Disposal' },
                { date: '2024-01-10', type: 'Buy', asset: 'SOL', quantity: 10, price: 95, fee: 5, value: 950, exchange: 'Coinbase', classification: 'Capital Purchase' },
            ];
            
            sampleTransactions.forEach(tx => {
                const txRef = doc(transactionsCol); // Auto-generate ID
                txBatch.set(txRef, tx);
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
                    This action will overwrite existing sample data. Only use this for initial setup.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    Clicking the button will populate your Firestore database with sample users (including an admin, client, and consultant) and transaction data. This is useful for testing the application's features without manually entering data.
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

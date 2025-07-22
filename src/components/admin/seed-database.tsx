
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, doc, writeBatch, Timestamp, query, where, getDocs } from 'firebase/firestore';
import type { Transaction, User } from '@/lib/types';
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
            
            // 1. Get all client users
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('role', '==', 'Client'));
            const querySnapshot = await getDocs(q);
            const clientUsers = querySnapshot.docs;

            if (clientUsers.length === 0) {
                toast({
                    title: 'No Clients Found',
                    description: 'There are no users with the "Client" role to seed transactions for.',
                    variant: 'default',
                });
                setIsSeeding(false);
                return;
            }
            
            const batch = writeBatch(db);

            const sampleTransactions: Omit<Transaction, 'id' | 'value'>[] = [
                { date: '2023-10-26', type: 'Buy', asset: 'BTC', quantity: 0.5, price: 34000, fee: 15, exchange: 'Coinbase', classification: 'Capital Purchase' },
                { date: '2023-11-15', type: 'Sell', asset: 'ETH', quantity: 2, price: 2000, fee: 8, exchange: 'Binance', classification: 'Capital Disposal' },
                { date: '2024-01-10', type: 'Buy', asset: 'SOL', quantity: 10, price: 95, fee: 5, exchange: 'Coinbase', classification: 'Capital Purchase' },
                { date: '2024-02-20', type: 'Staking', asset: 'ADA', quantity: 1000, price: 0.55, fee: 0, exchange: 'Self-custody', classification: 'Income' },
                { date: '2024-03-01', type: 'Swap', asset: 'BTC', quantity: 0.1, price: 45000, fee: 10, exchange: 'Coinbase', classification: 'Capital Disposal/Purchase', toAsset: 'ETH', toQuantity: 1.5 },
            ];

            let transactionsSeededCount = 0;
            clientUsers.forEach(clientDoc => {
                console.log(`🟡 Preparing transactions for client: ${clientDoc.id}`);
                const transactionsCol = collection(db, `users/${clientDoc.id}/transactions`);
                sampleTransactions.forEach(txData => {
                    const txRef = doc(transactionsCol); // Auto-generate ID
                    const txWithVal = {...txData, value: txData.price * txData.quantity};
                    batch.set(txRef, txWithVal);
                    transactionsSeededCount++;
                });
            });

            await batch.commit();

            toast({
                title: 'Seed Complete',
                description: `Successfully seeded ${transactionsSeededCount} transactions for ${clientUsers.length} client(s).`,
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
                    Clicking this will add a set of sample transactions to every user with the 'Client' role.
                </p>
                 <p className="text-sm text-muted-foreground mt-2">
                    This is safe to run multiple times. It will add more transactions to the clients each time.
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

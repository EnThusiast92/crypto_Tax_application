
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import type { User, Transaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TransactionsTable } from '@/components/dashboard/transactions-table';
import { Button } from '@/components/ui/button';
import { FileDown, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const { user, users } = useAuth();
  const [clientTransactions, setClientTransactions] = React.useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const client = users.find(u => u.id === clientId);

  React.useEffect(() => {
    if (!clientId) return;
    
    setIsLoading(true);
    const transactionsCol = collection(db, `users/${clientId}/transactions`);
    const q = query(transactionsCol, orderBy('date', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const userTransactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
        setClientTransactions(userTransactions);
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching client transactions:", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [clientId]);


  // Security Check
  if (user?.role !== 'TaxConsultant' || !user?.linkedClientIds?.includes(clientId)) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>You do not have permission to view this client's data.</p>
      </div>
    );
  }

  if (!client) {
    return (
        <div className="flex flex-col gap-8">
             <header>
                <Skeleton className="h-10 w-48 mb-4" />
                <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div>
                      <Skeleton className="h-8 w-64 mb-2" />
                      <Skeleton className="h-4 w-80" />
                    </div>
                </div>
            </header>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 duration-1000">
       <header>
          <Button asChild variant="ghost" className="mb-4 -ml-4">
              <Link href="/consultant/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Client List
              </Link>
          </Button>
          <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                  <AvatarImage src={client.avatarUrl} />
                  <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold font-headline">{client.name}'s Dashboard</h1>
                <p className="text-muted-foreground">
                    Viewing transactions and reports for {client.email}.
                </p>
              </div>
          </div>
      </header>

      <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Client Transactions</CardTitle>
            <Button variant="outline" size="sm" className="gap-2">
              <FileDown className="h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
            ) : (
                <TransactionsTable data={clientTransactions} />
            )}
          </CardContent>
        </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>Generate Tax Report</CardTitle>
          <CardDescription>Generate a UK tax report for {client.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button>Generate 2023-2024 Report</Button>
        </CardContent>
      </Card>
    </div>
  );
}

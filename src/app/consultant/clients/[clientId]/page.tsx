
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useTransactions } from '@/context/transactions-context';
import type { User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TransactionsTable } from '@/components/dashboard/transactions-table';
import { Button } from '@/components/ui/button';
import { FileDown, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const { user, users } = useAuth();
  const { transactions } = useTransactions();

  const client = users.find(u => u.id === clientId);

  // Security Check
  if (user?.role !== 'TaxConsultant' || !user?.linkedClientIds?.includes(clientId)) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>You do not have permission to view this client's data.</p>
      </div>
    );
  }

  if (!client) {
    return <p>Client not found.</p>;
  }
  
  // In a real app, you'd fetch transactions for this specific client
  const clientTransactions = transactions; 

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
            <TransactionsTable data={clientTransactions} />
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

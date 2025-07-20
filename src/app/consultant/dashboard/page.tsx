
'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { ArrowRight } from 'lucide-react';

export default function ConsultantDashboardPage() {
  const { user, users } = useAuth();
  const router = useRouter();

  // In a real app, this would be a Firestore query based on user.linkedClientIds
  const linkedClients = users.filter(u => user?.linkedClientIds?.includes(u.id));

  if (user?.role !== 'TaxConsultant') {
    return (
      <div className="flex items-center justify-center h-full">
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  const handleViewClient = (clientId: string) => {
    router.push(`/consultant/clients/${clientId}`);
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 duration-1000">
      <header>
        <h1 className="text-3xl font-bold font-headline">Consultant Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name}. Manage your clients and their tax reports.
        </p>
      </header>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Clients</CardTitle>
          <CardDescription>
            Here are the clients who have granted you access to their data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {linkedClients.length > 0 ? (
            linkedClients.map((client: User) => (
              <div key={client.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={client.avatarUrl} alt={client.name} />
                    <AvatarFallback>{client.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{client.name}</p>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => handleViewClient(client.id)}>
                  View Client <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-12 border-dashed border rounded-lg">
                <p className="text-muted-foreground">You have no clients yet.</p>
                <p className="text-sm text-muted-foreground mt-1">Clients can invite you from their settings page.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

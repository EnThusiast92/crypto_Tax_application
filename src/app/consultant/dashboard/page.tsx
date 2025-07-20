
'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { ArrowRight, Check, X, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ConsultantDashboardPage() {
  const { user, users, invitations, acceptInvitation, rejectInvitation } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  if (user?.role !== 'TaxConsultant') {
    return (
      <div className="flex items-center justify-center h-full">
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  // In a real app, this would be a Firestore query based on user.linkedClientIds
  const linkedClients = users.filter(u => user?.linkedClientIds?.includes(u.id));
  
  const pendingInvites = invitations.filter(inv => inv.toConsultantEmail === user.email && inv.status === 'pending');
  const getClientById = (id: string) => users.find(u => u.id === id);


  const handleViewClient = (clientId: string) => {
    router.push(`/consultant/clients/${clientId}`);
  };

  const handleAccept = (invitationId: string) => {
    acceptInvitation(invitationId);
    toast({
        title: 'Invitation Accepted',
        description: 'Client has been added to your list.',
    });
  }

  const handleReject = (invitationId: string) => {
    rejectInvitation(invitationId);
     toast({
        title: 'Invitation Rejected',
        description: 'The invitation has been removed.',
    });
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 duration-1000">
      <header>
        <h1 className="text-3xl font-bold font-headline">Consultant Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name}. Manage your clients and their tax reports.
        </p>
      </header>
      
       {pendingInvites.length > 0 && (
        <Card className="border-primary/50">
            <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>You have new client invitations waiting for your approval.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {pendingInvites.map(invite => {
                    const client = getClientById(invite.fromClientId);
                    if (!client) return null;
                    return (
                        <div key={invite.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
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
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleReject(invite.id)}>
                                    <X className="mr-2 h-4 w-4" />
                                    Reject
                                </Button>
                                <Button variant="accent" size="sm" onClick={() => handleAccept(invite.id)}>
                                    <Check className="mr-2 h-4 w-4" />
                                    Accept
                                </Button>
                            </div>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
      )}
      
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
                <p className="text-sm text-muted-foreground mt-1">Accept an invitation to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

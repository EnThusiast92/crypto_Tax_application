
'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import type { User, Invitation } from '@/lib/types';
import { ArrowRight, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

type DisplayClient = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  status: 'active' | 'pending';
  invitationId?: string;
};

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

  const handleViewClient = (clientId: string) => {
    router.push(`/consultant/clients/${clientId}`);
  };

  const handleAccept = async (invitationId: string) => {
    try {
        await acceptInvitation(invitationId);
        toast({
            title: 'Invitation Accepted',
            description: 'Client has been added to your list.',
        });
    } catch(error) {
        toast({
            title: 'Error Accepting Invite',
            description: (error as Error).message,
            variant: 'destructive',
        });
    }
  }

  const handleReject = async (invitationId: string) => {
    try {
        await rejectInvitation(invitationId);
        toast({
            title: 'Invitation Rejected',
            description: 'The invitation has been removed.',
        });
    } catch(error) {
        toast({
            title: 'Error Rejecting Invite',
            description: (error as Error).message,
            variant: 'destructive',
        });
    }
  }

  // Create a unified list of clients and pending invitations
  const allClients = React.useMemo(() => {
    const clientMap = new Map<string, DisplayClient>();

    // Add active clients
    const activeClients = users.filter(u => user?.linkedClientIds?.includes(u.id));
    activeClients.forEach(client => {
      clientMap.set(client.id, { ...client, status: 'active' });
    });

    // Add pending invitations
    const pendingInvites = invitations.filter(inv => inv.status === 'pending');
    pendingInvites.forEach(invite => {
      // Only add if not already an active client
      if (!clientMap.has(invite.fromClientId)) {
        const clientUser = users.find(u => u.id === invite.fromClientId);
        if (clientUser) {
          clientMap.set(clientUser.id, {
            ...clientUser,
            status: 'pending',
            invitationId: invite.id,
          });
        }
      }
    });

    return Array.from(clientMap.values());
  }, [users, invitations, user?.linkedClientIds]);


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
            Here are your active clients and pending invitations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {allClients.length === 0 ? (
             <div className="text-center py-12 border-dashed border rounded-lg">
                <p className="text-muted-foreground">You have no clients or invitations yet.</p>
             </div>
          ) : (
            allClients.map((client) => (
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
                {client.status === 'pending' && client.invitationId ? (
                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm" onClick={() => handleReject(client.invitationId!)}>
                        <X className="mr-2 h-4 w-4" />
                        Reject
                    </Button>
                    <Button variant="default" size="sm" onClick={() => handleAccept(client.invitationId!)}>
                        <Check className="mr-2 h-4 w-4" />
                        Accept
                    </Button>
                  </div>
                ) : (
                   <Button variant="outline" onClick={() => handleViewClient(client.id)}>
                    View Client <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

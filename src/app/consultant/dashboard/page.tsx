
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
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, documentId } from 'firebase/firestore';

export default function ConsultantDashboardPage() {
  const { user, users, invitations, acceptInvitation, rejectInvitation } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [pendingClients, setPendingClients] = React.useState<User[]>([]);
  const [loadingClients, setLoadingClients] = React.useState(true);
  
  const pendingInvites = React.useMemo(() => 
    invitations.filter(inv => inv.status === 'pending'), 
    [invitations]
  );

  React.useEffect(() => {
    const fetchPendingClients = async () => {
      if (pendingInvites.length === 0) {
        setPendingClients([]);
        setLoadingClients(false);
        return;
      }
      setLoadingClients(true);
      const pendingClientIds = pendingInvites.map(invite => invite.fromClientId);
      const uniqueClientIds = [...new Set(pendingClientIds)];
      
      try {
        const existingUserIds = users.map(u => u.id);
        const idsToFetch = uniqueClientIds.filter(id => !existingUserIds.includes(id));

        if (idsToFetch.length > 0) {
            const clientPromises = idsToFetch.map(id => getDoc(doc(db, 'users', id)));
            const clientDocs = await Promise.all(clientPromises);
            const newClients = clientDocs
              .filter(doc => doc.exists())
              .map(doc => ({ id: doc.id, ...doc.data() } as User));
            setPendingClients(prev => [...prev.filter(c => !idsToFetch.includes(c.id)), ...newClients]);
        } else {
            // This handles the case where the client data might already be in `users`
            // but the invitation is new. We ensure the pendingClients list is accurate.
            const allPossibleClients = users.filter(u => uniqueClientIds.includes(u.id));
            setPendingClients(allPossibleClients);
        }

      } catch (error) {
        console.error("Error fetching pending clients:", error);
        toast({ title: 'Error', description: 'Could not load client information.', variant: 'destructive'});
      } finally {
        setLoadingClients(false);
      }
    };
    fetchPendingClients();
  }, [pendingInvites, users, toast]);

  if (user?.role !== 'TaxConsultant') {
    return (
      <div className="flex items-center justify-center h-full">
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  const linkedClients = users.filter(u => user?.linkedClientIds?.includes(u.id));
  const getPendingClientById = (id: string) => [...users, ...pendingClients].find(c => c.id === id);


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
                {loadingClients ? (
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                       <p>Loading client info...</p>
                    </div>
                ) : (
                    pendingInvites.map(invite => {
                        const client = getPendingClientById(invite.fromClientId);
                        if (!client) return (
                           <div key={invite.id} className="flex items-center justify-between p-4 rounded-lg border bg-card transition-colors">
                               <p>Could not load client info for invite {invite.id}.</p>
                            </div>
                        );
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
                                    <Button variant="destructive" size="sm" onClick={() => handleReject(invite.id)}>
                                        <X className="mr-2 h-4 w-4" />
                                        Reject
                                    </Button>
                                    <Button variant="default" size="sm" onClick={() => handleAccept(invite.id)}>
                                        <Check className="mr-2 h-4 w-4" />
                                        Accept
                                    </Button>
                                </div>
                            </div>
                        )
                    })
                )}
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

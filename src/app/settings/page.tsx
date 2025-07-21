
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X, Send, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import type { Invitation } from "@/lib/types";

export default function SettingsPage() {
    const { user, users, invitations, removeConsultantAccess, sendInvitation } = useAuth();
    const [consultantEmail, setConsultantEmail] = React.useState('');
    const { toast } = useToast();

    if (!user) {
        return (
             <div className="space-y-8 animate-in fade-in-0 duration-500">
                <header>
                    <h1 className="text-3xl font-bold font-headline">Settings</h1>
                    <p className="text-muted-foreground">Loading user settings...</p>
                </header>
            </div>
        )
    }
    
    // Find the linked consultant and any sent invites
    const linkedConsultant = users.find(u => u.id === user.linkedConsultantId);
    const sentInvite = invitations.find(inv => inv.fromClientId === user.id && inv.status === 'pending');
    const consultantForInvite = sentInvite ? users.find(u => u.email === sentInvite.toConsultantEmail) : null;
    
    const handleRemoveAccess = () => {
        if (user && user.id) {
            removeConsultantAccess(user.id);
        }
    };
    
    const handleSendInvite = async () => {
        if (!consultantEmail) {
            toast({ title: "Error", description: "Please enter a consultant's email.", variant: "destructive" });
            return;
        }
        try {
            await sendInvitation(consultantEmail);
            setConsultantEmail('');
        } catch (error) {
            toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
        }
    }

    const InviteStatusIcon = ({ status }: { status: 'pending' | 'accepted' | 'rejected' }) => {
        switch(status) {
            case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'accepted': return <CheckCircle className="h-4 w-4 text-green-500" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in-0 duration-500">
            <header>
                <h1 className="text-3xl font-bold font-headline">Settings</h1>
                <p className="text-muted-foreground">Manage your account and application settings.</p>
            </header>

            <Card className="max-w-4xl">
                <CardHeader>
                    <CardTitle>Public Profile</CardTitle>
                    <CardDescription>This is how others will see you on the site.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-2">
                             <Label>Profile Picture</Label>
                             <Button variant="outline" size="sm" className="w-fit">
                                <Upload className="mr-2 h-4 w-4" />
                                Change Photo
                            </Button>
                            <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" defaultValue={user.name} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" defaultValue={user.email} readOnly/>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Input id="role" defaultValue={user.role} readOnly className="cursor-not-allowed bg-muted/50"/>
                    </div>
                </CardContent>
                 <CardFooter className="border-t px-6 py-4">
                    <Button>Save Changes</Button>
                </CardFooter>
            </Card>
            
            {user.role === 'Client' && (
                <Card className="max-w-4xl">
                    <CardHeader>
                        <CardTitle>Manage Tax Consultant Access</CardTitle>
                        <CardDescription>Invite your tax consultant to view your transaction data and reports.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {!linkedConsultant && !sentInvite && (
                            <div>
                                <Label htmlFor="consultant-email">Consultant's Email</Label>
                                <div className="flex gap-2 mt-2">
                                    <Input 
                                        id="consultant-email" 
                                        type="email" 
                                        placeholder="consultant@email.com" 
                                        value={consultantEmail}
                                        onChange={(e) => setConsultantEmail(e.target.value)}
                                    />
                                    <Button variant="secondary" className="gap-2" onClick={handleSendInvite}>
                                        <Send className="h-4 w-4" />
                                        Send Invite
                                    </Button>
                                </div>
                            </div>
                        )}
                        <div className="space-y-3">
                            <Label>Access & Invitations</Label>
                             {linkedConsultant ? (
                                <div key={linkedConsultant.id} className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={linkedConsultant.avatarUrl} alt={linkedConsultant.name} />
                                            <AvatarFallback>{linkedConsultant.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{linkedConsultant.name}</p>
                                            <p className="text-sm text-muted-foreground">{linkedConsultant.email}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={handleRemoveAccess}>
                                        <X className="h-4 w-4 mr-2" />
                                        Remove Access
                                    </Button>
                                </div>
                            ) : sentInvite && consultantForInvite ? (
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={consultantForInvite.avatarUrl} alt={consultantForInvite.name} />
                                            <AvatarFallback>{consultantForInvite.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{consultantForInvite.name}</p>
                                            <p className="text-sm text-muted-foreground">{consultantForInvite.email}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="capitalize gap-2">
                                        <InviteStatusIcon status={sentInvite.status} />
                                        {sentInvite.status}
                                    </Badge>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">You have not invited any tax consultants yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className="max-w-4xl border-destructive/50">
                 <CardHeader>
                    <CardTitle className="text-destructive">Delete Account</CardTitle>
                    <CardDescription>Permanently remove your Account and all of its contents from the platform. This action is not reversible, so please continue with caution.</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-end border-t border-destructive/50 px-6 py-4">
                    <Button variant="destructive">Delete My Account</Button>
                </CardFooter>
            </Card>
        </div>
    );
}

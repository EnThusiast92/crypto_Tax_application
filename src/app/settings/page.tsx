
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";

export default function SettingsPage() {
    const { user } = useAuth();

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
                            <Input id="email" type="email" defaultValue={user.email} />
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

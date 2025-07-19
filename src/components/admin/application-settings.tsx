
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from '../ui/badge';
import { DollarSign } from 'lucide-react';

export function ApplicationSettings() {

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Site Configuration</CardTitle>
                    <CardDescription>Configure site-wide settings like logo and branding.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="logoUrl">Logo URL</Label>
                        <Input id="logoUrl" placeholder="https://example.com/logo.png" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="taxRules">Tax Rules</Label>
                        <Textarea id="taxRules" placeholder="Enter tax regulations and guidelines..." />
                        <p className="text-xs text-muted-foreground">This content will be displayed to users in the report generation section.</p>
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button>Save Site Config</Button>
                </CardFooter>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Feature Toggles</CardTitle>
                    <CardDescription>Enable or disable specific modules for all users.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <Label htmlFor="csv-import">CSV Import</Label>
                            <p className="text-[0.8rem] text-muted-foreground">Allow users to upload CSV files.</p>
                        </div>
                        <Switch id="csv-import" defaultChecked />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <Label htmlFor="tax-report">Tax Report Generation</Label>
                            <p className="text-[0.8rem] text-muted-foreground">Enable tax report generation.</p>
                        </div>
                        <Switch id="tax-report" defaultChecked />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <Label htmlFor="api-sync">API Sync</Label>
                            <p className="text-[0.8rem] text-muted-foreground">Allow syncing with exchange APIs (coming soon).</p>
                        </div>
                        <Switch id="api-sync" disabled />
                    </div>
                </CardContent>
                 <CardFooter className="border-t px-6 py-4">
                    <Button>Save Feature Toggles</Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Payment Plans</CardTitle>
                    <CardDescription>Manage subscription tiers and pricing.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg border p-4 flex justify-between items-start">
                        <div>
                            <Badge variant="outline">Free Tier</Badge>
                            <p className="text-sm text-muted-foreground mt-2">Basic features, limited reports.</p>
                        </div>
                        <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                    <div className="rounded-lg border p-4 flex justify-between items-start">
                        <div>
                            <Badge variant="secondary">Pro Tier</Badge>
                            <p className="text-2xl font-bold mt-1">$29<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                            <p className="text-sm text-muted-foreground mt-2">Unlimited reports, API sync, priority support.</p>
                        </div>
                        <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                </CardContent>
                 <CardFooter className="border-t px-6 py-4">
                    <Button>Save Payment Plans</Button>
                </CardFooter>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Staff Permissions</CardTitle>
                    <CardDescription>Assign specific module access to Staff users.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between rounded-lg border p-3">
                        <Label htmlFor="staff-user-management">Can manage users</Label>
                        <Switch id="staff-user-management" />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-3">
                        <Label htmlFor="staff-view-all-tx">Can view all transactions</Label>
                        <Switch id="staff-view-all-tx" defaultChecked/>
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button>Save Staff Permissions</Button>
                </CardFooter>
            </Card>
        </>
    );
}

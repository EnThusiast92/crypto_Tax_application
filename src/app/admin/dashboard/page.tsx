
'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UsersTable } from '@/components/admin/users-table';
import { ApplicationSettings } from '@/components/admin/application-settings';
import { SeedDatabase } from '@/components/admin/seed-database';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  
  if (user?.role !== 'Developer') {
    return (
        <div className="flex items-center justify-center h-full">
            <p>You do not have permission to view this page.</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 duration-1000">
      <header>
        <h1 className="text-3xl font-bold font-headline">Developer Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, roles, and application settings.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
            <Card>
                <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                    View and manage all users in the system.
                </CardDescription>
                </CardHeader>
                <CardContent>
                    <UsersTable />
                </CardContent>
            </Card>
        </div>
        <div className="space-y-8">
            <ApplicationSettings />
            <SeedDatabase />
        </div>

      </div>
    </div>
  );
}

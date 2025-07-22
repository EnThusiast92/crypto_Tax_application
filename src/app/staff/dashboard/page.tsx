
'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { useSettings } from '@/context/settings-context';
import { useTransactions, TransactionsProvider } from '@/context/transactions-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UsersTable } from '@/components/admin/users-table';
import { TransactionsTable } from '@/components/dashboard/transactions-table';
import { ShieldAlert } from 'lucide-react';

function StaffDashboardPageContent() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const { transactions } = useTransactions();

  if (user?.role !== 'Staff' && user?.role !== 'Developer') {
    return (
        <div className="flex items-center justify-center h-full">
            <p>You do not have permission to view this page.</p>
        </div>
    );
  }
  
  const canManageUsers = settings.permissions.canManageUsers;
  const canViewAllTx = settings.permissions.canViewAllTx;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-0 duration-1000">
      <header>
        <h1 className="text-3xl font-bold font-headline">Staff Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome, {user.name}. Access tools based on your assigned permissions.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
            {canManageUsers ? (
                <Card>
                    <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                        View and manage users as per your permissions.
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UsersTable />
                    </CardContent>
                </Card>
            ) : (
                 <Card className="border-dashed">
                    <CardHeader className="flex-row gap-4 items-center">
                        <ShieldAlert className="w-8 h-8 text-muted-foreground" />
                        <div>
                            <CardTitle>User Management</CardTitle>
                            <CardDescription>
                                You do not have permission to manage users.
                            </CardDescription>
                        </div>
                    </CardHeader>
                </Card>
            )}
        </div>
        <div className="space-y-8">
             {canViewAllTx ? (
                <Card>
                    <CardHeader>
                    <CardTitle>All Transactions</CardTitle>
                    <CardDescription>
                        View all transactions in the system.
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TransactionsTable data={transactions} />
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-dashed">
                    <CardHeader className="flex-row gap-4 items-center">
                        <ShieldAlert className="w-8 h-8 text-muted-foreground" />
                        <div>
                            <CardTitle>All Transactions</CardTitle>
                            <CardDescription>
                                You do not have permission to view all transactions.
                            </CardDescription>
                        </div>
                    </CardHeader>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}

export default function StaffDashboardPage() {
    return (
        <TransactionsProvider>
            <StaffDashboardPageContent />
        </TransactionsProvider>
    )
}

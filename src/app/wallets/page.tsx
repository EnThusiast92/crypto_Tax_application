
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ConnectWalletDialog } from '@/components/wallets/connect-wallet-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useWallets } from '@/context/wallets-context';
import { WalletsTable } from '@/components/wallets/wallets-table';
import { Skeleton } from '@/components/ui/skeleton';

export default function WalletsPage() {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const { wallets, loading } = useWallets();

    return (
        <>
            <div className="flex flex-col gap-8 animate-in fade-in-0 duration-1000">
                <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Wallets</h1>
                    <p className="text-muted-foreground">
                    Connect and manage your CEX and DEX wallets.
                    </p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                    <PlusCircle />
                    Connect Wallet
                </Button>
                </header>

                <Card className="animate-in fade-in-0 slide-in-from-bottom-5 duration-500">
                    <CardHeader>
                        <CardTitle>Connected Wallets</CardTitle>
                        <CardDescription>
                            Here are all the wallets you've connected to your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                             <div className="space-y-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-40 w-full" />
                            </div>
                        ) : (
                            <WalletsTable data={wallets} />
                        )}
                    </CardContent>
                </Card>
            </div>
            <ConnectWalletDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
        </>
    )
}

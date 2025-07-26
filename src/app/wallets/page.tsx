
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw, Search, Info, ChevronDown } from 'lucide-react';
import { ConnectWalletDialog } from '@/components/wallets/connect-wallet-dialog';
import { useWallets } from '@/context/wallets-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { WalletList } from '@/components/wallets/wallet-list';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function WalletsPage() {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const { wallets, loading } = useWallets();

    return (
        <>
            <div className="flex flex-col gap-6 animate-in fade-in-0 duration-1000">
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold font-headline">Wallets</h1>
                        {!loading && <Badge variant="secondary" className="text-base">{wallets.length}</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add wallet / exchange
                        </Button>
                        <Button variant="outline" className="w-full sm:w-auto">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Sync all
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Info className="h-5 w-5" />
                        </Button>
                    </div>
                </header>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Find wallet..." className="pl-10" />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto">
                                Sort by Date Added <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Date Added</DropdownMenuItem>
                            <DropdownMenuItem>Name</DropdownMenuItem>
                            <DropdownMenuItem>Total Value</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <main>
                    {loading ? (
                        <div className="space-y-4">
                           {[...Array(3)].map((_, i) => (
                             <Skeleton key={i} className="h-20 w-full" />
                           ))}
                        </div>
                    ) : (
                        <WalletList wallets={wallets} />
                    )}
                </main>
            </div>
            <ConnectWalletDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
        </>
    )
}

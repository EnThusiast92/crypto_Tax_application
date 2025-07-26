
'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { allWallets, popularWallets } from '@/lib/data';
import { WalletGridItem } from '@/components/wallets/wallet-grid-item';

export default function AddWalletPage() {
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredPopular = popularWallets.filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredAll = allWallets.filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return (
        <div className="max-w-5xl mx-auto animate-in fade-in-0 duration-500">
            <header className="flex items-center gap-4 mb-8">
                <Button asChild variant="ghost" size="icon">
                    <Link href="/wallets">
                        <ArrowLeft />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold font-headline">Add your wallets</h1>
            </header>

            <div className="space-y-10">
                {/* Search and Filters */}
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Paste your wallet address or search..." 
                            className="pl-12 h-12 text-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary">All</Button>
                        <Button variant="ghost">Exchanges</Button>
                        <Button variant="ghost">Wallets</Button>
                        <Button variant="ghost">Blockchains</Button>
                        <Button variant="ghost">Services</Button>
                        <Button variant="ghost">New</Button>
                    </div>
                </div>

                {/* Popular Section */}
                {filteredPopular.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-sm font-semibold uppercase text-muted-foreground">Popular</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-lg overflow-hidden border">
                           {filteredPopular.map(wallet => (
                               <WalletGridItem key={wallet.name} {...wallet} />
                           ))}
                        </div>
                    </div>
                )}
                

                {/* All Section */}
                 {filteredAll.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-sm font-semibold uppercase text-muted-foreground">All</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-lg overflow-hidden border">
                            {filteredAll.map(wallet => (
                                <WalletGridItem key={wallet.name} {...wallet} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

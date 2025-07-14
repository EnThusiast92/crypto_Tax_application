'use client';

import type { WalletProvider } from "@/lib/types";
import { ProviderIcon } from "./provider-icon";

interface ProviderGridProps {
    onSelectProvider: (provider: WalletProvider) => void;
}

export const walletProviders: {name: WalletProvider, type: 'CEX' | 'Wallet'}[] = [
    { name: 'MetaMask', type: 'Wallet' },
    { name: 'Phantom', type: 'Wallet' },
    { name: 'Ledger', type: 'Wallet' },
    { name: 'Binance', type: 'CEX' },
    { name: 'Coinbase', type: 'CEX' },
    { name: 'Kraken', type: 'CEX' },
];

export function ProviderGrid({ onSelectProvider }: ProviderGridProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {walletProviders.map((provider) => (
                <button
                    key={provider.name}
                    onClick={() => onSelectProvider(provider.name)}
                    className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-border p-6 text-center transition-colors hover:border-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    <ProviderIcon provider={provider.name} className="w-12 h-12" />
                    <span className="font-semibold text-foreground">{provider.name}</span>
                </button>
            ))}
        </div>
    )
}


'use client';

import type { Wallet } from '@/lib/types';
import { WalletListItem } from './wallet-list-item';
import { AnimatePresence, motion } from 'framer-motion';

interface WalletListProps {
  wallets: Wallet[];
}

export function WalletList({ wallets }: WalletListProps) {
  if (wallets.length === 0) {
    return (
      <div className="text-center py-12 border-dashed border rounded-lg">
        <p className="text-muted-foreground">No wallets connected yet.</p>
        <p className="text-sm text-muted-foreground mt-1">Click "Add wallet / exchange" to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
        <AnimatePresence>
            {wallets.map((wallet, index) => (
                <motion.div
                    key={wallet.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                    <WalletListItem wallet={wallet} />
                </motion.div>
            ))}
      </AnimatePresence>
    </div>
  );
}


'use client';

import Image from 'next/image';
import { CheckCircle } from 'lucide-react';
import type { StaticWallet } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';

export function WalletGridItem({ name, iconUrl, supported }: StaticWallet) {
  return (
    <Card className="rounded-none bg-card hover:bg-muted/50 cursor-pointer transition-colors group border-0 shadow-none">
        <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Image src={iconUrl} alt={`${name} logo`} width={24} height={24} className="object-contain" />
                <p className="font-semibold text-sm">{name}</p>
            </div>
            {supported && <CheckCircle className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
        </CardContent>
    </Card>
  );
}

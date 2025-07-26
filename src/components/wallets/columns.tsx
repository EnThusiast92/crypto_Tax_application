
'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Wallet, WalletType } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import type { Timestamp } from 'firebase/firestore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const formatDate = (date: Timestamp | undefined) => {
    if (!date) return 'N/A';
    return formatDistanceToNow(date.toDate(), { addSuffix: true });
};

export const columns: ColumnDef<Wallet>[] = [
  {
    accessorKey: 'name',
    header: 'Wallet',
    cell: ({ row }) => {
        const wallet = row.original;
        return (
            <div className="flex items-center gap-3">
                <div className="flex flex-col">
                    <span className="font-medium">{wallet.name}</span>
                    <span className="text-sm text-muted-foreground font-mono truncate max-w-[200px]">{wallet.identifier}</span>
                </div>
            </div>
        )
    }
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('type') as WalletType;
      return <Badge variant={type === 'CEX' ? 'secondary' : 'outline'}>{type}</Badge>;
    },
  },
  {
    accessorKey: 'transactionsCount',
    header: () => <div className="text-center">Transactions</div>,
    cell: ({ row }) => {
        return <div className="text-center">{row.getValue('transactionsCount')}</div>
    }
  },
  {
    accessorKey: 'reportedBalance',
    header: () => <div className="text-right">Reported Balance</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('reportedBalance'));
      const formatted = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'discrepancy', // A virtual column, we'll calculate the value
    header: () => <div className="text-right">Discrepancy</div>,
    cell: ({ row }) => {
      const wallet = row.original;
      // In a real scenario, liveBalance would be passed or calculated from transactions context
      const liveBalance = wallet.reportedBalance + (Math.random() - 0.5) * 100; // Placeholder logic
      const discrepancy = liveBalance - wallet.reportedBalance;
      const formatted = new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
      }).format(discrepancy);

      if (Math.abs(discrepancy) < 0.01) {
        return <div className="text-right text-muted-foreground">-</div>;
      }

      return (
        <div className={cn("text-right font-medium", Math.abs(discrepancy) > 0.01 && "text-destructive")}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="flex items-center justify-end gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {formatted}
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Live balance differs from reported balance.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
      );
    },
  },
  {
    accessorKey: 'lastSyncAt',
    header: () => <div className="text-right">Last Synced</div>,
    cell: ({ row }) => <div className="text-right">{formatDate(row.getValue('lastSyncAt'))}</div>,
  },
  {
    id: 'actions',
    cell: function ActionsCell({ row }) {
      const wallet = row.original;
      return (
        <div className="text-center">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>Sync Now</DropdownMenuItem>
              <DropdownMenuItem>View Transactions</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                Delete Wallet
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

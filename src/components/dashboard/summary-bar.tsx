
'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { useTransactions } from '@/context/transactions-context';
import { Skeleton } from '../ui/skeleton';

export function SummaryBar() {
    const { transactions, loading } = useTransactions();

    const summaryItems = React.useMemo(() => {
        const formatCurrency = (value: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
        
        const summary = {
            in: 0,
            out: 0,
            income: 0,
            expenses: 0,
            tradingFees: 0,
            realizedGains: 0,
        };

        transactions.forEach(tx => {
            summary.tradingFees += tx.fee;
            if (tx.type === 'Buy') {
                summary.in += tx.value;
            } else if (tx.type === 'Sell') {
                summary.out += tx.value;
                 // Note: Realized gains calculation is simplified here.
                 // A proper calculation requires tracking cost basis of sold assets.
            } else if (tx.type === 'Staking' || tx.type === 'Airdrop') {
                summary.income += tx.value;
            }
        });

        return [
            { label: 'In', value: formatCurrency(summary.in) },
            { label: 'Out', value: formatCurrency(summary.out) },
            { label: 'Income', value: formatCurrency(summary.income) },
            { label: 'Expenses', value: formatCurrency(summary.expenses) },
            { label: 'Trading fees', value: formatCurrency(summary.tradingFees) },
            { label: 'Realized gains', value: '...' }, // Complex calculation, showing placeholder
        ];

    }, [transactions]);
    
    if (loading) {
        return (
            <Card>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className={`p-4 ${index < 5 ? 'border-r border-border' : ''}`}>
                            <Skeleton className="h-4 w-20 mb-2" />
                            <Skeleton className="h-6 w-16" />
                        </div>
                    ))}
                </div>
            </Card>
        )
    }

  return (
    <Card>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {summaryItems.map((item, index) => (
          <div
            key={item.label}
            className={`p-4 ${index < summaryItems.length - 1 ? 'border-r border-border' : ''} ${index >= 3 ? 'border-t md:border-t-0' : ''}`}
          >
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="text-lg font-semibold">{item.value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

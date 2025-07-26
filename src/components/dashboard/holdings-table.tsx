
'use client';

import React from 'react';
import type { Holding } from '@/lib/types';
import { CryptoIcon } from '../crypto/crypto-icon';
import { Button } from '../ui/button';
import { MoreHorizontal, ArrowDown, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { useTransactions } from '@/context/transactions-context';
import { Skeleton } from '../ui/skeleton';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const generateSparkline = () => Array.from({ length: 20 }, () => ({ value: Math.random() * 100 }));


export function HoldingsTable() {
    const { transactions, loading } = useTransactions();

    const holdings: Holding[] = React.useMemo(() => {
        const assetMap = new Map<string, { balance: number, cost: number, marketValue: number }>();

        transactions.forEach(tx => {
            if (!assetMap.has(tx.asset)) {
                assetMap.set(tx.asset, { balance: 0, cost: 0, marketValue: 0 });
            }
            const current = assetMap.get(tx.asset)!;

            if (tx.type === 'Buy') {
                current.balance += tx.quantity;
                current.cost += tx.value;
            } else if (tx.type === 'Sell') {
                const proportionSold = tx.quantity / current.balance;
                current.cost -= current.cost * proportionSold; // Reduce cost basis proportionally
                current.balance -= tx.quantity;
            } else if (tx.type === 'Swap') {
                // From asset
                const proportionSwapped = tx.quantity / current.balance;
                current.cost -= current.cost * proportionSwapped;
                current.balance -= tx.quantity;
                
                // To asset
                if(tx.toAsset) {
                    if (!assetMap.has(tx.toAsset)) {
                        assetMap.set(tx.toAsset, { balance: 0, cost: 0, marketValue: 0 });
                    }
                    const toAssetCurrent = assetMap.get(tx.toAsset)!;
                    toAssetCurrent.balance += tx.toQuantity || 0;
                    toAssetCurrent.cost += tx.value; // The cost of the new asset is the value of the asset swapped away
                }
            } else {
                 // For staking, airdrop etc. we assume 0 cost basis for simplicity
                 current.balance += tx.quantity;
            }

            // In a real app, marketValue would be fetched from an API.
            // For now, we'll estimate it based on the last transaction price.
            current.marketValue = current.balance * tx.price;
        });

        return Array.from(assetMap.entries()).map(([asset, data]) => ({
            asset,
            balance: data.balance,
            cost: data.cost,
            marketValue: data.marketValue,
            roi: data.cost > 0 ? (data.marketValue - data.cost) / data.cost : 0,
            hasIssue: false, // Placeholder
            chartData: generateSparkline(), // Placeholder
        })).filter(h => h.balance > 0.00001); // Filter out dust

    }, [transactions]);


    if (loading) {
        return (
             <Card>
                <CardHeader><CardTitle>Holdings</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                </CardContent>
            </Card>
        )
    }

    if (holdings.length === 0 && !loading) {
        return (
            <Card>
                <CardHeader><CardTitle>Holdings</CardTitle></CardHeader>
                <CardContent>
                    <div className="text-center py-10 border-dashed border rounded-lg">
                        <p className="text-muted-foreground">No transaction data found.</p>
                        <p className="text-sm text-muted-foreground mt-1">Add transactions or import a CSV to see your holdings.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Holdings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2 px-4 font-normal flex items-center gap-1">Asset <ArrowDown className="w-3 h-3" /></th>
                <th className="py-2 px-4 font-normal text-right">Balance</th>
                <th className="py-2 px-4 font-normal text-right">Cost (GBP)</th>
                <th className="py-2 px-4 font-normal text-right flex items-center justify-end gap-1">Market Value <ArrowDown className="w-3 h-3" /></th>
                <th className="py-2 px-4 font-normal text-right">ROI</th>
                <th className="py-2 px-4 font-normal text-center">24h</th>
                <th className="py-2 px-4 font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding) => (
                <tr key={holding.asset} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <CryptoIcon asset={holding.asset} className="w-6 h-6" />
                      <span className="font-semibold">{holding.asset}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <p className="font-mono">{holding.balance.toFixed(4)}</p>
                    {holding.hasIssue && <Info className="h-4 w-4 text-yellow-500 inline-block ml-1" />}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <p className="font-mono">{formatCurrency(holding.cost)}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(holding.cost / holding.balance)} / unit</p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <p className="font-mono">{formatCurrency(holding.marketValue)}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(holding.marketValue / holding.balance)} / unit</p>
                  </td>
                  <td className={cn(
                    "py-3 px-4 text-right font-semibold font-mono",
                    holding.roi > 0 ? "text-green-400" : "text-red-400"
                  )}>
                    {holding.roi > 0 ? '+' : ''}{(holding.roi * 100).toFixed(2)}%
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-8 w-24 mx-auto">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={holding.chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                           <defs>
                              <linearGradient id={`color-${holding.asset}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={holding.roi > 0 ? '#4ade80' : '#f87171'} stopOpacity={0.4}/>
                                <stop offset="95%" stopColor={holding.roi > 0 ? '#4ade80' : '#f87171'} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                           <Area type="monotone" dataKey="value" stroke={holding.roi > 0 ? '#4ade80' : '#f87171'} strokeWidth={2} fillOpacity={1} fill={`url(#color-${holding.asset})`} />
                         </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

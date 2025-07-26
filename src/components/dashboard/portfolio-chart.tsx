
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { portfolioChartData } from '@/lib/data';
import { Info } from 'lucide-react';
import { useWallets } from '@/context/wallets-context';
import { useTransactions } from '@/context/transactions-context';
import { Skeleton } from '../ui/skeleton';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/80 backdrop-blur-sm p-2 border border-border rounded-lg shadow-lg">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-base font-bold text-primary">{`£${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

export function PortfolioChart() {
    const { wallets, loading: walletsLoading } = useWallets();
    const { transactions, loading: transactionsLoading } = useTransactions();

    const { totalValue, costBasis, unrealizedGains, unrealizedGainsPercent } = React.useMemo(() => {
        const totalValue = wallets.reduce((acc, wallet) => acc + wallet.reportedBalance, 0);
        
        const costBasis = transactions
            .filter(tx => tx.type === 'Buy')
            .reduce((acc, tx) => acc + tx.value, 0);

        const unrealizedGains = totalValue - costBasis;
        const unrealizedGainsPercent = costBasis > 0 ? (unrealizedGains / costBasis) * 100 : 0;

        return { totalValue, costBasis, unrealizedGains, unrealizedGainsPercent };

    }, [wallets, transactions]);

    const isLoading = walletsLoading || transactionsLoading;

    const formatCurrency = (value: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

  return (
    <Card className="bg-card/75">
      <CardContent className="p-6">
        {isLoading ? (
            <div className="flex flex-col md:flex-row justify-between mb-4">
                <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-10 w-48 mb-1" />
                </div>
                 <div className="flex gap-6 mt-4 md:mt-0">
                    <div>
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-8 w-32" />
                    </div>
                    <div>
                        <Skeleton className="h-4 w-28 mb-2" />
                        <Skeleton className="h-8 w-32" />
                    </div>
                </div>
            </div>
        ) : (
            <div className="flex flex-col md:flex-row justify-between mb-4">
                <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                    Total value <Info className="w-3 h-3" />
                    </p>
                    <div className="flex items-end gap-2">
                    <p className="text-4xl font-bold">{formatCurrency(totalValue)}</p>
                    <p className={`text-lg font-semibold ${unrealizedGainsPercent >= 0 ? 'text-green-400' : 'text-red-400'} mb-1`}>
                        {unrealizedGainsPercent >= 0 ? '+' : ''}{unrealizedGainsPercent.toFixed(2)}%
                    </p>
                    </div>
                </div>
                <div className="flex gap-6 mt-4 md:mt-0">
                    <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                        Cost basis <Info className="w-3 h-3" />
                    </p>
                    <p className="text-2xl font-semibold">{formatCurrency(costBasis)}</p>
                    </div>
                    <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                        Unrealized gains <Info className="w-3 h-3" />
                    </p>
                    <p className="text-2xl font-semibold">{formatCurrency(unrealizedGains)}</p>
                    </div>
                </div>
            </div>
        )}

        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={portfolioChartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
              />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `£${value / 1000}k`} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                domain={['dataMin - 10000', 'dataMax + 10000']}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

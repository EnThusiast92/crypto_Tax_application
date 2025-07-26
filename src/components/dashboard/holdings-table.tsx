
'use client';

import type { Holding } from '@/lib/types';
import { CryptoIcon } from '../crypto/crypto-icon';
import { Button } from '../ui/button';
import { MoreHorizontal, ArrowDown, ChevronDown, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface HoldingsTableProps {
  data: Holding[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export function HoldingsTable({ data }: HoldingsTableProps) {
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
              {data.map((holding) => (
                <tr key={holding.asset} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      <CryptoIcon asset={holding.asset} className="w-6 h-6" />
                      <span className="font-semibold">{holding.asset}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <p className="font-mono">{holding.balance}</p>
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
        <div className="pt-4 text-center">
            <Button variant="link">57 assets hidden</Button>
        </div>
      </CardContent>
    </Card>
  );
}

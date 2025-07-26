
'use client';

import { Card } from '@/components/ui/card';

const summaryItems = [
  { label: 'In', value: '£527' },
  { label: 'Out', value: '£107' },
  { label: 'Income', value: '£0' },
  { label: 'Expenses', value: '£0' },
  { label: 'Trading fees', value: '£3' },
  { label: 'Realized gains', value: '£4,344' },
];

export function SummaryBar() {
  return (
    <Card>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {summaryItems.map((item, index) => (
          <div
            key={item.label}
            className={`p-4 ${index < summaryItems.length - 1 ? 'border-r border-border' : ''} ${index > 2 ? 'border-t md:border-t-0' : ''}`}
          >
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="text-lg font-semibold">{item.value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

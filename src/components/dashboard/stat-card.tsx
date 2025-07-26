
// This file is no longer used by the new dashboard and can be considered for deletion in a future cleanup.
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { StatCardData } from '@/lib/types';
import { cn } from '@/lib/utils';

export function StatCard({ title, value, change, changeType, icon: Icon }: StatCardData) {
  return (
    <Card className="transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground neon-icon" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-headline">{value}</div>
        <p className={cn(
          "text-xs",
          changeType === 'increase' ? 'text-accent' : 'text-destructive'
        )}>
          {change} from last month
        </p>
      </CardContent>
    </Card>
  );
}


'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { OnboardingSteps } from '@/components/dashboard/onboarding-steps';
import { PortfolioChart } from '@/components/dashboard/portfolio-chart';
import { SummaryBar } from '@/components/dashboard/summary-bar';
import { HoldingsTable } from '@/components/dashboard/holdings-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { IconProvider } from '@/context/icon-context';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2025, 3, 6),
    to: new Date(2026, 3, 5),
  });

  React.useEffect(() => {
    if (user?.role === 'TaxConsultant') {
      router.replace('/consultant/dashboard');
    }
  }, [user, router]);

  if (!user || user.role === 'TaxConsultant') {
    return null;
  }

  return (
    <IconProvider>
      <div className="flex flex-col gap-6 animate-in fade-in-0 duration-1000">
        <OnboardingSteps name={user.name.split(' ')[0]} />

        <Tabs defaultValue="overview">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="nfts" disabled>NFTs</TabsTrigger>
              <TabsTrigger value="tax-optimization" disabled>Tax optimization</TabsTrigger>
            </TabsList>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[260px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          <TabsContent value="overview" className="space-y-6 mt-4">
            <PortfolioChart />
            <SummaryBar />
            <HoldingsTable />
          </TabsContent>
        </Tabs>
      </div>
    </IconProvider>
  );
}

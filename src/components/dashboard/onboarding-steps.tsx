
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import Link from 'next/link';

interface OnboardingStepsProps {
  name: string;
}

export function OnboardingSteps({ name }: OnboardingStepsProps) {
  return (
    <Card className="p-4 bg-card-foreground/5">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold">Welcome, {name}! Follow these steps to get started.</p>
          <div className="flex items-center gap-2 mt-2">
            <Button asChild size="sm" variant="secondary" className="rounded-full">
              <Link href="/wallets">1 Add accounts & wallets</Link>
            </Button>
            <Button asChild size="sm" variant="secondary" className="rounded-full">
              <Link href="/transactions">2 Review transactions</Link>
            </Button>
            <Button asChild size="sm" variant="secondary" className="rounded-full">
              <Link href="/reports">3 Download tax report</Link>
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <p className="text-sm text-muted-foreground hidden md:block">
            Need help? Watch our <a href="#" className="underline">YouTube video</a>
          </p>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

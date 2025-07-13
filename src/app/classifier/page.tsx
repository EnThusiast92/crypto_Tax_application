'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ClassificationCard } from '@/components/classifier/classification-card';
import { classifyTransaction } from '@/ai/flows/classify-transaction';
import type { ClassificationResult, Transaction } from '@/lib/types';
import { misclassifiedTransactions } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

export default function ClassifierPage() {
  const [results, setResults] = useState<ClassificationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const runClassification = async () => {
      setIsLoading(true);
      try {
        const promises = misclassifiedTransactions.map(async (tx: Transaction) => {
          const result = await classifyTransaction({
            transactionData: JSON.stringify(tx),
            currentClassification: tx.classification,
          });
          return { transaction: tx, ...result };
        });

        const classificationResults = await Promise.all(promises);
        setResults(classificationResults.filter(r => r.isMisclassified));
      } catch (error) {
        console.error('Classification failed:', error);
        toast({
          title: 'Error',
          description: 'Failed to run transaction classification.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    runClassification();
  }, [toast]);

  const handleAccept = (transactionId: string) => {
    setResults(results.filter(r => r.transaction.id !== transactionId));
    toast({
      title: 'Classification Updated',
      description: `Transaction ${transactionId} has been updated.`,
    });
  };

  const handleIgnore = (transactionId: string) => {
    setResults(results.filter(r => r.transaction.id !== transactionId));
    toast({
        title: 'Suggestion Ignored',
        description: `Suggestion for transaction ${transactionId} has been ignored.`,
        variant: 'default'
    })
  };

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-500">
      <header>
        <h1 className="text-3xl font-bold font-headline">AI Transaction Classifier</h1>
        <p className="text-muted-foreground">
          Our AI has scanned your transactions and flagged potentially incorrect classifications.
        </p>
      </header>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {[...Array(2)].map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <div className="flex justify-end gap-2">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {results.map((result) => (
            <ClassificationCard
              key={result.transaction.id}
              result={result}
              onAccept={handleAccept}
              onIgnore={handleIgnore}
            />
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
            <CardTitle>All Clear!</CardTitle>
            <CardDescription className="mt-2">No potential misclassifications found in your recent transactions.</CardDescription>
        </Card>
      )}
    </div>
  );
}

import type { ClassificationResult } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Lightbulb } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ClassificationCardProps {
  result: ClassificationResult;
  onAccept: (transactionId: string) => void;
  onIgnore: (transactionId: string) => void;
}

export function ClassificationCard({ result, onAccept, onIgnore }: ClassificationCardProps) {
  const { transaction, suggestedClassification, confidence } = result;
  
  return (
    <Card className="flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Potential Misclassification</CardTitle>
            <CardDescription>
              Transaction <span className="font-mono text-foreground">{transaction.id}</span> on {transaction.date}
            </CardDescription>
          </div>
           <Badge variant="outline" className="gap-2 shrink-0">
            <Lightbulb className="h-4 w-4 text-accent" />
            AI Suggestion
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex items-center justify-center gap-4 text-center">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Current</p>
            <Badge variant="secondary" className="text-sm">{transaction.classification}</Badge>
          </div>
          <ArrowRight className="h-6 w-6 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Suggested</p>
            <Badge variant="default" className="text-sm bg-primary/80">{suggestedClassification}</Badge>
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Confidence</p>
          <div className="flex items-center gap-2">
            <Progress value={confidence * 100} className="w-full" />
            <span className="font-semibold text-primary/90">{(confidence * 100).toFixed(0)}%</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => onIgnore(transaction.id)}>Ignore</Button>
        <Button variant="accent" onClick={() => onAccept(transaction.id)}>Accept Suggestion</Button>
      </CardFooter>
    </Card>
  );
}

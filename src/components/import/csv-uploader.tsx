'use client';

import { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useTransactions } from '@/context/transactions-context';
import type { Transaction } from '@/lib/types';
import Papa from 'papaparse';

export function CsvUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const { addTransactions } = useTransactions();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type !== 'text/csv') {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a CSV file.',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a CSV file to upload.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setProgress(0);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          // Fake progress for UI effect
          const interval = setInterval(() => {
            setProgress((prev) => (prev >= 90 ? prev : prev + 10));
          }, 100);

          // Normalize data
          const normalizedTransactions = results.data.map((row: any) => {
            // This normalization is a basic example. It should be adapted for specific CSV formats (e.g., Coinbase, Binance).
            // It assumes column names like 'Date', 'Type', 'Asset', 'Quantity', etc.
            const quantity = parseFloat(row.Quantity);
            const price = parseFloat(row['Price Per Unit']);
            
            if (isNaN(quantity) || isNaN(price)) {
              console.warn('Skipping invalid row:', row);
              return null;
            }

            return {
              date: new Date(row.Timestamp).toISOString().split('T')[0],
              type: row.Type, // 'Buy', 'Sell', etc.
              asset: row.Asset,
              quantity: quantity,
              price: price,
              fee: parseFloat(row.Fee) || 0,
              exchange: row.Source, // 'Coinbase', 'Binance', etc.
              classification: 'Imported', // Default classification
              walletId: row.WalletID, // Assumes a WalletID column exists
            };
          }).filter(Boolean) as Omit<Transaction, 'id' | 'value'>[];

          if(normalizedTransactions.length === 0) {
              throw new Error("No valid transactions found in the file. Check the format.");
          }

          addTransactions(normalizedTransactions);
          
          clearInterval(interval);
          setProgress(100);

          setTimeout(() => {
            setIsUploading(false);
            setFile(null);
            toast({
              title: 'Upload Successful',
              description: `${normalizedTransactions.length} transactions have been imported.`,
            });
          }, 500);

        } catch (error: any) {
            setIsUploading(false);
            toast({
                title: 'Import Failed',
                description: error.message || 'Could not process the CSV file.',
                variant: 'destructive'
            })
        }
      },
      error: (error) => {
        setIsUploading(false);
        toast({
            title: 'Parsing Error',
            description: error.message,
            variant: 'destructive'
        });
      }
    });
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <label
        htmlFor="csv-upload"
        className={cn(
          'w-full cursor-pointer rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors hover:border-primary',
          isUploading && 'cursor-not-allowed opacity-50'
        )}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <UploadCloud className="h-12 w-12 text-primary neon-purple-text" />
          <p className="font-semibold">
            {file ? file.name : 'Click to browse or drag and drop'}
          </p>
          <p className="text-xs">Supports: Standardized CSV files</p>
        </div>
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={isUploading}
          className="sr-only"
        />
      </label>

      {isUploading && <Progress value={progress} className="w-full" />}

      <Button onClick={handleUpload} disabled={!file || isUploading} size="lg" className="gap-2">
        {isUploading ? 'Processing...' : 'Upload and Process'}
      </Button>
    </div>
  );
}

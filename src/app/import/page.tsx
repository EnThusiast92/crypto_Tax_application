
'use client';

import { CsvUploader } from '@/components/import/csv-uploader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ImportPage() {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in-0 duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Import Transactions</h1>
        <p className="text-muted-foreground">
          Upload your CSV files from exchanges like Binance, Coinbase, or Kraken. We'll normalize the data for you.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>CSV Uploader</CardTitle>
          <CardDescription>
            Drag and drop your file or click to browse.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CsvUploader />
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function CsvUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
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

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setFile(null);
          toast({
            title: 'Upload Successful',
            description: `${file.name} has been processed.`,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
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
          <p className="text-xs">Supports: CSV files from major exchanges</p>
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
        Upload and Process
      </Button>
    </div>
  );
}

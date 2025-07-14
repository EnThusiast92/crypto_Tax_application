'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { WalletProvider, Wallet, Blockchain } from '@/lib/types';
import { ProviderGrid, walletProviders } from './provider-grid';
import { ArrowLeft, FileUp, Zap } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter } from 'next/navigation';

type Step = 'provider' | 'details' | 'sync';

interface AddWalletDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onWalletAdd: (walletData: Omit<Wallet, 'id' | 'transactionCount' | 'balance' | 'createdAt' | 'updatedAt'>) => void;
}

const blockchains: Blockchain[] = ["Ethereum", "Solana", "BSC", "Polygon", "Bitcoin", "Avalanche"];

export function AddWalletDialog({ isOpen, onOpenChange, onWalletAdd }: AddWalletDialogProps) {
  const router = useRouter();
  const [step, setStep] = React.useState<Step>('provider');
  const [selectedProvider, setSelectedProvider] = React.useState<WalletProvider | null>(null);
  const [walletName, setWalletName] = React.useState('');
  const [walletAddress, setWalletAddress] = React.useState<string | null>(null);
  const [selectedBlockchain, setSelectedBlockchain] = React.useState<Blockchain | null>(null);
  
  const providerDetails = selectedProvider ? walletProviders.find(p => p.name === selectedProvider) : null;

  const resetState = () => {
    setStep('provider');
    setSelectedProvider(null);
    setWalletName('');
    setWalletAddress(null);
    setSelectedBlockchain(null);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  };
  
  const handleProviderSelect = (provider: WalletProvider) => {
    setSelectedProvider(provider);
    setStep('details');
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('provider');
      setSelectedProvider(null);
    } else if (step === 'sync') {
      setStep('details');
    }
  };

  const handleDetailsSubmit = () => {
    if (!walletName || !selectedBlockchain) return;
    setStep('sync');
  };

  const handleSyncOption = (option: 'csv' | 'auto') => {
    if (!selectedProvider || !providerDetails || !walletName || !selectedBlockchain) return;
    
    onWalletAdd({
      userId: 'user-client-1', // Mock user ID
      name: walletName,
      provider: selectedProvider,
      type: providerDetails.type,
      address: walletAddress,
      blockchain: selectedBlockchain,
      apiKey: null,
      apiSecret: null,
    });
    
    handleClose(false);

    if (option === 'csv') {
      router.push('/import');
    }
  };


  const renderStepContent = () => {
    switch (step) {
      case 'provider':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Add a new Wallet</DialogTitle>
              <DialogDescription>
                Select a wallet or exchange to connect.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <ProviderGrid onSelectProvider={handleProviderSelect} />
            </div>
          </>
        );

      case 'details':
        return (
          <>
             <DialogHeader>
                <DialogTitle>Wallet Details</DialogTitle>
                <DialogDescription>
                    Enter a name and choose a blockchain for your {selectedProvider} wallet.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="wallet-name">Wallet Name</Label>
                    <Input id="wallet-name" value={walletName} onChange={(e) => setWalletName(e.target.value)} placeholder={`e.g. My ${selectedProvider} Wallet`} />
                </div>
                 {providerDetails?.type === 'Wallet' && (
                    <div className="space-y-2">
                        <Label htmlFor="wallet-address">Wallet Address (Optional)</Label>
                        <Input id="wallet-address" value={walletAddress ?? ''} onChange={(e) => setWalletAddress(e.target.value)} placeholder="e.g. 0x... or Sol..." />
                    </div>
                )}
                 <div className="space-y-2">
                    <Label htmlFor="blockchain">Blockchain</Label>
                    <Select onValueChange={(value: Blockchain) => setSelectedBlockchain(value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a blockchain" />
                        </SelectTrigger>
                        <SelectContent>
                            {blockchains.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                        </SelectContent>
                    </Select>
                 </div>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={handleBack}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
                <Button onClick={handleDetailsSubmit} disabled={!walletName || !selectedBlockchain}>Continue</Button>
            </DialogFooter>
          </>
        );

      case 'sync':
        return (
          <>
            <DialogHeader>
              <DialogTitle>How to sync transactions?</DialogTitle>
              <DialogDescription>
                Choose how you want to import your transaction history for {walletName}.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
               <button onClick={() => handleSyncOption('auto')} className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-border p-6 text-center transition-colors hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring">
                    <Zap className="w-10 h-10 text-primary" />
                    <h3 className="font-semibold">Auto Sync</h3>
                    <p className="text-sm text-muted-foreground">Connect via API for automatic updates.</p>
               </button>
                <button onClick={() => handleSyncOption('csv')} className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-border p-6 text-center transition-colors hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring">
                    <FileUp className="w-10 h-10 text-primary" />
                    <h3 className="font-semibold">Upload CSV</h3>
                    <p className="text-sm text-muted-foreground">Import a file from your exchange.</p>
                </button>
            </div>
             <DialogFooter>
                <Button variant="ghost" onClick={handleBack}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
            </DialogFooter>
          </>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
}

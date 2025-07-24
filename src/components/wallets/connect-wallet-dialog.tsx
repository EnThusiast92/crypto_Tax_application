
'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { AddWalletFormValues, WalletType } from '@/lib/types';
import { useWallets } from '@/context/wallets-context';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const walletSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  type: z.enum(['DEX', 'CEX']),
  publicAddress: z.string().optional(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
}).refine(data => {
    if (data.type === 'DEX') {
        return !!data.publicAddress && data.publicAddress.length > 0;
    }
    return true;
}, {
    message: 'Public address is required for DEX wallets.',
    path: ['publicAddress'],
}).refine(data => {
    if (data.type === 'CEX') {
        return !!data.apiKey && data.apiKey.length > 0;
    }
    return true;
}, {
    message: 'API Key is required for CEX wallets.',
    path: ['apiKey'],
});

interface ConnectWalletDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function ConnectWalletDialog({ isOpen, onOpenChange }: ConnectWalletDialogProps) {
  const [step, setStep] = React.useState(1);
  const { addWallet } = useWallets();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<AddWalletFormValues>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      name: '',
      type: 'DEX',
    },
  });

  const walletType = form.watch('type');

  const onSubmit = async (data: AddWalletFormValues) => {
    setIsSubmitting(true);
    try {
      await addWallet(data);
      onOpenChange(false);
      form.reset();
      setStep(1);
    } catch (error) {
      console.error("Failed to add wallet", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClose = () => {
    if (isSubmitting) return;
    onOpenChange(false);
    // Delay resetting form to avoid UI flicker
    setTimeout(() => {
        form.reset();
        setStep(1);
    }, 200);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Connect a new Wallet</DialogTitle>
              <DialogDescription>
                {step === 1 ? 'Choose the type of wallet you want to connect.' : 'Enter your wallet details.'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-6 space-y-6">
              {step === 1 && (
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          <FormItem>
                            <FormControl>
                              <RadioGroupItem value="DEX" id="dex" className="sr-only" />
                            </FormControl>
                            <FormLabel
                              htmlFor="dex"
                              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="mb-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              DEX Wallet
                            </FormLabel>
                          </FormItem>
                          <FormItem>
                            <FormControl>
                              <RadioGroupItem value="CEX" id="cex" className="sr-only" />
                            </FormControl>
                            <FormLabel
                              htmlFor="cex"
                              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="mb-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              CEX Exchange
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wallet Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Main Wallet" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {walletType === 'DEX' ? (
                    <FormField
                      control={form.control}
                      name="publicAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Public Address</FormLabel>
                          <FormControl>
                            <Input placeholder="0x..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <>
                      <FormField
                        control={form.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Key</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter API Key" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="apiSecret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Secret</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter API Secret" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              {step === 2 && (
                <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={isSubmitting}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              )}
              {step === 1 ? (
                <Button type="button" onClick={() => setStep(2)}>Next</Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

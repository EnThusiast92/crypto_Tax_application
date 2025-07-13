
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { AddTransactionDialogProps } from '@/lib/types';


const transactionSchema = z.object({
  asset: z.string().min(1, 'Asset is required').toUpperCase(),
  type: z.enum(['Buy', 'Sell', 'Staking', 'Airdrop', 'Gift']),
  quantity: z.coerce.number().positive('Quantity must be positive'),
  price: z.coerce.number().positive('Price must be positive'),
  date: z.string().min(1, 'Date is required'),
  exchange: z.enum(['Binance', 'Coinbase', 'Kraken', 'Self-custody']),
  classification: z.string().min(1, 'Classification is required'),
  fee: z.coerce.number().min(0, 'Fee cannot be negative'),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export function AddTransactionDialog({
  isOpen,
  onOpenChange,
  onAddTransaction,
}: AddTransactionDialogProps) {
  const { toast } = useToast();
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      asset: '',
      quantity: 0,
      price: 0,
      date: new Date().toISOString().split('T')[0],
      type: 'Buy',
      exchange: 'Coinbase',
      classification: 'Capital Purchase',
      fee: 0,
    },
  });

  const onSubmit = (data: TransactionFormValues) => {
    onAddTransaction(data);
    toast({
      title: 'Transaction Added',
      description: `Successfully added transaction for ${data.quantity} ${data.asset}.`,
    });
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>
            Enter the details of your transaction. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="asset"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. BTC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Buy">Buy</SelectItem>
                        <SelectItem value="Sell">Sell</SelectItem>
                        <SelectItem value="Staking">Staking</SelectItem>
                        <SelectItem value="Airdrop">Airdrop</SelectItem>
                        <SelectItem value="Gift">Gift</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                        <Input type="number" step="any" placeholder="e.g. 0.5" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Price per unit (£)</FormLabel>
                        <FormControl>
                        <Input type="number" step="any" placeholder="e.g. 34000" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                          <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                      </FormItem>
                  )}
              />
               <FormField
                  control={form.control}
                  name="fee"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Fee (£)</FormLabel>
                      <FormControl>
                      <Input type="number" step="any" placeholder="e.g. 5.50" {...field} />
                      </FormControl>
                      <FormMessage />
                  </FormItem>
                  )}
              />
            </div>
            <FormField
                control={form.control}
                name="exchange"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Exchange / Source</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Coinbase">Coinbase</SelectItem>
                        <SelectItem value="Binance">Binance</SelectItem>
                        <SelectItem value="Kraken">Kraken</SelectItem>
                        <SelectItem value="Self-custody">Self-custody</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="classification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classification</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Capital Purchase" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Save Transaction</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

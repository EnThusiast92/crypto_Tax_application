
import type { Transaction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CryptoIcon } from '@/components/crypto/crypto-icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Pencil, Trash2, ArrowRight, ExternalLink, Info } from 'lucide-react';

interface TransactionDetailProps {
  transaction: Transaction;
}

const InfoRow = ({ label, value }: { label: string, value: string | number }) => (
    <div className="flex justify-between items-center text-sm">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-mono text-foreground">{value}</p>
    </div>
)

export function TransactionDetail({ transaction }: TransactionDetailProps) {

  const costBasis = transaction.type === 'Sell' ? transaction.value / 1.2 : 0; // Example logic
  const gain = transaction.type === 'Sell' ? transaction.value - costBasis : 0;

  const formattedValue = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(transaction.value);
  const formattedCostBasis = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(costBasis);
  const formattedGain = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(gain);


  return (
    <div className="bg-card-foreground/5 p-4">
      <div className="flex justify-between items-center mb-4">
          <Tabs defaultValue="details" className="w-[400px]">
            <TabsList className="grid w-full grid-cols-3 bg-transparent p-0">
                <TabsTrigger value="details" className="data-[state=active]:bg-muted/80 data-[state=active]:shadow-none -mx-2">Details</TabsTrigger>
                <TabsTrigger value="ledger" className="data-[state=active]:bg-muted/80 data-[state=active]:shadow-none -mx-2">Ledger</TabsTrigger>
                <TabsTrigger value="cost" className="data-[state=active]:bg-muted/80 data-[state=active]:shadow-none -mx-2">Cost analysis</TabsTrigger>
            </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
            <Badge variant="secondary">#{transaction.id.substring(0,6)}...</Badge>
            <Button variant="ghost" size="icon" className="h-7 w-7"><Copy className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-4 w-4" /></Button>
            <Button variant="destructive" size="icon" className="h-7 w-7"><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Details */}
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                 <div className="text-2xl font-bold flex items-center gap-2">
                     <ArrowRight className="h-6 w-6" /> 
                     <span>{transaction.type}</span>
                 </div>
                <p className="text-muted-foreground">{new Date(transaction.date).toLocaleString()}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                    <p className="text-muted-foreground mb-1">Order ID / Tx Hash</p>
                    <a href="#" className="flex items-center gap-1 text-primary hover:underline">
                        {transaction.id}
                        <ExternalLink className="h-3 w-3" />
                    </a>
                </div>
                 <div>
                    <p className="text-muted-foreground mb-1">Source</p>
                    <p>{transaction.exchange}</p>
                </div>
                 <div>
                    <p className="text-muted-foreground mb-1">Destination</p>
                    <p>My Wallet</p>
                </div>
            </div>
        </div>

        {/* Right Side: Financials */}
        <div className="space-y-2 rounded-lg bg-background/50 p-4 border">
            <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-red-400">-</p>
                <div className="flex items-center gap-2 flex-1">
                    <CryptoIcon asset={transaction.asset} className="w-5 h-5" />
                    <p>{transaction.quantity} {transaction.asset}</p>
                </div>
                <Badge variant="outline">API</Badge>
            </div>
            
            {transaction.type === 'Swap' && transaction.toAsset && (
                 <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-green-400">+</p>
                    <div className="flex items-center gap-2 flex-1">
                        <CryptoIcon asset={transaction.toAsset} className="w-5 h-5" />
                        <p>{transaction.toQuantity} {transaction.toAsset}</p>
                    </div>
                    <Badge variant="outline">API</Badge>
                </div>
            )}
           
            <Separator className="my-2" />

            <div className="space-y-1">
                <InfoRow label="Fiat value" value={formattedValue} />
                <InfoRow label="Cost basis" value={formattedCostBasis} />
                <InfoRow label="Gain" value={formattedGain} />
            </div>
        </div>
      </div>
    </div>
  );
}


'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, BarChart, Bot, FileText, ShieldCheck, Zap } from 'lucide-react';
import { CryptoIcon } from '@/components/crypto/crypto-icon';

const features = [
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: 'Automated Tax Calculation',
    description: 'Connect your exchange accounts and let our AI-powered engine handle the complex tax calculations for you.',
  },
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: 'Comprehensive Reports',
    description: 'Generate detailed tax reports compliant with UK regulations, ready for submission.',
  },
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: 'AI-Powered Classification',
    description: 'Our smart AI automatically classifies transactions, saving you hours of manual work.',
  },
    {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: 'Secure & Private',
    description: 'Your financial data is encrypted and stored securely. We prioritize your privacy and security.',
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden">
             <div className="absolute inset-0 bg-grid-white/[0.05] bg-center [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
             <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-transparent"></div>
            <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
                <div className="flex flex-col items-center space-y-6">
                     <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                        Powered by AI
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400">
                        Effortless Crypto Taxes for the UK
                    </h1>
                    <p className="max-w-[700px] mx-auto text-lg text-muted-foreground md:text-xl">
                        TaxWise uses AI to simplify your crypto tax reporting. Connect your exchanges, import CSVs, and get your compliant tax reports in minutes.
                    </p>
                    <div className="space-x-4">
                        <Button asChild size="lg" variant="accent" className="gap-2">
                             <Link href="/dashboard">
                                Open Dashboard <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Features Built for You</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to accurately calculate and file your crypto taxes, without the headache.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-2 mt-12">
              {features.map((feature, index) => (
                <Card key={index} className="bg-card/50 backdrop-blur-sm border-primary/20 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20">
                  <CardContent className="p-6 flex flex-col items-start gap-4">
                    {feature.icon}
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-4 md:px-6 border-t border-border/20">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} TaxWise Crypto. All rights reserved.</p>
           <div className="flex gap-4 mt-4 md:mt-0">
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link>
            </div>
        </div>
      </footer>
    </div>
  );
}

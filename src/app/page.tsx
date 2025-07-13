
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowRight, Search, Zap } from 'lucide-react';
import Image from 'next/image';

const features = [
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: 'Automated Tax Calculation',
    description: 'Connect your exchange accounts and let our AI-powered engine handle the complex tax calculations for you.',
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: 'Comprehensive Reports',
    description: 'Generate detailed tax reports compliant with UK regulations, ready for submission.',
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: 'AI-Powered Classification',
    description: 'Our smart AI automatically classifies transactions, saving you hours of manual work.',
  },
    {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: 'Secure & Private',
    description: 'Your financial data is encrypted and stored securely. We prioritize your privacy and security.',
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      {/* Header */}
      <header className="w-full py-4 px-8 flex justify-between items-center fixed top-0 left-0 z-50 bg-background/80 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2 font-semibold">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 7L12 12L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h1 className="text-xl font-headline font-semibold">TaxWise</h1>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm hover:text-primary transition-colors">Features</Link>
            <Link href="#" className="text-sm hover:text-primary transition-colors">About Us</Link>
            <Link href="#" className="text-sm hover:text-primary transition-colors">Pricing</Link>
        </nav>
        <div className="flex items-center gap-4">
            <Search className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-primary"/>
            <Button asChild variant="outline" className="hidden md:flex bg-transparent border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                 <Link href="/dashboard">
                    Get Started
                </Link>
            </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full min-h-screen flex items-center justify-center pt-24 pb-12 md:pt-32 lg:pt-40">
            <div className="container mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-16 items-center">
                <div className="relative flex flex-col items-start space-y-6">
                    <div className="absolute -left-20 top-0 hidden md:flex items-center justify-center transform -rotate-90">
                        <span className="text-sm text-muted-foreground tracking-widest uppercase">AI POWERED - UK</span>
                    </div>
                     <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-glow">
                        Effortless-
                        <br/>
                        <span className="text-primary-foreground">Crypto Taxes</span>
                    </h1>
                    <p className="max-w-[500px] text-lg text-muted-foreground">
                        TaxWise uses AI to simplify your crypto tax reporting. Connect your exchanges, import CSVs, and get your compliant tax reports in minutes.
                    </p>
                    <div className="flex items-center gap-4 pt-4">
                        <Button asChild size="lg" className="bg-primary-foreground text-background hover:bg-primary-foreground/90 gap-2">
                             <Link href="/dashboard">
                                Get Started <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="border-muted-foreground text-muted-foreground hover:border-primary-foreground hover:text-primary-foreground">
                             <Link href="#features">
                                Learn More
                            </Link>
                        </Button>
                    </div>
                     <div className="absolute -left-12 bottom-0 hidden md:flex items-center justify-center">
                        <ArrowDown className="h-6 w-6 text-muted-foreground"/>
                    </div>
                </div>

                <div className="relative hidden md:block">
                     <div className="absolute -top-10 -right-10 w-24 h-24">
                       <svg viewBox="0 0 100 100" className="text-primary-foreground text-glow-hard opacity-70">
                        <path d="M 50,0 L 60,40 L 100,50 L 60,60 L 50,100 L 40,60 L 0,50 L 40,40 Z" fill="currentColor"/>
                       </svg>
                    </div>
                    <Image
                        src="https://images.unsplash.com/photo-1640286599723-3a216905585b?q=80&w=1887&auto=format&fit=crop"
                        alt="Crypto illustration"
                        width={600}
                        height={600}
                        className="rounded-2xl"
                        data-ai-hint="crypto coin"
                    />
                    <div className="absolute -bottom-16 left-0 w-20 h-20">
                       <svg viewBox="0 0 100 100" className="text-primary-foreground text-glow-hard opacity-70">
                         <path d="M20 20 L80 20 L80 80 L20 80 Z" stroke="currentColor" strokeWidth="4" fill="none" transform="rotate(45 50 50)"/>
                         <path d="M35 35 L65 35 L65 65 L35 65 Z" stroke="currentColor" strokeWidth="2" fill="none" transform="rotate(45 50 50)"/>
                       </svg>
                    </div>
                </div>
            </div>
        </section>

        {/* Features Section - can be built out later */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background/50">
          {/* Feature content can be added here */}
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

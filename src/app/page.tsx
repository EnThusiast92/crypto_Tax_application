
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Instagram, ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-transparent z-0"></div>
      
      <div className="relative z-10 flex flex-col flex-1">
        {/* Header */}
        <header className="px-4 lg:px-12 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center justify-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
              <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 7L12 12L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 12V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xl font-bold font-headline">TaxWise</span>
          </Link>
          <nav className="hidden gap-6 sm:gap-8 lg:flex items-center">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
            <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">Pricing</Link>
            <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">About</Link>
            <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">Contact</Link>
          </nav>
          <div className="ml-auto lg:hidden">
            <Button variant="ghost" size="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </Button>
          </div>
        </header>

        <main className="flex-1 flex items-center">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              
              {/* Left Content */}
              <div className="flex flex-col justify-center space-y-6 lg:pl-24">
                <div className="space-y-4">
                  <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
                    Crypto Taxes, <br/> <span className="text-primary">Simplified.</span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-lg">
                    Stop stressing over spreadsheets. TaxWise uses AI to automate your crypto tax reporting, ensuring accuracy and compliance.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Button asChild size="lg">
                    <Link href="/dashboard">
                      Get Started
                    </Link>
                  </Button>
                </div>
                <div className="flex items-center gap-4 pt-8">
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5"/></Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5"/></Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5"/></Link>
                </div>
              </div>

              {/* Right Image */}
              <div className="relative flex items-center justify-center -mr-32">
                 <Image
                    src="https://i.imgur.com/xt0RaoQ.png"
                    width="700"
                    height="700"
                    alt="Crypto Assets"
                    className="aspect-square overflow-hidden object-contain"
                    data-ai-hint="crypto illustration"
                  />
              </div>

            </div>
          </div>
        </main>

        {/* Footer Controls */}
        <footer className="w-full py-6 px-4 md:px-6">
            <div className="container flex justify-end items-center gap-4">
                <p className="text-sm font-medium text-muted-foreground">Effortless & Accurate</p>
                <div className="h-6 w-px bg-border"></div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4"/>
                    </Button>
                    <Button variant="outline" size="icon">
                        <ArrowRight className="h-4 w-4"/>
                    </Button>
                </div>
            </div>
        </footer>
      </div>
    </div>
  );
}

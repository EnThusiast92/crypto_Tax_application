
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Wallet, BarChart, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

const features = [
  {
    icon: <Wallet className="h-10 w-10 text-primary" />,
    title: 'Seamless CSV Imports',
    description: 'Easily upload transaction files from major exchanges like Coinbase and Binance. We handle the rest.',
  },
  {
    icon: <BarChart className="h-10 w-10 text-primary" />,
    title: 'Automated Tax Reports',
    description: 'Generate UK-compliant tax reports in minutes. Our AI engine ensures accuracy and saves you hours.',
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-primary" />,
    title: 'AI-Powered Classification',
    description: 'Our smart AI automatically classifies complex transactions, flagging potential errors for your review.',
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
        <Link href="/" className="flex items-center justify-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
            <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 7L12 12L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 12V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xl font-bold font-headline">TaxWise</span>
        </Link>
        <nav className="ml-auto hidden gap-4 sm:gap-6 lg:flex">
          <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
          <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">Pricing</Link>
          <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">About</Link>
        </nav>
        <div className="ml-auto lg:ml-4">
            <Button asChild>
                <Link href="/dashboard">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full pt-24 md:pt-32 lg:pt-48 pb-12 md:pb-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-glow">
                    Crypto Taxes, <span className="text-primary">Simplified.</span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    TaxWise uses AI to automate your crypto tax reporting. Securely connect your exchanges, import data, and generate compliant tax reports in minutes.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row pt-2">
                  <Button asChild size="lg">
                    <Link href="/dashboard">
                      Launch App
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="#features">
                      Learn More
                    </Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://i.imgur.com/GqwhjLj.png"
                width="600"
                height="600"
                alt="Hero"
                className="mx-auto aspect-square overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                data-ai-hint="crypto illustration"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-primary">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need for Crypto Taxes</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform is packed with features designed to make tax season a breeze for crypto investors in the UK.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 pt-12">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-col items-center text-center gap-4 p-6 rounded-lg border border-border/50 bg-card hover:bg-card/80 transition-colors">
                  {feature.icon}
                  <div className="grid gap-1">
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to Simplify Your Crypto Taxes?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Stop stressing over spreadsheets. Get started with TaxWise today and experience effortless tax reporting.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
                 <Button asChild size="lg" className="w-full">
                    <Link href="/dashboard">
                      Get Started for Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
              <p className="text-xs text-muted-foreground">
                No credit card required. Launch the app and see how it works.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} TaxWise Crypto. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">Terms of Service</Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">Privacy</Link>
        </nav>
      </footer>
    </div>
  );
}

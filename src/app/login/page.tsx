
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { seedDatabase } from '@/lib/data';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isFirebaseReady } = useAuth();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });
  
  const handleSeed = async () => {
    setIsSeeding(true);
    console.log('🚀 Starting seed process...');

    try {
        const result = await Promise.race([
        seedDatabase(),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Seeding timed out')), 15000)
        ),
        ]);

        toast({
        title: 'Seed Complete',
        description: 'Database has been seeded.',
        });
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        toast({
        title: 'Seed Failed',
        description: (err as Error).message || 'An error occurred during seeding.',
        variant: 'destructive',
        });
    } finally {
        setIsSeeding(false);
        console.log('🔁 Seeding UI reset');
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const loggedInUser = await login(data.email, data.password);
      if (loggedInUser) {
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${loggedInUser.name}!`,
        });
      }
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register('email')}
                disabled={isSubmitting}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                {...register('password')}
                disabled={isSubmitting}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
            <Button variant="outline" className="w-full" type="button" disabled={isSubmitting}>
              Login with Google
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
            <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                    First-time setup
                    </span>
                </div>
            </div>
            <Button variant="secondary" className="w-full" onClick={handleSeed} disabled={isSeeding || !isFirebaseReady}>
                {isSeeding ? 'Seeding...' : !isFirebaseReady ? 'Connecting...' : 'Seed Database'}
            </Button>
            <p className="text-xs text-muted-foreground text-center px-4">
                Click this once to populate your new Firebase database with sample users and transactions.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}

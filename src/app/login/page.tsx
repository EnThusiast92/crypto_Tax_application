
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

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [isGoogleSubmitting, setIsGoogleSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

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
  
  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true);
    try {
        await signInWithGoogle();
        toast({
            title: 'Google Sign-In Successful',
            description: 'Welcome to TaxWise!',
        });
    } catch (error) {
        toast({
            title: 'Google Sign-In Failed',
            description: (error as Error).message,
            variant: 'destructive',
        });
    } finally {
        setIsGoogleSubmitting(false);
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
                disabled={isSubmitting || isGoogleSubmitting}
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
                disabled={isSubmitting || isGoogleSubmitting}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || isGoogleSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
            <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn} disabled={isSubmitting || isGoogleSubmitting}>
              {isGoogleSubmitting ? 'Please wait...' : 'Login with Google'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

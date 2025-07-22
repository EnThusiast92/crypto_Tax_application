
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { AuthProvider, useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { makeAdmin } from '@/ai/flows/make-admin';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';


const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;


function LoginPageContent() {
  const { login, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [isSubmittingManual, setIsSubmittingManual] = React.useState(false);
  const [isSubmittingGoogle, setIsSubmittingGoogle] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmittingManual(true);
    try {
      await login(data.email, data.password);
      // The redirect is handled by the AuthProvider's onAuthStateChanged listener
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingManual(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setIsSubmittingGoogle(true);
    try {
        await signInWithGoogle();
        // The redirect is handled by the AuthProvider's onAuthStateChanged listener
    } catch (error) {
        toast({
            title: 'Google Sign-In Failed',
            description: (error as Error).message,
            variant: 'destructive',
        });
    } finally {
        setIsSubmittingGoogle(false);
    }
  };

  const handleMakeAdmin = async () => {
    const email = prompt("Enter the email address of the user you want to make a Developer:");
    if (!email) return;

    try {
      toast({ title: 'Promoting User...', description: 'Please wait.' });
      const result = await makeAdmin({ email });
      if (result.success) {
        toast({ title: 'Success!', description: result.message });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
       toast({
        title: 'Operation Failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };


  const isSubmitting = isSubmittingManual || isSubmittingGoogle;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-4">
        <Card>
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
                {isSubmittingManual ? 'Logging in...' : 'Login'}
              </Button>
              <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn} disabled={isSubmitting}>
                {isSubmittingGoogle ? 'Please wait...' : 'Login with Google'}
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
        
        {/* Temporary Admin Promotion Tool */}
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>First-Time Setup</AlertTitle>
          <AlertDescription className="space-y-2">
            <div>After registering your first user, click this button to make them a Developer and initialize the app.</div>
            <Button variant="destructive" size="sm" onClick={handleMakeAdmin}>Make User Admin</Button>
          </AlertDescription>
        </Alert>

      </div>
    </div>
  );
}

export default function LoginPage() {
    return (
        <AuthProvider>
            <LoginPageContent />
        </AuthProvider>
    )
}

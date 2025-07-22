
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { RegisterFormValues } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  isTaxConsultant: z.boolean().default(false),
});

type FormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [isGoogleSubmitting, setIsGoogleSubmitting] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      isTaxConsultant: false,
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const newUser = await registerUser(data);
      if (newUser) {
        toast({
          title: 'Registration Successful',
          description: "We've created your account for you.",
        });
        // Redirect is handled by the AuthProvider's useEffect
      } else {
         toast({
            title: 'Registration Failed',
            description: 'An unknown error occurred.',
            variant: 'destructive',
          });
      }
    } catch (error) {
      toast({
        title: 'Registration Failed',
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
            title: 'Google Sign-Up Successful',
            description: 'Welcome to TaxWise!',
        });
    } catch (error) {
        toast({
            title: 'Google Sign-Up Failed',
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
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>Enter your information to create an account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Satoshi Nakamoto"
                {...register('name')}
                disabled={isSubmitting || isGoogleSubmitting}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="satoshi@gmx.com"
                {...register('email')}
                disabled={isSubmitting || isGoogleSubmitting}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                disabled={isSubmitting || isGoogleSubmitting}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="isTaxConsultant" {...register('isTaxConsultant')} disabled={isSubmitting || isGoogleSubmitting} />
                <Label
                    htmlFor="isTaxConsultant"
                    className="text-sm font-normal text-muted-foreground"
                >
                   I am a Tax Consultant
                </Label>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || isGoogleSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Create an account'}
            </Button>
          </form>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
           </div>

            <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn} disabled={isSubmitting || isGoogleSubmitting}>
              {isGoogleSubmitting ? 'Please wait...' : 'Sign up with Google'}
            </Button>

          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

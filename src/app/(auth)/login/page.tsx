'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { signIn, signUp } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, UserPlus } from 'lucide-react';
import { Logo } from '@/components/logo';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

type Action = 'signIn' | 'signUp';

export default function LoginPage() {
  const [loading, setLoading] = useState<Action | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>, action: Action) {
    setLoading(action);
    try {
      if (action === 'signIn') {
        await signIn(values.email, values.password);
      } else {
        await signUp(values.email, values.password);
      }
      toast({
        title: action === 'signIn' ? 'Signed In' : 'Account Created',
        description: "You've been successfully logged in.",
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description:
          error.code === 'auth/invalid-credential'
            ? 'Invalid email or password. Please try again.'
            : error.message,
      });
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <Form {...form}>
        <form>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Logo />
            </div>
            <CardTitle className="font-headline text-2xl">
              Welcome to QuizFire
            </CardTitle>
            <CardDescription>
              Enter your credentials to access your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <Button
              type="button"
              className="w-full"
              disabled={!!loading}
              onClick={form.handleSubmit((values) => onSubmit(values, 'signIn'))}
            >
              {loading === 'signIn' ? (
                <Loader2 className="animate-spin" />
              ) : (
                <LogIn />
              )}
              <span>Sign In</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={!!loading}
              onClick={form.handleSubmit((values) => onSubmit(values, 'signUp'))}
            >
              {loading === 'signUp' ? (
                <Loader2 className="animate-spin" />
              ) : (
                <UserPlus />
              )}
              <span>Sign Up</span>
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

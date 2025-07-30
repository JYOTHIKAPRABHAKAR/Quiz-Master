'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  evaluateContentLevel,
  type EvaluateContentLevelOutput,
} from '@/ai/flows/content-level-evaluator';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  studentLearningHistory: z.string().min(20, 'Please provide more details on the student\'s history.'),
  quizContent: z.string().min(20, 'Please provide more details on the quiz content.'),
});

export default function ContentEvaluatorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<EvaluateContentLevelOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentLearningHistory: '',
      quizContent: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const evaluationResult = await evaluateContentLevel(values);
      setResult(evaluationResult);
    } catch (error) {
      console.error('Evaluation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to evaluate content. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
       <div>
        <h1 className="font-headline text-3xl font-bold">Content Level Evaluator</h1>
        <p className="text-muted-foreground">Use AI to determine if the quiz vocabulary is appropriate for a student.</p>
      </div>
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="font-headline">Evaluation Inputs</CardTitle>
              <CardDescription>
                Provide the student's learning background and the content of the quiz to be evaluated.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="studentLearningHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student Learning History</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Student is in 10th grade, has shown proficiency in basic algebra but struggles with abstract concepts. English is their second language..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quizContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quiz Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste the full quiz content here, including all questions and options..."
                        className="min-h-[160px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Evaluate Content
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      {isLoading && (
         <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-muted-foreground animate-in fade-in">
            <Loader2 className="mr-2 h-8 w-8 animate-spin mb-2" />
            <span className="font-semibold">AI is analyzing the content...</span>
         </div>
      )}

      {result && (
        <Card className="animate-in fade-in">
            <CardHeader>
                <CardTitle className="font-headline">Evaluation Result</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert variant={result.isAppropriate ? 'default' : 'destructive'}>
                    {result.isAppropriate ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    <AlertTitle className="font-bold">
                        {result.isAppropriate ? 'Content is Appropriate' : 'Content May Not Be Appropriate'}
                    </AlertTitle>
                    <AlertDescription>
                        {result.explanation}
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
      )}
    </div>
  );
}

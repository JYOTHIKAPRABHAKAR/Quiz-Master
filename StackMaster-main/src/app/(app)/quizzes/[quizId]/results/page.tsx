

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Award, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { type Question, type UserResult } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


export default function ResultsPage() {
    return (
        <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <ResultsContent />
        </Suspense>
    );
}


function ResultsContent() {
  const [results, setResults] = useState<UserResult | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let submission: UserResult | null = null;
    const resultId = searchParams.get('resultId');

    if (resultId) {
        const allResults: UserResult[] = JSON.parse(localStorage.getItem('quizResults') || '[]');
        submission = allResults.find(r => r.id === resultId) || null;
    } else {
        const storedResults = sessionStorage.getItem('quizSubmission');
        if (storedResults) {
            try {
                submission = JSON.parse(storedResults);
                sessionStorage.removeItem('quizSubmission');
            } catch (error) {
                 console.error("Failed to parse quiz results from session storage", error);
            }
        }
    }
    
    if (submission) {
        setResults(submission);
    } else if (!resultId) { // Only redirect if we didn't come from a "view results" link
        router.replace('/dashboard');
    }
    
    setLoading(false);
  }, [router, searchParams]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!results) {
    // This can happen if the resultId is invalid, show a message instead of blank screen
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>Result Not Found</CardTitle>
          <CardDescription>The quiz result you are looking for could not be found.</CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const { score, total, questions = [], answers, quizTitle } = results;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const wrongQuestions = Array.isArray(questions) ? questions.filter(q => answers[q.id] !== q.correctAnswer) : [];
  const isPerfectScore = score === total && total > 0;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Card className="text-center shadow-lg animate-in fade-in zoom-in-95">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 mb-4">
             <Award className="h-10 w-10 text-accent" />
          </div>
          <CardTitle className="font-headline text-3xl">{quizTitle} - Results</CardTitle>
          <CardDescription className="text-lg">Here's how you did.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-8">
          <div className="text-6xl font-bold text-primary">
            {score} <span className="text-4xl font-normal text-muted-foreground">/ {total}</span>
          </div>
          <div>
            <Progress value={percentage} className="h-3" />
            <p className="mt-2 text-xl font-semibold">{percentage}%</p>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4 pt-6">
          <Button asChild className="w-full max-w-xs">
            <Link href="/dashboard">My Results</Link>
          </Button>
        </CardFooter>
      </Card>

      {wrongQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Review Your Incorrect Answers</CardTitle>
            <CardDescription>Here are the questions you got wrong and their correct answers.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {wrongQuestions.map((question, index) => {
                const userAnswerIndex = answers[question.id];
                
                return (
                  <AccordionItem key={question.id} value={`item-${index}`}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-4 w-full pr-4">
                        <XCircle className="h-5 w-5 text-destructive flex-shrink-0"/>
                        <span className="flex-1 text-left">{question.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pl-9">
                        {question.options.map((option, optIndex) => {
                          const isUserAnswer = userAnswerIndex === optIndex;
                          const isCorrectAnswer = question.correctAnswer === optIndex;
                          
                          return (
                             <div key={optIndex} className={cn(
                              "flex items-center rounded-md border p-3 text-sm",
                              isCorrectAnswer && "border-green-500 bg-green-500/10 text-green-700 font-semibold",
                              isUserAnswer && !isCorrectAnswer && "border-destructive bg-destructive/10 text-destructive",
                             )}>
                                {isCorrectAnswer ? <CheckCircle className="h-4 w-4 mr-2 text-green-500"/> : isUserAnswer ? <XCircle className="h-4 w-4 mr-2 text-destructive"/> : <div className="w-4 h-4 mr-2"/>}
                                <span className="flex-1">{option}</span>
                                {isUserAnswer && !isCorrectAnswer && <span className="ml-auto text-xs font-semibold">(Your Answer)</span>}
                                {isCorrectAnswer && <span className="ml-auto text-xs font-semibold">(Correct Answer)</span>}
                             </div>
                          )
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {isPerfectScore && (
         <Card>
            <CardHeader className="items-center text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mb-2"/>
                <CardTitle className="font-headline">Perfect Score!</CardTitle>
                <CardDescription>Congratulations, you answered all {total} questions correctly.</CardDescription>
            </CardHeader>
         </Card>
      )}
    </div>
  );
}

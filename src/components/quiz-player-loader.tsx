
'use client';

import { generateQuiz } from '@/ai/flows/quiz-generator';
import { useEffect, useState } from 'react';
import type { Quiz } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QuizPlayer } from '@/components/quiz-player';
import { notFound } from 'next/navigation';

interface QuizPlayerLoaderProps {
  quizDetails: Quiz;
  difficultyLevel: number;
}

export const QuizPlayerLoader: React.FC<QuizPlayerLoaderProps> = ({ quizDetails, difficultyLevel }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    if (!quizDetails) {
      notFound();
      return;
    }

    const createQuiz = async () => {
      try {
        setLoading(true);
        const { questions } = await generateQuiz({
          topic: quizDetails.title,
          questionCount: quizDetails.questionCount,
          difficultyLevel: difficultyLevel,
        });
        setQuiz({ ...quizDetails, questions });
      } catch (error) {
        console.error("Failed to generate quiz:", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not generate the quiz. Please try again later.',
        });
      } finally {
        setLoading(false);
      }
    };

    createQuiz();
  }, [quizDetails, difficultyLevel, toast]);


  if (loading) {
     return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <Loader2 className="mr-2 h-8 w-8 animate-spin mb-4" />
            <p className="text-lg font-semibold">Generating your unique quiz...</p>
            <p className="text-muted-foreground">This may take a moment. Please wait.</p>
         </div>
      );
  }

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-destructive/50 p-8 text-center">
          <p className="text-lg font-semibold text-destructive">Failed to load quiz.</p>
          <p className="text-muted-foreground">Please try refreshing the page.</p>
       </div>
    );
  }

  return <QuizPlayer quiz={quiz} difficultyLevel={difficultyLevel} />;
}

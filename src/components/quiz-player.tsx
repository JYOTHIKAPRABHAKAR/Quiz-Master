
'use client';

import { useState, useEffect, type FC } from 'react';
import { useRouter } from 'next/navigation';
import { type Quiz, type UserResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Timer, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface QuizPlayerProps {
  quiz: Quiz;
  difficultyLevel: number;
}

export const QuizPlayer: FC<QuizPlayerProps> = ({ quiz, difficultyLevel }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);
  
  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const goToNextQuestion = () => {
    if (answers[currentQuestion.id] === undefined) {
      toast({
        variant: 'destructive',
        title: 'No Answer Selected',
        description: 'Please select an answer before proceeding.',
      });
      return;
    }

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    let score = 0;
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        score++;
      }
    });

    const totalQuestions = quiz.questions.length;
    
    // Prepare data for both session and local storage
    if (user) {
      const newResult: UserResult = {
        id: `res-${Date.now()}-${user.uid}`,
        quizId: quiz.id,
        quizTitle: quiz.title,
        userId: user.uid,
        userName: user.displayName || user.email || 'Anonymous',
        score,
        total: totalQuestions,
        date: new Date().toISOString(),
        questions: quiz.questions, 
        answers,
        difficultyLevel: difficultyLevel,
      };

      // 1. Save to session storage for immediate results page
      sessionStorage.setItem('quizSubmission', JSON.stringify(newResult));

      // 2. Save to local storage for persistent user history
      const allResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
      allResults.push(newResult);
      localStorage.setItem('quizResults', JSON.stringify(allResults));

      toast({
        title: "Quiz Submitted!",
        description: `You scored ${score} out of ${totalQuestions}.`,
      });
      router.push(`/quizzes/${quiz.id}/results`);
    } else {
        toast({
            variant: 'destructive',
            title: "Error",
            description: "You must be logged in to save results.",
        });
    }
  };
  
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div>
      <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-destructive">
          <Timer className="h-6 w-6" />
          <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
        </div>
        <div className="w-full sm:w-64">
          <Progress value={progress} className="h-2" />
          <div className="text-sm text-muted-foreground text-center mt-1">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </div>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl leading-snug">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            key={currentQuestion.id}
            value={answers[currentQuestion.id]?.toString()}
            onValueChange={(value) => handleAnswerSelect(currentQuestion.id, parseInt(value, 10))}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, index) => (
              <Label key={index} htmlFor={`${currentQuestion.id}-${index}`} className="flex items-center space-x-3 rounded-md border p-4 cursor-pointer transition-colors hover:bg-accent/10 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-secondary">
                <RadioGroupItem value={index.toString()} id={`${currentQuestion.id}-${index}`} />
                <span className="flex-1 text-base font-normal">{option}</span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="justify-between border-t pt-6">
          <Button variant="outline" onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <Button onClick={goToNextQuestion}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button>Submit Quiz</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You cannot change your answers after submitting. This action is final.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

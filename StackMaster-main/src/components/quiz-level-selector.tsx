
'use client';

import * as React from 'react';
import { notFound, useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { QuizPlayerLoader } from '@/components/quiz-player-loader';
import { type Quiz, type UserResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { BarChart, GraduationCap, ChevronRight, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

interface QuizLevelSelectorProps {
    quizDetails: Quiz;
}

export function QuizLevelSelector({ quizDetails }: QuizLevelSelectorProps) {
  const [level, setLevel] = React.useState<number | null>(null);
  const [highestPassedLevel, setHighestPassedLevel] = React.useState(0);
  const [unlockedSection, setUnlockedSection] = React.useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const { user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (user) {
      const allResults: UserResult[] = JSON.parse(localStorage.getItem('quizResults') || '[]');
      const userQuizResults = allResults.filter(
        r => r.userId === user.uid && r.quizId === quizDetails.id
      );

      const passedLevels = new Set(
        userQuizResults
          .filter(r => r.difficultyLevel && r.score === r.total)
          .map(r => r.difficultyLevel!)
      );

      const maxPassed = passedLevels.size > 0 ? Math.max(...Array.from(passedLevels)) : 0;
      setHighestPassedLevel(maxPassed);
      
      const beginnerPassed = [1, 2, 3, 4, 5].every(lvl => passedLevels.has(lvl));
      const intermediatePassed = [6, 7, 8, 9, 10].every(lvl => passedLevels.has(lvl));

      if (beginnerPassed && intermediatePassed) {
        setUnlockedSection('advanced');
      } else if (beginnerPassed) {
        setUnlockedSection('intermediate');
      } else {
        setUnlockedSection('beginner');
      }
    }
  }, [user, quizDetails.id]);

  if (!quizDetails) {
    notFound();
  }

  const handleLevelSelect = (selectedLevel: number) => {
    if (selectedLevel <= highestPassedLevel + 1) {
        setLevel(selectedLevel);
    }
  };

  const levels = Array.from({ length: 15 }, (_, i) => i + 1);
  const beginnerLevels = levels.slice(0, 5);
  const intermediateLevels = levels.slice(5, 10);
  const advancedLevels = levels.slice(10, 15);
  
  const LevelButton = ({lvl}: {lvl: number}) => {
    const isLocked = lvl > highestPassedLevel + 1;
    return (
        <Button
            key={lvl}
            variant="outline"
            onClick={() => handleLevelSelect(lvl)}
            disabled={isLocked}
            className="relative"
            aria-label={isLocked ? `Level ${lvl} (Locked)` : `Level ${lvl}`}
        >
            {isLocked && <Lock className="absolute h-3 w-3 -top-1 -right-1 text-muted-foreground" />}
            Level {lvl}
        </Button>
    )
  }

  if (level) {
    return (
      <div className="mx-auto max-w-4xl">
        <Card className="mb-8 bg-card/50">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              {quizDetails.title}
            </CardTitle>
            <CardDescription>
              {quizDetails.description} - Level {level}
            </CardDescription>
          </CardHeader>
        </Card>
        <QuizPlayerLoader quizDetails={quizDetails} difficultyLevel={level} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
        <Button variant="outline" asChild>
            <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Link>
        </Button>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">
            Select Your Difficulty Level
          </CardTitle>
          <CardDescription>
            Pass a level with a 100% score to unlock the next. Complete all levels in a section to unlock the next section.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="flex items-center text-lg font-semibold text-muted-foreground">
              <GraduationCap className="mr-2 h-5 w-5" />
              Beginner (Levels 1-5)
            </h3>
            <div className="flex flex-wrap gap-2">
              {beginnerLevels.map((lvl) => <LevelButton key={lvl} lvl={lvl} />)}
            </div>
          </div>
          <div className="space-y-2">
             <h3 className="flex items-center text-lg font-semibold text-muted-foreground">
                <BarChart className="mr-2 h-5 w-5" />
                Intermediate (Levels 6-10)
                {unlockedSection === 'beginner' && <Lock className="ml-2 h-4 w-4" />}
            </h3>
            <div className="flex flex-wrap gap-2">
              {intermediateLevels.map((lvl) => (
                unlockedSection !== 'beginner' ? <LevelButton key={lvl} lvl={lvl} /> : 
                <Button key={lvl} variant="outline" disabled className="relative">
                    <Lock className="absolute h-3 w-3 -top-1 -right-1 text-muted-foreground" />
                    Level {lvl}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
             <h3 className="flex items-center text-lg font-semibold text-muted-foreground">
                <ChevronRight className="mr-2 h-5 w-5" />
                Advanced (Levels 11-15)
                {unlockedSection !== 'advanced' && <Lock className="ml-2 h-4 w-4" />}
            </h3>
            <div className="flex flex-wrap gap-2">
              {advancedLevels.map((lvl) => (
                unlockedSection === 'advanced' ? <LevelButton key={lvl} lvl={lvl} /> :
                <Button key={lvl} variant="outline" disabled className="relative">
                    <Lock className="absolute h-3 w-3 -top-1 -right-1 text-muted-foreground" />
                    Level {lvl}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            The AI will generate questions tailored to your selected difficulty.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

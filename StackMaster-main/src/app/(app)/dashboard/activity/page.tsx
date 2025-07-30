
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, TrendingUp, Trophy, Star, Target, ArrowLeft } from 'lucide-react';
import type { UserResult } from '@/lib/types';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { subDays, format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ActivityPage() {
  const { user, loading } = useAuth();
  const [userResults, setUserResults] = useState<UserResult[]>([]);

  useEffect(() => {
    if (user) {
      const allResults: UserResult[] = JSON.parse(localStorage.getItem('quizResults') || '[]');
      const currentUserResults = allResults.filter(
        (result: UserResult) => result.userId === user.uid
      );
      setUserResults(currentUserResults);
    }
  }, [user]);

  const stats = useMemo(() => {
    if (userResults.length === 0) {
      return {
        totalQuizzes: 0,
        averageScore: 0,
        highestLevel: 0,
        bestQuiz: 'N/A',
      };
    }

    const totalQuizzes = userResults.length;
    const totalScore = userResults.reduce((acc, r) => acc + (r.score / r.total) * 100, 0);
    const averageScore = Math.round(totalScore / totalQuizzes);
    const highestLevel = Math.max(0, ...userResults.map(r => r.difficultyLevel || 0));
    
    const bestPerformingQuiz = userResults.reduce((best, current) => {
        const bestScore = (best.score / best.total);
        const currentScore = (current.score / current.total);
        return currentScore > bestScore ? current : best;
    });

    return {
      totalQuizzes,
      averageScore,
      highestLevel,
      bestQuiz: `${bestPerformingQuiz.quizTitle} (${Math.round(bestPerformingQuiz.score/bestPerformingQuiz.total * 100)}%)`,
    };
  }, [userResults]);

  const chartData = useMemo(() => {
    const data: { name: string; total: number }[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const formattedDate = format(date, 'yyyy-MM-dd');
      const dayName = format(date, 'EEE');
      
      const quizzesOnDay = userResults.filter(
        r => format(parseISO(r.date), 'yyyy-MM-dd') === formattedDate
      ).length;

      data.push({ name: dayName, total: quizzesOnDay });
    }
    return data;
  }, [userResults]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
       <Button variant="outline" asChild>
            <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Link>
        </Button>
      <div>
        <h1 className="font-headline text-3xl font-bold">My Activity</h1>
        <p className="text-muted-foreground">An overview of your quiz performance and progress.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quizzes Taken</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
            <p className="text-xs text-muted-foreground">Keep up the great work!</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
            <p className="text-xs text-muted-foreground">Your average across all quizzes.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Level Passed</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Level {stats.highestLevel}</div>
             <p className="text-xs text-muted-foreground">Your peak performance so far.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Quiz</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{stats.bestQuiz}</div>
            <p className="text-xs text-muted-foreground">Your highest scoring quiz.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Recent Activity</CardTitle>
          <CardDescription>Number of quizzes completed in the last 7 days.</CardDescription>
        </CardHeader>
        <CardContent>
          {userResults.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                    }}
                 />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[350px] items-center justify-center text-muted-foreground">
                <p>No activity yet. Complete a quiz to see your stats!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

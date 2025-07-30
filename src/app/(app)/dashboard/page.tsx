
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { quizzes } from '@/lib/data';
import { UserResult } from '@/lib/types';
import { cn } from '@/lib/utils';
import { FileText, Clock, Loader2, User, Eye, History } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const allResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
      const currentUserResults = allResults.filter(
        (result: UserResult) => result.userId === user.uid
      );
      setUserResults(currentUserResults.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  }, [user]);

  const viewResults = (quizId: string, resultId: string) => {
    router.push(`/quizzes/${quizId}/results?resultId=${resultId}`);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayName = user?.displayName || user?.email || 'User';
  const recentResults = userResults.slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">
          Welcome back, {displayName}!
        </h1>
        <p className="text-muted-foreground">
          Here are the available quizzes. Good luck!
        </p>
      </div>

      <section>
        <h2 className="font-headline text-2xl font-semibold mb-4">
          Available Quizzes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card
              key={quiz.id}
              className="flex flex-col transition-shadow duration-300 hover:shadow-lg"
            >
              <CardHeader>
                <CardTitle className="font-headline text-xl">
                  {quiz.title}
                </CardTitle>
                <CardDescription>{quiz.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{quiz.questionCount} Questions</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{quiz.timeLimit} minutes</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/quizzes/${quiz.id}`}>Start Quiz</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-headline text-2xl font-semibold mb-4">
          My Recent Results
        </h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quiz Title</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="text-center">Result</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentResults.length > 0 ? (
                recentResults.map((result) => {
                  const percentage = Math.round(
                    (result.score / result.total) * 100
                  );
                  const passed = percentage >= 50;
                  return (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">
                        {result.quizTitle}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {new Date(result.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">
                        {result.score}/{result.total} ({percentage}%)
                      </TableCell>
                      <TableCell className="text-center">
                        <div
                          className={cn(
                            'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                            passed
                              ? 'border-transparent bg-accent text-accent-foreground'
                              : 'border-transparent bg-destructive text-destructive-foreground'
                          )}
                        >
                          {passed ? 'Passed' : 'Failed'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => viewResults(result.quizId, result.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    You haven't completed any quizzes yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
           {userResults.length > 5 && (
            <CardFooter className="justify-center border-t pt-6">
                <Button variant="outline" asChild>
                    <Link href="/dashboard/history">
                        <History className="mr-2 h-4 w-4" />
                        View Full History
                    </Link>
                </Button>
            </CardFooter>
           )}
        </Card>
      </section>
    </div>
  );
}

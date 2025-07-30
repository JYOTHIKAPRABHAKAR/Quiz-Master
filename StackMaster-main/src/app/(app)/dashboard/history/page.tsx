
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Card,
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
import { UserResult } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Loader2, Eye, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const RESULTS_PER_PAGE = 10;

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
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
  
  const totalPages = Math.ceil(userResults.length / RESULTS_PER_PAGE);
  const paginatedResults = userResults.slice(
    (currentPage - 1) * RESULTS_PER_PAGE,
    currentPage * RESULTS_PER_PAGE
  );

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };


  return (
    <div className="space-y-8">
       <Button variant="outline" asChild>
            <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Link>
        </Button>
      <Card>
        <CardHeader>
            <CardTitle className="font-headline text-3xl">My Full History</CardTitle>
            <CardDescription>Review all of your past quiz results.</CardDescription>
        </CardHeader>
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
              {paginatedResults.length > 0 ? (
                paginatedResults.map((result) => {
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
          {totalPages > 1 && (
            <CardFooter className="justify-between border-t pt-6">
                <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrevPage} disabled={currentPage === 1}>
                        <ChevronLeft className="mr-2 h-4 w-4"/>
                        Previous
                    </Button>
                    <Button variant="outline" onClick={handleNextPage} disabled={currentPage === totalPages}>
                        Next
                        <ChevronRight className="ml-2 h-4 w-4"/>
                    </Button>
                </div>
            </CardFooter>
          )}
      </Card>
    </div>
  );
}

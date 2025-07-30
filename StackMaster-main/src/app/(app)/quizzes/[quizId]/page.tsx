
import { getQuizById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { QuizLevelSelector } from '@/components/quiz-level-selector';

type QuizPageProps = {
  params: {
    quizId: string;
  };
};

export default function QuizPage({ params }: QuizPageProps) {
  const quizDetails = getQuizById(params.quizId);

  if (!quizDetails) {
    notFound();
  }

  return <QuizLevelSelector quizDetails={quizDetails} />;
}

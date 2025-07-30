export type Question = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
};

export type Quiz = {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  timeLimit: number; // in minutes
  questions: Question[];
};

export type UserResult = {
  id: string;
  quizId: string;
  quizTitle: string;
  userId: string;
  userName: string;
  score: number;
  total: number;
  date: string;
  questions: Question[];
  answers: Record<number, number>;
  difficultyLevel?: number;
};

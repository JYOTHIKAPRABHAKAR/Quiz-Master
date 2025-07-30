
import type { Quiz } from './types';

// Questions will be generated dynamically by AI. The 'questions' array is now empty.
export const quizzes: Quiz[] = [
  {
    id: '7',
    title: 'Basic HTML',
    description: 'Test your knowledge of fundamental HTML tags and structure.',
    questionCount: 5,
    timeLimit: 5,
    questions: []
  },
  {
    id: '8',
    title: 'CSS Fundamentals',
    description: 'Covering the basics of Cascading Style Sheets.',
    questionCount: 5,
    timeLimit: 7,
    questions: []
  },
   {
    id: '12',
    title: 'Tailwind CSS',
    description: 'A quiz on the popular utility-first CSS framework.',
    questionCount: 8,
    timeLimit: 10,
    questions: []
  },
  {
    id: '9',
    title: 'Bootstrap Basics',
    description: 'A quiz on the popular CSS framework, Bootstrap.',
    questionCount: 5,
    timeLimit: 7,
    questions: []
  },
  {
    id: '10',
    title: 'CSS Grid Layout',
    description: 'Test your knowledge of the powerful CSS Grid Layout system.',
    questionCount: 5,
    timeLimit: 8,
    questions: []
  },
  {
    id: '1',
    title: 'Modern JavaScript Fundamentals',
    description: 'Test your knowledge of ES6+ features, including async/await, destructuring, and more.',
    questionCount: 10,
    timeLimit: 15,
    questions: [],
  },
  {
    id: '2',
    title: 'React.js Core Concepts',
    description: 'A quiz covering the fundamental concepts of React, including components, state, and props.',
    questionCount: 8,
    timeLimit: 10,
    questions: []
  },
   {
    id: '13',
    title: 'MySQL Basics',
    description: 'Test your knowledge of the popular open-source relational database.',
    questionCount: 10,
    timeLimit: 12,
    questions: []
  },
  {
    id: '11',
    title: 'Python Programming: From Beginner to Advanced',
    description: 'Test your Python knowledge, from basic syntax to advanced concepts.',
    questionCount: 10,
    timeLimit: 15,
    questions: []
  },
  {
    id: '4',
    title: 'Calculus I Basics',
    description: 'Test your knowledge of fundamental differential calculus concepts.',
    questionCount: 5,
    timeLimit: 8,
    questions: []
  },
  {
    id: '5',
    title: 'Introduction to Psychology',
    description: 'Explore the basics of human behavior and mental processes.',
    questionCount: 5,
    timeLimit: 7,
    questions: []
  }
];

export const getQuizById = (id: string): Quiz | undefined => {
  return quizzes.find(quiz => quiz.id === id);
};

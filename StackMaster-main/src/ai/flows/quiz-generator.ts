'use server';

/**
 * @fileOverview A quiz generation AI agent.
 *
 * - generateQuiz - A function that handles the quiz generation process.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Question } from '@/lib/types';

const QuestionSchema = z.object({
  id: z.number(),
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.number(),
});

const GenerateQuizInputSchema = z.object({
  topic: z.string().describe('The topic for the quiz.'),
  questionCount: z.number().describe('The number of questions to generate.'),
  difficultyLevel: z
    .number()
    .min(1)
    .max(15)
    .describe('The difficulty level of the quiz, from 1 (basic) to 15 (advanced).'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  questions: z.array(QuestionSchema),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;


export async function generateQuiz(
  input: GenerateQuizInput
): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: { schema: GenerateQuizInputSchema },
  output: { schema: GenerateQuizOutputSchema },
  prompt: `You are an expert curriculum designer and quiz creator for a full-stack developer learning platform. Your task is to generate a quiz with {{questionCount}} multiple-choice questions on the topic of "{{topic}}".

The questions MUST be tailored to the specified difficulty level: {{difficultyLevel}} on a scale of 1 to 15.

- **Levels 1-3 (Beginner):** Focus on fundamental definitions, syntax, and basic concepts. e.g., "What does HTML stand for?"
- **Levels 4-6 (Foundation):** Test understanding of core mechanics and common use cases. e.g., "What is the difference between 'let' and 'const' in JavaScript?"
- **Levels 7-9 (Intermediate):** Require application of knowledge to simple problems. e.g., "Given this CSS, which element will have the highest specificity?"
- **Levels 10-12 (Advanced):** Involve combining multiple concepts, understanding trade-offs, and best practices. e.g., "How would you optimize this React component to prevent unnecessary re-renders?"
- **Levels 13-15 (Expert):** Present complex scenarios, architectural questions, and require deep, nuanced knowledge to solve a problem. e.g., "Analyze this database schema for potential performance bottlenecks under high load."

CRITICAL: Do NOT repeat questions. Each difficulty level must present a new and distinct set of challenges. The questions must become progressively and noticeably harder. A level 3 question must be harder than a level 2 question.

For each question:
- It must have exactly 4 options.
- One option must be the correct answer.
- The 'correctAnswer' field must be the zero-based index of the correct option. Before finalizing, double-check that the index points to the genuinely correct answer. For example, if the options are ["<a>", "<b>", "<c>", "<d>"] and "<a>" is correct, the correctAnswer MUST be 0.
- The 'id' for each question must be a unique number starting from 1.

Return the questions in the specified JSON format.
  `,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);

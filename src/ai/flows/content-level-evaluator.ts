'use server';

/**
 * @fileOverview A content level evaluation AI agent.
 *
 * - evaluateContentLevel - A function that handles the content level evaluation process.
 * - EvaluateContentLevelInput - The input type for the evaluateContentLevel function.
 * - EvaluateContentLevelOutput - The return type for the evaluateContentLevel function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateContentLevelInputSchema = z.object({
  studentLearningHistory: z
    .string()
    .describe('The learning history of the student.'),
  quizContent: z.string().describe('The content of the quiz.'),
});
export type EvaluateContentLevelInput = z.infer<typeof EvaluateContentLevelInputSchema>;

const EvaluateContentLevelOutputSchema = z.object({
  isAppropriate: z
    .boolean()
    .describe(
      'Whether or not the quiz content is appropriate for the student.'
    ),
  explanation: z
    .string()
    .describe('The explanation of why the content is appropriate or not.'),
});
export type EvaluateContentLevelOutput = z.infer<typeof EvaluateContentLevelOutputSchema>;

export async function evaluateContentLevel(
  input: EvaluateContentLevelInput
): Promise<EvaluateContentLevelOutput> {
  return evaluateContentLevelFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateContentLevelPrompt',
  input: {schema: EvaluateContentLevelInputSchema},
  output: {schema: EvaluateContentLevelOutputSchema},
  prompt: `You are an expert educator specializing in evaluating the appropriateness of quiz content for students.

You will use the student's learning history and the quiz content to determine if the quiz is appropriate for the student.

Student Learning History: {{{studentLearningHistory}}}
Quiz Content: {{{quizContent}}}

Is the quiz content appropriate for the student?  Explain why or why not.  Set the isAppropriate output field appropriately.
`,
});

const evaluateContentLevelFlow = ai.defineFlow(
  {
    name: 'evaluateContentLevelFlow',
    inputSchema: EvaluateContentLevelInputSchema,
    outputSchema: EvaluateContentLevelOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

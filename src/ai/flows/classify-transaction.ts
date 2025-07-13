'use server';

/**
 * @fileOverview AI-powered transaction classifier.
 *
 * This flow analyzes transaction data and flags potentially misclassified entries.
 * It provides suggestions for alternate classifications to ensure accurate tax reporting.
 *
 * - classifyTransaction - The main function to classify transactions.
 * - ClassifyTransactionInput - The input type for the classifyTransaction function.
 * - ClassifyTransactionOutput - The output type for the classifyTransaction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifyTransactionInputSchema = z.object({
  transactionData: z.string().describe('The transaction data to classify.'),
  currentClassification: z.string().describe('The current classification of the transaction.'),
});
export type ClassifyTransactionInput = z.infer<typeof ClassifyTransactionInputSchema>;

const ClassifyTransactionOutputSchema = z.object({
  isMisclassified: z.boolean().describe('Whether the transaction is potentially misclassified.'),
  suggestedClassification: z.string().describe('A suggested alternate classification for the transaction.'),
  confidence: z.number().describe('The confidence level (0-1) in the misclassification assessment.'),
});
export type ClassifyTransactionOutput = z.infer<typeof ClassifyTransactionOutputSchema>;

export async function classifyTransaction(input: ClassifyTransactionInput): Promise<ClassifyTransactionOutput> {
  return classifyTransactionFlow(input);
}

const classifyTransactionPrompt = ai.definePrompt({
  name: 'classifyTransactionPrompt',
  input: {schema: ClassifyTransactionInputSchema},
  output: {schema: ClassifyTransactionOutputSchema},
  prompt: `You are an expert in classifying cryptocurrency transactions for tax purposes.

  Analyze the following transaction data and determine if it is potentially misclassified.
  Provide a suggested alternate classification if you believe the transaction is misclassified.

  Transaction Data: {{{transactionData}}}
  Current Classification: {{{currentClassification}}}

  Respond with a JSON object that contains the following fields:
  - isMisclassified: true if the transaction is likely misclassified, false otherwise.
  - suggestedClassification: A suggested alternate classification if isMisclassified is true, otherwise null.
  - confidence: A number between 0 and 1 indicating the confidence level in the misclassification assessment.
  `,
});

const classifyTransactionFlow = ai.defineFlow(
  {
    name: 'classifyTransactionFlow',
    inputSchema: ClassifyTransactionInputSchema,
    outputSchema: ClassifyTransactionOutputSchema,
  },
  async input => {
    const {output} = await classifyTransactionPrompt(input);
    return output!;
  }
);

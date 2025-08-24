'use server';
/**
 * @fileOverview A flow for generating suggestions for a club leader.
 *
 * - generateSuggestion - A function that generates a suggestion.
 * - GenerateSuggestionInput - The input type for the generateSuggestion function.
 * - GenerateSuggestionOutput - The return type for the generateSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSuggestionInputSchema = z.object({
  topic: z.string().describe('The topic for which a suggestion is needed.'),
});
export type GenerateSuggestionInput = z.infer<
  typeof GenerateSuggestionInputSchema
>;

const GenerateSuggestionOutputSchema = z.object({
  suggestion: z.string().describe('The generated suggestion.'),
});
export type GenerateSuggestionOutput = z.infer<
  typeof GenerateSuggestionOutputSchema
>;

const suggestionPrompt = ai.definePrompt({
  name: 'suggestionPrompt',
  input: {schema: GenerateSuggestionInputSchema},
  output: {schema: GenerateSuggestionOutputSchema},
  prompt: `You are an expert in student club management.
  The user is a club leader and needs a suggestion for "{{topic}}".
  
  Please provide a creative and engaging suggestion for them.`,
});

const generateSuggestionFlow = ai.defineFlow(
  {
    name: 'generateSuggestionFlow',
    inputSchema: GenerateSuggestionInputSchema,
    outputSchema: GenerateSuggestionOutputSchema,
  },
  async (input: GenerateSuggestionInput) => {
    const {output} = await suggestionPrompt(input);
    return output!;
  }
);

export async function generateSuggestion(
  input: GenerateSuggestionInput
): Promise<GenerateSuggestionOutput> {
  return generateSuggestionFlow(input);
}

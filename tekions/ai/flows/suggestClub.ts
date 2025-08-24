'use server';
/**
 * @fileOverview A flow for suggesting a club to a user based on their interests.
 *
 * - suggestClub - A function that suggests a club based on interests.
 * - SuggestClubInput - The input type for the suggestClub function.
 * - SuggestClubOutput - The return type for the suggestClub function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {allClubs} from '@/lib/mock-data';

const SuggestClubInputSchema = z.object({
  interest: z.string().describe('The user\'s stated interest.'),
});
export type SuggestClubInput = z.infer<typeof SuggestClubInputSchema>;

const SuggestClubOutputSchema = z.object({
  clubName: z.string().describe('The name of the suggested club.'),
  reason: z.string().describe('A brief explanation for why this club is a good match.'),
});
export type SuggestClubOutput = z.infer<typeof SuggestClubOutputSchema>;


const clubSuggestionPrompt = ai.definePrompt({
  name: 'clubSuggestionPrompt',
  input: {schema: z.object({ interest: z.string(), clubs: z.any() })},
  output: {schema: SuggestClubOutputSchema},
  prompt: `You are an expert student advisor. A student has expressed an interest in "{{interest}}".
  
  Based on the following list of available clubs, please suggest the best fit for them. Provide the name of the club and a short, encouraging reason why it's a great match.

  Available Clubs:
  {{#each clubs}}
  - {{this.name}}: {{this.description}} (Category: {{this.category}})
  {{/each}}
  `,
});

const suggestClubFlow = ai.defineFlow(
  {
    name: 'suggestClubFlow',
    inputSchema: SuggestClubInputSchema,
    outputSchema: SuggestClubOutputSchema,
  },
  async (input) => {
    const {output} = await clubSuggestionPrompt({
        interest: input.interest,
        clubs: allClubs,
    });
    return output!;
  }
);

export async function suggestClub(
  input: SuggestClubInput
): Promise<SuggestClubOutput> {
  return suggestClubFlow(input);
}

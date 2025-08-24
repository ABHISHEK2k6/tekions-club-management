'use server';
/**
 * @fileOverview A flow for suggesting a club to a user based on their interests.
 *
 * - suggestClub - A function that suggests a club based on interests.
 * - SuggestClubInput - The input type for the suggestClub function.
 * - SuggestClubOutput - The return type for the suggestClub function.
 */

import {ai} from '@/lib/ai/genkit';
import {z} from 'genkit';
import {allClubs} from '@/lib/mock-data';

const SuggestClubInputSchema = z.object({
  interest: z.string().describe('The user\'s stated interest.'),
  clubs: z.array(z.any()).optional().describe('Array of clubs from database. If not provided, will use mock data.'),
});
export type SuggestClubInput = z.infer<typeof SuggestClubInputSchema>;

const SuggestClubOutputSchema = z.object({
  clubName: z.string().describe('The name of the suggested club.'),
  clubId: z.string().describe('The ID of the suggested club.'),
  reason: z.string().describe('A brief explanation for why this club is a good match.'),
  matchScore: z.number().min(1).max(10).describe('A score from 1-10 indicating how well this club matches the user\'s interest.'),
});
export type SuggestClubOutput = z.infer<typeof SuggestClubOutputSchema>;


const clubSuggestionPrompt = ai.definePrompt({
  name: 'clubSuggestionPrompt',
  input: {schema: z.object({ interest: z.string(), clubs: z.any() })},
  output: {schema: SuggestClubOutputSchema},
  prompt: `You are an expert student advisor with deep knowledge of club categorization and student interests. A student has expressed an interest in "{{interest}}".

  CRITICAL MATCHING RULES:
  1. PRIORITIZE EXACT SEMANTIC MATCHES - If someone asks for "cybersecurity", suggest technology/security clubs, NOT arts/dance clubs
  2. ANALYZE CONTEXT - Consider the domain and field of the interest
  3. MATCH CATEGORIES APPROPRIATELY:
     - "cybersecurity/security/hacking" → Technology/Engineering clubs
     - "programming/coding/software" → Technology/Programming clubs  
     - "dance/music/art" → Arts/Cultural clubs
     - "sports/fitness" → Sports/Athletic clubs
     - "business/entrepreneur" → Business/Professional clubs
  4. PENALIZE COMPLETELY UNRELATED SUGGESTIONS (e.g., dance club for cybersecurity interest)
  5. Consider club activities, not just names

  Based on the following list of available clubs, suggest the MOST RELEVANT club that actually matches their interest domain.

  Available Clubs:
  {{#each clubs}}
  - ID: {{this.id}}
  - Name: {{this.name}}
  - Description: {{this.description}}
  - Category: {{this.category}}
  - Tags: {{#if this.tags}}{{join this.tags ", "}}{{else}}None{{/if}}
  - Requirements: {{#if this.requirements}}{{this.requirements}}{{else}}None{{/if}}
  - Members: {{this._count.members}}
  - Upcoming Events: {{this._count.events}}
  ---
  {{/each}}
  
  Return the BEST SEMANTIC MATCH with highest domain relevance to "{{interest}}". If no good match exists, choose the closest relevant option but give it a low match score (1-3).`,
});

const suggestClubFlow = ai.defineFlow(
  {
    name: 'suggestClubFlow',
    inputSchema: SuggestClubInputSchema,
    outputSchema: SuggestClubOutputSchema,
  },
  async (input) => {
    // Use provided clubs or fallback to mock data
    const clubsToUse = input.clubs && input.clubs.length > 0 ? input.clubs : allClubs;
    
    const {output} = await clubSuggestionPrompt({
        interest: input.interest,
        clubs: clubsToUse,
    });
    return output!;
  }
);

export async function suggestClub(
  input: SuggestClubInput
): Promise<SuggestClubOutput> {
  return suggestClubFlow(input);
}

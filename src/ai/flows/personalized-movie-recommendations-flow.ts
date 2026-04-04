'use server';
/**
 * @fileOverview This file implements a Genkit flow for personalized movie and show recommendations.
 *
 * - getPersonalizedMovieRecommendations - A function that generates AI-powered movie recommendations.
 * - PersonalizedMovieRecommendationsInput - The input type for the recommendation function.
 * - PersonalizedMovieRecommendationsOutput - The return type for the recommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedMovieRecommendationsInputSchema = z.object({
  genrePreference: z
    .string()
    .describe('A comma-separated string of the user\u0027s preferred genres.'),
  watchHistorySummary: z
    .string()
    .describe('A summary of the user\u0027s recent watch history.'),
});
export type PersonalizedMovieRecommendationsInput = z.infer<
  typeof PersonalizedMovieRecommendationsInputSchema
>;

const PersonalizedMovieRecommendationsOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      title: z.string().describe('The title of the recommended movie or show.'),
      genre: z.string().describe('The main genre of the recommended movie or show.'),
      description: z
        .string()
        .describe('A brief description or synopsis of the recommended movie or show.'),
    })
  ),
});
export type PersonalizedMovieRecommendationsOutput = z.infer<
  typeof PersonalizedMovieRecommendationsOutputSchema
>;

export async function getPersonalizedMovieRecommendations(
  input: PersonalizedMovieRecommendationsInput
): Promise<PersonalizedMovieRecommendationsOutput> {
  return personalizedMovieRecommendationsFlow(input);
}

const personalizedMovieRecommendationsPrompt = ai.definePrompt({
  name: 'personalizedMovieRecommendationsPrompt',
  input: {schema: PersonalizedMovieRecommendationsInputSchema},
  output: {schema: PersonalizedMovieRecommendationsOutputSchema},
  prompt: `You are an AI assistant specialized in generating personalized movie and show recommendations.

Based on the user's preferences and watch history, recommend a list of movies or shows.

User's Preferred Genres: {{{genrePreference}}}
User's Watch History Summary: {{{watchHistorySummary}}}

Provide at least 3, but no more than 5, recommendations.
For each recommendation, provide the title, main genre, and a brief description.`,
});

const personalizedMovieRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedMovieRecommendationsFlow',
    inputSchema: PersonalizedMovieRecommendationsInputSchema,
    outputSchema: PersonalizedMovieRecommendationsOutputSchema,
  },
  async (input) => {
    const {output} = await personalizedMovieRecommendationsPrompt(input);
    return output!;
  }
);

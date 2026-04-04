'use server';
/**
 * @fileOverview A Genkit flow for natural language content search.
 *
 * - naturalLanguageContentSearch - A function that handles natural language queries for movies and shows.
 * - NaturalLanguageContentSearchInput - The input type for the naturalLanguageContentSearch function.
 * - NaturalLanguageContentSearchOutput - The return type for the naturalLanguageContentSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NaturalLanguageContentSearchInputSchema = z
  .object({
    query: z.string().describe('The natural language query for content search.'),
  })
  .describe('Input for the natural language content search flow.');
export type NaturalLanguageContentSearchInput = z.infer<
  typeof NaturalLanguageContentSearchInputSchema
>;

const NaturalLanguageContentSearchOutputSchema = z
  .object({
    genres: z
      .array(z.string())
      .optional()
      .describe('An array of genres extracted from the query, e.g., ["sci-fi", "comedy"].'),
    releaseYear: z
      .string()
      .optional()
      .describe('The release year or decade extracted from the query, e.g., "1990s", "2000-2010".'),
    keywords: z
      .array(z.string())
      .optional()
      .describe('An array of descriptive keywords extracted from the query, e.g., ["funny", "action-packed"].'),
    titleSearch: z
      .string()
      .optional()
      .describe('A specific movie or show title to search for, if mentioned in the query.'),
  })
  .describe('Output of the natural language content search flow, containing structured search parameters.');
export type NaturalLanguageContentSearchOutput = z.infer<
  typeof NaturalLanguageContentSearchOutputSchema
>;

export async function naturalLanguageContentSearch(
  input: NaturalLanguageContentSearchInput
): Promise<NaturalLanguageContentSearchOutput> {
  return naturalLanguageContentSearchFlow(input);
}

const contentSearchPrompt = ai.definePrompt({
  name: 'contentSearchPrompt',
  input: {schema: NaturalLanguageContentSearchInputSchema},
  output: {schema: NaturalLanguageContentSearchOutputSchema},
  prompt: `You are an intelligent assistant designed to parse natural language queries for movies and shows.
Your goal is to extract specific search parameters like genres, release years, keywords, and specific titles from the user's query.

Return the extracted information in a structured JSON format according to the output schema. If a piece of information is not present in the query, omit that field from the JSON output.

Here are some examples:
- Query: "show me funny sci-fi movies from the 90s"
  Output: {"genres": ["sci-fi"], "releaseYear": "1990s", "keywords": ["funny"]}

- Query: "action-packed thrillers released after 2010"
  Output: {"genres": ["action", "thriller"], "releaseYear": "2010s", "keywords": ["action-packed"]}

- Query: "find the movie The Matrix"
  Output: {"titleSearch": "The Matrix"}

- Query: "documentaries about space"
  Output: {"genres": ["documentary"], "keywords": ["space"]}

- Query: "movies with strong female leads"
  Output: {"keywords": ["strong female leads"]}

- Query: "comedy from the early 2000s"
  Output: {"genres": ["comedy"], "releaseYear": "2000s"}

- Query: "movies similar to Inception"
  Output: {"keywords": ["similar to Inception"]}

Strictly adhere to the output schema and return only the JSON object.

Query: {{{query}}}`,
});

const naturalLanguageContentSearchFlow = ai.defineFlow(
  {
    name: 'naturalLanguageContentSearchFlow',
    inputSchema: NaturalLanguageContentSearchInputSchema,
    outputSchema: NaturalLanguageContentSearchOutputSchema,
  },
  async input => {
    const {output} = await contentSearchPrompt(input);
    return output!;
  }
);

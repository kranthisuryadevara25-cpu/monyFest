
'use server';

/**
 * @fileOverview AI-powered offer moderation flow for superAdmins.
 *
 * - moderateOffer - A function to assess offer quality and flag inappropriate content.
 * - ModerateOfferInput - The input type for the moderateOffer function.
 * - ModerateOfferOutput - The return type for the moderateOffer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateOfferInputSchema = z.object({
  title: z.string().describe('The title of the offer.'),
  description: z.string().describe('The detailed description of the offer.'),
});

export type ModerateOfferInput = z.infer<typeof ModerateOfferInputSchema>;

const ModerateOfferOutputSchema = z.object({
  isAppropriate: z.boolean().describe('True if the offer is appropriate and high quality, false otherwise.'),
  reason: z.string().describe('The reason for the moderation decision, if the offer is not appropriate.'),
});

export type ModerateOfferOutput = z.infer<typeof ModerateOfferOutputSchema>;

export async function moderateOffer(input: ModerateOfferInput): Promise<ModerateOfferOutput> {
  return moderateOfferFlow(input);
}

const moderateOfferPrompt = ai.definePrompt({
  name: 'moderateOfferPrompt',
  input: {schema: ModerateOfferInputSchema},
  output: {schema: ModerateOfferOutputSchema},
  prompt: `You are an AI assistant specialized in content moderation for a loyalty platform.
  Your task is to evaluate merchant offers based on their title and description, and determine if they are appropriate and of high quality.

  Consider these factors:
  - Is the offer clear, concise, and easy to understand?
  - Is the offer free of inappropriate or offensive content?
  - Does the offer provide genuine value to the platform's users?
  - Is the offer aligned with the platform's quality standards?

  Title: {{{title}}}
  Description: {{{description}}}

  Based on your assessment, set the isAppropriate field to true if the offer meets all criteria, and false otherwise.
  If the offer is not appropriate, provide a detailed reason in the reason field.
  Be specific in the reason, not vague.
  `,
});

const moderateOfferFlow = ai.defineFlow(
  {
    name: 'moderateOfferFlow',
    inputSchema: ModerateOfferInputSchema,
    outputSchema: ModerateOfferOutputSchema,
  },
  async input => {
    const {output} = await moderateOfferPrompt(input);
    return output!;
  }
);

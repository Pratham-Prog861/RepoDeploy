'use server';

/**
 * @fileOverview Suggests a build command for a given project if a standard one is not found.
 *
 * - suggestBuildCommand - A function that suggests a build command.
 * - SuggestBuildCommandInput - The input type for the suggestBuildCommand function.
 * - SuggestBuildCommandOutput - The return type for the suggestBuildCommand function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestBuildCommandInputSchema = z.object({
  projectType: z.string().describe('The type of the project (e.g., HTML/CSS/JS, React, Vue).'),
  projectFiles: z.string().describe('A list of files in the project.'),
});

export type SuggestBuildCommandInput = z.infer<typeof SuggestBuildCommandInputSchema>;

const SuggestBuildCommandOutputSchema = z.object({
  buildCommand: z.string().describe('The suggested build command for the project.'),
});

export type SuggestBuildCommandOutput = z.infer<typeof SuggestBuildCommandOutputSchema>;

export async function suggestBuildCommand(input: SuggestBuildCommandInput): Promise<SuggestBuildCommandOutput> {
  return suggestBuildCommandFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBuildCommandPrompt',
  input: {schema: SuggestBuildCommandInputSchema},
  output: {schema: SuggestBuildCommandOutputSchema},
  prompt: `You are an expert build system administrator.

You will be provided with the project type and a list of project files. Your goal is to suggest a build command that can be used to build the project. If no build command can be found then provide a message.

Project Type: {{{projectType}}}
Project Files: {{{projectFiles}}}

Suggest Build Command:`,
});

const suggestBuildCommandFlow = ai.defineFlow(
  {
    name: 'suggestBuildCommandFlow',
    inputSchema: SuggestBuildCommandInputSchema,
    outputSchema: SuggestBuildCommandOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

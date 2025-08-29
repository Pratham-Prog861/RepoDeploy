
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';

// A simple regex to validate GitHub repository URLs.
const GITHUB_URL_REGEX =
  /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-._]+(\/)?$/;

const schema = z.object({
  repoUrl: z.string().regex(GITHUB_URL_REGEX, {
    message: 'Please enter a valid public GitHub repository URL.',
  }),
});

export async function deployRepo(
  prevState: { message: string },
  formData: FormData
) {
  const validatedFields = schema.safeParse({
    repoUrl: formData.get('repoUrl'),
  });

  if (!validatedFields.success) {
    return {
      message:
        validatedFields.error.flatten().fieldErrors.repoUrl?.[0] ||
        'Invalid input.',
    };
  }

  // Simulate deployment process
  try {
    // Simulate cloning
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate build
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Simulate deployment
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    return { message: 'An unexpected error occurred during deployment.' };
  }

  // Generate a random ID for the project
  const projectId = Math.random().toString(36).substring(2, 10);

  redirect(`/p/${projectId}`);
}

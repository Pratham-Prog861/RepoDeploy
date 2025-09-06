
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { startDeployment } from '@/lib/deployment';

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

  try {
    // Call deployment service directly (no HTTP request needed)
    const result = await startDeployment(validatedFields.data.repoUrl);
    const deploymentId = result.deploymentId;
    
    // Add a small delay to ensure the database record is saved
    await new Promise(resolve => setTimeout(resolve, 100));
    
    redirect(`/p/${deploymentId}`);
    
  } catch (error: any) {
    // Handle redirect errors (these are expected)
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error; // Re-throw redirect errors - this is normal Next.js behavior
    }
    
    console.error('Deployment error:', error);
    
    return { 
      message: error.message || 'Deployment failed. Please try again.' 
    };
  }
}

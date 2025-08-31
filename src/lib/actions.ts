
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
// import { deployRepository } from './firebase';

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
    // TEMPORARY: Simulate deployment until Firebase Functions are ready
    // TODO: Uncomment when Firebase Functions are deployed
    // const result = await deployRepository({
    //   repoUrl: validatedFields.data.repoUrl,
    // });
    // const deploymentId = (result.data as any).deploymentId;
    
    // Simulate deployment process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate a temporary deployment ID
    const deploymentId = Math.random().toString(36).substring(2, 10);
    
    redirect(`/p/${deploymentId}`);
    
  } catch (error: any) {
    console.error('Deployment error:', error);
    return { 
      message: 'Firebase Functions not deployed yet. Please upgrade to Blaze plan and deploy functions first.' 
    };
  }
}

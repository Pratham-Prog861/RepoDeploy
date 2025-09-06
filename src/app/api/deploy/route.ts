import { NextRequest, NextResponse } from 'next/server';
import { startDeployment, validateGitHubUrl } from '@/lib/deployment';

export async function POST(request: NextRequest) {
  try {
    const { repoUrl } = await request.json();
    
    // Use deployment service
    const result = await startDeployment(repoUrl);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Deployment error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Deployment failed to start' },
      { status: 500 }
    );
  }
}

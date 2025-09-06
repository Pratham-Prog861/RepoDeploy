import { NextRequest, NextResponse } from 'next/server';
import { getDeployment } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log(`[API] Fetching deployment with ID: ${id}`);
    
    if (!id) {
      console.error('[API] No deployment ID provided');
      return NextResponse.json(
        { error: 'Deployment ID is required' },
        { status: 400 }
      );
    }
    
    const deployment = await getDeployment(id);
    
    if (!deployment) {
      console.error(`[API] Deployment not found for ID: ${id}`);
      return NextResponse.json(
        { 
          error: 'Deployment not found',
          code: 'DEPLOYMENT_NOT_FOUND',
          id: id
        },
        { status: 404 }
      );
    }
    
    console.log(`[API] Found deployment: ${id}, status: ${deployment.status}`);
    return NextResponse.json(deployment);
    
  } catch (error) {
    console.error('Error fetching deployment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deployment status' },
      { status: 500 }
    );
  }
}

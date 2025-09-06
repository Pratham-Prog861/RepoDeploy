'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ExternalLink, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CopyButton } from '@/components/copy-button';
import { WebsitePreview } from '@/components/website-preview';
interface Deployment {
  id: string;
  repoUrl: string;
  status: 'pending' | 'building' | 'deployed' | 'failed';
  liveUrl: string;
  createdAt: any;
  updatedAt: any;
  buildLogs: string[];
  error?: string;
}

export default function DeploymentSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeployment = async () => {
      try {
        console.log(`[Client] Fetching deployment with ID: ${id}`);
        const response = await fetch(`/api/status/${id}`, {
          cache: 'no-store', // Prevent caching issues
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        console.log(`[Client] API response status: ${response.status}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error(`[Client] API error:`, errorData);
          throw new Error(errorData.error || 'Deployment not found');
        }
        
        const deploymentData = await response.json();
        console.log(`[Client] Deployment data received:`, deploymentData);
        
        // Transform Supabase data to match component interface
        const deployment: Deployment = {
          id: deploymentData.id,
          repoUrl: deploymentData.repo_url,
          status: deploymentData.status,
          liveUrl: deploymentData.live_url || null,
          createdAt: deploymentData.created_at,
          updatedAt: deploymentData.updated_at,
          buildLogs: deploymentData.build_logs || [],
          error: deploymentData.error_message
        };
        
        setDeployment(deployment);
      } catch (error) {
        console.error('[Client] Failed to fetch deployment:', error);
        setDeployment(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDeployment();
    
    // Poll for updates every 3 seconds if deployment is in progress
    const interval = setInterval(() => {
      if (deployment?.status === 'pending' || deployment?.status === 'building') {
        fetchDeployment();
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [id, deployment?.status]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-2xl">
          <CardContent className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading deployment...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!deployment) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-2xl">
          <CardContent className="text-center py-20">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Deployment not found</h2>
            <p className="text-muted-foreground mt-2 mb-4">
              The deployment with ID <code className="bg-gray-100 px-2 py-1 rounded">{id}</code> doesn't exist or may have been removed.
            </p>
            <Button asChild variant="outline">
              <Link href="/">Go back to deploy a new project</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (deployment.status) {
      case 'deployed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'failed':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Loader2 className="h-6 w-6 animate-spin text-blue-500" />;
    }
  };

  const getStatusText = () => {
    switch (deployment.status) {
      case 'pending':
        return 'Initializing deployment...';
      case 'building':
        return 'Building your project...';
      case 'deployed':
        return 'Successfully deployed!';
      case 'failed':
        return 'Deployment failed';
      default:
        return 'Unknown status';
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl animate-in fade-in-50 zoom-in-95 duration-500">
        <CardHeader>
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <CardTitle className="text-3xl">
                {deployment.status === 'deployed' ? 'Congratulations!' : getStatusText()}
              </CardTitle>
              <CardDescription>
                {deployment.status === 'deployed' 
                  ? 'Your project has been successfully deployed.'
                  : 'Your project is being processed. This may take a few minutes.'
                }
              </CardDescription>
            </div>
          </div>
          
        </CardHeader>
        <CardContent className="space-y-6">
          {deployment.status === 'deployed' && deployment.liveUrl && (
            <div className="aspect-video w-full overflow-hidden rounded-lg border bg-gray-50">
              <WebsitePreview 
                url={deployment.liveUrl}
                alt={`Screenshot of ${deployment.repoUrl}`}
                fallbackTitle={deployment.id}
              />
            </div>
          )}
          
          {deployment.liveUrl ? (
            <div className="space-y-2">
              <Label htmlFor="live-url">Your unique live URL</Label>
              <div className="flex space-x-2">
                <Input id="live-url" value={deployment.liveUrl} readOnly />
                <CopyButton textToCopy={deployment.liveUrl} />
              </div>
              {deployment.status === 'deployed' && (
                <p className="text-sm text-green-600">
                  ✅ This link is now live and accessible!
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                  Deployment is in progress...
              </div>
            </div>
          )}

          {deployment.buildLogs && deployment.buildLogs.length > 0 && (
            <div className="space-y-2">
              <Label>Build Logs</Label>
              <div className="bg-gray-100 p-3 rounded-md max-h-40 overflow-y-auto">
                {deployment.buildLogs.map((log, index) => (
                  <div key={index} className="text-sm font-mono text-gray-700">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {deployment.error && (
            <div className="space-y-2">
              <Label className="text-red-600">Error Details</Label>
              <div className="bg-red-50 p-3 rounded-md">
                <p className="text-sm text-red-700">{deployment.error}</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
          <Button variant="outline" asChild>
            <Link href="/">Deploy Another</Link>
          </Button>
          {deployment.status === 'deployed' && deployment.liveUrl && (
            <Button asChild>
              <a href={deployment.liveUrl} target="_blank" rel="noopener noreferrer">
                Visit Site <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

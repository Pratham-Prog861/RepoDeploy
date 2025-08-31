'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
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
// import { getDeploymentStatus } from '@/lib/firebase';

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
  params: { id: string };
}) {
  const { id } = params;
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TEMPORARY: Create mock deployment data until Firebase is ready
    const mockDeployment: Deployment = {
      id,
      repoUrl: 'https://github.com/example/repo',
      status: 'deployed',
      liveUrl: `https://${id}.repodeploy.web.app`,
      createdAt: new Date(),
      updatedAt: new Date(),
      buildLogs: [
        'Deployment initiated...',
        'Starting build process...',
        'Cloning repository...',
        'Installing dependencies...',
        'Building project...',
        'Creating deployment package...',
        'Deploying to hosting...',
        'Deployment successful!'
      ]
    };

    // Simulate loading
    setTimeout(() => {
      setDeployment(mockDeployment);
      setLoading(false);
    }, 1500);

    // TODO: Uncomment when Firebase Functions are deployed
    // const fetchDeployment = async () => {
    //   try {
    //     const result = await getDeploymentStatus({ deploymentId: id });
    //     setDeployment(result.data as Deployment);
    //   } catch (error) {
    //     console.error('Failed to fetch deployment:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchDeployment();
    // const interval = setInterval(fetchDeployment, 5000);
    // return () => clearInterval(interval);
  }, [id]);

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
            <p className="text-muted-foreground mt-2">
              The deployment you're looking for doesn't exist.
            </p>
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
          
          {/* Firebase Functions Notice */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                <strong>Note:</strong> This is a demo deployment. To enable real deployments, upgrade to Firebase Blaze plan and deploy functions.
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {deployment.status === 'deployed' && (
            <div className="aspect-video w-full overflow-hidden rounded-lg border">
              <Image
                src="https://picsum.photos/1280/720"
                alt="Project screenshot placeholder"
                width={1280}
                height={720}
                className="object-cover w-full h-full"
                data-ai-hint="website screenshot"
              />
            </div>
          )}
          
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
          {deployment.status === 'deployed' && (
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

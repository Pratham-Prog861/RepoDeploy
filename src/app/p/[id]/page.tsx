import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
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

export default function DeploymentSuccessPage({
  params,
}: {
  params: { id: string };
}) {
  const liveUrl = `https://${params.id}.repodeploy.app`;

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl animate-in fade-in-50 zoom-in-95 duration-500">
        <CardHeader>
          <CardTitle className="text-3xl">Congratulations!</CardTitle>
          <CardDescription>
            Your project has been successfully deployed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
          <div className="space-y-2">
            <Label htmlFor="live-url">Your unique live URL</Label>
            <div className="flex space-x-2">
              <Input id="live-url" value={liveUrl} readOnly />
              <CopyButton textToCopy={liveUrl} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
          <Button variant="outline" asChild>
            <Link href="/">Deploy Another</Link>
          </Button>
          <Button asChild>
            <a href={liveUrl} target="_blank" rel="noopener noreferrer">
              Visit Site <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

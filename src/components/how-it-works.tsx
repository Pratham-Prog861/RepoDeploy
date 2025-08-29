import { Link, CloudCog, Rocket } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: <Link className="h-10 w-10 text-primary" />,
    title: '1. Paste Your Repo',
    description:
      'Grab your public GitHub repository URL and paste it into our deployment dialog.',
  },
  {
    icon: <CloudCog className="h-10 w-10 text-primary" />,
    title: '2. We Build & Deploy',
    description:
      'Our system clones your repository, runs the build process, and deploys it to our global network.',
  },
  {
    icon: <Rocket className="h-10 w-10 text-primary" />,
    title: '3. Get Your Live Link',
    description:
      "In seconds, you'll receive a unique, shareable URL for your live project. It's that simple!",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 md:py-32 bg-secondary">
      <div className="container px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            A process so simple, it feels like magic.
          </h2>
          <p className="text-lg text-muted-foreground md:text-xl">
            Deploying your project takes just a few clicks. Here's how it works.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="flex flex-col items-center text-center shadow-md hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="p-4 bg-primary/10 rounded-full inline-block">
                  {feature.icon}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

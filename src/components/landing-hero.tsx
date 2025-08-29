import { DeploymentDialog } from './deployment-dialog';

export function LandingHero() {
  return (
    <section className="flex-1 flex items-center justify-center py-20 md:py-32 lg:py-40">
      <div className="container px-4 md:px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline">
            Deploy in seconds.
            <br />
            <span className="text-primary">Not minutes.</span>
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl">
            Paste your GitHub repository. We clone, build, and host it. It's
            that simple. Get your unique live URL instantly. For free.
          </p>
          <div className="flex justify-center">
            <DeploymentDialog />
          </div>
        </div>
      </div>
    </section>
  );
}

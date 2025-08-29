import Link from 'next/link';
import { RocketIcon } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground"
          aria-label="RepoDeploy Home"
        >
          <RocketIcon className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">RepoDeploy</span>
        </Link>
      </div>
    </header>
  );
}

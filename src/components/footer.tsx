'use client';

import { useState, useEffect } from 'react';

export function Footer() {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto flex h-16 items-center justify-center px-4 md:px-6">
        <p className="text-center text-sm text-muted-foreground">
          © {year} RepoDeploy. A simpler way to deploy.
        </p>
      </div>
    </footer>
  );
}

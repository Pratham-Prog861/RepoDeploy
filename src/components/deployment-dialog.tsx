'use client';

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, GitBranch } from 'lucide-react';
import { deployRepo } from '@/lib/actions';

const initialState = {
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Deploying...
        </>
      ) : (
        'Deploy'
      )}
    </Button>
  );
}

export function DeploymentDialog() {
  const [state, formAction] = useFormState(deployRepo, initialState);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state?.message) {
      toast({
        variant: 'destructive',
        title: 'Deployment Failed',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          Get Started
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[475px]">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Deploy a new project</DialogTitle>
            <DialogDescription>
              Paste your public GitHub repository URL to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="repoUrl">GitHub Repository URL</Label>
              <div className="relative">
                <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="repoUrl"
                  name="repoUrl"
                  placeholder="https://github.com/user/repo"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

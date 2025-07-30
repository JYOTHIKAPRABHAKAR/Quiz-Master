import { Rocket } from 'lucide-react';
import { type HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export function Logo({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-lg font-semibold tracking-tighter text-sidebar-foreground',
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-center rounded-lg bg-sidebar-primary p-2">
        <Rocket className="size-5 text-sidebar-primary-foreground" />
      </div>
      <span className="font-headline">QuizFire</span>
    </div>
  );
}

import { AlertDescription, AlertRoot, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface AlertProps {
  tone: 'error' | 'success';
  title: string;
  children?: ReactNode;
}

export function Alert({ tone, title, children }: AlertProps) {
  const Icon = tone === 'error' ? AlertCircle : CheckCircle2;

  return (
    <AlertRoot
      role={tone === 'error' ? 'alert' : 'status'}
      variant={tone === 'error' ? 'destructive' : 'success'}
    >
      <Icon className="size-4" />
      <AlertTitle>{title}</AlertTitle>
      {children && <AlertDescription>{children}</AlertDescription>}
    </AlertRoot>
  );
}

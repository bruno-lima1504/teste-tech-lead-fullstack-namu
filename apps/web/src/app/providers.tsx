'use client';

import { ApiError } from '@/modules/shared/api-client';
import { CurrentUserProvider } from '@/modules/shared/current-user';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

// Erros de regra (4xx) não mudam com nova tentativa; só falha de rede ou 5xx é repetida.
const shouldRetry = (failureCount: number, error: Error) =>
  failureCount < 2 && !(error instanceof ApiError && error.status >= 400 && error.status < 500);

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: shouldRetry } } }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <CurrentUserProvider>{children}</CurrentUserProvider>
    </QueryClientProvider>
  );
}

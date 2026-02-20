'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode, useState } from 'react';

// Optimized query client configuration
const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 5 minutes
        staleTime: 5 * 60 * 1000,
        // Keep unused data in cache for 10 minutes
        gcTime: 10 * 60 * 1000,
        // Retry failed requests 1 time
        retry: 1,
        // Don't refetch on window focus (reduces API calls)
        refetchOnWindowFocus: false,
        // Refetch on mount only if data is stale
        refetchOnMount: 'stale',
        // Refetch on reconnect only if data is stale
        refetchOnReconnect: 'stale',
      },
      mutations: {
        // Retry failed mutations once
        retry: 1,
      },
    },
  });

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Create query client once per app instance
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

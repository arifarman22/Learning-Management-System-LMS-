'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import { QueryProvider } from '@/lib/providers/QueryProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <QueryProvider>{children}</QueryProvider>
    </Provider>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import SplashScreen from '@/components/SplashScreen';

export const metadata: Metadata = {
  title: 'LMS - Learning Management System',
  description: 'A production-grade Learning Management System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SplashScreen />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

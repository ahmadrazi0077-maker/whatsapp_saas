import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import I18nProvider from '@/components/providers/I18nProvider';
import RTLSupport from '@/components/shared/RTLSupport';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WhatsApp SaaS - Business WhatsApp Automation',
  description: 'Powerful WhatsApp automation for businesses. Send bulk messages, auto-reply, and manage leads efficiently.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <I18nProvider>
          <RTLSupport>
            {children}
          </RTLSupport>
        </I18nProvider>
      </body>
    </html>
  );
}
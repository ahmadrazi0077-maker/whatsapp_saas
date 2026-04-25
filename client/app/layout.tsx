import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WhatsApp SaaS',
  description: 'WhatsApp automation platform for businesses',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNavbar } from '@/components/site-navbar';
import { readEnv } from '@/server/env';
import '@/styles/main.scss';

export function generateMetadata(): Metadata {
  const { STORE_NAME } = readEnv();
  return {
    title: { default: STORE_NAME, template: `%s | ${STORE_NAME}` },
    description: 'Choose a product, its options and sizes, and order it your way.',
  };
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const { STORE_NAME } = readEnv();
  return (
    <html lang="en">
      <body className="d-flex flex-column min-vh-100">
        <SiteNavbar storeName={STORE_NAME} />
        <main className="flex-grow-1">{children}</main>
        <SiteFooter storeName={STORE_NAME} />
      </body>
    </html>
  );
}

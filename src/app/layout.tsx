import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNavbar } from '@/components/site-navbar';
import '@/styles/main.scss';

export const metadata: Metadata = {
  title: { default: 'i2i custom sports uniforms', template: '%s | i2i' },
  description: 'Custom team uniforms: order by player, mix products, or buy from stock.',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="d-flex flex-column min-vh-100">
        <SiteNavbar />
        <main className="flex-grow-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

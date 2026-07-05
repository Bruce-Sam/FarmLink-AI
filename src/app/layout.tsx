import type { Metadata, Viewport } from 'next';
import { Inter, Manrope } from 'next/font/google';
import { Toaster } from 'sonner';
import { AppProviders } from '@/providers/AppProviders';
import { BRAND_NAME, BRAND_TAGLINE } from '@/constants/brand';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: BRAND_NAME,
    template: `%s · ${BRAND_NAME}`,
  },
  description: `${BRAND_TAGLINE} — connect Ghanaian farmers with buyers.`,
  applicationName: BRAND_NAME,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: BRAND_NAME,
  },
  icons: {
    icon: '/brand/afuo-market-icon.png',
    apple: '/brand/afuo-market-icon.png',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#1B4D2E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${inter.variable} min-h-dvh bg-field-cream font-sans text-field-ink antialiased`}
      >
        <AppProviders>
          {children}
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{ className: 'font-sans' }}
          />
        </AppProviders>
      </body>
    </html>
  );
}

'use client';

import Link from 'next/link';
import { ArrowRight, LogIn, ShoppingBasket, Sprout, UserPlus } from 'lucide-react';
import { DemoModeIndicator } from '@/components/feedback/DemoModeIndicator';
import { ApiHealthBanner } from '@/components/feedback/ApiHealthBanner';
import { AfuoPortalMark } from '@/components/brand/AfuoPortalMark';
import { AUTH_ROUTES, BUYER_ROUTES, FARMER_ROUTES } from '@/constants/routes';
import { seedCredentialHint } from '@/constants/seed-credentials';
import { config } from '@/lib/config';
import { cn } from '@/lib/utils';

const portals = [
  {
    role: 'farmer' as const,
    title: 'Farmer / Supplier',
    description: 'List harvest, manage offers, and coordinate pickups from the field.',
    loginHref: FARMER_ROUTES.login,
    signupHref: FARMER_ROUTES.signup,
    icon: Sprout,
    accent: 'border-farm-green/30 bg-farm-green/5 hover:border-farm-green',
    demoHint: 'Demo: kwame.mensah@example.com or 0244123456',
    devHint: seedCredentialHint('farmer'),
  },
  {
    role: 'buyer' as const,
    title: 'Buyer / Business',
    description: 'Source verified produce for restaurants, hotels, and wholesale buyers.',
    loginHref: BUYER_ROUTES.login,
    signupHref: BUYER_ROUTES.signup,
    icon: ShoppingBasket,
    accent: 'border-market-green/30 bg-market-green/5 hover:border-market-green',
    demoHint: 'Demo: orders@goldenspoon.gh or 0244555667',
    devHint: seedCredentialHint('buyer'),
  },
];

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-field-cream dark:bg-exchange-ink">
      <DemoModeIndicator />
      <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-5 py-10 sm:px-8">
        <AfuoPortalMark useFullLogo />
        {!config.isDemoMode && (
          <div className="mt-4">
            <ApiHealthBanner />
          </div>
        )}
        <div className="my-10 flex-1 space-y-8">
          <div className="space-y-3">
            <h1 className="font-heading text-2xl font-bold text-field-ink dark:text-produce-cream sm:text-3xl">
              Ghana&apos;s farm-to-marketplace
            </h1>
            <p className="max-w-xl text-muted-text">
              Connect Ghana&apos;s farmers with buyers. Each account is tied to one portal — sign in
              as a farmer to list produce, or as a buyer to source harvest.
            </p>
            {config.isDemoMode && (
              <p className="rounded-lg border border-farm-green/30 bg-farm-green/5 px-4 py-3 text-sm text-field-ink dark:text-produce-cream">
                Demo mode is on — use any valid Ghana phone or email with a password of 6+
                characters, or the sample accounts below.
              </p>
            )}
            {config.isDevelopment && !config.isDemoMode && (
              <p className="rounded-lg border border-farm-green/30 bg-farm-green/5 px-4 py-3 text-sm text-field-ink dark:text-produce-cream">
                Live API mode — use the seeded dev accounts on each sign-in page, or register a new
                account. Admin: {seedCredentialHint('admin')}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {portals.map((portal) => {
              const Icon = portal.icon;
              return (
                <div
                  key={portal.role}
                  className={cn('flex flex-col border p-6 transition-colors', portal.accent)}
                >
                  <Icon className="size-8 text-farm-green" aria-hidden />
                  <h2 className="font-heading mt-3 text-xl font-semibold text-field-ink dark:text-produce-cream">
                    {portal.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm text-muted-text">{portal.description}</p>
                  {config.isDemoMode && (
                    <p className="mt-2 text-xs text-muted-text">{portal.demoHint}</p>
                  )}
                  {config.isDevelopment && !config.isDemoMode && (
                    <p className="mt-2 text-xs text-muted-text">Dev: {portal.devHint}</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={portal.loginHref}
                      className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      <LogIn className="size-4" aria-hidden />
                      Sign in
                    </Link>
                    <Link
                      href={portal.signupHref}
                      className="inline-flex items-center gap-1 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                    >
                      <UserPlus className="size-4" aria-hidden />
                      Sign up
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            href={AUTH_ROUTES.signup}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Not sure which portal? Compare roles <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

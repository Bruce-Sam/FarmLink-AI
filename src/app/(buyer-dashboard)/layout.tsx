import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { BuyerAppClientLayout } from './BuyerAppClientLayout';

export const metadata: Metadata = {
  title: 'Buyer',
};

export default function BuyerAppLayout({ children }: { children: ReactNode }) {
  return <BuyerAppClientLayout>{children}</BuyerAppClientLayout>;
}

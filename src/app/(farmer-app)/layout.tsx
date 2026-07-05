import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { FarmerAppClientLayout } from './FarmerAppClientLayout';

export const metadata: Metadata = {
  title: 'Farmer',
};

export default function FarmerAppLayout({ children }: { children: ReactNode }) {
  return <FarmerAppClientLayout>{children}</FarmerAppClientLayout>;
}

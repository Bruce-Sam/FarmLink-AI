'use client';

import { Suspense } from 'react';
import { ListingSuccessScreen } from '@/features/listing-creation/components/ListingSuccessScreen';

export default function ListingSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ListingSuccessScreen />
    </Suspense>
  );
}

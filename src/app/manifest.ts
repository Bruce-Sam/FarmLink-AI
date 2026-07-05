import type { MetadataRoute } from 'next';
import { BRAND_NAME, BRAND_TAGLINE } from '@/constants/brand';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND_NAME,
    short_name: 'Afuo',
    description: `${BRAND_TAGLINE} — list produce and source harvest across Ghana.`,
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#F4EEDD',
    theme_color: '#1B4D2E',
    categories: ['business', 'food', 'productivity'],
    icons: [
      {
        src: '/brand/afuo-market-icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/brand/afuo-market-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/brand/afuo-market-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}

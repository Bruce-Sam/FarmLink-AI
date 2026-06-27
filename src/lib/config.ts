function readEnv(key: string): string | undefined {
  return process.env[key]?.trim() || undefined;
}

const demoEnv = readEnv('NEXT_PUBLIC_ENABLE_DEMO_MODE');
const mockDataEnv = readEnv('NEXT_PUBLIC_USE_MOCK_DATA');

export const config = {
  apiUrl: readEnv('NEXT_PUBLIC_API_URL') ?? 'http://localhost:4000/api/v1',
  /** Demo handlers activate when env is exactly "true", or in development unless explicitly "false". */
  isDemoMode:
    demoEnv === 'true' ||
    (process.env.NODE_ENV === 'development' && demoEnv !== 'false'),
  /** Admin mock-data mode — explicit opt-in; never silently replaces failed API calls in production. */
  useMockData: mockDataEnv === 'true',
  mapProvider: readEnv('NEXT_PUBLIC_MAP_PROVIDER') ?? 'osm',
  mapToken: readEnv('NEXT_PUBLIC_MAP_TOKEN'),
  isDevelopment: process.env.NODE_ENV === 'development',
} as const;

export type AppConfig = typeof config;

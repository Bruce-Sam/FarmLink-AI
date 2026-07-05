import { describe, expect, it } from 'vitest';
import manifest from '@/app/manifest';

describe('PWA manifest', () => {
  it('uses Afuo Market branding and colours', () => {
    const data = manifest();
    expect(data.name).toBe('Afuo Market');
    expect(data.short_name).toBe('Afuo');
    expect(data.start_url).toBe('/');
    expect(data.background_color).toBe('#F4EEDD');
    expect(data.theme_color).toBe('#1B4D2E');
    expect(data.display).toBe('standalone');
  });

  it('includes maskable icons', () => {
    const data = manifest();
    expect(data.icons?.some((icon) => icon.purpose === 'maskable')).toBe(true);
  });
});

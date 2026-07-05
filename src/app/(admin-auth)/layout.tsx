import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Admin sign in',
};

export default function AdminAuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-surface admin-contour-bg min-h-dvh">
      {children}
    </div>
  );
}

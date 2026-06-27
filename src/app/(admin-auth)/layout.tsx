import type { ReactNode } from 'react';

export default function AdminAuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-surface admin-contour-bg min-h-dvh">
      {children}
    </div>
  );
}

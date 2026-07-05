'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { AdminAnalytics } from '@/types/admin';

interface AdminMatchScoreDistributionProps {
  data: AdminAnalytics['matchScoreDistribution'];
  averageScore: number;
}

export function AdminMatchScoreDistribution({
  data,
  averageScore,
}: AdminMatchScoreDistributionProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Platform average match score:{' '}
        <strong className="text-foreground">{averageScore.toFixed(1)}%</strong>
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
          <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: 'var(--admin-bg-elevated)',
              border: '1px solid var(--admin-border)',
              borderRadius: '0.5rem',
            }}
          />
          <Bar dataKey="count" fill="var(--admin-accent)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

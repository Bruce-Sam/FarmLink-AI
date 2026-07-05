'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import type { AdminAnalyticsTrendPoint } from '@/types/admin';

interface AdminActivityTrendChartProps {
  trends: AdminAnalyticsTrendPoint[];
}

export function AdminActivityTrendChart({ trends }: AdminActivityTrendChartProps) {
  const data = trends.map((point) => ({
    ...point,
    label: format(parseISO(point.date), 'd MMM'),
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: 'var(--admin-bg-elevated)',
            border: '1px solid var(--admin-border)',
            borderRadius: '0.5rem',
          }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="newListings"
          name="Listings"
          stroke="#356b45"
          fill="#356b45"
          fillOpacity={0.15}
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="newOffers"
          name="Offers"
          stroke="#c46b3a"
          fill="#c46b3a"
          fillOpacity={0.12}
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="completedTransactions"
          name="Transactions"
          stroke="#d7a33e"
          fill="#d7a33e"
          fillOpacity={0.12}
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="newUsers"
          name="Users"
          stroke="#66a36f"
          fill="#66a36f"
          fillOpacity={0.1}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

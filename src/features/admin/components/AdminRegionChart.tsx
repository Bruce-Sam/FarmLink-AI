'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface AdminRegionChartProps {
  data: Array<{ region: string; count: number }>;
}

const COLORS = ['#356b45', '#c46b3a', '#d7a33e', '#66a36f', '#bc6a3e', '#94bc74'];

export function AdminRegionChart({ data }: AdminRegionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="region"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={({ name, percent }) =>
            `${String(name ?? '')} ${((percent ?? 0) * 100).toFixed(0)}%`
          }
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: 'var(--admin-bg-elevated)',
            border: '1px solid var(--admin-border)',
            borderRadius: '0.5rem',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

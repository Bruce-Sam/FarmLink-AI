'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface AdminStatusBreakdownChartProps {
  data: Array<{ status: string; count: number }>;
  color?: string;
}

function formatStatusLabel(status: string): string {
  return status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function AdminStatusBreakdownChart({
  data,
  color = 'var(--admin-primary)',
}: AdminStatusBreakdownChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    label: formatStatusLabel(item.status),
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border/60" />
        <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
        <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={110} />
        <Tooltip
          contentStyle={{
            background: 'var(--admin-bg-elevated)',
            border: '1px solid var(--admin-border)',
            borderRadius: '0.5rem',
          }}
        />
        <Bar dataKey="count" fill={color} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

import axios from 'axios';
import { config } from '@/lib/config';
import type { AdminHealthStatus } from '@/types/admin';

export async function getApiHealth(): Promise<AdminHealthStatus> {
  const base = config.apiUrl.replace(/\/api\/v1\/?$/, '');
  const res = await axios.get<AdminHealthStatus>(`${base}/api/v1/health`, { timeout: 5000 });
  return res.data;
}

export async function getRootHealth(): Promise<AdminHealthStatus> {
  const base = config.apiUrl.replace(/\/api\/v1\/?$/, '');
  const res = await axios.get<AdminHealthStatus>(`${base}/health`, { timeout: 5000 });
  return res.data;
}

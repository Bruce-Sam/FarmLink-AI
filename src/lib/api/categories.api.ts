import { apiGet } from './client';
import type { ProduceCategory } from '@/types/category';
import { mapBackendCategory } from './mappers/backend-mappers';

export async function getCategories(): Promise<ProduceCategory[]> {
  const response = await apiGet<{ categories: Record<string, unknown>[] }>('/categories');
  return (response.data.categories ?? []).map(mapBackendCategory);
}

export async function getCategory(id: string): Promise<ProduceCategory> {
  const response = await apiGet<{ category: Record<string, unknown> }>(`/categories/${id}`);
  return mapBackendCategory(response.data.category);
}

export async function getActiveCategories(): Promise<ProduceCategory[]> {
  const categories = await getCategories();
  return categories.filter((c) => c.active);
}

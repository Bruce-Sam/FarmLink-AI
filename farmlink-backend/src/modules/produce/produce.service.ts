import { type ProduceCategory } from '@prisma/client';
import { prisma } from '../../config/database';
import { ApiError } from '../../utils/api-error';

export class ProduceService {
  async listCategories(includeInactive = false): Promise<ProduceCategory[]> {
    return prisma.produceCategory.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async getCategory(categoryId: string): Promise<ProduceCategory> {
    const category = await prisma.produceCategory.findUnique({ where: { id: categoryId } });
    if (!category) throw ApiError.notFound('Produce category not found');
    return category;
  }
}

export const produceService = new ProduceService();

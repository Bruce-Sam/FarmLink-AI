import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { Role, AccountStatus } from '@prisma/client';
import { mockPrisma } from '../setup';
import { mockUserFarmer, mockUserBuyer } from '../helpers/fixtures';

vi.mock('../../src/utils/jwt', () => ({
  signAccessToken: vi.fn().mockReturnValue('token'),
  verifyAccessToken: vi.fn(),
}));

import { createApp } from '../../src/app';
import { verifyAccessToken } from '../../src/utils/jwt';

const app = createApp();

describe('Role authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.user.findUnique.mockImplementation(({ where }: { where: { id: string } }) => {
      const base = {
        accountStatus: AccountStatus.ACTIVE,
        phoneVerified: true,
        profileImageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
      };
      if (where.id === mockUserFarmer.id) {
        return Promise.resolve({ ...mockUserFarmer, ...base, role: Role.FARMER });
      }
      if (where.id === mockUserBuyer.id) {
        return Promise.resolve({ ...mockUserBuyer, ...base, role: Role.BUYER });
      }
      return Promise.resolve(null);
    });
  });

  it('rejects buyers on farmer profile routes', async () => {
    vi.mocked(verifyAccessToken).mockReturnValue({ sub: mockUserBuyer.id, role: Role.BUYER });

    const res = await request(app)
      .get('/api/v1/farmers/profile')
      .set('Authorization', 'Bearer buyer-token');

    expect(res.status).toBe(403);
  });

  it('rejects farmers on buyer profile routes', async () => {
    vi.mocked(verifyAccessToken).mockReturnValue({ sub: mockUserFarmer.id, role: Role.FARMER });

    const res = await request(app)
      .get('/api/v1/buyers/profile')
      .set('Authorization', 'Bearer farmer-token');

    expect(res.status).toBe(403);
  });

  it('rejects non-admin users on admin dashboard', async () => {
    vi.mocked(verifyAccessToken).mockReturnValue({ sub: mockUserBuyer.id, role: Role.BUYER });

    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', 'Bearer buyer-token');

    expect(res.status).toBe(403);
  });
});

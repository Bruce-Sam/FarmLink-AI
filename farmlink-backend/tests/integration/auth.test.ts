import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { Role, AccountStatus } from '@prisma/client';
import { mockPrisma } from '../setup';
import { mockUserFarmer, mockUserBuyer } from '../helpers/fixtures';

vi.mock('../../src/utils/password', () => ({
  hashPassword: vi.fn().mockResolvedValue('hashed-password'),
  verifyPassword: vi.fn().mockResolvedValue(true),
}));

vi.mock('../../src/utils/jwt', () => ({
  signAccessToken: vi.fn().mockReturnValue('test-access-token'),
  verifyAccessToken: vi.fn().mockReturnValue({ sub: mockUserFarmer.id, role: Role.FARMER }),
}));

import { createApp } from '../../src/app';
import { verifyPassword } from '../../src/utils/password';
import { verifyAccessToken } from '../../src/utils/jwt';

const app = createApp();

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers a farmer successfully', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: mockUserFarmer.id,
      fullName: mockUserFarmer.fullName,
      phoneNumber: mockUserFarmer.phoneNumber,
      email: mockUserFarmer.email,
      role: Role.FARMER,
      accountStatus: AccountStatus.ACTIVE,
      phoneVerified: false,
      profileImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
    });

    const res = await request(app).post('/api/v1/auth/register').send({
      fullName: 'Kwame Mensah',
      phoneNumber: '+233240000000',
      email: 'kwame@example.com',
      password: 'StrongPassword123!',
      role: 'FARMER',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBe('test-access-token');
    expect(res.body.data.user.role).toBe('FARMER');
  });

  it('registers a buyer successfully', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: mockUserBuyer.id,
      fullName: 'Golden Spoon',
      phoneNumber: '+233245556667',
      email: 'buyer@farmlink.local',
      role: Role.BUYER,
      accountStatus: AccountStatus.ACTIVE,
      phoneVerified: false,
      profileImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
    });

    const res = await request(app).post('/api/v1/auth/register').send({
      fullName: 'Golden Spoon',
      phoneNumber: '+233245556667',
      email: 'buyer@farmlink.local',
      password: 'BuyerPassword123!',
      role: 'BUYER',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('BUYER');
  });

  it('rejects administrator public registration', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      fullName: 'Bad Admin',
      phoneNumber: '+233200000099',
      password: 'AdminPassword123!',
      role: 'ADMIN',
    });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('logs in with valid credentials', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      ...mockUserFarmer,
      passwordHash: 'hashed-password',
    });
    mockPrisma.user.update.mockResolvedValue(mockUserFarmer);
    vi.mocked(verifyPassword).mockResolvedValue(true);

    const res = await request(app).post('/api/v1/auth/login').send({
      identifier: 'farmer@farmlink.local',
      password: 'FarmerPassword123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBe('test-access-token');
  });

  it('rejects invalid password', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      ...mockUserFarmer,
      passwordHash: 'hashed-password',
    });
    vi.mocked(verifyPassword).mockResolvedValue(false);

    const res = await request(app).post('/api/v1/auth/login').send({
      identifier: 'farmer@farmlink.local',
      password: 'wrong-password',
    });

    expect(res.status).toBe(401);
  });

  it('rejects protected route without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns current user with valid token', async () => {
    vi.mocked(verifyAccessToken).mockReturnValue({ sub: mockUserFarmer.id, role: Role.FARMER });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: mockUserFarmer.id,
      fullName: mockUserFarmer.fullName,
      phoneNumber: mockUserFarmer.phoneNumber,
      email: mockUserFarmer.email,
      role: Role.FARMER,
      accountStatus: AccountStatus.ACTIVE,
      phoneVerified: true,
      profileImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
    });

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer test-access-token');

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('farmer@farmlink.local');
  });
});

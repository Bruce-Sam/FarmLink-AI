import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ListingStatus,
  OfferStatus,
  ProduceUnit,
  TransactionStatus,
} from '@prisma/client';
import { mockPrisma } from '../setup';
import {
  buildMockPrisma,
  mockUserFarmer,
  mockUserBuyer,
  mockFarmerProfile,
  mockBuyerProfile,
} from '../helpers/fixtures';

vi.mock('../../src/services/notification.service', () => ({
  notificationService: { create: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock('../../src/services/audit.service', () => ({
  recordAudit: vi.fn().mockResolvedValue(undefined),
}));

import { offersService } from '../../src/modules/offers/offers.service';

const listingId = 'listing-1';
const offerId = 'offer-1';

describe('Offers service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.buyerProfile.findUnique.mockResolvedValue(mockBuyerProfile);
    mockPrisma.farmerProfile.findUnique.mockResolvedValue(mockFarmerProfile);
  });

  it('creates an offer for a published listing', async () => {
    mockPrisma.produceListing.findUnique.mockResolvedValue({
      id: listingId,
      status: ListingStatus.PUBLISHED,
      quantity: 60,
      reservedQuantity: 0,
      unit: ProduceUnit.CRATE,
      title: 'Fresh tomatoes',
      farmerId: mockFarmerProfile.id,
      farmer: { id: mockFarmerProfile.id, userId: mockUserFarmer.id },
    });
    mockPrisma.offer.create.mockResolvedValue({
      id: offerId,
      listingId,
      buyerId: mockBuyerProfile.id,
      offeredQuantity: 20,
      unit: ProduceUnit.CRATE,
      offeredPricePerUnit: 180,
      totalAmount: 3600,
      message: null,
      proposedPickupDate: new Date('2026-07-01'),
      status: OfferStatus.PENDING,
      expiresAt: null,
      acceptedAt: null,
      rejectedAt: null,
      cancelledAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      listing: {
        id: listingId,
        title: 'Fresh tomatoes',
        unit: ProduceUnit.CRATE,
        status: ListingStatus.PUBLISHED,
        farmerId: mockFarmerProfile.id,
      },
      buyer: { id: mockBuyerProfile.id, businessName: 'Golden Spoon Restaurant' },
    });
    mockPrisma.matchRecommendation.updateMany.mockResolvedValue({ count: 1 });

    const offer = await offersService.createOffer(mockUserBuyer.id, {
      listingId,
      offeredQuantity: 20,
      offeredPricePerUnit: 180,
      proposedPickupDate: new Date('2026-07-01'),
    });

    expect(offer.offeredQuantity).toBe(20);
    expect(offer.status).toBe(OfferStatus.PENDING);
  });

  it('rejects offer exceeding available quantity', async () => {
    mockPrisma.produceListing.findUnique.mockResolvedValue({
      id: listingId,
      status: ListingStatus.PUBLISHED,
      quantity: 60,
      reservedQuantity: 50,
      unit: ProduceUnit.CRATE,
      title: 'Fresh tomatoes',
      farmerId: mockFarmerProfile.id,
      farmer: { id: mockFarmerProfile.id, userId: mockUserFarmer.id },
    });

    await expect(
      offersService.createOffer(mockUserBuyer.id, {
        listingId,
        offeredQuantity: 20,
        offeredPricePerUnit: 180,
        proposedPickupDate: new Date('2026-07-01'),
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('accepts an offer and creates a transaction', async () => {
    const txMock = buildMockPrisma();
    txMock.offer.findUnique.mockResolvedValue({
      id: offerId,
      status: OfferStatus.PENDING,
      expiresAt: null,
      offeredQuantity: 20,
      unit: ProduceUnit.CRATE,
      offeredPricePerUnit: 180,
      totalAmount: 3600,
      proposedPickupDate: new Date('2026-07-01'),
      listing: {
        id: listingId,
        farmerId: mockFarmerProfile.id,
        quantity: 60,
        reservedQuantity: 0,
        title: 'Fresh tomatoes',
      },
      buyer: { id: mockBuyerProfile.id, userId: mockUserBuyer.id },
    });
    txMock.offer.updateMany.mockResolvedValue({ count: 1 });
    txMock.produceListing.update.mockResolvedValue({});
    txMock.produceTransaction.create.mockResolvedValue({
      id: 'txn-1',
      offerId,
      listingId,
      farmerId: mockFarmerProfile.id,
      buyerId: mockBuyerProfile.id,
      agreedQuantity: 20,
      unit: ProduceUnit.CRATE,
      agreedPricePerUnit: 180,
      totalAmount: 3600,
      pickupDate: new Date('2026-07-01'),
      status: TransactionStatus.CONFIRMED,
      completedAt: null,
      cancelledAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    txMock.matchRecommendation.updateMany.mockResolvedValue({ count: 1 });
    txMock.offer.findMany.mockResolvedValue([]);

    mockPrisma.$transaction.mockImplementation(async (fn) => fn(txMock));

    const result = await offersService.acceptOffer(mockUserFarmer.id, offerId);
    expect(result.transaction.status).toBe(TransactionStatus.CONFIRMED);
    expect(txMock.produceListing.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ reservedQuantity: 20 }),
      }),
    );
  });

  it('prevents double acceptance of the same offer', async () => {
    const txMock = buildMockPrisma();
    txMock.offer.findUnique.mockResolvedValue({
      id: offerId,
      status: OfferStatus.PENDING,
      expiresAt: null,
      offeredQuantity: 20,
      unit: ProduceUnit.CRATE,
      offeredPricePerUnit: 180,
      totalAmount: 3600,
      proposedPickupDate: new Date('2026-07-01'),
      listing: {
        id: listingId,
        farmerId: mockFarmerProfile.id,
        quantity: 60,
        reservedQuantity: 0,
        title: 'Fresh tomatoes',
      },
      buyer: { id: mockBuyerProfile.id, userId: mockUserBuyer.id },
    });
    txMock.offer.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.$transaction.mockImplementation(async (fn) => fn(txMock));

    await expect(offersService.acceptOffer(mockUserFarmer.id, offerId)).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it('prevents unauthorized farmer from accepting an offer', async () => {
    const txMock = buildMockPrisma();
    txMock.offer.findUnique.mockResolvedValue({
      id: offerId,
      status: OfferStatus.PENDING,
      listing: {
        farmerId: 'other-farmer-id',
        quantity: 60,
        reservedQuantity: 0,
        title: 'Other',
        id: listingId,
      },
      buyer: { id: mockBuyerProfile.id, userId: mockUserBuyer.id },
    });
    mockPrisma.$transaction.mockImplementation(async (fn) => fn(txMock));

    await expect(offersService.acceptOffer(mockUserFarmer.id, offerId)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

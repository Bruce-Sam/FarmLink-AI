import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListingStatus, ListingSourceType, ProduceUnit } from '@prisma/client';
import { mockPrisma } from '../setup';
import { mockUserFarmer, mockFarmerProfile } from '../helpers/fixtures';

vi.mock('../../src/services/matching-engine.service', () => ({
  matchingEngineService: {
    generateMatchesForListing: vi.fn().mockResolvedValue([{ id: 'match-1', score: 85 }]),
  },
}));

vi.mock('../../src/modules/transport/transport.service', () => ({
  transportService: { generateForListing: vi.fn().mockResolvedValue([]) },
}));

vi.mock('../../src/services/audit.service', () => ({
  recordAudit: vi.fn().mockResolvedValue(undefined),
}));

import { listingsService } from '../../src/modules/listings/listings.service';
import { matchingEngineService } from '../../src/services/matching-engine.service';

const categoryId = 'cat-tomatoes';
const listingId = 'listing-draft-1';

describe('Listings service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.farmerProfile.findUnique.mockResolvedValue(mockFarmerProfile);
    mockPrisma.produceCategory.findUnique.mockResolvedValue({ id: categoryId });
  });

  it('creates a draft listing for a farmer', async () => {
    mockPrisma.produceListing.create.mockResolvedValue({
      id: listingId,
      farmerId: mockFarmerProfile.id,
      categoryId,
      title: 'Fresh tomatoes in Agogo',
      description: 'Wholesale tomatoes',
      quantity: 60,
      reservedQuantity: 0,
      unit: ProduceUnit.CRATE,
      minimumOrderQuantity: 10,
      pricePerUnit: 180,
      currency: 'GHS',
      harvestDate: new Date('2026-06-29'),
      availableFrom: new Date('2026-06-29'),
      availableUntil: null,
      qualityGrade: null,
      farmingMethod: null,
      region: 'Ashanti',
      district: 'Asante Akim North',
      town: 'Agogo',
      latitude: 6.8001,
      longitude: -1.0819,
      status: ListingStatus.DRAFT,
      sourceType: ListingSourceType.TEXT,
      rawInputText: '60 crates tomatoes',
      aiExtractionConfidence: 0.9,
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: { id: categoryId, name: 'Tomatoes', slug: 'tomatoes' },
      farmer: {
        id: mockFarmerProfile.id,
        farmName: mockFarmerProfile.farmName,
        region: mockFarmerProfile.region,
        district: mockFarmerProfile.district,
        town: mockFarmerProfile.town,
        verificationStatus: 'UNVERIFIED',
      },
    });

    const listing = await listingsService.create(mockUserFarmer.id, {
      categoryId,
      title: 'Fresh tomatoes in Agogo',
      description: 'Wholesale tomatoes',
      quantity: 60,
      unit: ProduceUnit.CRATE,
      minimumOrderQuantity: 10,
      pricePerUnit: 180,
      currency: 'GHS',
      harvestDate: new Date('2026-06-29'),
      availableFrom: new Date('2026-06-29'),
      region: 'Ashanti',
      district: 'Asante Akim North',
      town: 'Agogo',
      latitude: 6.8001,
      longitude: -1.0819,
      sourceType: ListingSourceType.TEXT,
      rawInputText: '60 crates tomatoes',
      aiExtractionConfidence: 0.9,
    });

    expect(listing.status).toBe(ListingStatus.DRAFT);
  });

  it('publishes a draft listing and triggers matching', async () => {
    mockPrisma.produceListing.findUnique.mockResolvedValue({
      id: listingId,
      farmerId: mockFarmerProfile.id,
      status: ListingStatus.DRAFT,
      category: { id: categoryId, name: 'Tomatoes', slug: 'tomatoes' },
      farmer: {
        id: mockFarmerProfile.id,
        farmName: mockFarmerProfile.farmName,
        region: mockFarmerProfile.region,
        district: mockFarmerProfile.district,
        town: mockFarmerProfile.town,
        verificationStatus: 'UNVERIFIED',
      },
      quantity: 60,
      reservedQuantity: 0,
      unit: ProduceUnit.CRATE,
      title: 'Fresh tomatoes',
      description: 'desc',
      minimumOrderQuantity: 10,
      pricePerUnit: 180,
      currency: 'GHS',
      harvestDate: new Date(),
      availableFrom: new Date(),
      availableUntil: null,
      qualityGrade: null,
      farmingMethod: null,
      region: 'Ashanti',
      district: 'Asante Akim North',
      town: 'Agogo',
      latitude: 6.8001,
      longitude: -1.0819,
      sourceType: ListingSourceType.FORM,
      rawInputText: null,
      aiExtractionConfidence: null,
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockPrisma.produceListing.update.mockResolvedValue({
      id: listingId,
      status: ListingStatus.PUBLISHED,
      publishedAt: new Date(),
    });

    const result = await listingsService.publish(mockUserFarmer.id, listingId);
    expect(result.matchesGenerated).toBe(1);
    expect(matchingEngineService.generateMatchesForListing).toHaveBeenCalledWith(listingId);
  });

  it('prevents a farmer from editing another farmers listing', async () => {
    mockPrisma.produceListing.findUnique.mockResolvedValue({
      id: listingId,
      farmerId: 'other-farmer-id',
      status: ListingStatus.DRAFT,
    });

    await expect(
      listingsService.update(mockUserFarmer.id, listingId, { title: 'Hacked' }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

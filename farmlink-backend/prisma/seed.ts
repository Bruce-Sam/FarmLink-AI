import {
  AccountStatus,
  BuyerType,
  ListingSourceType,
  ListingStatus,
  MatchStatus,
  NotificationType,
  OfferStatus,
  ProduceUnit,
  Role,
  TransactionStatus,
  VerificationStatus,
} from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config as loadEnv } from 'dotenv';
import { PRODUCE_CATEGORIES } from '../src/constants/produce';
import { GHANA_LOCATIONS } from '../src/services/geolocation.service';

loadEnv();

const prisma = new PrismaClient();

const DEMO_PASSWORDS = {
  admin: process.env.ADMIN_PASSWORD ?? 'AdminPassword123!',
  farmer: 'FarmerPassword123!',
  buyer: 'BuyerPassword123!',
};

function loc(town: string) {
  const found = GHANA_LOCATIONS.find((l) => l.town === town);
  if (!found) throw new Error(`Unknown town: ${town}`);
  return found;
}

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

async function hash(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

async function main(): Promise<void> {
  console.log('🌱 Seeding FarmLink AI database…');

  // Clear in dependency order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.transportPoolSuggestion.deleteMany();
  await prisma.produceTransaction.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.matchRecommendation.deleteMany();
  await prisma.buyerDemand.deleteMany();
  await prisma.produceListing.deleteMany();
  await prisma.farmerProfile.deleteMany();
  await prisma.buyerProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.produceCategory.deleteMany();

  // Categories
  const categories = await Promise.all(
    PRODUCE_CATEGORIES.map((cat) =>
      prisma.produceCategory.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          unitOptions: cat.unitOptions,
        },
      }),
    ),
  );
  const cat = (slug: string) => categories.find((c) => c.slug === slug)!;

  // Admin
  const admin = await prisma.user.create({
    data: {
      fullName: process.env.ADMIN_FULL_NAME ?? 'FarmLink Administrator',
      phoneNumber: process.env.ADMIN_PHONE_NUMBER ?? '+233200000000',
      email: process.env.ADMIN_EMAIL ?? 'admin@farmlink.local',
      passwordHash: await hash(DEMO_PASSWORDS.admin),
      role: Role.ADMIN,
      accountStatus: AccountStatus.ACTIVE,
      phoneVerified: true,
    },
  });

  // Farmers (5+)
  const farmerDefs = [
    { name: 'Kwame Mensah', phone: '+233244123456', email: 'farmer@farmlink.local', town: 'Agogo', farm: 'Sunrise Valley Farm', crops: ['tomatoes', 'pepper'] },
    { name: 'Akosua Adjei', phone: '+233244234567', email: 'akosua.adjei@example.com', town: 'Ejura', farm: 'Green Harvest Farms', crops: ['maize', 'cassava'] },
    { name: 'Yaw Osei', phone: '+233244345678', email: 'yaw.osei@example.com', town: 'Techiman', farm: 'Bono Produce Co-op', crops: ['plantain', 'yam'] },
    { name: 'Abena Frimpong', phone: '+233244456789', email: 'abena.frimpong@example.com', town: 'Koforidua', farm: 'Eastern Fresh Farms', crops: ['pineapple', 'mango'] },
    { name: 'Kofi Asante', phone: '+233244567890', email: 'kofi.asante@example.com', town: 'Tamale', farm: 'Northern Greens', crops: ['onions', 'tomatoes'] },
    { name: 'Efua Boateng', phone: '+233244678901', email: 'efua.boateng@example.com', town: 'Cape Coast', farm: 'Coastal Harvest', crops: ['okra', 'cabbage'] },
  ];

  const farmers = [];
  for (const f of farmerDefs) {
    const l = loc(f.town);
    const user = await prisma.user.create({
      data: {
        fullName: f.name,
        phoneNumber: f.phone,
        email: f.email,
        passwordHash: await hash(f.email === 'farmer@farmlink.local' ? DEMO_PASSWORDS.farmer : 'DemoFarmer123!'),
        role: Role.FARMER,
        accountStatus: AccountStatus.ACTIVE,
        phoneVerified: true,
      },
    });
    const profile = await prisma.farmerProfile.create({
      data: {
        userId: user.id,
        farmName: f.farm,
        description: `${f.farm} supplies fresh produce from ${f.town}.`,
        region: l.region,
        district: l.district,
        town: l.town,
        latitude: l.latitude,
        longitude: l.longitude,
        primaryCrops: f.crops,
        farmSizeAcres: 12 + Math.floor(Math.random() * 20),
        verificationStatus: f.email === 'farmer@farmlink.local' ? VerificationStatus.VERIFIED : VerificationStatus.PENDING,
      },
    });
    farmers.push({ user, profile });
  }

  // Buyers (6+)
  const buyerDefs = [
    { name: 'Golden Spoon Restaurant', phone: '+233244555667', email: 'buyer@farmlink.local', town: 'Kumasi', type: BuyerType.RESTAURANT, prefs: ['tomatoes', 'onions', 'pepper'] },
    { name: 'Accra Fresh Hotels', phone: '+233244666778', email: 'orders@accrahotels.gh', town: 'Accra', type: BuyerType.HOTEL, prefs: ['pineapple', 'watermelon', 'mango'] },
    { name: 'Cape Coast Academy', phone: '+233244777889', email: 'kitchen@ccacademy.edu.gh', town: 'Cape Coast', type: BuyerType.SCHOOL, prefs: ['rice', 'plantain', 'cassava'] },
    { name: 'Kasoa Market Traders Union', phone: '+233244888990', email: 'procurement@kasoamarket.gh', town: 'Kasoa', type: BuyerType.MARKET_TRADER, prefs: ['tomatoes', 'onions', 'pepper'] },
    { name: 'Techiman Wholesalers Ltd', phone: '+233244999001', email: 'buy@techimanwholesale.gh', town: 'Techiman', type: BuyerType.WHOLESALER, prefs: ['maize', 'yam', 'cassava'] },
    { name: 'Volta Foods Processing', phone: '+233244100112', email: 'supply@voltafoods.gh', town: 'Ho', type: BuyerType.PROCESSOR, prefs: ['cassava', 'plantain', 'maize'] },
    { name: 'Sunyani Supermarket Chain', phone: '+233244111223', email: 'procure@sunyanism.gh', town: 'Sunyani', type: BuyerType.SUPERMARKET, prefs: ['tomatoes', 'carrots', 'cabbage'] },
  ];

  const buyers = [];
  for (const b of buyerDefs) {
    const l = loc(b.town);
    const user = await prisma.user.create({
      data: {
        fullName: b.name,
        phoneNumber: b.phone,
        email: b.email,
        passwordHash: await hash(b.email === 'buyer@farmlink.local' ? DEMO_PASSWORDS.buyer : 'DemoBuyer123!'),
        role: Role.BUYER,
        accountStatus: AccountStatus.ACTIVE,
        phoneVerified: true,
      },
    });
    const profile = await prisma.buyerProfile.create({
      data: {
        userId: user.id,
        businessName: b.name,
        buyerType: b.type,
        description: `${b.name} procures fresh produce across ${l.region}.`,
        region: l.region,
        district: l.district,
        town: l.town,
        latitude: l.latitude,
        longitude: l.longitude,
        preferredProduce: b.prefs,
        minimumOrderQuantity: 10,
        maximumTravelDistanceKm: 100,
        verificationStatus: b.email === 'buyer@farmlink.local' ? VerificationStatus.VERIFIED : VerificationStatus.UNVERIFIED,
      },
    });
    buyers.push({ user, profile });
  }

  // Buyer demands
  const goldenSpoon = buyers[0];
  await prisma.buyerDemand.create({
    data: {
      buyerId: goldenSpoon.profile.id,
      categoryId: cat('tomatoes').id,
      minimumQuantity: 40,
      maximumQuantity: 100,
      unit: ProduceUnit.CRATE,
      preferredPriceMaximum: 200,
      requiredFrom: daysFromNow(1),
      requiredUntil: daysFromNow(14),
      preferredRegions: ['Ashanti', 'Eastern'],
      isRecurring: true,
      frequency: 'weekly',
    },
  });

  await prisma.buyerDemand.create({
    data: {
      buyerId: buyers[1].profile.id,
      categoryId: cat('pineapple').id,
      minimumQuantity: 50,
      maximumQuantity: 200,
      unit: ProduceUnit.PIECE,
      preferredPriceMaximum: 8,
      requiredFrom: daysFromNow(2),
      requiredUntil: daysFromNow(10),
      preferredRegions: ['Greater Accra', 'Central'],
      isRecurring: true,
      frequency: 'biweekly',
    },
  });

  await prisma.buyerDemand.create({
    data: {
      buyerId: buyers[3].profile.id,
      categoryId: cat('onions').id,
      minimumQuantity: 20,
      unit: ProduceUnit.BAG,
      preferredPriceMaximum: 150,
      preferredRegions: ['Central', 'Greater Accra'],
      isRecurring: true,
      frequency: 'weekly',
    },
  });

  // Listings (10+)
  const listingDefs = [
    { farmer: 0, slug: 'tomatoes', title: 'Fresh tomatoes — Agogo harvest', qty: 60, unit: ProduceUnit.CRATE, price: 180, town: 'Agogo', status: ListingStatus.PUBLISHED, source: ListingSourceType.VOICE_TRANSCRIPTION },
    { farmer: 0, slug: 'pepper', title: 'Red pepper crates available', qty: 30, unit: ProduceUnit.CRATE, price: 220, town: 'Agogo', status: ListingStatus.PUBLISHED, source: ListingSourceType.FORM },
    { farmer: 1, slug: 'maize', title: 'Maize bags from Ejura', qty: 200, unit: ProduceUnit.BAG, price: 95, town: 'Ejura', status: ListingStatus.PUBLISHED, source: ListingSourceType.TEXT },
    { farmer: 2, slug: 'plantain', title: 'Plantain bunches — Techiman', qty: 80, unit: ProduceUnit.BUNCH, price: 25, town: 'Techiman', status: ListingStatus.PUBLISHED, source: ListingSourceType.FORM },
    { farmer: 3, slug: 'pineapple', title: 'Sweet pineapple boxes', qty: 120, unit: ProduceUnit.BOX, price: 45, town: 'Koforidua', status: ListingStatus.PUBLISHED, source: ListingSourceType.FORM },
    { farmer: 4, slug: 'onions', title: 'Northern onions sacks', qty: 150, unit: ProduceUnit.SACK, price: 110, town: 'Tamale', status: ListingStatus.PUBLISHED, source: ListingSourceType.TEXT },
    { farmer: 5, slug: 'okra', title: 'Fresh okra baskets', qty: 40, unit: ProduceUnit.BASKET, price: 60, town: 'Cape Coast', status: ListingStatus.DRAFT, source: ListingSourceType.FORM },
    { farmer: 1, slug: 'cassava', title: 'Cassava tonnes bulk', qty: 5, unit: ProduceUnit.TONNE, price: 1200, town: 'Ejura', status: ListingStatus.PUBLISHED, source: ListingSourceType.FORM },
    { farmer: 2, slug: 'yam', title: 'Yam harvest — Bono region', qty: 300, unit: ProduceUnit.PIECE, price: 15, town: 'Techiman', status: ListingStatus.PUBLISHED, source: ListingSourceType.FORM },
    { farmer: 0, slug: 'tomatoes', title: 'Second tomato batch next week', qty: 45, unit: ProduceUnit.CRATE, price: 175, town: 'Agogo', status: ListingStatus.PUBLISHED, source: ListingSourceType.VOICE_TRANSCRIPTION },
    { farmer: 3, slug: 'mango', title: 'Mango crates — Eastern region', qty: 70, unit: ProduceUnit.CRATE, price: 90, town: 'Koforidua', status: ListingStatus.PARTIALLY_RESERVED, source: ListingSourceType.FORM },
  ];

  const listings = [];
  for (const ld of listingDefs) {
    const l = loc(ld.town);
    const listing = await prisma.produceListing.create({
      data: {
        farmerId: farmers[ld.farmer].profile.id,
        categoryId: cat(ld.slug).id,
        title: ld.title,
        description: `${ld.title}. High-quality produce from ${l.town}, ${l.region}.`,
        quantity: ld.qty,
        reservedQuantity: ld.status === ListingStatus.PARTIALLY_RESERVED ? ld.qty * 0.3 : 0,
        unit: ld.unit,
        minimumOrderQuantity: 10,
        pricePerUnit: ld.price,
        harvestDate: daysFromNow(3),
        availableFrom: daysFromNow(2),
        availableUntil: daysFromNow(14),
        region: l.region,
        district: l.district,
        town: l.town,
        latitude: l.latitude,
        longitude: l.longitude,
        status: ld.status,
        sourceType: ld.source,
        rawInputText: ld.source === ListingSourceType.VOICE_TRANSCRIPTION ? `I have ${ld.qty} ${ld.unit.toLowerCase()} of ${ld.slug} ready next week at ${l.town}` : null,
        aiExtractionConfidence: ld.source === ListingSourceType.VOICE_TRANSCRIPTION ? 0.91 : null,
        publishedAt: ld.status !== ListingStatus.DRAFT ? daysFromNow(-1) : null,
      },
    });
    listings.push(listing);
  }

  const tomatoListing = listings[0];

  // Match recommendations
  await prisma.matchRecommendation.create({
    data: {
      listingId: tomatoListing.id,
      buyerId: goldenSpoon.profile.id,
      score: 88,
      produceScore: 100,
      quantityScore: 100,
      distanceScore: 85,
      dateScore: 95,
      priceScore: 100,
      explanation:
        'This buyer regularly purchases tomatoes, requires 40–100 crates, is located 32 km away and needs delivery within the listing\'s availability period.',
      status: MatchStatus.RECOMMENDED,
    },
  });

  await prisma.matchRecommendation.create({
    data: {
      listingId: tomatoListing.id,
      buyerId: buyers[3].profile.id,
      score: 72,
      produceScore: 70,
      quantityScore: 85,
      distanceScore: 65,
      dateScore: 80,
      priceScore: 90,
      explanation: 'This buyer lists tomatoes among preferred produce, is located 58 km away.',
      status: MatchStatus.VIEWED,
    },
  });

  // Offers
  const pendingOffer = await prisma.offer.create({
    data: {
      listingId: tomatoListing.id,
      buyerId: goldenSpoon.profile.id,
      offeredQuantity: 40,
      unit: ProduceUnit.CRATE,
      offeredPricePerUnit: 175,
      totalAmount: 7000,
      message: 'We can pick up from Agogo on Monday morning.',
      proposedPickupDate: daysFromNow(5),
      status: OfferStatus.PENDING,
      expiresAt: daysFromNow(7),
    },
  });

  const acceptedOfferListing = listings[10]; // mango partially reserved
  const acceptedOffer = await prisma.offer.create({
    data: {
      listingId: acceptedOfferListing.id,
      buyerId: buyers[1].profile.id,
      offeredQuantity: 21,
      unit: ProduceUnit.CRATE,
      offeredPricePerUnit: 88,
      totalAmount: 1848,
      proposedPickupDate: daysFromNow(4),
      status: OfferStatus.ACCEPTED,
      acceptedAt: daysFromNow(-1),
    },
  });

  // Completed transactions (2+)
  await prisma.produceTransaction.create({
    data: {
      offerId: acceptedOffer.id,
      listingId: acceptedOfferListing.id,
      farmerId: farmers[3].profile.id,
      buyerId: buyers[1].profile.id,
      agreedQuantity: 21,
      unit: ProduceUnit.CRATE,
      agreedPricePerUnit: 88,
      totalAmount: 1848,
      pickupDate: daysFromNow(4),
      status: TransactionStatus.CONFIRMED,
    },
  });

  const completedListing = listings[4]; // pineapple
  const completedOffer = await prisma.offer.create({
    data: {
      listingId: completedListing.id,
      buyerId: buyers[1].profile.id,
      offeredQuantity: 50,
      unit: ProduceUnit.BOX,
      offeredPricePerUnit: 42,
      totalAmount: 2100,
      proposedPickupDate: daysFromNow(-2),
      status: OfferStatus.COMPLETED,
      acceptedAt: daysFromNow(-5),
    },
  });

  await prisma.produceTransaction.create({
    data: {
      offerId: completedOffer.id,
      listingId: completedListing.id,
      farmerId: farmers[3].profile.id,
      buyerId: buyers[1].profile.id,
      agreedQuantity: 50,
      unit: ProduceUnit.BOX,
      agreedPricePerUnit: 42,
      totalAmount: 2100,
      pickupDate: daysFromNow(-2),
      status: TransactionStatus.COMPLETED,
      completedAt: daysFromNow(-1),
    },
  });

  // Transport pool suggestion between two Agogo tomato listings
  await prisma.transportPoolSuggestion.create({
    data: {
      primaryListingId: listings[0].id,
      secondaryListingId: listings[9].id,
      distanceBetweenFarmsKm: 8.4,
      destinationSimilarityScore: 1,
      estimatedSavingsPercentage: 18,
      explanation:
        'Another tomato farmer is located 8.4 km away and has produce scheduled for pickup on the same day. Combining transport may reduce delivery costs.',
    },
  });

  // Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: goldenSpoon.user.id,
        type: NotificationType.MATCH_FOUND,
        title: 'New produce match',
        message: 'A tomato listing in Agogo matches your weekly demand.',
        metadata: { listingId: tomatoListing.id, score: 88 },
      },
      {
        userId: farmers[0].user.id,
        type: NotificationType.OFFER_RECEIVED,
        title: 'New offer received',
        message: 'Golden Spoon Restaurant sent an offer for your tomato listing.',
        metadata: { offerId: pendingOffer.id },
      },
      {
        userId: buyers[1].user.id,
        type: NotificationType.OFFER_ACCEPTED,
        title: 'Offer accepted',
        message: 'Your mango offer was accepted.',
        metadata: { offerId: acceptedOffer.id },
      },
    ],
  });

  // Audit logs
  await prisma.auditLog.createMany({
    data: [
      { actorUserId: admin.id, action: 'SEED_COMPLETED', entityType: 'System', metadata: { version: '0.1.0' } },
      { actorUserId: farmers[0].user.id, action: 'LISTING_PUBLISHED', entityType: 'ProduceListing', entityId: tomatoListing.id },
      { actorUserId: goldenSpoon.user.id, action: 'OFFER_CREATED', entityType: 'Offer', entityId: pendingOffer.id },
      { actorUserId: farmers[3].user.id, action: 'OFFER_ACCEPTED', entityType: 'Offer', entityId: acceptedOffer.id },
    ],
  });

  console.log('✅ Seed complete');
  console.log('');
  console.log('Demo credentials (development only):');
  console.log(`  Admin:  ${process.env.ADMIN_EMAIL ?? 'admin@farmlink.local'} / ${DEMO_PASSWORDS.admin}`);
  console.log('  Farmer: farmer@farmlink.local / FarmerPassword123!');
  console.log('  Buyer:  buyer@farmlink.local / BuyerPassword123!');
  console.log('');
  console.log(`  Categories: ${categories.length}`);
  console.log(`  Farmers: ${farmers.length}`);
  console.log(`  Buyers: ${buyers.length}`);
  console.log(`  Listings: ${listings.length}`);
  console.log(`  Demands: 3 (incl. Golden Spoon tomato demand)`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

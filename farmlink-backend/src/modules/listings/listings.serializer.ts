import { type Prisma } from '@prisma/client';
import { decimalToNumber } from '../../utils/money';

type ListingWithRelations = Prisma.ProduceListingGetPayload<{
  include: {
    category: { select: { id: true; name: true; slug: true } };
    farmer: {
      select: {
        id: true;
        farmName: true;
        region: true;
        district: true;
        town: true;
        verificationStatus: true;
      };
    };
  };
}>;

// Converts Decimal columns to plain numbers and exposes availableQuantity.
export function serializeListing(listing: ListingWithRelations) {
  const quantity = decimalToNumber(listing.quantity) ?? 0;
  const reservedQuantity = decimalToNumber(listing.reservedQuantity) ?? 0;
  return {
    ...listing,
    quantity,
    reservedQuantity,
    availableQuantity: Math.max(0, quantity - reservedQuantity),
    minimumOrderQuantity: decimalToNumber(listing.minimumOrderQuantity),
    pricePerUnit: decimalToNumber(listing.pricePerUnit),
  };
}

export type SerializedListing = ReturnType<typeof serializeListing>;

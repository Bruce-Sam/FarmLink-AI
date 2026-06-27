import { Prisma } from '@prisma/client';

// Convert a Prisma Decimal (or number) to a plain JS number for API responses.
export function decimalToNumber(value: Prisma.Decimal | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return typeof value === 'number' ? value : value.toNumber();
}

// Server-side, decimal-safe monetary multiplication. Returns a Prisma.Decimal.
export function multiplyMoney(
  pricePerUnit: number | Prisma.Decimal,
  quantity: number | Prisma.Decimal,
): Prisma.Decimal {
  const price = new Prisma.Decimal(pricePerUnit);
  const qty = new Prisma.Decimal(quantity);
  return price.mul(qty).toDecimalPlaces(2);
}

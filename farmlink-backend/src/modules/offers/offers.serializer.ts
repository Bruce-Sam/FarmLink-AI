import { type Offer, type ProduceTransaction } from '@prisma/client';
import { decimalToNumber } from '../../utils/money';

export function serializeOffer<T extends Offer>(offer: T) {
  return {
    ...offer,
    offeredQuantity: decimalToNumber(offer.offeredQuantity),
    offeredPricePerUnit: decimalToNumber(offer.offeredPricePerUnit),
    totalAmount: decimalToNumber(offer.totalAmount),
  };
}

export function serializeTransaction<T extends ProduceTransaction>(tx: T) {
  return {
    ...tx,
    agreedQuantity: decimalToNumber(tx.agreedQuantity),
    agreedPricePerUnit: decimalToNumber(tx.agreedPricePerUnit),
    totalAmount: decimalToNumber(tx.totalAmount),
  };
}

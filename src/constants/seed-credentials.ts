/** Seeded development accounts (see Afuo Market-backend/README.md). */
export const SEED_CREDENTIALS = {
  farmer: {
    email: 'farmer@farmlink.local',
    password: 'FarmerPassword123!',
    label: 'Kwame Mensah (farmer)',
  },
  buyer: {
    email: 'buyer@farmlink.local',
    password: 'BuyerPassword123!',
    label: 'Golden Spoon Restaurant (buyer)',
  },
  admin: {
    email: 'admin@farmlink.local',
    password: 'AdminPassword123!',
    label: 'Afuo Market Administrator',
  },
} as const;

export function seedCredentialHint(role: keyof typeof SEED_CREDENTIALS): string {
  const cred = SEED_CREDENTIALS[role];
  return `${cred.email} · ${cred.password}`;
}

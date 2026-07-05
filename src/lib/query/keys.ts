export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },
  farmer: {
    all: ['farmer'] as const,
    profile: () => [...queryKeys.farmer.all, 'profile'] as const,
  },
  listings: {
    all: ['listings'] as const,
    my: (filters?: Record<string, unknown>) =>
      [...queryKeys.listings.all, 'my', filters ?? {}] as const,
    detail: (id: string) => [...queryKeys.listings.all, 'detail', id] as const,
    matches: (listingId: string) =>
      [...queryKeys.listings.all, 'matches', listingId] as const,
  },
  offers: {
    all: ['offers'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.offers.all, 'list', filters ?? {}] as const,
    detail: (id: string) => [...queryKeys.offers.all, 'detail', id] as const,
  },
  transactions: {
    all: ['transactions'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.transactions.all, 'list', filters ?? {}] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.notifications.all, 'list', filters ?? {}] as const,
    unreadCount: () =>
      [...queryKeys.notifications.all, 'unread-count'] as const,
  },
  categories: {
    all: ['categories'] as const,
    list: () => [...queryKeys.categories.all, 'list'] as const,
    detail: (id: string) =>
      [...queryKeys.categories.all, 'detail', id] as const,
  },
  transport: {
    all: ['transport'] as const,
    suggestions: () => [...queryKeys.transport.all, 'suggestions'] as const,
  },
  buyer: {
    all: ['buyer'] as const,
    profile: () => [...queryKeys.buyer.all, 'profile'] as const,
    dashboard: () => [...queryKeys.buyer.all, 'dashboard'] as const,
    demands: (filters?: Record<string, unknown>) =>
      [...queryKeys.buyer.all, 'demands', filters ?? {}] as const,
    demandDetail: (id: string) => [...queryKeys.buyer.all, 'demand', id] as const,
    recommendations: (filters?: Record<string, unknown>) =>
      [...queryKeys.buyer.all, 'recommendations', filters ?? {}] as const,
    recommendationDetail: (id: string) =>
      [...queryKeys.buyer.all, 'recommendation', id] as const,
    marketplace: (filters?: Record<string, unknown>) =>
      [...queryKeys.buyer.all, 'marketplace', filters ?? {}] as const,
    marketplaceDetail: (id: string) =>
      [...queryKeys.buyer.all, 'marketplace-detail', id] as const,
    offers: (filters?: Record<string, unknown>) =>
      [...queryKeys.buyer.all, 'offers', filters ?? {}] as const,
    offerDetail: (id: string) => [...queryKeys.buyer.all, 'offer', id] as const,
    transactions: (filters?: Record<string, unknown>) =>
      [...queryKeys.buyer.all, 'transactions', filters ?? {}] as const,
    transactionDetail: (id: string) =>
      [...queryKeys.buyer.all, 'transaction', id] as const,
    insights: () => [...queryKeys.buyer.all, 'insights'] as const,
  },
  ratings: {
    all: ['ratings'] as const,
    userSummary: (userId: string) => [...queryKeys.ratings.all, 'user', userId] as const,
    farmerSummary: (farmerId: string) => [...queryKeys.ratings.all, 'farmer', farmerId] as const,
    buyerSummary: (buyerId: string) => [...queryKeys.ratings.all, 'buyer', buyerId] as const,
    transaction: (transactionId: string) =>
      [...queryKeys.ratings.all, 'transaction', transactionId] as const,
  },
  admin: {
    all: ['admin'] as const,
    dashboard: () => [...queryKeys.admin.all, 'dashboard'] as const,
    analytics: () => [...queryKeys.admin.all, 'analytics'] as const,
    users: (filters?: object) =>
      [...queryKeys.admin.all, 'users', filters ?? {}] as const,
    user: (id: string) => [...queryKeys.admin.all, 'user', id] as const,
    listings: (filters?: object) =>
      [...queryKeys.admin.all, 'listings', filters ?? {}] as const,
    listing: (id: string) => [...queryKeys.admin.all, 'listing', id] as const,
    offers: (filters?: object) =>
      [...queryKeys.admin.all, 'offers', filters ?? {}] as const,
    transactions: (filters?: object) =>
      [...queryKeys.admin.all, 'transactions', filters ?? {}] as const,
    matches: (filters?: object) =>
      [...queryKeys.admin.all, 'matches', filters ?? {}] as const,
    demands: () => [...queryKeys.admin.all, 'demands'] as const,
    transport: () => [...queryKeys.admin.all, 'transport'] as const,
    auditLogs: (filters?: object) =>
      [...queryKeys.admin.all, 'audit-logs', filters ?? {}] as const,
    health: () => [...queryKeys.admin.all, 'health'] as const,
  },
} as const;

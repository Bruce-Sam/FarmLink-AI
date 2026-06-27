import { type Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { config } from './env';

// Hand-authored OpenAPI document. Kept intentionally focused on the core demo
// flow; extend `paths` as new endpoints are added.
export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'FarmLink AI API',
    version: '0.1.0',
    description:
      'Ghana-focused agricultural marketplace and produce-matching backend. ' +
      'Connects farmers with bulk buyers using AI extraction and a weighted matching engine.',
  },
  servers: [{ url: `http://localhost:${config.PORT}/api/v1`, description: 'Local' }],
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'Categories' },
    { name: 'Farmer Profiles' },
    { name: 'Buyer Profiles' },
    { name: 'Listings' },
    { name: 'Marketplace' },
    { name: 'AI Extraction' },
    { name: 'Matching' },
    { name: 'Offers' },
    { name: 'Transactions' },
    { name: 'Notifications' },
    { name: 'Admin' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: { type: 'object' },
          meta: { type: 'object', nullable: true },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          error: {
            type: 'object',
            properties: { code: { type: 'string' }, details: {} },
          },
          requestId: { type: 'string' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['fullName', 'phoneNumber', 'password', 'role'],
        properties: {
          fullName: { type: 'string', example: 'Kwame Mensah' },
          phoneNumber: { type: 'string', example: '+233240000000' },
          email: { type: 'string', example: 'kwame@example.com' },
          password: { type: 'string', example: 'StrongPassword123!' },
          role: { type: 'string', enum: ['FARMER', 'BUYER'], example: 'FARMER' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['identifier', 'password'],
        properties: {
          identifier: { type: 'string', example: 'farmer@farmlink.local' },
          password: { type: 'string', example: 'FarmerPassword123!' },
        },
      },
      ExtractRequest: {
        type: 'object',
        required: ['text'],
        properties: {
          text: {
            type: 'string',
            example: 'I have 60 crates of tomatoes ready next Monday at Agogo',
          },
          referenceDate: { type: 'string', example: '2026-06-26' },
        },
      },
      CreateListingRequest: {
        type: 'object',
        required: [
          'categoryId',
          'title',
          'description',
          'quantity',
          'unit',
          'harvestDate',
          'availableFrom',
          'region',
          'district',
          'town',
          'latitude',
          'longitude',
        ],
        properties: {
          categoryId: { type: 'string', format: 'uuid' },
          title: { type: 'string', example: 'Fresh tomatoes available in Agogo' },
          description: { type: 'string' },
          quantity: { type: 'number', example: 60 },
          unit: { type: 'string', example: 'CRATE' },
          minimumOrderQuantity: { type: 'number', example: 10 },
          pricePerUnit: { type: 'number', example: 180 },
          harvestDate: { type: 'string', example: '2026-06-29' },
          availableFrom: { type: 'string', example: '2026-06-29' },
          region: { type: 'string', example: 'Ashanti' },
          district: { type: 'string', example: 'Asante Akim North' },
          town: { type: 'string', example: 'Agogo' },
          latitude: { type: 'number', example: 6.8001 },
          longitude: { type: 'number', example: -1.0819 },
          sourceType: { type: 'string', example: 'VOICE_TRANSCRIPTION' },
        },
      },
      CreateOfferRequest: {
        type: 'object',
        required: ['listingId', 'offeredQuantity', 'offeredPricePerUnit', 'proposedPickupDate'],
        properties: {
          listingId: { type: 'string', format: 'uuid' },
          offeredQuantity: { type: 'number', example: 40 },
          offeredPricePerUnit: { type: 'number', example: 175 },
          message: { type: 'string', example: 'We can collect on Monday morning.' },
          proposedPickupDate: { type: 'string', example: '2026-06-30' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: buildPaths(),
};

type Operation = Record<string, unknown>;

function ok(description: string): Operation {
  return {
    description,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
  };
}

function jsonBody(ref: string): Operation {
  return {
    required: true,
    content: { 'application/json': { schema: { $ref: `#/components/schemas/${ref}` } } },
  };
}

function buildPaths(): Record<string, unknown> {
  return {
    '/health': {
      get: { tags: ['Health'], security: [], summary: 'Service health', responses: { 200: ok('Healthy') } },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        security: [],
        summary: 'Register a farmer or buyer',
        requestBody: jsonBody('RegisterRequest'),
        responses: { 201: ok('Account created') },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        security: [],
        summary: 'Log in',
        requestBody: jsonBody('LoginRequest'),
        responses: { 200: ok('Logged in') },
      },
    },
    '/auth/me': {
      get: { tags: ['Auth'], summary: 'Current user', responses: { 200: ok('Current user') } },
    },
    '/categories': {
      get: { tags: ['Categories'], security: [], summary: 'List produce categories', responses: { 200: ok('Categories') } },
    },
    '/farmers/profile': {
      post: { tags: ['Farmer Profiles'], summary: 'Create farmer profile', responses: { 201: ok('Created') } },
      get: { tags: ['Farmer Profiles'], summary: 'Get farmer profile', responses: { 200: ok('Profile') } },
      patch: { tags: ['Farmer Profiles'], summary: 'Update farmer profile', responses: { 200: ok('Updated') } },
    },
    '/buyers/profile': {
      post: { tags: ['Buyer Profiles'], summary: 'Create buyer profile', responses: { 201: ok('Created') } },
      get: { tags: ['Buyer Profiles'], summary: 'Get buyer profile', responses: { 200: ok('Profile') } },
      patch: { tags: ['Buyer Profiles'], summary: 'Update buyer profile', responses: { 200: ok('Updated') } },
    },
    '/buyers/demands': {
      post: { tags: ['Buyer Profiles'], summary: 'Create demand', responses: { 201: ok('Created') } },
      get: { tags: ['Buyer Profiles'], summary: 'List demands', responses: { 200: ok('Demands') } },
    },
    '/buyers/recommendations': {
      get: { tags: ['Matching'], summary: 'AI-ranked recommendations', responses: { 200: ok('Recommendations') } },
    },
    '/listings/extract': {
      post: {
        tags: ['AI Extraction'],
        summary: 'Extract structured produce data from text',
        requestBody: jsonBody('ExtractRequest'),
        responses: { 200: ok('Extraction result') },
      },
    },
    '/listings': {
      post: {
        tags: ['Listings'],
        summary: 'Create a draft listing',
        requestBody: jsonBody('CreateListingRequest'),
        responses: { 201: ok('Listing created') },
      },
    },
    '/listings/my': {
      get: { tags: ['Listings'], summary: 'My listings', responses: { 200: ok('Listings') } },
    },
    '/listings/{listingId}/publish': {
      post: {
        tags: ['Listings'],
        summary: 'Publish a listing (triggers matching)',
        parameters: [{ name: 'listingId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: ok('Published') },
      },
    },
    '/marketplace/listings': {
      get: { tags: ['Marketplace'], summary: 'Browse published listings', responses: { 200: ok('Listings') } },
    },
    '/offers': {
      post: {
        tags: ['Offers'],
        summary: 'Create an offer (buyer)',
        requestBody: jsonBody('CreateOfferRequest'),
        responses: { 201: ok('Offer sent') },
      },
    },
    '/farmers/offers/{offerId}/accept': {
      post: {
        tags: ['Offers'],
        summary: 'Accept an offer (farmer)',
        parameters: [{ name: 'offerId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: ok('Accepted; transaction created') },
      },
    },
    '/farmers/transactions': {
      get: { tags: ['Transactions'], summary: 'Farmer transactions', responses: { 200: ok('Transactions') } },
    },
    '/notifications': {
      get: { tags: ['Notifications'], summary: 'List notifications', responses: { 200: ok('Notifications') } },
    },
    '/admin/dashboard': {
      get: { tags: ['Admin'], summary: 'Admin metrics', responses: { 200: ok('Metrics') } },
    },
    '/admin/users': {
      get: { tags: ['Admin'], summary: 'List users', responses: { 200: ok('Users') } },
    },
  };
}

export function mountSwagger(app: Express): void {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.get('/api/docs.json', (_req, res) => {
    res.json(openApiDocument);
  });
}

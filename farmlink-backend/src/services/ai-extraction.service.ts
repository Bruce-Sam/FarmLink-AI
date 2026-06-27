import { config } from '../config/env';
import { logger } from '../config/logger';
import { localExtractionProvider } from './ai/local-provider';
import { externalExtractionProvider } from './ai/external-provider';
import {
  extractionResultSchema,
  type ExtractionInput,
  type ExtractionResult,
} from './ai/extraction.schema';

export { extractionInputSchema, type ExtractionInput, type ExtractionResult } from './ai/extraction.schema';

// Validates any provider output against the strict schema. Never trust raw AI.
function validateExtraction(raw: unknown): ExtractionResult {
  return extractionResultSchema.parse(raw);
}

export class AIExtractionService {
  async extract(input: ExtractionInput): Promise<ExtractionResult> {
    const useExternal = config.AI_PROVIDER !== 'local' && Boolean(config.AI_API_KEY);

    if (useExternal) {
      try {
        const raw = await externalExtractionProvider.extract(input);
        const result = validateExtraction(raw);
        logger.info({ provider: externalExtractionProvider.name }, 'AI extraction succeeded');
        return result;
      } catch (error) {
        logger.warn(
          { provider: externalExtractionProvider.name, err: (error as Error).message },
          'External AI extraction failed; falling back to local provider',
        );
      }
    }

    const raw = await localExtractionProvider.extract(input);
    return validateExtraction(raw);
  }
}

export const aiExtractionService = new AIExtractionService();

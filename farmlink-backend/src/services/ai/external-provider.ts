import { type AIExtractionProvider } from './provider';
import { type ExtractionInput } from './extraction.schema';
import { config } from '../../config/env';

// Placeholder for a real LLM provider (OpenAI, Anthropic, etc.).
// Wire an HTTP call here using config.AI_API_KEY / config.AI_MODEL and return
// the raw JSON; the service will validate it with the strict Zod schema and
// fall back to the local provider if this throws or returns invalid data.
export const externalExtractionProvider: AIExtractionProvider = {
  name: config.AI_PROVIDER,
  async extract(_input: ExtractionInput): Promise<unknown> {
    if (!config.AI_API_KEY) {
      throw new Error('AI_API_KEY is not configured; external provider unavailable');
    }
    // Intentionally not implemented for the MVP. Returning/throwing here makes
    // the service fall back to the deterministic local provider.
    throw new Error(
      `External AI provider "${config.AI_PROVIDER}" is not implemented in this MVP build`,
    );
  },
};

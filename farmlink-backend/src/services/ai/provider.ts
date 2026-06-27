import { type ExtractionInput } from './extraction.schema';

// Providers return loosely-typed output; the service validates it with Zod
// before the result is ever trusted by business logic.
export interface AIExtractionProvider {
  readonly name: string;
  extract(input: ExtractionInput): Promise<unknown>;
}

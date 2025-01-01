// src/config/environment.ts
import { z } from 'zod';
import { mkdir } from 'node:fs/promises';

/**
 * Environment variable schema definition
 */
const envSchema = z.object({
  // Server Configuration
  PORT: z.string().transform(Number).default('9000'),
  
  // Database Configuration
  DATABASE_PATH: z.string().default('invoices.db'),
  
  // Storage Configuration
  PDF_STORAGE_PATH: z.string().default('./pdfs'),
  
  // Invoice Configuration
  INVOICE_PREFIX: z.string().default('INV'),
  PDF_REVISION: z.string().default('1'),
  PDF_FORM_NUMBER: z.string().default('FORM-INV-2024'),
});

/**
 * Type for the validated environment configuration
 */
export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Gets the validated environment configuration
 */
export async function getEnvConfig(): Promise<EnvConfig> {
  try {
    // Validate environment variables against schema
    const config = envSchema.parse(process.env);
    
    // Ensure required directories exist
    if (config.PDF_STORAGE_PATH) {
      try {
        await mkdir(config.PDF_STORAGE_PATH, { recursive: true });
      } catch (error) {
        // Ignore error if directory already exists
        if (!(error instanceof Error) || !error.message.includes('EEXIST')) {
          throw error;
        }
      }
    }
    
    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .map(issue => issue.path.join('.'))
        .join(', ');
      throw new Error(`Invalid environment configuration: ${missingVars}`);
    }
    throw error;
  }
}
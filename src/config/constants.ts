// src/config/constants.ts
// Constants that can be used throughout the application
export const constants = {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    MIN_INVOICE_AMOUNT: 0,
    MAX_INVOICE_AMOUNT: 1000000,
    DEFAULT_TAX_RATE: 0.13, // 13% HST/GST
    DATE_FORMAT: 'YYYY-MM-DD',
    TIMESTAMP_FORMAT: 'YYYY-MM-DD HH:mm:ss',
} as const;

// Types for the constants
export type Constants = typeof constants;

/**
 * Example usage:
 * 
 * import { getEnvConfig, constants } from './config/environment';
 * 
 * const config = getEnvConfig();
 * console.log(`Server running on port ${config.PORT}`);
 * console.log(`Using PDF storage path: ${config.PDF_STORAGE_PATH}`);
 * 
 * // Using constants
 * const pageSize = constants.DEFAULT_PAGE_SIZE;
 */

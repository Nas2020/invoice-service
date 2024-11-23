// src/config/env.ts

export interface EnvConfig {
    PORT: number;
    DATABASE_PATH: string;
    PDF_STORAGE_PATH: string;
    INVOICE_PREFIX: string;
    
    // Business Details
    BUSINESS_NAME: string;
    BUSINESS_ROLE: string;
    BUSINESS_ADDRESS: string;
    BUSINESS_CITY: string;
    BUSINESS_PHONE: string;
    BUSINESS_GST: string;
    
    // Rates
    HOURLY_RATE: number;
    TAX_RATE: number;
  }
  
  export function getEnvConfig(): EnvConfig {
    // Validate required environment variables
    const requiredEnvVars = [
      'PORT',
      'DATABASE_PATH',
      'PDF_STORAGE_PATH',
      'INVOICE_PREFIX',
      'BUSINESS_NAME',
      'BUSINESS_ROLE',
      'BUSINESS_ADDRESS',
      'BUSINESS_CITY',
      'BUSINESS_PHONE',
      'BUSINESS_GST',
      'HOURLY_RATE',
      'TAX_RATE'
    ];
  
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }
  
    return {
      PORT: Number(process.env.PORT),
      DATABASE_PATH: process.env.DATABASE_PATH || 'invoices.db',
      PDF_STORAGE_PATH: process.env.PDF_STORAGE_PATH || './pdfs',
      INVOICE_PREFIX: process.env.INVOICE_PREFIX || 'INV',
      
      BUSINESS_NAME: process.env.BUSINESS_NAME || '',
      BUSINESS_ROLE: process.env.BUSINESS_ROLE || '',
      BUSINESS_ADDRESS: process.env.BUSINESS_ADDRESS || '',
      BUSINESS_CITY: process.env.BUSINESS_CITY || '',
      BUSINESS_PHONE: process.env.BUSINESS_PHONE || '',
      BUSINESS_GST: process.env.BUSINESS_GST || '',
      
      HOURLY_RATE: Number(process.env.HOURLY_RATE),
      TAX_RATE: Number(process.env.TAX_RATE)
    };
  }
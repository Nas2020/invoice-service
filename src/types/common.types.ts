// src/types/common.types.ts
import { Database } from 'bun:sqlite';

export interface CustomEnv {
  Variables: {
    db: Database;
    INVOICE_PREFIX: string;
  };
}
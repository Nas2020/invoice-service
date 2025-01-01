// src/db/schema.ts
import { Database } from 'bun:sqlite';
import { migrate } from './migrations/001_initial';
import { getEnvConfig } from '../config/environment';

export const initDB = async (): Promise<Database> => {
  const config = await getEnvConfig();
  const db = new Database(config.DATABASE_PATH);
  
  // Run migrations
  migrate(db);
  
  return db;
};
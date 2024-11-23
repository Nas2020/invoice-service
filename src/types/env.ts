import { Database } from 'bun:sqlite';

export interface CustomEnv {
  Bindings: {
    db: Database;
  };
  Variables: {
    db: Database;
  };
}
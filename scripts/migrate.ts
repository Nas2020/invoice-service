// scripts/migrate.ts
import { Database } from 'bun:sqlite';
import { getEnvConfig } from '../src/config/environment';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

interface MigrationModule {
  migrate: (db: Database) => void;
}

const runMigrations = async () => {
  try {
    console.log('🔄 Starting database migrations...');

    const config = await getEnvConfig();
    const db = new Database(config.DATABASE_PATH);

    // Create migrations table if it doesn't exist
    db.run(`
            CREATE TABLE IF NOT EXISTS migrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                executed_at TEXT NOT NULL
            )
        `);

    // Function to check if migration has been executed
    const isMigrationExecuted = (name: string): boolean => {
      const result = db.prepare('SELECT COUNT(*) as count FROM migrations WHERE name = ?')
        .get(name) as { count: number };
      return result.count > 0;
    };

    // Auto-discover migrations from the migrations directory
    const migrationsDir = join(import.meta.dir, '../src/db/migrations');
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.ts'))
      .sort(); // This ensures migrations run in order

    // Run each migration
    for (const filename of migrationFiles) {
      const migrationName = filename.replace('.ts', '');

      if (!isMigrationExecuted(migrationName)) {
        console.log(`Running migration: ${migrationName}...`);

        // Import migration module dynamically
        const migrationModule = await import(join(migrationsDir, filename)) as MigrationModule;

        // Begin transaction
        db.prepare('BEGIN TRANSACTION').run();

        try {
          migrationModule.migrate(db);

          // Record migration
          const now = new Date().toISOString();
          db.prepare(
            'INSERT INTO migrations (name, executed_at) VALUES (?, ?)'
          ).run(migrationName, now);

          // Commit transaction
          db.prepare('COMMIT').run();

          console.log(`✅ Migration ${migrationName} completed successfully!`);
        } catch (error) {
          // Rollback transaction on error
          db.prepare('ROLLBACK').run();
          throw error;
        }
      } else {
        console.log(`Migration ${migrationName} already executed, skipping...`);
      }
    }

    console.log('✅ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();
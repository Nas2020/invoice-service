// scripts/generate-migration.ts
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const generateMigration = () => {
    const migrationName = process.argv[2];
    if (!migrationName) {
        console.error('❌ Please provide a migration name');
        console.log('Usage: bun run generate-migration my_migration_name');
        process.exit(1);
    }

    // Create migrations directory if it doesn't exist
    const migrationsDir = join(import.meta.dir, '../src/db/migrations');
    if (!existsSync(migrationsDir)) {
        mkdirSync(migrationsDir, { recursive: true });
    }

    // Generate timestamp prefix for the migration
    const timestamp = new Date().toISOString().replace(/[-T:]|\.\d{3}Z$/g, '');
    const filename = `${timestamp}_${migrationName}.ts`;
    const filepath = join(migrationsDir, filename);

    // Migration file template
    const template = `import { Database } from 'bun:sqlite';

export function migrate(db: Database) {
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');

    // Write your migration here
    db.run(\`
        -- Add your SQL statements here
        -- For example:
        -- ALTER TABLE my_table ADD COLUMN new_column TEXT;
    \`);

    // Add any necessary indexes
    // db.run('CREATE INDEX IF NOT EXISTS idx_name ON table(column)');
}
`;

    // Write the migration file
    writeFileSync(filepath, template);
    console.log(`✅ Created migration file: ${filename}`);
};

generateMigration();
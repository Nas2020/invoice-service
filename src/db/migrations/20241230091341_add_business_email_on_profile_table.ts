import { Database } from 'bun:sqlite';

export function migrate(db: Database) {
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');

    // Since SQLite doesn't support adding NOT NULL constraints to existing columns,
    // we need to:
    // 1. Create a new temporary table
    // 2. Copy the data
    // 3. Drop the old table
    // 4. Rename the new table

    // Create new table with desired structure
    db.run(`
        CREATE TABLE profile_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            business_name TEXT NOT NULL,
            business_email TEXT NOT NULL,
            business_role TEXT,
            business_address TEXT,
            business_city TEXT,
            business_stateorprovince TEXT,
            business_country TEXT,
            business_postal_code TEXT,
            business_phone TEXT,
            business_gst_hst_number TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Copy data from old table to new table
    db.run(`
        INSERT INTO profile_new (
            id, 
            business_name,
            business_email,
            business_role,
            business_address,
            business_city,
            business_stateorprovince,
            business_country,
            business_postal_code,
            business_phone,
            business_gst_hst_number,
            created_at,
            updated_at
        )
        SELECT 
            id,
            business_name,
            'placeholder_' || id || '@example.com', -- Default email for existing records
            business_role,
            business_address,
            business_city,
            business_stateorprovince,
            business_country,
            business_postal_code,
            business_phone,
            business_gst_hst_number,
            created_at,
            updated_at
        FROM profile
    `);

    // Drop the old table
    db.run('DROP TABLE profile');

    // Rename the new table to the original name
    db.run('ALTER TABLE profile_new RENAME TO profile');

    // Create unique indexes
    db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_profile_business_name ON profile(business_name)');
    db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_profile_business_email ON profile(business_email)');
}
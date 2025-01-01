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

    // Write your migration here
    db.run(`
        CREATE TABLE organizations_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profile_id INTEGER NOT NULL,
            company_name TEXT NOT NULL,
            company_email_general TEXT,
            company_email_for_invoice TEXT,
            address TEXT,
            city TEXT,
            stateorprovince TEXT,
            country TEXT,
            postal_code TEXT,
            hourly_rate TEXT,
            tax_rate_percentage INTEGER,
            business_role TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (profile_id) REFERENCES profile (id) ON DELETE CASCADE
        )
    `);

    // Copy data from old table to new table
    db.run(`
        INSERT INTO organizations_new (
            id, 
            profile_id,
            company_name,
            company_email_general,
            company_email_for_invoice,
            address,
            city,
            stateorprovince,
            country,
            postal_code,
            hourly_rate,
            tax_rate_percentage,
            business_role,
            created_at,
            updated_at
        )
        SELECT 
            id,
            profile_id,
            company_name,
            'placeholder_' || id || '@example.com', -- Default email for existing records
            'placeholder_' || id || '@example.com', -- Default email for existing records
            address,
            city,
            stateorprovince,
            country,
            postal_code,
            hourly_rate,
            tax_rate_percentage,
            business_role,
            created_at,
            updated_at
        FROM organizations
    `);

    // Drop the old table
    db.run('DROP TABLE organizations');

    // Rename the new table to the original name
    db.run('ALTER TABLE organizations_new RENAME TO organizations');

        // Create indexes
    db.run('CREATE INDEX IF NOT EXISTS idx_organizations_profile ON organizations(profile_id)');

    // Create unique indexes
    db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_organizations_company_name ON organizations(company_name)');
}

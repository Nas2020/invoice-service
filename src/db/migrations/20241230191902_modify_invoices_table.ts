import { Database } from 'bun:sqlite';

export function migrate(db: Database) {
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');

    // Write your migration here
    db.run(`
        CREATE TABLE invoices_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id INTEGER NOT NULL,
        organization_id INTEGER NOT NULL,
        invoice_number TEXT NOT NULL UNIQUE,
        invoice_name TEXT,
        due_date TEXT,
        contact_person TEXT,
        status TEXT CHECK( status IN ('SUBMITTED', 'WAITING', 'RECEIVED_PAYMENT', 'DENIED', 'DISPUTE') ) DEFAULT 'WAITING',
        invoice_submission_date TEXT,
        subtotal REAL,
        total REAL,
        currency TEXT DEFAULT 'CAD',
        exchange_rate REAL DEFAULT 1.0,
        pdf_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (profile_id) REFERENCES profile (id) ON DELETE CASCADE,
        FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE
    )
    `);

    // Drop the old table
    db.run('DROP TABLE invoices');

    // Rename the new table to the original name
    db.run('ALTER TABLE invoices_new RENAME TO invoices');

    // Create unique indexes
    db.run('CREATE INDEX IF NOT EXISTS idx_invoices_organization ON invoices(organization_id)');

}

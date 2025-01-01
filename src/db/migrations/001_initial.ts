// src/db/migrations/001_initial.ts
import { Database } from 'bun:sqlite';

export function migrate(db: Database) {
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');

    // Create profile table
    db.run(`
        CREATE TABLE IF NOT EXISTS profile (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            business_name TEXT NOT NULL,
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

    // Create organizations table
    db.run(`
        CREATE TABLE IF NOT EXISTS organizations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profile_id INTEGER NOT NULL,
            company_name TEXT NOT NULL,
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

    // Create invoices table
    db.run(`
        CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profile_id INTEGER NOT NULL,
            organization_id INTEGER NOT NULL,
            invoice_number TEXT NOT NULL UNIQUE,
            invoice_name TEXT,
            due_date TEXT,
            contact_person TEXT,
            status TEXT CHECK( status IN ('SENT', 'WAITING', 'RECEIVED', 'DENIED', 'DISPUTE') ) DEFAULT 'WAITING',
            client_email_for_invoice TEXT,
            client_email_for_phone TEXT,
            invoice_submission_date TEXT,
            client_name TEXT,
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

    // Create invoice_items table
    db.run(`
        CREATE TABLE IF NOT EXISTS invoice_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            description TEXT NOT NULL,
            hours REAL NOT NULL,
            rate REAL NOT NULL,
            amount REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE
        )
    `);

    // Create invoice_taxes table
    db.run(`
        CREATE TABLE IF NOT EXISTS invoice_taxes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_id INTEGER NOT NULL,
            tax_type TEXT NOT NULL,
            rate REAL NOT NULL,
            amount REAL NOT NULL,
            region TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE
        )
    `);

    // Create indexes
    db.run('CREATE INDEX IF NOT EXISTS idx_invoices_profile ON invoices(profile_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_invoices_organization ON invoices(organization_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_invoice_taxes_invoice ON invoice_taxes(invoice_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_organizations_profile ON organizations(profile_id)');
}
// src/scripts/seed.ts
import { Database } from 'bun:sqlite';
import { getEnvConfig } from '../src/config/environment';
import { InvoiceStatus, TAX_TYPE } from '../src/db/models/invoice.model';


async function seed() {
    const config = await getEnvConfig();
    const db = new Database(config.DATABASE_PATH);

    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');

    try {
        // Start transaction
        db.run('BEGIN TRANSACTION');

        // Insert test profile
        const profileResult = db.run(`
            INSERT INTO profile (
                business_name,
                business_role,
                business_address,
                business_city,
                business_stateorprovince,
                business_country,
                business_postal_code,
                business_phone,
                business_gst_hst_number
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            'Tech Consulting Inc.',
            'Software Development',
            '123 Tech Street',
            'Toronto',
            'Ontario',
            'Canada',
            'M5V 2H1',
            '+1 (416) 555-0123',
            '123456789 RT0001'
        ]);

        const profileId = profileResult.lastInsertRowid;

        // Insert test organization
        const orgResult = db.run(`
            INSERT INTO organizations (
                profile_id,
                company_name,
                address,
                city,
                stateorprovince,
                country,
                postal_code,
                hourly_rate,
                tax_rate_percentage,
                business_role
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            profileId,
            'Client Corp Ltd.',
            '456 Business Ave',
            'Vancouver',
            'British Columbia',
            'Canada',
            'V6B 1A1',
            65,  // String as defined in schema
            13,    // Integer as defined in schema
            'Software Engineer'
        ]);

        const orgId = orgResult.lastInsertRowid;

        // Insert multiple test invoices
        for (let i = 1; i <= 3; i++) {
            const invoiceResult = db.run(`
                INSERT INTO invoices (
                    profile_id,
                    organization_id,
                    invoice_number,
                    invoice_name,
                    due_date,
                    status,
                    invoice_submission_date,
                    subtotal,
                    total,
                    currency
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                profileId,
                orgId,
                `INV-202401-000${i}`,
                `January Development Work ${i}`,
                `2024-02-0${i}`,
                InvoiceStatus.WAITING,
                '2024-01-01',
                1000.00 * i,
                1130.00 * i,
                'CAD'
            ]);

            const invoiceId = invoiceResult.lastInsertRowid;

            // Insert test invoice items
            db.run(`
                INSERT INTO invoice_items (
                    invoice_id,
                    date,
                    description,
                    hours,
                    rate,
                    amount
                ) VALUES (?, ?, ?, ?, ?, ?)
            `, [
                invoiceId,
                `2024-01-${String(14 + i).padStart(2, '0')}`,
                'Backend Development',
                8,
                125.00,
                1000.00
            ]);

            // Insert test invoice taxes
            db.run(`
                INSERT INTO invoice_taxes (
                    invoice_id,
                    tax_type,
                    rate,
                    amount,
                    region
                ) VALUES (?, ?, ?, ?, ?)
            `, [
                invoiceId,
                TAX_TYPE.GST_HST,
                13.0,
                130.00 * i,
                'Ontario'
            ]);
        }

        // Commit transaction
        db.run('COMMIT');
        console.log('✅ Database seeded successfully');

    } catch (error) {
        // Rollback on error
        db.run('ROLLBACK');
        console.error('Error seeding database:', error);
        throw error;
    } finally {
        db.close();
    }
}

seed().catch(console.error);
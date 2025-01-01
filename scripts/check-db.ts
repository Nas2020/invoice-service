// scripts/check-db.ts
import { Database } from 'bun:sqlite';

async function checkDatabase() {
    const db = new Database('invoices.db');

    try {
        // List all tables
        console.log('\n=== Tables in Database ===');
        const tables = db.prepare(`
            SELECT name FROM sqlite_master 
            WHERE type='table' 
            ORDER BY name;
        `).all();
        console.log(tables);

        // Check invoice_items structure
        console.log('\n=== invoice_items Table Structure ===');
        const itemsStructure = db.prepare(`
            PRAGMA table_info(invoice_items);
        `).all();
        console.log(JSON.stringify(itemsStructure, null, 2));

        // Count records in invoice_items
        console.log('\n=== Records in invoice_items ===');
        const itemsCount = db.prepare(`
            SELECT COUNT(*) as count FROM invoice_items;
        `).get();
        console.log(itemsCount);

        // Show a sample of invoice_items if any exist
        console.log('\n=== Sample invoice_items Records ===');
        const sampleItems = db.prepare(`
            SELECT * FROM invoice_items LIMIT 2;
        `).all();
        console.log(JSON.stringify(sampleItems, null, 2));

    } catch (error) {
        console.error('Error checking database:', error);
    } finally {
        db.close();
    }
}

checkDatabase().catch(console.error);
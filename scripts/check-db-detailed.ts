// scripts/check-db-detailed.ts
import { Database } from 'bun:sqlite';

async function checkDatabase() {
    const db = new Database('invoices.db');

    try {
        // Check invoices
        console.log('\n=== Recent Invoices ===');
        const invoices = db.prepare(`
            SELECT id, profile_id, organization_id, invoice_number, invoice_name, created_at 
            FROM invoices 
            ORDER BY created_at DESC 
            LIMIT 5;
        `).all();
        console.log(JSON.stringify(invoices, null, 2));

        if (invoices.length > 0) {
            const lastInvoiceId = invoices[0].id;

            // Check items for the last invoice
            console.log(`\n=== Items for Last Invoice (ID: ${lastInvoiceId}) ===`);
            const items = db.prepare(`
                SELECT * FROM invoice_items 
                WHERE invoice_id = ?
                ORDER BY date ASC;
            `).all(lastInvoiceId);
            console.log(JSON.stringify(items, null, 2));

            // Check taxes for the last invoice
            console.log(`\n=== Taxes for Last Invoice (ID: ${lastInvoiceId}) ===`);
            const taxes = db.prepare(`
                SELECT * FROM invoice_taxes 
                WHERE invoice_id = ?;
            `).all(lastInvoiceId);
            console.log(JSON.stringify(taxes, null, 2));

            // Add debug query to check transaction integrity
            console.log('\n=== Transaction Check ===');
            const debugInfo = db.prepare(`
                SELECT 
                    i.id as invoice_id,
                    i.invoice_number,
                    COUNT(DISTINCT it.id) as item_count,
                    COUNT(DISTINCT t.id) as tax_count
                FROM invoices i
                LEFT JOIN invoice_items it ON i.id = it.invoice_id
                LEFT JOIN invoice_taxes t ON i.id = t.invoice_id
                WHERE i.id = ?
                GROUP BY i.id;
            `).get(lastInvoiceId);
            console.log(JSON.stringify(debugInfo, null, 2));
        }

    } catch (error) {
        console.error('Error checking database:', error);
    } finally {
        db.close();
    }
}

checkDatabase().catch(console.error);
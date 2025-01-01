// src/db/repositories/invoice.repository.ts
import { Database } from 'bun:sqlite';
import { InvoiceRecord, TaxDetail, InvoiceStatus, InvoiceItem } from '../models/invoice.model';
import { InvoiceNumberGenerator } from '../../utils/invoice-number-generator';

// Update the type definition to explicitly include items
type CreateInvoiceInput = Omit<InvoiceRecord, 'id' | 'created_at' | 'invoice_number'> & {
    items?: InvoiceItem[];
    taxes?: TaxDetail[];
};


export class InvoiceRepository {
    private numberGenerator: InvoiceNumberGenerator;

    constructor(private db: Database) {
        this.numberGenerator = new InvoiceNumberGenerator(db);
    }


    findAll(profileId: number): InvoiceRecord[] {
        try {
            const invoices = this.db.prepare(
                'SELECT * FROM invoices WHERE profile_id = ? ORDER BY created_at DESC'
            ).all(profileId) as InvoiceRecord[];

            return invoices.map(invoice => this.attachTaxDetails(invoice));
        } catch (error) {
            console.error('Error finding invoices:', error);
            throw error;
        }
    }

    findByOrganization(profileId: number, organizationId: number): InvoiceRecord[] {
        try {
            const invoices = this.db.prepare(
                'SELECT * FROM invoices WHERE profile_id = ? AND organization_id = ? ORDER BY created_at DESC'
            ).all(profileId, organizationId) as InvoiceRecord[];

            return invoices.map(invoice => this.attachTaxDetails(invoice));
        } catch (error) {
            console.error('Error finding invoices for organization:', error);
            throw error;
        }
    }

    findById(profileId: number, invoiceId: number): InvoiceRecord | undefined {
        try {
            const invoice = this.db.prepare(
                'SELECT * FROM invoices WHERE profile_id = ? AND id = ?'
            ).get(profileId, invoiceId) as InvoiceRecord | undefined;

            if (!invoice) return undefined;

            return this.attachTaxDetails(invoice);
        } catch (error) {
            console.error('Error finding invoice:', error);
            throw error;
        }
    }

    async create(profileId: number, invoice: CreateInvoiceInput): Promise<InvoiceRecord> {
        console.log('Creating invoice with data:', JSON.stringify(invoice, null, 2));
        const now = new Date().toISOString();

        try {
            console.log('Starting invoice creation transaction');
            this.db.prepare('BEGIN TRANSACTION').run();

            // Generate invoice number
            const invoiceNumber = await this.numberGenerator.generateNumber();
            console.log('Generated invoice number:', invoiceNumber);

            const { items, taxes, ...invoiceData } = invoice; // Properly destructure items and taxes

            const result = this.db.prepare(`
                INSERT INTO invoices (
                    profile_id,
                    organization_id,
                    invoice_number,
                    invoice_name,
                    due_date,
                    contact_person,
                    status,
                    created_at,
                    invoice_submission_date,
                    subtotal,
                    total,
                    currency,
                    exchange_rate,
                    pdf_path
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                profileId,
                invoiceData.organization_id,
                invoiceNumber,
                invoiceData.invoice_name || null,
                invoiceData.due_date || null,
                invoiceData.contact_person || null,
                invoiceData.status || InvoiceStatus.WAITING,
                now,
                invoiceData.invoice_submission_date || null,
                invoiceData.subtotal || null,
                invoiceData.total || null,
                invoiceData.currency || 'CAD',
                invoiceData.exchange_rate || 1.0,
                invoiceData.pdf_path || null
            );

            const invoiceId = Number(result.lastInsertRowid);
            console.log('Created invoice with ID:', invoiceId);

            // Insert invoice items if provided
            if (items && items.length > 0) {
                console.log('Inserting items:', items);
                this.insertInvoiceItems(invoiceId, items);
            }

            // Insert tax details if provided
            if (taxes && taxes.length > 0) {
                this.insertTaxDetails(invoiceId, taxes);
            }

            this.db.prepare('COMMIT').run();

            const createdInvoice = this.findById(profileId, invoiceId);
            console.log('Retrieved created invoice:', createdInvoice);
            return createdInvoice!;
        } catch (error) {
            console.error('Error in transaction, rolling back:', error);
            this.db.prepare('ROLLBACK').run();
            throw error;
        }
    }


    update(profileId: number, invoiceId: number, invoice: Partial<InvoiceRecord>): InvoiceRecord {
        const now = new Date().toISOString();

        try {
            this.db.prepare('BEGIN TRANSACTION').run();

            // Extract items from the update data
            const { items, taxes, ...invoiceData } = invoice;

            // Update main invoice record
            const updateFields: string[] = [];
            const updateValues: any[] = [];

            Object.entries(invoiceData).forEach(([key, value]) => {
                if (key !== 'id' && key !== 'profile_id') {
                    updateFields.push(`${key} = ?`);
                    updateValues.push(value === undefined ? null : value);
                }
            });

            if (updateFields.length > 0) {
                updateValues.push(profileId, invoiceId);

                const result = this.db.prepare(`
                    UPDATE invoices 
                    SET ${updateFields.join(', ')}
                    WHERE profile_id = ? AND id = ?
                `).run(...updateValues);

                if (result.changes === 0) {
                    throw new Error('Invoice not found');
                }
            }

            // Update tax details if provided
            if (taxes) {
                this.db.prepare('DELETE FROM invoice_taxes WHERE invoice_id = ?').run(invoiceId);
                this.insertTaxDetails(invoiceId, taxes);
            }

            // Update invoice items if provided
            if (items) {
                this.db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?').run(invoiceId);
                this.insertInvoiceItems(invoiceId, items);
            }

            this.db.prepare('COMMIT').run();

            return this.findById(profileId, invoiceId)!;
        } catch (error) {
            this.db.prepare('ROLLBACK').run();
            console.error('Error updating invoice:', error);
            throw error;
        }
    }

    deleteById(profileId: number, invoiceId: number): boolean {
        try {
            const result = this.db.prepare(
                'DELETE FROM invoices WHERE profile_id = ? AND id = ?'
            ).run(profileId, invoiceId);

            return result.changes > 0;
        } catch (error) {
            console.error('Error deleting invoice:', error);
            throw error;
        }
    }

    deleteAllByProfile(profileId: number): void {
        try {
            this.db.prepare('DELETE FROM invoices WHERE profile_id = ?').run(profileId);
        } catch (error) {
            console.error('Error deleting invoices:', error);
            throw error;
        }
    }

    deleteAllByOrganization(profileId: number, organizationId: number): void {
        try {
            this.db.prepare(
                'DELETE FROM invoices WHERE profile_id = ? AND organization_id = ?'
            ).run(profileId, organizationId);
        } catch (error) {
            console.error('Error deleting organization invoices:', error);
            throw error;
        }
    }

    private attachTaxDetails(invoice: InvoiceRecord): InvoiceRecord {
        try {
            console.log('Fetching details for invoice:', invoice.id);

            const taxes = this.db.prepare(`
                SELECT tax_type, rate, amount, region 
                FROM invoice_taxes 
                WHERE invoice_id = ?
            `).all(invoice.id) as TaxDetail[];

            const items = this.db.prepare(`
                SELECT date, description, hours, rate, amount
                FROM invoice_items 
                WHERE invoice_id = ?
                ORDER BY date ASC
            `).all(invoice.id) as InvoiceItem[];

            console.log('Found items:', items.length, 'taxes:', taxes.length);
            return { ...invoice, taxes, items };
        } catch (error) {
            console.error('Error in attachTaxDetails:', error);
            throw error;
        }
    }

    private insertTaxDetails(invoiceId: number, taxes: TaxDetail[]): void {
        const now = new Date().toISOString();

        try {
            console.log('Inserting tax details:', { invoiceId, taxesCount: taxes.length });

            const stmt = this.db.prepare(`
            INSERT INTO invoice_taxes (
                invoice_id, 
                tax_type, 
                rate, 
                amount, 
                region,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

            for (const tax of taxes) {
                console.log('Inserting tax:', tax);
                stmt.run(
                    invoiceId,
                    tax.tax_type,
                    tax.rate || 0,  // Default to 0 if undefined
                    tax.amount || 0, // Default to 0 if undefined
                    tax.region || null, // Default to null if undefined
                    now,
                    now
                );
            }

            console.log('Successfully inserted all taxes');
        } catch (error) {
            console.error('Error inserting tax details:', error);
            throw error;
        }
    }

    private insertInvoiceItems(invoiceId: number, items: InvoiceItem[]): void {
        console.log('Starting insertInvoiceItems with:', {
            invoiceId,
            itemsArray: JSON.stringify(items, null, 2)
        });

        const now = new Date().toISOString();

        try {
            console.log(`Preparing to insert ${items.length} items`);

            const stmt = this.db.prepare(`
                INSERT INTO invoice_items (
                    invoice_id,
                    date,
                    description,
                    hours,
                    rate,
                    amount,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);

            for (const item of items) {
                console.log('Inserting item:', JSON.stringify(item, null, 2));
                try {
                    const result = stmt.run(
                        invoiceId,
                        item.date || now.split('T')[0],
                        item.description || '',
                        item.hours || 0,
                        item.rate || 0,
                        item.amount || 0,
                        now,
                        now
                    );
                    console.log('Insert result:', result);
                } catch (error) {
                    console.error('Failed to insert item:', error);
                    throw error;
                }
            }

            // Verify the insert
            const insertedItems = this.db.prepare(`
                SELECT * FROM invoice_items WHERE invoice_id = ?
            `).all(invoiceId);
            console.log('Inserted items:', JSON.stringify(insertedItems, null, 2));

        } catch (error) {
            console.error('Error in insertInvoiceItems:', error);
            throw error;
        }
    }

    private async generateInvoiceNumber(): Promise<string> {
        const prefix = 'INV';
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');

        // Get the latest invoice number for this month
        const latestInvoice = this.db.prepare(`
            SELECT invoice_number 
            FROM invoices 
            WHERE invoice_number LIKE ? 
            ORDER BY id DESC 
            LIMIT 1
        `).get(`${prefix}-${year}${month}%`) as { invoice_number: string } | undefined;

        let sequence = 1;
        if (latestInvoice) {
            const lastSequence = parseInt(latestInvoice.invoice_number.split('-')[2]);
            sequence = lastSequence + 1;
        }

        return `${prefix}-${year}${month}-${String(sequence).padStart(4, '0')}`;
    }
}
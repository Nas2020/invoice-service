import { Database } from 'bun:sqlite';
import { getEnvConfig } from '../config/env';

interface InvoiceRecord {
    invoice_number: string;
}

export class InvoiceNumberGenerator {
    private db: Database;
    private prefix: string;
    private year: string;

    constructor(db: Database) {
        const config = getEnvConfig();
        this.db = db;
        this.prefix = config.INVOICE_PREFIX;
        this.year = new Date().getFullYear().toString();
    }

    async generateNumber(): Promise<string> {
        const lastInvoice = this.db.prepare(
            'SELECT invoice_number FROM invoices WHERE invoice_number LIKE ? ORDER BY id DESC LIMIT 1'
        ).get(`${this.prefix}${this.year}%`) as InvoiceRecord | undefined;

        let sequence = 1;
        if (lastInvoice && lastInvoice.invoice_number) {
            const lastSequence = parseInt(lastInvoice.invoice_number.slice(-4));
            sequence = lastSequence + 1;
        }

        return `${this.prefix}${this.year}${sequence.toString().padStart(4, '0')}`;
    }
}
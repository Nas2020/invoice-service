//src/utils/invoice-number-generator.ts
import { Database } from 'bun:sqlite';
import { getEnvConfig } from '../config/environment';

interface InvoiceRecord {
    invoice_number: string;
}

export class InvoiceNumberGenerator {
    private db: Database;
    private prefix: string;
    private year: string;

    constructor(db: Database) {
        this.db = db;
        this.prefix = 'INV'; // Default value
        this.year = new Date().getFullYear().toString();
        this.initializeConfig();
    }

    private async initializeConfig() {
        const config = await getEnvConfig();
        this.prefix = config.INVOICE_PREFIX;
    }

    async generateNumber(): Promise<string> {
        await this.initializeConfig(); // Ensure config is initialized
        
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
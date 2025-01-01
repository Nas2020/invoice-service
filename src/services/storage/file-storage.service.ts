// src/services/storage/file-storage.service.ts
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { InvoiceDataForPDF } from '../pdf';

export class FileStorageService {
    constructor(private readonly pdfStoragePath: string) { }

    async saveInvoicePDF(profileId: number, invoiceDetails: InvoiceDataForPDF, buffer: Uint8Array): Promise<string> {
        try {
            // Create profile directory if it doesn't exist
            const profileDir = join(this.pdfStoragePath, profileId.toString());
            await mkdir(profileDir, { recursive: true });

            // Generate PDF filename
            const filename = `Invoice-${invoiceDetails.info.number}-Date-${invoiceDetails.info.date}-${invoiceDetails.to.company}.pdf`;
            const filepath = join(profileDir, filename);

            // Write PDF file
            await writeFile(filepath, buffer);

            // Return relative path for database storage
            return join(profileId.toString(), filename);
        } catch (error) {
            console.error('Error saving PDF:', error);
            throw new Error('Failed to save PDF file');
        }
    }

    async getInvoicePDF(profileId: number, invoiceId: number): Promise<Uint8Array | null> {
        try {
            const filepath = join(this.pdfStoragePath, profileId.toString(), `invoice_${invoiceId}.pdf`);
            const file = Bun.file(filepath);
            const arrayBuffer = await file.arrayBuffer();
            return new Uint8Array(arrayBuffer);
        } catch (error) {
            console.error('Error reading PDF:', error);
            return null;
        }
    }
}
import { Context } from 'hono';
import { InvoiceService } from '../../services/invoice/invoice.service';
import { InvoiceCreateRequest, InvoiceUpdateRequest } from '../../types/invoice.types';
import { CustomEnv } from '../../types/common.types';
import { PDFService } from '../../services/pdf';
import { TAX_TYPE } from '../../db/models/invoice.model';
import { FileStorageService } from '../../services/storage/file-storage.service';

export class InvoiceController {

    constructor(private invoiceService: InvoiceService,
        private fileStorageService: FileStorageService,
        private pdfService: PDFService
    ) {
    }

    async getAllInvoices(c: Context<CustomEnv>) {
        try {
            const profileId = Number(c.req.param('profileId'));
            if (isNaN(profileId)) {
                return c.json({ error: 'Invalid profile ID' }, 400);
            }

            const invoices = await this.invoiceService.getAllInvoices(profileId);
            return c.json(invoices);
        } catch (error) {
            console.error('Error getting invoices:', error);
            return c.json({
                error: error instanceof Error ? error.message : 'Failed to get invoices'
            }, 500);
        }
    }

    async getOrganizationInvoices(c: Context<CustomEnv>) {
        try {
            const profileId = Number(c.req.param('profileId'));
            const organizationId = Number(c.req.param('orgId'));

            if (isNaN(profileId) || isNaN(organizationId)) {
                return c.json({ error: 'Invalid ID format' }, 400);
            }

            const invoices = await this.invoiceService.getOrganizationInvoices(profileId, organizationId);
            return c.json(invoices);
        } catch (error) {
            console.error('Error getting organization invoices:', error);
            return c.json({
                error: error instanceof Error ? error.message : 'Failed to get organization invoices'
            }, 500);
        }
    }
    async getInvoice(c: Context<CustomEnv>) {
        try {
            const profileId = Number(c.req.param('profileId'));
            const invoiceId = Number(c.req.param('invoiceId'));

            if (isNaN(profileId) || isNaN(invoiceId)) {
                return c.json({ error: 'Invalid ID format' }, 400);
            }

            const invoice = await this.invoiceService.getInvoiceById(profileId, invoiceId);
            if (!invoice) {
                return c.json({ error: 'Invoice not found' }, 404);
            }

            return c.json(invoice);
        } catch (error) {
            console.error('Error getting invoice:', error);
            return c.json({
                error: error instanceof Error ? error.message : 'Failed to get invoice'
            }, 500);
        }
    }

    async createInvoice(c: Context<CustomEnv>) {
        try {
            const profileId = Number(c.req.param('profileId'));
            if (isNaN(profileId)) {
                return c.json({ error: 'Invalid profile ID' }, 400);
            }

            const data = await c.req.json<InvoiceCreateRequest>();
            const invoice = await this.invoiceService.createInvoice(profileId, data);
            return c.json(invoice, 201);
        } catch (error) {
            console.error('Error creating invoice:', error);
            return c.json({
                error: error instanceof Error ? error.message : 'Failed to create invoice'
            }, 500);
        }
    }

    async updateInvoice(c: Context<CustomEnv>) {
        try {
            const profileId = Number(c.req.param('profileId'));
            const invoiceId = Number(c.req.param('invoiceId'));

            if (isNaN(profileId) || isNaN(invoiceId)) {
                return c.json({ error: 'Invalid ID format' }, 400);
            }

            const data = await c.req.json<InvoiceUpdateRequest>();
            const invoice = await this.invoiceService.updateInvoice(profileId, invoiceId, data);
            return c.json(invoice);
        } catch (error) {
            console.error('Error updating invoice:', error);
            return c.json({
                error: error instanceof Error ? error.message : 'Failed to update invoice'
            }, 500);
        }
    }

    async deleteInvoice(c: Context<CustomEnv>) {
        try {
            const profileId = Number(c.req.param('profileId'));
            const invoiceId = Number(c.req.param('invoiceId'));

            if (isNaN(profileId) || isNaN(invoiceId)) {
                return c.json({ error: 'Invalid ID format' }, 400);
            }

            const deleted = await this.invoiceService.deleteInvoice(profileId, invoiceId);
            if (!deleted) {
                return c.json({ error: 'Invoice not found' }, 404);
            }

            return c.json({ message: 'Invoice deleted successfully' });
        } catch (error) {
            console.error('Error deleting invoice:', error);
            return c.json({
                error: error instanceof Error ? error.message : 'Failed to delete invoice'
            }, 500);
        }
    }

    async deleteAllInvoices(c: Context<CustomEnv>) {
        try {
            const profileId = Number(c.req.param('profileId'));
            if (isNaN(profileId)) {
                return c.json({ error: 'Invalid profile ID' }, 400);
            }

            await this.invoiceService.deleteAllInvoices(profileId);
            return c.json({ message: 'All invoices deleted successfully' });
        } catch (error) {
            console.error('Error deleting all invoices:', error);
            return c.json({
                error: error instanceof Error ? error.message : 'Failed to delete all invoices'
            }, 500);
        }
    }

    async deleteOrganizationInvoices(c: Context<CustomEnv>) {
        try {
            const profileId = Number(c.req.param('profileId'));
            const organizationId = Number(c.req.param('orgId'));

            if (isNaN(profileId) || isNaN(organizationId)) {
                return c.json({ error: 'Invalid ID format' }, 400);
            }

            await this.invoiceService.deleteOrganizationInvoices(profileId, organizationId);
            return c.json({ message: 'Organization invoices deleted successfully' });
        } catch (error) {
            console.error('Error deleting organization invoices:', error);
            return c.json({
                error: error instanceof Error ? error.message : 'Failed to delete organization invoices'
            }, 500);
        }
    }
    
    async generateInvoicePDF(c: Context<CustomEnv>) {
        try {
            const profileId = Number(c.req.param('profileId'));
            const invoiceId = Number(c.req.param('invoiceId'));

            const invoiceDetails = await this.invoiceService.getInvoiceWithDetails(
                profileId,
                invoiceId
            );

            if (!invoiceDetails) {
                return c.json({ error: 'Invoice not found' }, 404);
            }

            const pdfBuffer = await this.pdfService.generatePDF(invoiceDetails);
            await this.fileStorageService.saveInvoicePDF(
                profileId,
                invoiceDetails,
                pdfBuffer
            );


            c.header('Content-Type', 'application/pdf');
            c.header('Content-Disposition', `attachment; filename="invoice-${invoiceDetails.info.number}-submitted-${invoiceDetails.info.date}-${invoiceDetails.to.company}.pdf"`);

            return new Response(pdfBuffer);
        } catch (error) {
            console.error('PDF generation error:', error);
            return c.json({
                error: error instanceof Error ? error.message : 'Failed to generate PDF'
            }, 500);
        }
    }
}

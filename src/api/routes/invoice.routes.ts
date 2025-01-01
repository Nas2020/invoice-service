import { Hono } from 'hono';
import { CustomEnv } from '../../types/common.types';
import { InvoiceController } from '../controllers/invoice.controller';

export const defineInvoiceRoutes = (app: Hono<CustomEnv>, controller: InvoiceController) => {
  const invoiceRouter = new Hono<CustomEnv>();

  // Get all invoices for a profile
  invoiceRouter.get('/', (c) => controller.getAllInvoices(c));

  // Get all invoices for an organization
  invoiceRouter.get('/organization/:orgId', (c) => controller.getOrganizationInvoices(c));

  // Get specific invoice
  invoiceRouter.get('/:invoiceId', (c) => controller.getInvoice(c));

  // Create new invoice
  invoiceRouter.post('/', (c) => controller.createInvoice(c));

  // Update specific invoice
  invoiceRouter.put('/:invoiceId', (c) => controller.updateInvoice(c));

  // Delete specific invoice
  invoiceRouter.delete('/:invoiceId', (c) => controller.deleteInvoice(c));

  // Delete all invoices for a profile
  invoiceRouter.delete('/', (c) => controller.deleteAllInvoices(c));

  // Delete all invoices for an organization
  invoiceRouter.delete('/organization/:orgId', (c) => controller.deleteOrganizationInvoices(c));

 // PDF routes
 invoiceRouter.get('/:invoiceId/pdf', (c) => controller.generateInvoicePDF(c));



  // Mount the router under /api/profiles/:profileId/invoices
  app.route('/api/profiles/:profileId/invoices', invoiceRouter);
};
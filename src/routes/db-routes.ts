import { Hono } from 'hono';
import { Database } from 'bun:sqlite';
import { dbUtils } from '../db/schema';
import { CustomEnv } from '../types/env';

export const defineDbRoutes = (app: Hono<CustomEnv>) => {
  // Get all invoices
  app.get('/api/invoices/all', async (c) => {
    try {
      const db = c.get('db') as Database;
      const invoices = dbUtils.getAllInvoices(db);
      return c.json(invoices);
    } catch (error) {
      return c.json({ error: 'Failed to fetch invoices' }, 500);
    }
  });

  // Delete specific invoice
  app.delete('/api/invoices/:number', async (c) => {
    try {
      const db = c.get('db') as Database;
      const number = c.req.param('number');
      const deleted = dbUtils.deleteInvoice(db, number);
      if (deleted) {
        return c.json({ message: `Invoice ${number} deleted` });
      }
      return c.json({ error: 'Invoice not found' }, 404);
    } catch (error) {
      return c.json({ error: 'Failed to delete invoice' }, 500);
    }
  });

  // Delete all invoices
  app.delete('/api/invoices/all', async (c) => {
    try {
      const db = c.get('db') as Database;
      const count = dbUtils.deleteAllInvoices(db);
      return c.json({ message: `${count} invoices deleted` });
    } catch (error) {
      return c.json({ error: 'Failed to delete invoices' }, 500);
    }
  });

  // Get invoice count
  app.get('/api/invoices/count', async (c) => {
    try {
      const db = c.get('db') as Database;
      const count = dbUtils.getInvoiceCount(db);
      return c.json({ count });
    } catch (error) {
      return c.json({ error: 'Failed to get invoice count' }, 500);
    }
  });
};
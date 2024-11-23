import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { InvoiceNumberGenerator } from './services/number-generator';
import { PDFService} from './services/pdf.service';
import { dbUtils, initDB } from './db/schema';
import { getEnvConfig } from './config/env';
import { InvoiceService } from './services/invoice.service';
import { CustomEnv } from './types/env';
import { InvoiceRequest } from './types/invoice';
import { defineDbRoutes } from './routes/db-routes';

const config = getEnvConfig();
const db = initDB();

const numberGenerator = new InvoiceNumberGenerator(db);
const pdfService = new PDFService();
const invoiceService = new InvoiceService();

const app = new Hono<CustomEnv>();

app.use('*', async (c, next) => {
  c.set('db', db);
  await next();
});

app.use(cors());
defineDbRoutes(app);

app.post('/api/invoices/generate', async (c) => {
  try {
    const request = await c.req.json<InvoiceRequest>();
    
    // Validate request
    const validation = invoiceService.validateRequest(request);
    if (!validation.isValid) {
      return c.json({ error: validation.error }, 400);
    }
    
    // Generate invoice number
    const invoiceNumber = await numberGenerator.generateNumber();
    
    // Calculate all invoice data
    const invoiceData = invoiceService.calculateInvoiceData(request, invoiceNumber);
    
    // Generate PDF
    const pdfBuffer = await pdfService.generatePDF(invoiceData);
    const pdfPath = `${config.PDF_STORAGE_PATH}/${invoiceNumber}.pdf`;
    await Bun.write(pdfPath, pdfBuffer);
    
    // Save to database
    db.prepare(`
      INSERT INTO invoices (
        invoice_number,
        created_at,
        client_name,
        amount,
        pdf_path
      ) VALUES (?, ?, ?, ?, ?)
    `).run(
      invoiceNumber,
      new Date().toISOString(),
      invoiceData.to.company,
      invoiceData.totals.total,
      pdfPath
    );
    
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${invoiceNumber}.pdf`
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return c.json({ error: errorMessage }, 400);
  }
});

// Get all invoices
app.get('/api/invoices/all', async (c) => {
  const invoices = dbUtils.getAllInvoices(db);
  return c.json(invoices);
});

// Delete specific invoice
app.delete('/api/invoices/:number', async (c) => {
  const number = c.req.param('number');
  dbUtils.deleteInvoice(db, number);
  return c.json({ message: `Invoice ${number} deleted` });
});

// Delete all invoices
app.delete('/api/invoices/all', async (c) => {
  dbUtils.deleteAllInvoices(db);
  return c.json({ message: 'All invoices deleted' });
});

// Get invoice count
app.get('/api/invoices/count', async (c) => {
  const count = dbUtils.getInvoiceCount(db);
  return c.json(count);
});

// Add console log when server starts
console.log(`🚀 Server running at http://localhost:${config.PORT}`);

export default {
  port: config.PORT,
  fetch: app.fetch
};
import { describe, expect, test, beforeAll, afterAll, afterEach } from 'bun:test';
import app from '../../index';
import { Database } from 'bun:sqlite';
import { initDB } from '../../db/schema';
import { getEnvConfig } from '../../config/env';
import { InvoiceRecord } from '../../db/schema';

// Define types for API responses
interface CountResponse {
  count: number;
}

describe('Invoice API Endpoints', () => {
  let db: Database;
  const config = getEnvConfig();

  beforeAll(() => {
    // Create a test database file specifically for testing
    process.env.DATABASE_PATH = ':memory:';
    process.env.PDF_STORAGE_PATH = './test-pdfs';
    db = initDB();
  });

  afterEach(async () => {
    // Clean up database after each test
    try {
      await app.fetch(new Request('http://localhost/api/invoices/all', {
        method: 'DELETE',
      }));
    } catch (error) {
      // Fallback to direct database cleanup if API fails
      db.prepare('DELETE FROM invoices').run();
    }
  });

  afterAll(() => {
    db.close();
  });

  const sampleInvoiceRequest = {
    to: {
      company: "Test Company Inc.",
      address: "123 Test St",
      city: "Test City",
      postalCode: "12345"
    },
    items: [
      {
        date: "2024-10-16",
        description: "Test work item",
        hours: 4
      }
    ]
  };

  test('POST /api/invoices/generate - should generate invoice', async () => {
    const response = await app.fetch(new Request('http://localhost/api/invoices/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sampleInvoiceRequest),
    }));

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    expect(response.headers.get('Content-Disposition')).toContain('attachment; filename=');
  });

  test('GET /api/invoices/all - should return empty list initially', async () => {
    const response = await app.fetch(new Request('http://localhost/api/invoices/all'));
    const data = await response.json() as InvoiceRecord[];

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(0);
  });

  test('GET /api/invoices/count - should return correct count', async () => {
    // First generate an invoice
    await app.fetch(new Request('http://localhost/api/invoices/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sampleInvoiceRequest),
    }));

    const response = await app.fetch(new Request('http://localhost/api/invoices/count'));
    const data = await response.json() as CountResponse;

    expect(response.status).toBe(200);
    expect(data.count).toBe(1);
  });

  test('DELETE /api/invoices/all - should delete all invoices', async () => {
    // First generate an invoice
    await app.fetch(new Request('http://localhost/api/invoices/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sampleInvoiceRequest),
    }));

    const deleteResponse = await app.fetch(new Request('http://localhost/api/invoices/all', {
      method: 'DELETE',
    }));
    expect(deleteResponse.status).toBe(200);

    // Verify count is 0
    const countResponse = await app.fetch(new Request('http://localhost/api/invoices/count'));
    const countData = await countResponse.json() as CountResponse;
    expect(countData.count).toBe(0);
  });
});
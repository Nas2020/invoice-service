import { describe, expect, test } from 'bun:test';
import { InvoiceService } from '../../services/invoice.service';
import type { InvoiceRequest } from '../../types/invoice';
import { getEnvConfig } from '../../config/env';

describe('InvoiceService', () => {
  const invoiceService = new InvoiceService();
  const config = getEnvConfig();

  const validRequest: InvoiceRequest = {
    to: {
      company: "Test Company",
      address: "123 Test St",
      city: "Test City",
      postalCode: "12345"
    },
    items: [
      {
        date: "2024-10-16",
        description: "Test work",
        hours: 4
      }
    ]
  };

  test('validateRequest - should validate correct request', () => {
    const result = invoiceService.validateRequest(validRequest);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test('validateRequest - should reject missing company', () => {
    const invalidRequest = {
      ...validRequest,
      to: {
        ...validRequest.to,
        company: ''
      }
    };
    const result = invoiceService.validateRequest(invalidRequest);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Company information is required');
  });

  test('validateRequest - should reject invalid date format', () => {
    const invalidRequest = {
      ...validRequest,
      items: [{
        ...validRequest.items[0],
        date: '16-10-2024' // Wrong format
      }]
    };
    const result = invoiceService.validateRequest(invalidRequest);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Date must be in YYYY-MM-DD format');
  });

  test('calculateInvoiceData - should calculate correct totals', () => {
    const invoiceData = invoiceService.calculateInvoiceData(validRequest, 'INV20240001');
    const hourlyRate = config.HOURLY_RATE;
    const expectedAmount = 4 * hourlyRate; // 4 hours * hourly rate
    
    expect(invoiceData.info.number).toBe('INV20240001');
    expect(invoiceData.items.length).toBe(1);
    expect(invoiceData.items[0].amount).toBe(expectedAmount);
    expect(invoiceData.totals.subtotal).toBe(expectedAmount);
    expect(invoiceData.totals.tax).toBe(expectedAmount * config.TAX_RATE / 100);
    expect(invoiceData.totals.total).toBe(expectedAmount * (1 + config.TAX_RATE / 100));
  });

  test('calculateInvoiceData - should format dates correctly', () => {
    const invoiceData = invoiceService.calculateInvoiceData(validRequest, 'INV20240001');
    
    expect(invoiceData.info.date).toMatch(/[A-Z][a-z]{2} \d{1,2}, \d{4}/);
    expect(invoiceData.info.dueDate).toMatch(/[A-Z][a-z]{2} \d{1,2}, \d{4}/);
    expect(invoiceData.items[0].date).toBe('Oct 16, 2024');
  });
});
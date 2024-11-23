import type { InvoiceData, InvoiceItem } from './pdf.service';
import type { InvoiceRequest } from '../types/invoice';
import { getEnvConfig } from '../config/env';

export class InvoiceService {
  private readonly config = getEnvConfig();

  private formatDate(dateStr: string | Date): string {
    if (typeof dateStr === 'string') {
      // Split the date string into components
      const [year, month, day] = dateStr.split('-').map(Number);

      // Create date object using local timezone
      // Month is 0-based in JavaScript Date
      const date = new Date(year, month - 1, day);

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }

    // If it's already a Date object
    return dateStr.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  private calculateItemAmount(hours: number): number {
    return Number((hours * this.config.HOURLY_RATE).toFixed(2));
  }

  private calculateTotals(items: InvoiceItem[]) {
    const subtotal = Number(
      items.reduce((sum, item) => sum + item.amount, 0).toFixed(2)
    );
    const tax = Number(((subtotal * this.config.TAX_RATE) / 100).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));

    return {
      subtotal,
      taxRate: this.config.TAX_RATE,
      tax,
      total
    };
  }

  private getBusinessDetails() {
    return {
      name: this.config.BUSINESS_NAME,
      role: this.config.BUSINESS_ROLE,
      address: this.config.BUSINESS_ADDRESS,
      city: this.config.BUSINESS_CITY,
      phone: this.config.BUSINESS_PHONE,
      gst: this.config.BUSINESS_GST
    };
  }

  private generateDates() {
    const currentDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    return {
      date: this.formatDate(currentDate),
      dueDate: this.formatDate(dueDate)
    };
  }

  calculateInvoiceData(request: InvoiceRequest, invoiceNumber: string): InvoiceData {
    // Calculate amounts for each item
    const items = request.items.map(item => ({
      date: this.formatDate(item.date),
      description: item.description,
      hours: item.hours,
      rate: this.config.HOURLY_RATE,
      amount: this.calculateItemAmount(item.hours)
    }));

    // Generate dates
    const dates = this.generateDates();

    // Calculate totals
    const totals = this.calculateTotals(items);

    return {
      from: this.getBusinessDetails(),
      to: request.to,
      info: {
        number: invoiceNumber,
        date: request.date?.invoice_submission_date || dates.date,
        dueDate: request.date?.invoice_due_date || dates.dueDate
      },
      items: items,
      totals: totals,
      notes: "Payment is due within 30 days. Please include invoice number with payment."
    };
  }

  validateRequest(request: InvoiceRequest): { isValid: boolean; error?: string } {
    if (!request.to?.company) {
      return { isValid: false, error: 'Company information is required' };
    }

    if (!request.items?.length) {
      return { isValid: false, error: 'At least one work item is required' };
    }

    for (const item of request.items) {
      if (!item.date) {
        return { isValid: false, error: 'Date is required for all items' };
      }
      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
        return { isValid: false, error: 'Date must be in YYYY-MM-DD format' };
      }
      if (!item.description) {
        return { isValid: false, error: 'Description is required for all items' };
      }
      if (!item.hours || item.hours <= 0) {
        return { isValid: false, error: 'Valid hours are required for all items' };
      }
    }

    return { isValid: true };
  }
}
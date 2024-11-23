import { renderToBuffer } from '@react-pdf/renderer';
import { WaveInvoice } from '../components/WaveInvoice';
import { Document } from '@react-pdf/renderer';
import React from 'react';
import { getEnvConfig } from '../config/env';

export interface InvoiceItem {
  date: string;
  description: string;
  hours: number;
  rate: number;
  amount: number;
}

export interface InvoiceData {
  from?: {
    name: string;
    role?: string;
    address: string;
    city: string;
    phone: string;
    gst: string;
  };
  to: {
    company: string;
    address: string;
    city: string;
    postalCode?: string;
  };
  date?: {
    invoice_submission_date: string;
    invoice_due_date: string;
  };
  info: {
    number: string;
    date: string;
    dueDate: string;
  };
  items: InvoiceItem[];
  totals: {
    subtotal: number;
    taxRate: number;
    tax: number;
    total: number;
  };
  notes?: string;
}

export class PDFService {
  private readonly config = getEnvConfig();

  async generatePDF(data: InvoiceData): Promise<Uint8Array> {
    try {
      // Set default values from environment config
      const invoiceData: InvoiceData = {
        ...data,
        from: {
          name: this.config.BUSINESS_NAME,
          role: this.config.BUSINESS_ROLE,
          address: this.config.BUSINESS_ADDRESS,
          city: this.config.BUSINESS_CITY,
          phone: this.config.BUSINESS_PHONE,
          gst: this.config.BUSINESS_GST,
          ...data.from
        },
        date: data.date ? {
          invoice_submission_date: data.date.invoice_submission_date,
          invoice_due_date: data.date.invoice_due_date
        } : undefined,
        notes: data.notes || "Payment is due within 30 days. Please include invoice number with payment."
      };

      const element = React.createElement(Document, {},
        React.createElement(WaveInvoice, { data: invoiceData })
      );
      const buffer = await renderToBuffer(element);
      return new Uint8Array(buffer);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`PDF generation failed: ${error.message}`);
      }
      throw new Error('PDF generation failed: Unknown error');
    }
  }
}


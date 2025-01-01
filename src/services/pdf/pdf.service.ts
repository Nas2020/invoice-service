
// src/services/pdf/pdf.service.ts

import { renderToBuffer } from '@react-pdf/renderer';
import React, { ReactElement } from 'react';
import { WaveInvoice } from '../../components/pdf/WaveInvoice';
import { InvoiceDataForPDF } from './pdf.types';

export class PDFService {
  async generatePDF(data: InvoiceDataForPDF): Promise<Uint8Array> {
    try {
      // Add form details to the invoice data
      const invoiceData: InvoiceDataForPDF = {
        ...data,
        info: {
          ...data.info,
        },
        notes: data.notes || "Payment is due within 30 days. Please include invoice number with payment."
      };

      // Create element explicitly to avoid type issues
      const element: ReactElement = React.createElement(WaveInvoice, { data: invoiceData });
      const buffer = await renderToBuffer(element);

      return new Uint8Array(buffer);
    } catch (error: unknown) {
      console.error('PDF generation error:', error);
      if (error instanceof Error) {
        throw new Error(`PDF generation failed: ${error.message}`);
      }
      throw new Error('PDF generation failed: Unknown error');
    }
  }
}
// src/services/pdf/pdf.types.ts
import { InvoiceItem } from "../../db/models/invoice.model";


export interface InvoiceDataForPDF {
    from?: {
        name: string;
        role?: string;
        addressLine1: string;
        addressLine2: string;
        country?: string;
        phone: string;
        gst: string;
    };
    to: {
        company: string;
        addressLine1: string;
        addressLine2: string;
        country?: string;
        tax_rate?: number;
        email?: string;
    };
    info: {
        number: string;
        date: string;
        dueDate: string;
        formNumber: string;
        revision: string;
        currency: string;
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
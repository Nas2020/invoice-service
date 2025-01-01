// src/types/invoice.types.ts
import { InvoiceRecord, InvoiceStatus, TaxDetail, InvoiceItem } from '../db/models/invoice.model';

export interface InvoiceCreateRequest {
    organization_id: number;
    invoice_name?: string;
    due_date?: string;
    contact_person?: string;
    status?: InvoiceStatus;
    invoice_submission_date?: string;
    subtotal?: number;
    total?: number;
    currency?: string;
    exchange_rate?: number;
    taxes?: TaxDetail[];
    items?: InvoiceItem[];
    pdf_path?: string;
}

export interface InvoiceUpdateRequest extends Partial<InvoiceCreateRequest> {}

export interface InvoiceResponse extends InvoiceRecord {}
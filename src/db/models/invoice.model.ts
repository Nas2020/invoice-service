// src/db/models/invoice.model.ts
export interface InvoiceItem {
    date: string;
    description: string;
    hours: number;
    rate?: number;
    amount?: number;
}

export interface InvoiceRecord {
    id: number;
    profile_id: number;
    organization_id: number;
    invoice_number: string;
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

export enum InvoiceStatus {
    SUBMITTED = 'SUBMITTED',
    WAITING = 'WAITING',
    RECEIVED_PAYMENT = 'RECEIVED_PAYMENT',
    DENIED = 'DENIED',
    DISPUTE = 'DISPUTE'
}

export interface TaxDetail {
    tax_type: TAX_TYPE;
    rate?: number;
    amount?: number;
    region?: string;
}

export enum TAX_TYPE {
    GST_HST = 'GST_HST',
    CORPORATE_TAX = 'CORPORATE_TAX',
    VAT = 'VAT'

}
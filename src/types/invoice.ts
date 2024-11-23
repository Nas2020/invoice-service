export interface InvoiceRecord {
  invoice_number: string;
  created_at: string;
  client_name: string;
  amount: number;
  pdf_path: string;
  status: string;
}

export interface ErrorResponse {
  error: string;
}

export interface InvoiceRequest {
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
  items: {
    date: string;
    description: string;
    hours: number;
  }[];
}
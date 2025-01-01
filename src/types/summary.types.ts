export interface TaxSummary {
    total_tax_collected: number;
    tax_by_type: {
        tax_type: string;
        amount: number;
        count: number;
    }[];
    tax_by_region: {
        region: string;
        amount: number;
        count: number;
    }[];
    quarterly_summary: {
        quarter: string;
        amount: number;
        tax_collected: number;
    }[];
}

export interface IncomeSummary {
    total_revenue: number;
    total_tax: number;
    net_income: number;
    monthly_summary: {
        month: string;
        revenue: number;
        tax: number;
        net: number;
    }[];
    client_summary: {
        organization_id: number;
        organization_name: string;
        total_billed: number;
        total_tax: number;
        invoice_count: number;
    }[];
    currency_summary: {
        currency: string;
        original_amount: number;
        cad_equivalent: number;
    }[];
}

export interface FinancialSummaryResponse {
    income: IncomeSummary;
    tax: TaxSummary;
    period: {
        start_date: string;
        end_date: string;
    };
}
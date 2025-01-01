// src/db/models/organization.model.ts
export interface OrganizationRecord {
    id: number;
    profile_id: number;
    company_name: string;
    company_email_general: string;
    company_email_for_invoice: string;
    address: string;
    city: string;
    stateorprovince: string;
    country: string;
    postal_code: string;
    hourly_rate: number;
    tax_rate_percentage: number;
    business_role?: string;
    created_at: string;
    updated_at: string;
}
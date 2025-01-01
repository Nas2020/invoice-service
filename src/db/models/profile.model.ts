// src/db/models/profile.model.ts
export interface ProfileRecord {
    id: number;
    business_name: string;
    business_email: string;
    business_role: string;
    business_address: string;
    business_city: string;
    business_stateorprovince: string;
    business_country: string;
    business_postal_code: string;
    business_phone: string;
    business_gst_hst_number: string;
    created_at: string;
    updated_at: string;
}
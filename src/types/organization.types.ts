// src/types/organization.types.ts
import { OrganizationRecord } from "../db/models/organization.model";

export type OrganizationRequest = Omit<OrganizationRecord, 'id' | 'created_at' | 'updated_at'>;

export type OrganizationResponse = OrganizationRecord;

export interface OrganizationResponseWithExtras extends OrganizationRecord {
    // API-specific fields can be added here
    // For example:
    // organizationCount?: number;
    // lastInvoiceDate?: string;
}

// src/types/profile.types.ts
import { ProfileRecord } from '../db/models/profile.model';

// Request type omits system-managed fields
export type ProfileUpdateRequest = Omit<ProfileRecord, 'id' | 'created_at' | 'updated_at'>;

// Response type is identical to the database model in this case
export type ProfileResponse = ProfileRecord;

// If you need to add API-specific fields later:
export interface ProfileResponseWithExtras extends ProfileResponse {
    // API-specific fields can be added here
    // For example:
    // organizationCount?: number;
    // lastInvoiceDate?: string;
}
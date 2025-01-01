// src/db/repositories/organization.repository.ts
import { Database } from 'bun:sqlite';
import { OrganizationRecord } from '../models/organization.model';

export class OrganizationRepository {
    constructor(private db: Database) {}

    findAllByProfileId(profileId: number): OrganizationRecord[] {
        try {
            return this.db.prepare(
                'SELECT * FROM organizations WHERE profile_id = ? ORDER BY created_at DESC'
            ).all(profileId) as OrganizationRecord[];
        } catch (error) {
            console.error('Error finding organizations:', error);
            throw error;
        }
    }

    findByProfileIdAndOrgId(profileId: number, orgId: number): OrganizationRecord | undefined {
        try {
            return this.db.prepare(
                'SELECT * FROM organizations WHERE profile_id = ? AND id = ?'
            ).get(profileId, orgId) as OrganizationRecord | undefined;
        } catch (error) {
            console.error('Error finding organization:', error);
            throw error;
        }
    }

    create(profileId: number, organization: Omit<OrganizationRecord, 'id' | 'profile_id' | 'created_at' | 'updated_at'>): OrganizationRecord {
        const now = new Date().toISOString();
        
        try {
            this.db.prepare('BEGIN TRANSACTION').run();
            
            const result = this.db.prepare(`
                INSERT INTO organizations (
                    profile_id,
                    company_name,
                    company_email_general,
                    company_email_for_invoice,
                    address,
                    city,
                    stateorprovince,
                    country,
                    postal_code,
                    hourly_rate,
                    tax_rate_percentage,
                    business_role,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                profileId,
                organization.company_name,
                organization.company_email_general,
                organization.company_email_for_invoice,
                organization.address,
                organization.city,
                organization.stateorprovince,
                organization.country,
                organization.postal_code,
                organization.hourly_rate,
                organization.tax_rate_percentage,
                organization.business_role || null,
                now,
                now
            );

            this.db.prepare('COMMIT').run();

            return {
                id: Number(result.lastInsertRowid),
                profile_id: profileId,
                ...organization,
                created_at: now,
                updated_at: now
            };
        } catch (error) {
            this.db.prepare('ROLLBACK').run();
            console.error('Error creating organization:', error);
            throw error;
        }
    }

    updateByProfileIdAndOrgId(
        profileId: number, 
        orgId: number, 
        organization: Omit<OrganizationRecord, 'id' | 'profile_id' | 'created_at' | 'updated_at'>
    ): OrganizationRecord {
        const now = new Date().toISOString();
        
        try {
            this.db.prepare('BEGIN TRANSACTION').run();
            
            const result = this.db.prepare(`
                UPDATE organizations SET
                    company_name = ?,
                    company_email_general = ?,
                    company_email_for_invoice = ?,
                    address = ?,
                    city = ?,
                    stateorprovince = ?,
                    country = ?,
                    postal_code = ?,
                    hourly_rate = ?,
                    tax_rate_percentage = ?,
                    business_role = ?,
                    updated_at = ?
                WHERE profile_id = ? AND id = ?
            `).run(
                organization.company_name,
                organization.company_email_general,
                organization.company_email_for_invoice,
                organization.address,
                organization.city,
                organization.stateorprovince,
                organization.country,
                organization.postal_code,
                organization.hourly_rate,
                organization.tax_rate_percentage,
                organization.business_role || null,
                now,
                profileId,
                orgId
            );
    
            if (result.changes === 0) {
                throw new Error('Organization not found');
            }
    
            this.db.prepare('COMMIT').run();
            
            const existingOrg = this.db.prepare(
                'SELECT created_at FROM organizations WHERE profile_id = ? AND id = ?'
            ).get(profileId, orgId) as Pick<OrganizationRecord, 'created_at'>;
    
            return {
                id: orgId,
                profile_id: profileId,
                ...organization,
                created_at: existingOrg.created_at,
                updated_at: now
            };
        } catch (error) {
            this.db.prepare('ROLLBACK').run();
            console.error('Error updating organization:', error);
            throw error;
        }
    }

    deleteAllByProfileId(profileId: number): void {
        try {
            this.db.prepare('DELETE FROM organizations WHERE profile_id = ?').run(profileId);
        } catch (error) {
            console.error('Error deleting organizations:', error);
            throw error;
        }
    }

    deleteByProfileIdAndOrgId(profileId: number, orgId: number): boolean {
        try {
            const result = this.db.prepare(
                'DELETE FROM organizations WHERE profile_id = ? AND id = ?'
            ).run(profileId, orgId);
            return result.changes > 0;
        } catch (error) {
            console.error('Error deleting organization:', error);
            throw error;
        }
    }
}
// src/db/repositories/profile.repository.ts
import { Database } from 'bun:sqlite';
import { ProfileRecord } from '../models/profile.model';

export class ProfileRepository {
    constructor(private db: Database) { }

    findAll(): ProfileRecord[] {
        try {
            return this.db.prepare('SELECT * FROM profile ORDER BY created_at DESC')
                .all() as ProfileRecord[];
        } catch (error) {
            console.error('Error getting profiles:', error);
            throw error;
        }
    }

    findById(id: number): ProfileRecord | undefined {
        try {
            return this.db.prepare('SELECT * FROM profile WHERE id = ?')
                .get(id) as ProfileRecord | undefined;
        } catch (error) {
            console.error('Error getting profile:', error);
            throw error;
        }
    }

    create(profile: Omit<ProfileRecord, 'id' | 'created_at' | 'updated_at'>): ProfileRecord {
        const now = new Date().toISOString();

        try {
            this.db.prepare('BEGIN TRANSACTION').run();

            const result = this.db.prepare(`
                INSERT INTO profile (
                    business_name,
                    business_email,
                    business_role,
                    business_address,
                    business_city,
                    business_stateorprovince,
                    business_country,
                    business_postal_code,
                    business_phone,
                    business_gst_hst_number,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                profile.business_name,
                profile.business_email,
                profile.business_role,
                profile.business_address,
                profile.business_city,
                profile.business_stateorprovince,
                profile.business_country,
                profile.business_postal_code,
                profile.business_phone,
                profile.business_gst_hst_number,
                now,
                now
            );

            this.db.prepare('COMMIT').run();

            return {
                id: Number(result.lastInsertRowid),
                ...profile,
                created_at: now,
                updated_at: now
            };
        } catch (error) {
            this.db.prepare('ROLLBACK').run();
            console.error('Error creating profile:', error);
            throw error;
        }
    }

    updateById(id: number, profile: Omit<ProfileRecord, 'id' | 'created_at' | 'updated_at'>): ProfileRecord {
        const now = new Date().toISOString();

        try {
            this.db.prepare('BEGIN TRANSACTION').run();

            // First, get the original record to preserve created_at
            const originalProfile = this.db.prepare('SELECT created_at FROM profile WHERE id = ?')
                .get(id) as ProfileRecord | undefined;

            if (!originalProfile) {
                throw new Error('Profile not found');
            }

            const result = this.db.prepare(`
                UPDATE profile SET
                    business_name = ?,
                    business_email = ?,
                    business_role = ?,
                    business_address = ?,
                    business_city = ?,
                    business_stateorprovince = ?,
                    business_country = ?,
                    business_postal_code = ?,
                    business_phone = ?,
                    business_gst_hst_number = ?,
                    updated_at = ?
                WHERE id = ?
            `).run(
                profile.business_name,
                profile.business_email,
                profile.business_role,
                profile.business_address,
                profile.business_city,
                profile.business_stateorprovince,
                profile.business_country,
                profile.business_postal_code,
                profile.business_phone,
                profile.business_gst_hst_number,
                now,
                id
            );

            if (result.changes === 0) {
                throw new Error('Profile not found');
            }

            this.db.prepare('COMMIT').run();

            return {
                id,
                ...profile,
                created_at: originalProfile.created_at, // Use the original created_at
                updated_at: now
            };
        } catch (error) {
            this.db.prepare('ROLLBACK').run();
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    deleteAll(): void {
        try {
            this.db.prepare('DELETE FROM profile').run();
        } catch (error) {
            console.error('Error deleting all profiles:', error);
            throw error;
        }
    }

    deleteById(id: number): boolean {
        try {
            const result = this.db.prepare('DELETE FROM profile WHERE id = ?').run(id);
            return result.changes > 0;
        } catch (error) {
            console.error('Error deleting profile:', error);
            throw error;
        }
    }
}
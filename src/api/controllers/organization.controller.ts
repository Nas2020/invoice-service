// src/api/controllers/organization.controller.ts
import { Context } from 'hono';
import { OrganizationRequest } from '../../types/organization.types';
import { CustomEnv } from '../../types/common.types';
import { OrganizationService } from '../../services/organization/organization.service';
import { ProfileService } from '../../services/profile/profile.service';

class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class OrganizationController {
    constructor(private organizationService: OrganizationService, private profileService: ProfileService) { }

    async getAllOrganizationsForProfile(c: Context<CustomEnv>) {
        try {
            const profileId = Number(c.req.param('profileId'));
            if (isNaN(profileId)) {
                return c.json({ error: 'Invalid profile ID' }, 400);
            }
           
            const profile = await this.profileService.getProfileById(profileId);
            if (!profile) {
                return c.json({ error: 'Profile not found' }, 404);
            }

            const organizations = await this.organizationService.getAllOrganizationsForProfile(profileId);
            return c.json(organizations);
        } catch (error) {
            console.error('Error getting organizations:', error);
            return c.json({
                error: error instanceof Error ? error.message : 'Failed to get organizations'
            }, 500);
        }
    }

    async getOrganizationForProfile(c: Context<CustomEnv>) {
        try {
            const profileId = Number(c.req.param('profileId'));
            const orgId = Number(c.req.param('orgId'));

            if (isNaN(profileId) || isNaN(orgId)) {
                return c.json({ error: 'Invalid ID format' }, 400);
            }

            const organization = await this.organizationService.getOrganizationForProfile(profileId, orgId);
            if (!organization) {
                return c.json({ error: 'Organization not found' }, 404);
            }

            return c.json(organization);
        } catch (error) {
            console.error('Error getting organization:', error);
            return c.json({
                error: error instanceof Error ? error.message : 'Failed to get organization'
            }, 500);
        }
    }

    async createOrganizationForProfile(c: Context<CustomEnv>) {
        try {
            const profileId = Number(c.req.param('profileId'));
            if (isNaN(profileId)) {
                return c.json({ error: 'Invalid profile ID' }, 400);
            }

            const data = await c.req.json<OrganizationRequest>();
            await this.validateOrganizationData(data);

            // Validate numeric fields
            if (typeof data.hourly_rate !== 'number' || data.hourly_rate <= 0) {
                throw new ValidationError('Hourly rate must be a positive number');
            }
            if (typeof data.tax_rate_percentage !== 'number' || data.tax_rate_percentage < 0 || data.tax_rate_percentage > 100) {
                throw new ValidationError('Tax rate percentage must be between 0 and 100');
            }

            const organization = await this.organizationService.createOrganizationForProfile(profileId, data);
            return c.json(organization, 201);
        } catch (error) {
            console.error('Error creating organization:', error);
            return c.json({
                error: error instanceof Error ? error.message : 'Failed to create organization'
            }, error instanceof ValidationError ? 400 : 500);
        }
    }

    async updateOrganizationForProfile(c: Context<CustomEnv>) {
        try {
            const profileId = Number(c.req.param('profileId'));
            const orgId = Number(c.req.param('orgId'));

            if (isNaN(profileId) || isNaN(orgId)) {
                return c.json({ error: 'Invalid ID format' }, 400);
            }

            const data = await c.req.json<OrganizationRequest>();
            await this.validateOrganizationData(data);

            // Validate numeric fields
            if (typeof data.hourly_rate !== 'number' || data.hourly_rate <= 0) {
                throw new ValidationError('Hourly rate must be a positive number');
            }
            if (typeof data.tax_rate_percentage !== 'number' || data.tax_rate_percentage < 0 || data.tax_rate_percentage > 100) {
                throw new ValidationError('Tax rate percentage must be between 0 and 100');
            }

            const organization = await this.organizationService.updateOrganizationForProfile(profileId, orgId, data);
            return c.json(organization);
        } catch (error) {
            console.error('Error updating organization:', error);
            return c.json({
                error: error instanceof Error ? error.message : 'Failed to update organization'
            }, error instanceof ValidationError ? 400 : 500);
        }
    }

    async deleteAllOrganizationsForProfile(c: Context<CustomEnv>) {
        try {
            const profileId = Number(c.req.param('profileId'));
            if (isNaN(profileId)) {
                return c.json({ error: 'Invalid profile ID' }, 400);
            }

            await this.organizationService.deleteAllOrganizationsForProfile(profileId);
            return c.json({ message: 'All organizations deleted successfully' });
        } catch (error) {
            console.error('Error deleting organizations:', error);
            return c.json({
                error: error instanceof Error ? error.message : 'Failed to delete organizations'
            }, 500);
        }
    }

    async deleteOrganizationForProfile(c: Context<CustomEnv>) {
        try {
            const profileId = Number(c.req.param('profileId'));
            const orgId = Number(c.req.param('orgId'));

            if (isNaN(profileId) || isNaN(orgId)) {
                return c.json({ error: 'Invalid ID format' }, 400);
            }

            const deleted = await this.organizationService.deleteOrganizationForProfile(profileId, orgId);
            if (!deleted) {
                return c.json({ error: 'Organization not found' }, 404);
            }

            return c.json({ message: 'Organization deleted successfully' });
        } catch (error) {
            console.error('Error deleting organization:', error);
            return c.json({
                error: error instanceof Error ? error.message : 'Failed to delete organization'
            }, 500);
        }
    }

    private async validateOrganizationData(data: OrganizationRequest | OrganizationRequest) {
        const requiredFields: (keyof OrganizationRequest)[] = [
            'company_name',
            'address',
            'city',
            'stateorprovince',
            'country',
            'postal_code',
            'hourly_rate',
            'tax_rate_percentage'
        ];

        const missingFields = requiredFields.filter(field => data[field] === undefined);
        if (missingFields.length > 0) {
            throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Validate string fields are not empty
        const stringFields: (keyof OrganizationRequest)[] = [
            'company_name',
            'address',
            'city',
            'stateorprovince',
            'country',
            'postal_code'
        ];

        const emptyFields = stringFields.filter(field =>
            typeof data[field] === 'string' && data[field].trim() === ''
        );

        if (emptyFields.length > 0) {
            throw new ValidationError(`Following fields cannot be empty: ${emptyFields.join(', ')}`);
        }
    }
}
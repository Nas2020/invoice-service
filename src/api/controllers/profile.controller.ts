// src/api/controllers/profile.controller.ts
import { Context } from 'hono';
import { ProfileService } from '../../services/profile/profile.service';
import { ProfileUpdateRequest } from '../../types/profile.types';
import { CustomEnv } from '../../types/common.types';

export class ProfileController {
    constructor(private profileService: ProfileService) { }

    async getAllProfiles(c: Context<CustomEnv>) {
        try {
            const profiles = await this.profileService.getAllProfiles();
            return c.json(profiles);
        } catch (error) {
            console.error('Error getting profiles:', error);
            return c.json({
                error: error instanceof Error ? error.message : 'Failed to get profiles'
            }, 500);
        }
    }

    async getProfileById(c: Context<CustomEnv>) {
        try {
            const id = Number(c.req.param('id'));
            if (isNaN(id)) {
                return c.json({ error: 'Invalid ID format' }, 400);
            }

            const profile = await this.profileService.getProfileById(id);
            if (!profile) {
                return c.json({ error: 'Profile not found' }, 404);
            }

            return c.json(profile);
        } catch (error) {
            console.error('Error getting profile:', error);
            return c.json({
                error: error instanceof Error ? error.message : 'Failed to get profile'
            }, 500);
        }
    }

    async createProfile(c: Context<CustomEnv>) {
        try {
            const data = await c.req.json<ProfileUpdateRequest>();
            await this.validateProfileData(data);
            const createdProfile = await this.profileService.createProfile(data);
            return c.json(createdProfile, 201);
        } catch (error) {
            console.error('Error creating profile:', error);
            return c.json({
                error: error instanceof Error ? error.message : 'Failed to create profile'
            }, error instanceof ValidationError ? 400 : 500);
        }
    }

    async updateProfileById(c: Context<CustomEnv>) {
        try {
            const id = Number(c.req.param('id'));
            if (isNaN(id)) {
                return c.json({ error: 'Invalid ID format' }, 400);
            }

            const data = await c.req.json<ProfileUpdateRequest>();
            await this.validateProfileData(data);

            const updatedProfile = await this.profileService.updateProfileById(id, data);
            return c.json(updatedProfile);
        } catch (error) {
            console.error('Error updating profile:', error);
            return c.json({
                error: error instanceof Error ? error.message : 'Failed to update profile'
            }, error instanceof ValidationError ? 400 : 500);
        }
    }

    async deleteAllProfiles(c: Context<CustomEnv>) {
        try {
            await this.profileService.deleteAllProfiles();
            return c.json({ message: 'All profiles deleted successfully' });
        } catch (error) {
            console.error('Error deleting profiles:', error);
            return c.json({
                error: error instanceof Error ? error.message : 'Failed to delete profiles'
            }, 500);
        }
    }

    async deleteProfileById(c: Context<CustomEnv>) {
        try {
            const id = Number(c.req.param('id'));
            if (isNaN(id)) {
                return c.json({ error: 'Invalid ID format' }, 400);
            }

            const deleted = await this.profileService.deleteProfileById(id);
            if (!deleted) {
                return c.json({ error: 'Profile not found' }, 404);
            }

            return c.json({ message: 'Profile deleted successfully' });
        } catch (error) {
            console.error('Error deleting profile:', error);
            return c.json({
                error: error instanceof Error ? error.message : 'Failed to delete profile'
            }, 500);
        }
    }

    private async validateProfileData(data: ProfileUpdateRequest) {
        const requiredFields: (keyof ProfileUpdateRequest)[] = [
            'business_name',
            'business_email',
            'business_role',
            'business_address',
            'business_city',
            'business_stateorprovince',
            'business_country',
            'business_postal_code',
            'business_phone',
            'business_gst_hst_number'
        ];

        const missingFields = requiredFields.filter(field => !data[field]);
        if (missingFields.length > 0) {
            throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
        }
    }
}

class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}
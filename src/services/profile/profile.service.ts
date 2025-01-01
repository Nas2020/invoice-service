// src/services/profile/profile.service.ts
import { ProfileRepository } from '../../db/repositories/profile.repository';
import { ProfileUpdateRequest, ProfileResponse } from '../../types/profile.types';

export class ProfileService {
    constructor(private profileRepository: ProfileRepository) { }

    async getAllProfiles(): Promise<ProfileResponse[]> {
        return this.profileRepository.findAll();
    }

    async getProfileById(id: number): Promise<ProfileResponse | undefined> {
        return this.profileRepository.findById(id);
    }

    async createProfile(profile: ProfileUpdateRequest): Promise<ProfileResponse> {
        return this.profileRepository.create(profile);
    }

    async updateProfileById(id: number, profile: ProfileUpdateRequest): Promise<ProfileResponse> {
        return this.profileRepository.updateById(id, profile);
    }

    async deleteAllProfiles(): Promise<void> {
        return this.profileRepository.deleteAll();
    }

    async deleteProfileById(id: number): Promise<boolean> {
        return this.profileRepository.deleteById(id);
    }
}
// src/services/organization/organization.service.ts
import { OrganizationRepository } from '../../db/repositories/organization.repository';
import { OrganizationRequest, OrganizationResponse } from '../../types/organization.types';

export class OrganizationService {
    constructor(private organizationRepository: OrganizationRepository) {}

    async getAllOrganizationsForProfile(profileId: number): Promise<OrganizationResponse[]> {
        return this.organizationRepository.findAllByProfileId(profileId);
    }

    async getOrganizationForProfile(profileId: number, orgId: number): Promise<OrganizationResponse | undefined> {
        return this.organizationRepository.findByProfileIdAndOrgId(profileId, orgId);
    }

    async createOrganizationForProfile(profileId: number, organization: OrganizationRequest): Promise<OrganizationResponse> {
        return this.organizationRepository.create(profileId, organization);
    }

    async updateOrganizationForProfile(
        profileId: number,
        orgId: number,
        organization: OrganizationRequest
    ): Promise<OrganizationResponse> {
        return this.organizationRepository.updateByProfileIdAndOrgId(profileId, orgId, organization);
    }

    async deleteAllOrganizationsForProfile(profileId: number): Promise<void> {
        return this.organizationRepository.deleteAllByProfileId(profileId);
    }

    async deleteOrganizationForProfile(profileId: number, orgId: number): Promise<boolean> {
        return this.organizationRepository.deleteByProfileIdAndOrgId(profileId, orgId);
    }
}
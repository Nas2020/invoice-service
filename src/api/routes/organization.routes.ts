// src/api/routes/organization.routes.ts
import { Hono } from 'hono';
import { CustomEnv } from '../../types/common.types';
import { OrganizationController } from '../controllers/organization.controller';

export const defineOrganizationRoutes = (app: Hono<CustomEnv>, controller: OrganizationController) => {
  const organizationRouter = new Hono<CustomEnv>();

  // Get all organizations for a profile
  organizationRouter.get('/', (c) => controller.getAllOrganizationsForProfile(c));

  // Create a new organization for a profile
  organizationRouter.post('/', (c) => controller.createOrganizationForProfile(c));

  // Get specific organization for a profile
  organizationRouter.get('/:orgId', (c) => controller.getOrganizationForProfile(c));

  // Update specific organization for a profile
  organizationRouter.put('/:orgId', (c) => controller.updateOrganizationForProfile(c));

  // Delete all organizations for a profile
  organizationRouter.delete('/', (c) => controller.deleteAllOrganizationsForProfile(c));

  // Delete specific organization for a profile
  organizationRouter.delete('/:orgId', (c) => controller.deleteOrganizationForProfile(c));

  // Mount the router under /api/profiles/:profileId/organizations
  app.route('/api/profiles/:profileId/organizations', organizationRouter);
};
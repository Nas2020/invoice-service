// src/api/routes/profile.routes.ts
import { Hono } from 'hono';
import { CustomEnv } from '../../types/common.types';
import { ProfileController } from '../controllers/profile.controller';

export const defineProfileRoutes = (app: Hono<CustomEnv>, controller: ProfileController) => {
  const profileRouter = new Hono<CustomEnv>();
  
  // Define routes on the router
  profileRouter.get('/', (c) => controller.getAllProfiles(c));
  profileRouter.post('/', (c) => controller.createProfile(c));
  profileRouter.get('/:id', (c) => controller.getProfileById(c));
  profileRouter.put('/:id', (c) => controller.updateProfileById(c));
  profileRouter.delete('/', (c) => controller.deleteAllProfiles(c));
  profileRouter.delete('/:id', (c) => controller.deleteProfileById(c));
  
  // Mount the router
  app.route('/api/profiles', profileRouter);
};
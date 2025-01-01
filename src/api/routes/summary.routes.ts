import { Hono } from 'hono';
import { CustomEnv } from '../../types/common.types';
import { SummaryController } from '../controllers/summary.controller';

export const defineSummaryRoutes = (app: Hono<CustomEnv>, controller: SummaryController) => {
    const summaryRouter = new Hono<CustomEnv>();

    // Get financial summary
    summaryRouter.get('/', (c) => controller.getFinancialSummary(c));

    // Mount the router under /api/profiles/:profileId/summary
    app.route('/api/profiles/:profileId/summary', summaryRouter);
};
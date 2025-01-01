import { Context } from 'hono';
import { SummaryService } from '../../services/summary/summary.service';
import { CustomEnv } from '../../types/common.types';

export class SummaryController {
    constructor(private summaryService: SummaryService) {}

    async getFinancialSummary(c: Context<CustomEnv>) {
        try {
            const profileId = Number(c.req.param('profileId'));
            const startDate = c.req.query('start_date');
            const endDate = c.req.query('end_date');

            if (isNaN(profileId)) {
                return c.json({ error: 'Invalid profile ID' }, 400);
            }

            const summary = await this.summaryService.getFinancialSummary(
                profileId,
                startDate,
                endDate
            );

            return c.json(summary);
        } catch (error) {
            console.error('Error getting financial summary:', error);
            return c.json({
                error: error instanceof Error ? error.message : 'Failed to get financial summary'
            }, 500);
        }
    }
}
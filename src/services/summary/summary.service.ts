import { SummaryRepository } from '../../db/repositories/summary.repository';
import { FinancialSummaryResponse } from '../../types/summary.types';

export class SummaryService {
    constructor(private summaryRepository: SummaryRepository) { }

    async getFinancialSummary(
        profileId: number,
        startDate?: string,
        endDate?: string
    ): Promise<FinancialSummaryResponse> {
        // Default to current year if dates not provided
        const currentDate = new Date();
        const defaultStartDate = `${currentDate.getFullYear()}-01-01`;
        const defaultEndDate = currentDate.toISOString().split('T')[0];

        const start = startDate || defaultStartDate;
        const end = endDate || defaultEndDate;

        const income = await this.summaryRepository.getIncomeSummary(profileId, start, end);
        const tax = await this.summaryRepository.getTaxSummary(profileId, start, end);

        return {
            income,
            tax,
            period: {
                start_date: start,
                end_date: end
            }
        };
    }
}
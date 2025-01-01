import { Database } from 'bun:sqlite';
import { TaxSummary, IncomeSummary } from '../../types/summary.types';

export class SummaryRepository {
    constructor(private db: Database) { }

    getTaxSummary(profileId: number, startDate: string, endDate: string): TaxSummary {
        const taxByType = this.db.prepare(`
            SELECT 
                it.tax_type,
                SUM(it.amount) as amount,
                COUNT(DISTINCT i.id) as count
            FROM invoice_taxes it
            JOIN invoices i ON i.id = it.invoice_id
            WHERE i.profile_id = ?
            AND i.created_at BETWEEN ? AND ?
            GROUP BY it.tax_type
        `).all(profileId, startDate, endDate) as TaxSummary['tax_by_type'];

        const taxByRegion = this.db.prepare(`
            SELECT 
                it.region,
                SUM(it.amount) as amount,
                COUNT(DISTINCT i.id) as count
            FROM invoice_taxes it
            JOIN invoices i ON i.id = it.invoice_id
            WHERE i.profile_id = ?
            AND i.created_at BETWEEN ? AND ?
            GROUP BY it.region
        `).all(profileId, startDate, endDate) as TaxSummary['tax_by_region'];

        const quarterlySummary = this.db.prepare(`
            SELECT 
                strftime('%Y-Q%m', i.created_at) as quarter,
                SUM(i.total - i.subtotal) as tax_collected,
                SUM(i.total) as amount
            FROM invoices i
            WHERE i.profile_id = ?
            AND i.created_at BETWEEN ? AND ?
            GROUP BY quarter
            ORDER BY quarter
        `).all(profileId, startDate, endDate) as TaxSummary['quarterly_summary'];

        const totalTax = this.db.prepare(`
            SELECT SUM(amount) as total
            FROM invoice_taxes it
            JOIN invoices i ON i.id = it.invoice_id
            WHERE i.profile_id = ?
            AND i.created_at BETWEEN ? AND ?
        `).get(profileId, startDate, endDate) as { total: number };

        return {
            total_tax_collected: totalTax.total || 0,
            tax_by_type: taxByType,
            tax_by_region: taxByRegion,
            quarterly_summary: quarterlySummary
        };
    }

    getIncomeSummary(profileId: number, startDate: string, endDate: string): IncomeSummary {
        const monthlySummary = this.db.prepare(`
            SELECT 
                strftime('%Y-%m', created_at) as month,
                SUM(subtotal) as revenue,
                SUM(total - subtotal) as tax,
                SUM(total) as net
            FROM invoices
            WHERE profile_id = ?
            AND created_at BETWEEN ? AND ?
            GROUP BY month
            ORDER BY month
        `).all(profileId, startDate, endDate) as IncomeSummary['monthly_summary'];

        const clientSummary = this.db.prepare(`
            SELECT 
                i.organization_id,
                o.company_name as organization_name,
                SUM(i.subtotal) as total_billed,
                SUM(i.total - i.subtotal) as total_tax,
                COUNT(i.id) as invoice_count
            FROM invoices i
            JOIN organizations o ON o.id = i.organization_id
            WHERE i.profile_id = ?
            AND i.created_at BETWEEN ? AND ?
            GROUP BY i.organization_id, o.company_name
        `).all(profileId, startDate, endDate) as IncomeSummary['client_summary'];

        const currencySummary = this.db.prepare(`
            SELECT 
                currency,
                SUM(total) as original_amount,
                SUM(total * exchange_rate) as cad_equivalent
            FROM invoices
            WHERE profile_id = ?
            AND created_at BETWEEN ? AND ?
            GROUP BY currency
        `).all(profileId, startDate, endDate) as IncomeSummary['currency_summary'];

        const totals = this.db.prepare(`
            SELECT 
                SUM(subtotal) as total_revenue,
                SUM(total - subtotal) as total_tax,
                SUM(total) as net_income
            FROM invoices
            WHERE profile_id = ?
            AND created_at BETWEEN ? AND ?
        `).get(profileId, startDate, endDate) as Pick<IncomeSummary, 'total_revenue' | 'total_tax' | 'net_income'>;

        return {
            ...totals,
            monthly_summary: monthlySummary,
            client_summary: clientSummary,
            currency_summary: currencySummary
        };
    }
}
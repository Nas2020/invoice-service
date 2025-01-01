// src/services/invoice/invoice.service.ts
import { InvoiceRepository } from '../../db/repositories/invoice.repository';
import { ProfileRepository } from '../../db/repositories/profile.repository';
import { OrganizationRepository } from '../../db/repositories/organization.repository';
import { InvoiceCreateRequest, InvoiceUpdateRequest, InvoiceResponse } from '../../types/invoice.types';
import { InvoiceItem, TaxDetail } from '../../db/models/invoice.model';
import { InvoiceDataForPDF } from '../pdf';
import { getEnvConfig } from '../../config/environment';


const config = await getEnvConfig();
const PDF_FORM_NUMBER = config.PDF_FORM_NUMBER;
const PDF_REVISION = config.PDF_REVISION;

export class InvoiceService {
    constructor(
        private invoiceRepository: InvoiceRepository,
        private profileRepository: ProfileRepository,
        private organizationRepository: OrganizationRepository,
    ) { }

    private calculateItemAmounts(items: InvoiceItem[], hourlyRate: number): InvoiceItem[] {
        return items.map(item => ({
            ...item,
            rate: hourlyRate,
            amount: item.hours * hourlyRate
        }));
    }

    private calculateInvoiceTotals(items: InvoiceItem[], taxes: TaxDetail[] = []): {
        subtotal: number;
        total: number;
    } {
        const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
        let total = subtotal;

        // Calculate tax amounts
        if (taxes) {
            for (const tax of taxes) {
                if (tax.rate) {
                    tax.amount = (subtotal * tax.rate) / 100;
                    total += tax.amount;
                }
            }
        }

        return { subtotal, total };
    }

    async getAllInvoices(profileId: number): Promise<InvoiceResponse[]> {
        const profile = this.profileRepository.findById(profileId);
        if (!profile) {
            throw new Error('Profile not found');
        }

        return this.invoiceRepository.findAll(profileId);
    }

    async getOrganizationInvoices(profileId: number, organizationId: number): Promise<InvoiceResponse[]> {
        const organization = this.organizationRepository.findByProfileIdAndOrgId(profileId, organizationId);
        if (!organization) {
            throw new Error('Organization not found');
        }

        return this.invoiceRepository.findByOrganization(profileId, organizationId);
    }

    async getInvoiceById(profileId: number, invoiceId: number): Promise<InvoiceResponse | undefined> {
        const profile = this.profileRepository.findById(profileId);
        if (!profile) {
            throw new Error('Profile not found');
        }

        return this.invoiceRepository.findById(profileId, invoiceId);
    }

    async createInvoice(profileId: number, invoiceData: InvoiceCreateRequest): Promise<InvoiceResponse> {
        // Verify profile exists
        const profile = await this.profileRepository.findById(profileId);
        if (!profile) {
            throw new Error('Profile not found');
        }

        // Verify organization exists and belongs to profile
        const organization = await this.organizationRepository.findByProfileIdAndOrgId(
            profileId,
            invoiceData.organization_id
        );
        if (!organization) {
            throw new Error('Organization not found');
        }

        // Calculate amounts for items using organization's hourly rate
        if (invoiceData.items) {
            invoiceData.items = this.calculateItemAmounts(
                invoiceData.items,
                organization.hourly_rate
            );
        }

        // Calculate subtotal and total
        const { subtotal, total } = this.calculateInvoiceTotals(
            invoiceData.items || [],
            invoiceData.taxes
        );

        // Create the invoice with calculated values
        return await this.invoiceRepository.create(profileId, {
            ...invoiceData,
            profile_id: profileId,
            subtotal,
            total
        });
    }

    async updateInvoice(
        profileId: number,
        invoiceId: number,
        invoiceData: InvoiceUpdateRequest
    ): Promise<InvoiceResponse> {
        // Verify invoice exists and belongs to profile
        const existingInvoice = await this.getInvoiceById(profileId, invoiceId);
        if (!existingInvoice) {
            throw new Error('Invoice not found');
        }

        // Get organization details for hourly rate
        const organization = await this.organizationRepository.findByProfileIdAndOrgId(
            profileId,
            invoiceData.organization_id || existingInvoice.organization_id
        );
        if (!organization) {
            throw new Error('Organization not found');
        }

        // If items are being updated, recalculate amounts
        if (invoiceData.items) {
            invoiceData.items = this.calculateItemAmounts(
                invoiceData.items,
                organization.hourly_rate
            );
        }

        // Calculate new totals if items or taxes are updated
        if (invoiceData.items || invoiceData.taxes) {
            const { subtotal, total } = this.calculateInvoiceTotals(
                invoiceData.items || existingInvoice.items || [],
                invoiceData.taxes || existingInvoice.taxes
            );
            invoiceData.subtotal = subtotal;
            invoiceData.total = total;
        }

        return this.invoiceRepository.update(profileId, invoiceId, invoiceData);
    }

    async deleteInvoice(profileId: number, invoiceId: number): Promise<boolean> {
        // Verify invoice exists and belongs to profile
        const existingInvoice = await this.getInvoiceById(profileId, invoiceId);
        if (!existingInvoice) {
            return false;
        }

        return this.invoiceRepository.deleteById(profileId, invoiceId);
    }

    async deleteAllInvoices(profileId: number): Promise<void> {
        // Verify profile exists
        const profile = this.profileRepository.findById(profileId);
        if (!profile) {
            throw new Error('Profile not found');
        }

        return this.invoiceRepository.deleteAllByProfile(profileId);
    }

    async deleteOrganizationInvoices(profileId: number, organizationId: number): Promise<void> {
        // Verify organization exists and belongs to profile
        const organization = this.organizationRepository.findByProfileIdAndOrgId(profileId, organizationId);
        if (!organization) {
            throw new Error('Organization not found');
        }

        return this.invoiceRepository.deleteAllByOrganization(profileId, organizationId);
    }

    async getInvoiceWithDetails(profileId: number, invoiceId: number): Promise<InvoiceDataForPDF | null> {
        const invoice = await this.getInvoiceById(profileId, invoiceId);
        if (!invoice) return null;

        const profile = await this.profileRepository.findById(profileId);
        const organization = await this.organizationRepository.findByProfileIdAndOrgId(
            profileId,
            invoice.organization_id
        );

        if (!profile || !organization) return null;

        const gstTax = invoice.taxes?.find(tax =>
            tax.tax_type.toLowerCase().includes('gst') ||
            tax.tax_type.toLowerCase().includes('hst')
        );

        // Get the tax amount from the GST/HST tax entry, or calculate it if amount is not present
        const taxAmount = gstTax?.amount ??
            (gstTax?.rate && invoice.subtotal ? (invoice.subtotal * gstTax.rate / 100) : 0);

        return {
            from: {
                name: profile.business_name,
                role: organization.business_role || profile.business_role,
                addressLine1: profile.business_address,
                addressLine2: `${profile.business_city}, ${profile.business_stateorprovince} - ${profile.business_postal_code}`,
                country: profile.business_country,
                phone: profile.business_phone,
                gst: profile.business_gst_hst_number,
            },
            to: {
                company: organization.company_name,
                addressLine1: organization.address,
                addressLine2: `${organization.city}, ${organization.stateorprovince} - ${organization.postal_code}`,
                country: organization.country,
                email: organization.company_email_for_invoice
            },
            info: {
                number: invoice.invoice_number,
                date: invoice.invoice_submission_date || "N/A",
                dueDate: invoice.due_date || "N/A",
                formNumber: PDF_FORM_NUMBER,
                revision: PDF_REVISION,
                currency: invoice.currency || 'N/A'
            },
            items: invoice.items || [],
            notes: "Payment is due within 30 days. Please include invoice number with payment.",
            totals: {
                subtotal: invoice.subtotal || 0,
                taxRate: gstTax?.rate || organization.tax_rate_percentage || 0,
                tax: taxAmount,
                total: invoice.total || 0,
            }
        };
    }
}
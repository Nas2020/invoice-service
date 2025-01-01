import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Config and Types
import { getEnvConfig } from './config/environment';
import { CustomEnv } from './types/common.types';
import { initDB } from './db/schema';

// Controllers
import { ProfileController } from './api/controllers/profile.controller';
import { OrganizationController } from './api/controllers/organization.controller';
import { InvoiceController } from './api/controllers/invoice.controller';
import { SummaryController } from './api/controllers/summary.controller';

// Services
import { ProfileService } from './services/profile/profile.service';
import { OrganizationService } from './services/organization/organization.service';
import { InvoiceService } from './services/invoice/invoice.service';
import { SummaryService } from './services/summary/summary.service';

// Routes
import { defineProfileRoutes } from './api/routes/profile.routes';
import { defineOrganizationRoutes } from './api/routes/organization.routes';
import { defineInvoiceRoutes } from './api/routes/invoice.routes';
import { defineSummaryRoutes } from './api/routes/summary.routes';

// Middlewares
import { errorMiddleware } from './api/middlewares/error.middleware';
import { loggerMiddleware } from './api/middlewares/logger.middleware';

// Repositories
import { ProfileRepository } from './db/repositories/profile.repository';
import { OrganizationRepository } from './db/repositories/organization.repository';
import { InvoiceRepository } from './db/repositories/invoice.repository';
import { SummaryRepository } from './db/repositories/summary.repository';
import { FileStorageService } from './services/storage/file-storage.service';
import { PDFService } from './services/pdf';

const initializeApp = async () => {
    // Initialize configuration and database
    const config = await getEnvConfig();
    const db = await initDB();

    // Initialize repositories
    const profileRepo = new ProfileRepository(db);
    const organizationRepo = new OrganizationRepository(db);
    const invoiceRepo = new InvoiceRepository(db);
    const summaryRepo = new SummaryRepository(db);

    // Initialize services
    const profileService = new ProfileService(profileRepo);
    const organizationService = new OrganizationService(organizationRepo);
    const invoiceService = new InvoiceService(invoiceRepo, profileRepo, organizationRepo);
    const summaryService = new SummaryService(summaryRepo);
    const fileStorageService = new FileStorageService(config.PDF_STORAGE_PATH);
    const pdfService = new PDFService(config.PDF_FORM_NUMBER, config.PDF_REVISION);

    // Initialize controllers
    const profileController = new ProfileController(profileService);
    const organizationController = new OrganizationController(organizationService, profileService);
    const invoiceController = new InvoiceController(invoiceService, 
        fileStorageService,
        pdfService);
    const summaryController = new SummaryController(summaryService);

    // Initialize application
    const app = new Hono<CustomEnv>();

    // Global middlewares
    app.use('*', errorMiddleware);
    app.use('*', loggerMiddleware);
    app.use('*', async (c, next) => {
        c.set('db', db);
        await next();
    });
    app.use(cors());

    // Define routes
    defineProfileRoutes(app, profileController);
    defineOrganizationRoutes(app, organizationController);
    defineInvoiceRoutes(app, invoiceController);
    defineSummaryRoutes(app, summaryController);

    return { app, config };
};

let appInstance: { app: Hono<CustomEnv>; config: any } | null = null;

export default {
    port: 9000, // Default port, will be overridden
    async fetch(request: Request, server: any) {
        if (!appInstance) {
            appInstance = await initializeApp();
            console.log(`🚀 Server running at http://localhost:${appInstance.config.PORT}`);
        }
        return appInstance.app.fetch(request, server);
    }
};
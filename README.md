

```markdown
# Invoice Service

A professional invoice management system built with Bun and TypeScript.

## Features

- Profile Management
- Organization/Client Management
- Invoice Generation with Automatic Numbering
- Tax Management (GST/HST, VAT)
- Financial Summary & Analytics
- Multi-currency Support

## Getting Started

### Prerequisites
- Bun v1.1.34 or higher
- SQLite

### Installation

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env

# Run database migrations
bun run migrate:fresh

# Seed the database with sample data
bun run db:seed
```

### Development

```bash
# Run in development mode with hot reloading
bun run dev

# Run tests
bun test

# Run with watch mode
bun test --watch
```

### Production
```bash
# Build the application
bun run build

# Start the server
bun start
```

## TODO

- Integrate Front part for all these functionality
- Integrate email sending
- Test multiple times, if everything is okay. Containerize it to deploy it on Raspberry Pi (both frontend and backend-DNS to access the app, No credential required for now.)
- Keep testing and monitoring - 31 Dec 2024

### Phase 1: Core Functionality ✅
- [x] Basic CRUD operations for Profiles
- [x] Organization management
- [x] Invoice generation with automatic numbering
- [x] Tax calculations
- [x] Financial summary and reporting

### Phase 2: Authentication & Security 🔒
- [ ] Implement OIDC Google login
  - Verified domain support
  - Optional Proton email integration
- [ ] SSO integration
- [ ] Passkey authentication support

### Phase 3: Financial & Tax Management 💰
- [x] GST/HST tracking
- [x] Tax summary reports
- [x] Financial analytics
- [ ] Export capabilities for accounting
- [ ] Custom date range filtering

### Phase 4: UI/UX Improvements 🎨
- [ ] Frontend development
  - [ ] React-based dashboard
  - [ ] Financial charts and analytics
  - [ ] Organization dropdown selection
  - [ ] Date range filters
- [ ] PDF handling
  - [ ] Preview functionality
  - [ ] Email integration
  - [ ] Download options

### Phase 5: Code Quality & DevOps 🔧
- [ ] Comprehensive testing
- [ ] Code cleanup and linting
- [ ] Documentation improvements
- [ ] CI/CD pipeline

## Project Structure

```
invoice-service/
├── src/
│   ├── api/                    # API layer
│   │   ├── controllers/        # Request handlers
│   │   ├── middlewares/        # Custom middleware
│   │   ├── routes/            # Route definitions
│   │   └── validators/        # Request validation schemas
│   │
│   ├── config/                # Configuration
│   ├── db/                    # Database layer
│   │   ├── migrations/        # Database migrations
│   │   ├── models/           # Database models
│   │   └── repositories/     # Database access
│   │
│   ├── services/             # Business logic
│   │   ├── invoice/
│   │   ├── organization/
│   │   ├── profile/
│   │   └── summary/          # Financial analytics
│   │
│   ├── types/                # Type definitions
│   ├── utils/                # Utility functions
│   └── app.ts               # Application entry
│
├── tests/                    # Test files
├── docs/                    # Documentation
└── scripts/                # Utility scripts
```

## API Endpoints

### Profiles
- `GET /api/profiles`
- `POST /api/profiles`
- `GET /api/profiles/:id`
- `PUT /api/profiles/:id`
- `DELETE /api/profiles/:id`

### Organizations
- `GET /api/profiles/:profileId/organizations`
- `POST /api/profiles/:profileId/organizations`
- `GET /api/profiles/:profileId/organizations/:orgId`
- `PUT /api/profiles/:profileId/organizations/:orgId`
- `DELETE /api/profiles/:profileId/organizations/:orgId`

### Invoices
- `GET /api/profiles/:profileId/invoices`
- `POST /api/profiles/:profileId/invoices`
- `GET /api/profiles/:profileId/invoices/:invoiceId`
- `PUT /api/profiles/:profileId/invoices/:invoiceId`
- `DELETE /api/profiles/:profileId/invoices/:invoiceId`

### Financial Summary
- `GET /api/profiles/:profileId/summary`
  - Query params: `start_date`, `end_date`

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
```
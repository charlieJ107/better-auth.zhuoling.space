# Better-Auth.Zhuoling.Space - Authentication Service

A comprehensive, enterprise-ready authentication service built with Next.js and Better Auth, featuring OAuth/OIDC provider capabilities, multi-language support, and advanced security features.

## 🌟 Features

### Authentication & Security
- **Multiple Auth Methods**: Email/password, magic links, OTP (email and SMS), passkeys, usernames, anonymous authentication
- **Two-Factor Authentication (2FA)**: Support for additional security layers
- **JWT Support**: Token-based authentication with JWT
- **Session Management**: Secure session handling with device tracking
- **Email Verification**: Required email verification on signup
- **Password Reset**: Secure password reset flow with email notifications

### OAuth/OIDC Provider
- **Full OAuth 2.0 & OpenID Connect Provider**: Allow third-party applications to authenticate users
- **Dynamic Client Management**: Create and manage OAuth clients through admin panel
- **Scope Management**: Configurable OAuth scopes with multi-language descriptions
- **Consent Flow**: User-friendly consent screen for OAuth authorization
- **API Key Management**: Generate and manage API keys with rate limiting

### Organization & SSO Support
- **Multi-Tenant Organizations**: Support for team-based access control
- **Organization Management**: Create and manage organizations
- **Member Invitations**: Invite users to organizations via email
- **SSO Integration**: Ready for Single Sign-On integrations

### Internationalization
- **Multi-Language Support**: English and Chinese (Simplified)
- **Locale-aware Email Templates**: Localized email notifications
- **Dynamic Language Switching**: User-friendly language switcher in UI
- **Localized Content**: Terms of service and privacy policies in multiple languages

### Admin Features
- **User Management**: Create, edit, and manage user accounts
- **OAuth Client Management**: Create and manage OAuth clients
- **Dashboard Statistics**: Real-time statistics and metrics
- **Admin Privileges**: Role-based access control

### Developer Experience
- **Modern Tech Stack**: Next.js 15, React 19, TypeScript 5
- **Type-Safe Database**: Kysely ORM with PostgreSQL
- **Component Library**: Radix UI with Tailwind CSS
- **Form Handling**: React Hook Form for form validation

## 🚀 Getting Started

### Prerequisites

- Node.js 12+ 
- PostgreSQL database
- SMTP server for email functionality

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd better-auth.zhuoling.space
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/better_auth

# App Configuration
BETTER_AUTH_URL=http://localhost:3000

# Branding Configuration (optional)
# You can configure branding via environment variables or branding.json file
# Priority: Environment variables > branding.json > default (Zhuoling.Space)
# Option 1: Use JSON string in environment variable
BRANDING_CONFIG={"appName":"Your App","platformName":"Your Platform","serviceName":"Your Services","companyName":"Your Company","contactEmail":{"legal":"legal@example.com","privacy":"privacy@example.com","dpo":"dpo@example.com"},"serviceDescription":{"en":"your service description","zh":"您的服务描述"}}
# Option 2: Use individual environment variables
BRANDING_APP_NAME=Your App
BRANDING_PLATFORM_NAME=Your Platform
BRANDING_SERVICE_NAME=Your Services
BRANDING_COMPANY_NAME=Your Company
BRANDING_EMAIL_LEGAL=legal@example.com
BRANDING_EMAIL_PRIVACY=privacy@example.com
BRANDING_EMAIL_DPO=dpo@example.com
BRANDING_SERVICE_DESC_EN=your service description
BRANDING_SERVICE_DESC_ZH=您的服务描述

# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-email-password
SMTP_FROM_EMAIL=noreply@example.com
SMTP_FROM_NAME=Your App Name

# Better Auth Secret (generate a secure random string)
BETTER_AUTH_SECRET=your-secret-key-here
# Better Auth URL, the base URL of your app

# Optional: Admin Configuration
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure-password
```

4. Run database migrations:
```bash
npm run migrate
```

5. Seed the database (optional if you don't need an admin user):
```bash
npm run seed
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
better-auth.zhuoling.space/
├── migrations/           # Database migrations
├── seeds/               # Database seed data
├── src/
│   ├── app/             # Next.js app router pages
│   │   ├── [locale]/    # Localized routes (en, zh)
│   │   │   ├── (front)/ # Public pages (login, register, etc.)
│   │   │   └── account/ # User account pages
│   │   ├── admin/       # Admin panel pages
│   │   └── api/         # API routes
│   ├── components/     # React components
│   │   └── ui/          # Reusable UI components
│   ├── content/         # Markdown content (terms, privacy policy)
│   ├── hooks/           # React hooks
│   └── lib/             # Core libraries
│       ├── auth.ts      # Better Auth configuration
│       ├── db/          # Database models and connection
│       ├── email/       # Email templates and utilities
│       ├── i18n/        # Internationalization
│       └── oauth-clients.ts # OAuth utilities
├── public/              # Static assets
└── package.json
```

## 🔧 Configuration

### Email Templates

Email templates are located in `src/lib/email/templates/` and support:
- Email verification
- Password reset
- Magic link authentication
- OTP (One-Time Password) codes

Templates are localized and support HTML content.

### Internationalization

Add new languages by:
1. Adding the locale to `src/lib/i18n/common.ts`
2. Creating a dictionary file in `src/lib/i18n/dictionaries/`
3. Adding localized content in `src/content/`

### Branding Configuration

The platform supports dynamic branding configuration. You can customize:
- Application name, platform name, service name, company name
- Contact email addresses (legal, privacy, DPO)
- Service descriptions in multiple languages

**Configuration Methods:**
1. **Environment Variables** (highest priority):
   - Set `BRANDING_CONFIG` as a JSON string, or
   - Use individual `BRANDING_*` environment variables

2. **branding.json file** (medium priority):
   - Create a `branding.json` file in the project root
   - See `branding.json` for an example (Paperlib configuration)

3. **Default** (fallback):
   - Defaults to Zhuoling.Space branding if no configuration is provided

**Template Syntax:**
- i18n dictionaries support template variables: `{{appName}}`, `{{platformName}}`, etc.
- MDX content files can use JSX components: `<BrandAppName />`, `<BrandPlatformName />`, etc.
- Escape characters: Use `\{{` for literal `{{`, `\\` for literal `\`

### OAuth Client Configuration

OAuth clients are managed through the admin panel at `/admin/clients`. Configure:
- Client ID and secret
- Redirect URLs
- Allowed scopes
- Client type (confidential/public)

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with initial data

## 🔐 Security Features

- **Password Hashing**: Secure password storage
- **CSRF Protection**: Built-in CSRF protection
- **Rate Limiting**: API key rate limiting support
- **Session Security**: Secure session management
- **Email Verification**: Required email verification
- **2FA Support**: Additional security layer
- **Passkey Support**: WebAuthn/FIDO2 authentication

## 🌍 API Endpoints

### Authentication
- `POST /api/auth/sign-in` - User sign in
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-out` - User sign out
- `POST /api/auth/verify-email` - Email verification

### OAuth/OIDC
- `GET /api/auth/oauth/authorize` - OAuth authorization endpoint
- `POST /api/auth/oauth/token` - OAuth token endpoint
- `GET /api/auth/.well-known/openid-configuration` - OIDC discovery

### Admin API
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/oauth-clients` - List OAuth clients
- `POST /api/admin/oauth-clients` - Create OAuth client
- `GET /api/admin/oauth-clients/[clientId]` - Get OAuth client details

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Better Auth](https://better-auth.com) - Authentication framework
- [Next.js](https://nextjs.org) - React framework
- [Shadcn](https://ui.shadcn.com/) - Component library
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework

## 📞 Support

For issues, feature requests, or questions, please open an issue on the GitHub repository.

---

Built with ❤️ using Next.js and Better Auth

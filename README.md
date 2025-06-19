# Pharmacy RX Manager

A modern prescription management system for independent pharmacies with POS integration. This application provides a streamlined workflow for managing patients, doctors, medications, and prescriptions while maintaining real-time inventory synchronization.

## 📚 Documentation

- **[AI Agent Guide](AI_AGENT_GUIDE.md)** - Comprehensive guide for AI agents working with this codebase
- **[Roadmap](ROADMAP.md)** - Current status and future development plans
- **[Codebase Context](CODEBASE_CONTEXT.md)** - Business context and architectural decisions
- **[API Documentation](API_DOCUMENTATION.md)** - Complete API endpoint reference
- **[Label Printing Guide](README-LABEL-PRINTING.md)** - Setup instructions for Zebra label printing

## Features

### Core Functionality
- **Patient Management**: Add, search, and manage patient records with comprehensive information
- **Doctor Management**: Maintain a database of doctors with contact information
- **Medication Management**: Track medications with details like strength and count
- **Prescription Creation**: Create prescriptions with multiple medications
- **Automatic Quantity Calculation**: Calculate quantity to dispense based on SIG fields
- **Modern UI**: Responsive design with autocomplete components and modal forms

### Integrations
- **Lightspeed Retail POS**: Real-time inventory synchronization with OAuth authentication
- **Zebra Label Printing**: Direct thermal printing for prescription labels
- **Point of Sale**: Basic checkout interface for OTC medications

## Tech Stack

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend/Database**: Supabase (Authentication, PostgreSQL, Storage)
- **Hosting**: Vercel
- **Security/DNS**: Cloudflare (optional)

## Project Structure

```
pharmacy-rx-manager/
├── public/              # Static assets
├── src/
│   ├── app/            # Next.js app router pages
│   ├── components/     # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Library code, including Supabase client
│   ├── services/       # Service layer for API calls
│   ├── styles/         # Global styles
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── supabase/           # Supabase configuration
├── .env.local          # Environment variables (create this file)
├── next.config.ts      # Next.js configuration
└── package.json        # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js 16.8.0 or later
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd pharmacy-rx-manager
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   Create a `.env.local` file in the root directory with the following variables:
   ```
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Lightspeed Integration (Optional)
   LIGHTSPEED_CLIENT_ID=your_lightspeed_client_id
   LIGHTSPEED_CLIENT_SECRET=your_lightspeed_client_secret
   LIGHTSPEED_REDIRECT_URI=http://localhost:3004/api/lightspeed/auth

   # Application Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3004
   ```

4. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application

## Supabase Setup

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)

2. Set up the following tables in your Supabase database:

   - **patients**
     - id (uuid, primary key)
     - name (text, not null)
     - dob (date, not null)
     - gender (text, not null)
     - id_number (text, not null)
     - dp_number (text)
     - birth_cert_pin (text)
     - phone (text, not null)
     - phone2 (text)
     - email (text)
     - address (text, not null)
     - city (text, not null)
     - state (text, not null)
     - zip (text, not null)
     - created_at (timestamp with time zone, default: now())
     - updated_at (timestamp with time zone, default: now())

   - **doctors**
     - id (uuid, primary key)
     - name (text, not null)
     - phone (text, not null)
     - address (text)
     - created_at (timestamp with time zone, default: now())
     - updated_at (timestamp with time zone, default: now())

   - **medications**
     - id (uuid, primary key)
     - name (text, not null)
     - strength (text, not null)
     - count (integer, default: 0)
     - created_at (timestamp with time zone, default: now())
     - updated_at (timestamp with time zone, default: now())

   - **prescriptions**
     - id (uuid, primary key)
     - patient_id (uuid, foreign key references patients.id)
     - doctor_id (uuid, foreign key references doctors.id)
     - date (date, not null)
     - notes (text)
     - created_at (timestamp with time zone, default: now())
     - updated_at (timestamp with time zone, default: now())

   - **prescription_medications**
     - id (uuid, primary key)
     - prescription_id (uuid, foreign key references prescriptions.id)
     - medication_id (uuid, foreign key references medications.id)
     - dose (text, not null)
     - route (text, not null)
     - frequency (text, not null)
     - days (integer, not null)
     - quantity (integer, not null)
     - unit (text, not null)
     - refills (integer, default: 0)
     - notes (text)
     - created_at (timestamp with time zone, default: now())
     - updated_at (timestamp with time zone, default: now())

3. Set up Row Level Security (RLS) policies as needed for your security requirements

## Deployment

### Deploying to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Connect your repository to Vercel at [https://vercel.com/new](https://vercel.com/new)

3. Add your environment variables in the Vercel project settings

4. Deploy your application

### Setting up Cloudflare (Optional)

1. Create a Cloudflare account at [https://www.cloudflare.com](https://www.cloudflare.com)

2. Add your domain to Cloudflare

3. Update your domain's nameservers to point to Cloudflare

4. Configure Cloudflare's SSL/TLS settings to Full or Full (Strict)

## Lightspeed Integration Setup

1. **Create a Lightspeed OAuth App**
   - Log in to your Lightspeed developer account
   - Create a new OAuth application
   - Set redirect URI to `http://localhost:3004/api/lightspeed/auth`
   - Note your Client ID and Client Secret

2. **Configure Environment Variables**
   - Add Lightspeed credentials to `.env.local`
   - Ensure `NEXT_PUBLIC_APP_URL` matches your development URL

3. **Connect to Lightspeed**
   - Navigate to `/lightspeed/connect` in the application
   - Click "Connect to Lightspeed"
   - Authorize the application
   - System will automatically sync products

## Development Guidelines

- See [AI_AGENT_GUIDE.md](AI_AGENT_GUIDE.md) for detailed development patterns
- Check [ROADMAP.md](ROADMAP.md) for current priorities
- Review [CODEBASE_CONTEXT.md](CODEBASE_CONTEXT.md) for architectural decisions

## Contributing

When contributing to this repository:
1. Create a feature branch from `develop`
2. Follow existing code patterns (see AI Agent Guide)
3. Test thoroughly with real-world scenarios
4. Submit a pull request with clear description

## Future Enhancements

See [ROADMAP.md](ROADMAP.md) for detailed plans. Key upcoming features:
- Complete Lightspeed bidirectional sync
- User authentication and roles
- Advanced reporting and analytics
- Insurance claim processing
- Mobile application

## License

This project is licensed under the MIT License - see the LICENSE file for details.

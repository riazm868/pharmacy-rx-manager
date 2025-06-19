# AI Agent Guide - Pharmacy RX Manager

This guide is designed to help AI agents quickly understand the codebase structure, patterns, and conventions used in the Pharmacy RX Manager project.

## Project Overview

**Purpose**: A modern prescription management system for independent pharmacies that integrates with Lightspeed Retail POS for inventory management.

**Core Functionality**:
1. Patient record management
2. Doctor information management  
3. Medication inventory tracking
4. Prescription creation and management
5. Label printing via Zebra printers
6. Lightspeed POS integration for real-time inventory sync

## Tech Stack Summary

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **State Management**: React hooks, local state
- **API**: Next.js API routes
- **External Integrations**: 
  - Lightspeed Retail API (OAuth 2.0)
  - Zebra printer network protocol

## Directory Structure and Responsibilities

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # Backend API endpoints
│   │   ├── lightspeed/    # Lightspeed OAuth and sync endpoints
│   │   ├── medications/   # Medication CRUD operations
│   │   ├── patients/      # Patient CRUD operations
│   │   └── test-connection/ # Printer connection testing
│   ├── doctors/           # Doctor management pages
│   ├── medications/       # Medication management pages
│   ├── patients/          # Patient management pages
│   ├── prescriptions/     # Prescription management pages
│   ├── lightspeed/        # Lightspeed integration UI
│   └── pos/              # Point of Sale interface
├── components/            # Reusable React components
│   ├── forms/            # Form components for each entity
│   ├── modals/           # Modal dialog components
│   ├── print/            # Printing-related components
│   ├── pos/              # POS-specific components
│   └── ui/               # Base UI components
├── lib/                   # Core libraries and utilities
│   ├── lightspeed/       # Lightspeed API client and sync logic
│   ├── storage/          # In-memory storage for temporary data
│   └── supabase.ts       # Supabase client configuration
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## Key Design Patterns

### 1. Database Operations Pattern
All database operations go through Supabase client:
```typescript
// Pattern for fetching data
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .order('created_at', { ascending: false });

// Pattern for inserting data
const { data, error } = await supabase
  .from('table_name')
  .insert({ ...fields })
  .select()
  .single();
```

### 2. Form Component Pattern
Each entity has a dedicated form component with:
- TypeScript interfaces for form data
- Validation logic
- Submission handlers
- Error handling

### 3. API Route Pattern
```typescript
// Standard API route structure
export async function GET(request: Request) {
  // Handle GET requests
}

export async function POST(request: Request) {
  // Handle POST requests
}
```

### 4. Modal Pattern
Modals use a consistent pattern with:
- `isOpen` prop for visibility
- `onClose` callback
- Entity data as prop
- Consistent styling

## Database Schema

### Core Tables
1. **patients**: Patient records with personal and contact information
2. **doctors**: Doctor records with contact details
3. **medications**: Medication inventory with strength and count
4. **prescriptions**: Prescription headers linking patients and doctors
5. **prescription_medications**: Junction table for prescription items

### Lightspeed Integration Tables (if added)
- Store mapping between local medications and Lightspeed items
- Sync status tracking

## Environment Variables

Required variables in `.env.local`:
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Lightspeed OAuth
LIGHTSPEED_CLIENT_ID=
LIGHTSPEED_CLIENT_SECRET=
LIGHTSPEED_REDIRECT_URI=http://localhost:3004/api/lightspeed/auth

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3004
```

## Key Features and Their Implementation

### 1. Prescription Creation Flow
1. User navigates to `/prescriptions/new`
2. Selects patient (with autocomplete)
3. Selects doctor (with autocomplete)
4. Adds medications with SIG details
5. System calculates quantity automatically
6. Saves to database with related records

### 2. Lightspeed Integration Flow
1. User connects via OAuth at `/lightspeed/connect`
2. Tokens stored in memory (temporary)
3. Sync process fetches Lightspeed items
4. Maps items to local medications
5. Updates inventory counts

### 3. Label Printing Flow
1. User clicks "Print Label" on prescription
2. System generates ZPL code for Zebra printer
3. Sends to Python print server via HTTP
4. Print server communicates with local printer

## Common Tasks for AI Agents

### Adding a New Feature
1. Identify which layer (UI, API, Database)
2. Follow existing patterns in that layer
3. Update TypeScript types if needed
4. Add error handling
5. Test with existing data

### Modifying Database Schema
1. Create migration SQL file
2. Update TypeScript types in `types/database.ts`
3. Update Supabase client calls
4. Update related components

### Adding API Endpoints
1. Create route file in `app/api/`
2. Implement HTTP method handlers
3. Add error handling and validation
4. Update frontend to call new endpoint

### Debugging Tips
1. Check browser console for client errors
2. Check Next.js terminal for server errors
3. Verify Supabase connection and permissions
4. Check network tab for API responses
5. Verify environment variables are set

## Code Style Guidelines

- Use TypeScript for type safety
- Follow React hooks conventions
- Use async/await for asynchronous operations
- Handle errors gracefully with try/catch
- Use meaningful variable names
- Comment complex logic
- Keep components focused and small

## Testing Approach

Currently manual testing. Future considerations:
- Unit tests for utilities
- Integration tests for API routes
- E2E tests for critical flows

## Security Considerations

- Supabase Row Level Security (RLS) policies
- API route authentication (to be implemented)
- Input validation on forms
- Sanitization of user inputs
- Secure storage of OAuth tokens

## Performance Considerations

- Use React.memo for expensive components
- Implement pagination for large lists
- Cache Lightspeed data appropriately
- Optimize database queries with proper indexes
- Lazy load components where appropriate

## Common Pitfalls to Avoid

1. Don't forget to handle loading and error states
2. Always validate user input
3. Check for null/undefined before accessing properties
4. Use proper TypeScript types (avoid 'any')
5. Handle API errors gracefully
6. Don't store sensitive data in localStorage

## Integration Points

1. **Supabase**: All database operations
2. **Lightspeed API**: Inventory and product data
3. **Zebra Printer**: Label printing via print server
4. **Browser APIs**: Local storage for printer config

## Future Architecture Considerations

- Implement proper authentication/authorization
- Add comprehensive error tracking
- Implement caching strategy
- Add API rate limiting
- Consider microservices for scaling
- Implement comprehensive logging 
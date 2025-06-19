# Codebase Context - Pharmacy RX Manager

## Business Context

### Domain: Independent Pharmacy Operations
This system addresses the specific needs of independent pharmacies that need modern prescription management without the complexity and cost of enterprise solutions.

### Key Business Problems Solved
1. **Manual Prescription Tracking**: Replaces paper-based or spreadsheet tracking
2. **Inventory Discrepancies**: Syncs with POS to maintain accurate counts
3. **Prescription Errors**: Automated calculations reduce dosage errors
4. **Inefficient Workflows**: Streamlines prescription creation and fulfillment
5. **Label Printing**: Direct integration with thermal printers

### Target Users
- **Pharmacists**: Primary users for prescription creation and verification
- **Pharmacy Technicians**: Data entry and prescription preparation
- **Pharmacy Owners**: Inventory and business insights
- **Front Desk Staff**: Patient registration and basic queries

## Technical Architecture Decisions

### Why Next.js App Router?
- Modern React framework with excellent DX
- Built-in API routes eliminate need for separate backend
- Server-side rendering for better performance
- Easy deployment to Vercel/Netlify
- Strong TypeScript support

### Why Supabase?
- Managed PostgreSQL with real-time capabilities
- Built-in authentication (ready for future use)
- Row Level Security for HIPAA compliance
- Cost-effective for small to medium pharmacies
- Easy to implement and maintain

### Why Lightspeed Integration?
- Popular POS system among independent pharmacies
- Real-time inventory synchronization
- Reduces double-entry of data
- Existing customer base already uses it

### Why In-Memory Token Storage?
- Temporary solution for MVP
- Avoids complexity of secure token storage initially
- Plan to migrate to encrypted database storage
- Acceptable for single-user/single-location use case

## Current Implementation Status

### What's Working Well
1. **Core CRUD Operations**: All basic operations functional
2. **Prescription Flow**: End-to-end prescription creation works
3. **Label Printing**: Successfully prints to Zebra printers
4. **Search Features**: Autocomplete for patients/doctors/medications
5. **UI/UX**: Clean, intuitive interface

### Known Limitations
1. **No Authentication**: System is currently open
2. **No Data Validation**: Limited input validation
3. **Error Handling**: Basic error handling, needs improvement
4. **Performance**: No optimization for large datasets
5. **Testing**: No automated tests yet

### Active Development Areas
1. **Lightspeed Integration**: OAuth flow complete, working on sync
2. **POS Interface**: Building simple checkout for OTC items
3. **Error Recovery**: Adding retry logic for external APIs
4. **Data Persistence**: Moving from memory to database storage

## Code Organization Philosophy

### Separation of Concerns
- **Pages (app/)**: Handle routing and page-level logic
- **Components**: Reusable UI elements with single responsibility
- **API Routes**: Backend logic and external integrations
- **Lib**: Core business logic and utilities
- **Types**: Centralized TypeScript definitions

### Naming Conventions
- **Files**: PascalCase for components, camelCase for utilities
- **Functions**: Verb-first naming (getPrescription, createPatient)
- **Types**: Descriptive interfaces (PatientFormData, PrescriptionWithDetails)
- **Database**: Snake_case for tables and columns

### State Management Strategy
- **Local State**: For component-specific UI state
- **Props Drilling**: For shallow component trees
- **URL State**: For shareable/bookmarkable state
- **Database**: Source of truth for all business data
- **Future**: Consider Redux/Zustand for complex state

## Integration Architecture

### Lightspeed Integration Flow
```
User → OAuth Login → Lightspeed
         ↓
    Access Token
         ↓
Fetch Products → Map to Medications → Update Inventory
```

### Print Server Architecture
```
Web App → Generate ZPL → HTTP POST → Python Server → Zebra Printer
                                          ↑
                                   Windows PC (USB/Network)
```

## Security Considerations

### Current Security Measures
- Environment variables for secrets
- HTTPS in production
- Supabase RLS (ready to enable)
- Input sanitization on forms

### Planned Security Enhancements
- JWT-based authentication
- Role-based access control
- API rate limiting
- Audit logging
- Encryption for sensitive data

## Performance Characteristics

### Current Performance
- Page loads: 2-3 seconds average
- API responses: 100-300ms
- Database queries: Not optimized
- No caching implemented

### Optimization Opportunities
1. Implement database indexes
2. Add Redis caching layer
3. Optimize React re-renders
4. Implement pagination
5. Lazy load large components

## Development Workflow

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `fix/*`: Bug fixes
- `hotfix/*`: Emergency fixes

### Typical Development Flow
1. Create feature branch
2. Implement changes
3. Test locally with real data
4. Create pull request
5. Deploy to staging (when available)
6. Merge to main

### Local Development Setup
1. Clone repository
2. Install dependencies
3. Set up Supabase project
4. Configure environment variables
5. Run development server
6. Connect to Lightspeed (optional)

## Common Troubleshooting

### Database Connection Issues
- Check Supabase service status
- Verify environment variables
- Check network connectivity
- Review Supabase logs

### Lightspeed Sync Failures
- Verify OAuth tokens are valid
- Check API rate limits
- Ensure product mappings exist
- Review error logs

### Print Server Problems
- Confirm server is running
- Check firewall settings
- Verify printer drivers
- Test with simple print job

## Future Considerations

### Scalability Planning
- Current: Single pharmacy, <1000 prescriptions/month
- Near-term: 10 pharmacies, 10K prescriptions/month
- Long-term: 100+ pharmacies, 100K+ prescriptions/month

### Technical Debt to Address
1. Add comprehensive test suite
2. Implement proper error boundaries
3. Add request validation middleware
4. Improve TypeScript strictness
5. Document API endpoints

### Architecture Evolution
- Consider microservices for scaling
- Evaluate GraphQL for complex queries
- Add event-driven updates
- Implement proper job queues
- Consider edge deployment

## Key Metrics to Track

### Technical Metrics
- API response times
- Error rates
- Database query performance
- Print success rate
- Sync completion rate

### Business Metrics
- Prescriptions per day
- Average prescription time
- Inventory accuracy
- User satisfaction
- System uptime

## Contact and Resources

- **Repository**: [GitHub link]
- **Documentation**: See README.md, AI_AGENT_GUIDE.md
- **Issues**: Use GitHub Issues for bugs/features
- **Deployment**: Vercel for web app, local for print server

---

*This document provides context for understanding the codebase's purpose, architecture, and current state. For detailed technical information, refer to the AI_AGENT_GUIDE.md.* 
# Database

This folder contains all database-related files for the Texas Water Service Request system.

## Files

### schema.sql
Complete production-ready PostgreSQL schema including:
- Main `water_service_requests` table with all 40+ fields
- Enum types for status, property use, billing, etc.
- Audit log table for compliance
- Helper views for common queries
- Row-level security policies
- Indexes for performance
- Triggers for automation

**To install**: Run this file in Supabase SQL Editor or via psql

### migrations/
Future database migration files will go here when schema changes are needed.

### seeds/
Test data and sample records for development.

## Setup Instructions

1. Create a Supabase project
2. Go to SQL Editor
3. Copy contents of `schema.sql`
4. Paste and run
5. Verify with: `SELECT * FROM water_service_requests LIMIT 1;`

## Schema Overview

**Main Table**: `water_service_requests`
- 60+ columns capturing all form data
- Full audit trail
- Encrypted SSN storage
- Document path storage
- Work order tracking

**Supporting Tables**:
- `admins` - Admin user access control
- `water_request_audit_log` - All changes logged

**Views**:
- `pending_activations` - Scheduled service activations
- `pending_landlord_verifications` - Rentals needing verification
- `pending_deposits` - Outstanding deposits

## Maintenance

### Backups
Supabase automatically backs up your database. For extra safety:
```bash
pg_dump -h your-host -U postgres -d postgres > backup.sql
```

### Monitoring
Check these regularly:
- Table sizes
- Index usage
- Slow queries
- Lock contention

### Updates
When schema needs changes:
1. Create migration file in `migrations/`
2. Test in development
3. Review with team
4. Run in production

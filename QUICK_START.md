# Quick Start Guide

Get the Texas Water Service Request system up and running in 10 minutes!

## Prerequisites

- Node.js 18+ installed
- npm 9+ installed
- Supabase account (free tier works)
- Git installed

## Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/tx-water-service-request.git
cd tx-water-service-request
```

## Step 2: Install Dependencies

```bash
npm install
```

This installs:
- Next.js 14
- React 18
- TypeScript 5
- Supabase client
- Zod validation
- All dev dependencies

## Step 3: Setup Supabase

### Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose organization
5. Enter project details:
   - Name: `tx-water-service`
   - Database password: Generate a strong password
   - Region: Choose closest to your users
6. Click "Create Project" (takes ~2 minutes)

### Get Your Credentials

1. In your Supabase project dashboard
2. Go to Settings → API
3. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`)

## Step 4: Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your credentials
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## Step 5: Setup Database

### Run the Schema

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy the contents of `database/schema.sql`
4. Paste into SQL Editor
5. Click "Run"

You should see: "Success. No rows returned"

### Verify Installation

```bash
npm run db:migrate
```

You should see:
```
✅ Table water_service_requests exists!
✅ Database is ready
```

## Step 6: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You should see the water service request form!

## Step 7: Test the Form

1. Fill out Step 1 (Contact Information)
   - Enter name, email, phone
   - Choose bill type preference

2. Fill out Step 2 (Address)
   - Enter service address
   - Choose if mailing address is different

3. Fill out Step 3 (Property & Services)
   - Select property use type
   - If rental, add landlord info
   - Choose trash/recycle cart counts
   - Select property features

4. Fill out Step 4 (Identity & Documents)
   - Enter driver's license info
   - Add date of birth
   - Add SSN (optional for testing)
   - Upload documents if needed

5. Step 5: Review & Sign
   - Review all information
   - Check acknowledgment box
   - Add signature
   - Submit!

## Step 8: View in Admin Panel

1. First, add yourself as admin:

```sql
-- In Supabase SQL Editor
INSERT INTO admins (user_id)
VALUES ('your-user-id-here');
```

2. Go to [http://localhost:3000/admin](http://localhost:3000/admin)
3. You should see your submitted application!

## Common Issues

### "Missing Supabase credentials"
- Make sure `.env.local` exists
- Check that variables are named exactly as shown
- Restart dev server after adding env vars

### "Table does not exist"
- Run the schema.sql in Supabase SQL Editor
- Make sure there were no errors
- Check that you're using the right database

### "Error connecting to Supabase"
- Verify your Project URL is correct
- Verify your anon key is correct
- Check your internet connection

### Port 3000 already in use
```bash
# Use a different port
npm run dev -- -p 3001
```

## Next Steps

### For Development:
1. Read [REPOSITORY_STRUCTURE.md](./REPOSITORY_STRUCTURE.md) to understand the codebase
2. Check [docs/implementation-checklist.md](./docs/implementation-checklist.md) for tasks
3. Review [docs/business-rules.md](./docs/business-rules.md) for logic

### For Production:
1. Setup proper encryption key for SSN
2. Configure email service (SendGrid/AWS SES)
3. Setup payment processing (Stripe/Square)
4. Enable credit check integration
5. Configure work order system integration
6. Setup monitoring and error tracking
7. Deploy to Vercel/Netlify

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests
npm test

# Format code
npm run format
```

## File Structure Quick Reference

```
tx-water-service-request/
├── app/
│   ├── actions/       # Server actions for form submission
│   ├── components/    # React components
│   ├── lib/           # Business logic (calculations)
│   └── utils/         # Utilities (validators)
├── database/
│   └── schema.sql     # Database schema
├── types/
│   └── water-service-request.ts  # TypeScript types
├── docs/              # All documentation
└── scripts/           # Setup scripts
```

## Getting Help

- **Documentation**: Check the `/docs` folder
- **Issues**: Open a GitHub issue
- **Questions**: Start a GitHub discussion

## Success! 🎉

You now have a fully functional water service request system running locally!

Next, explore the [Implementation Checklist](./docs/implementation-checklist.md) to see what features to build next.

# Onboarding Platform

Multi-tenant client onboarding platform for Berelvant, built with Next.js, React, Tailwind CSS, and Supabase.

**Built:** Feb 19, 2026  
**Deployed to:** Railway  
**Status:** Production-Ready

## Quick Start (Railway)

### 1. Connect Repository

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: onboarding platform"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/onboarding-platform
git push -u origin main
```

### 2. Deploy to Railway

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Connect your GitHub account
5. Select `onboarding-platform` repository
6. Configure environment variables (see below)
7. Click "Deploy"

### 3. Set Environment Variables in Railway

In Railway dashboard → your project → Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://ieirkjgfompuevwalzga.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NODE_ENV=production
PORT=3000
```

### 4. Set Up Supabase Database

Run the SQL schema in your Supabase project:

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin', 'manager', 'viewer')) DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  company TEXT,
  industry TEXT,
  logo_url TEXT,
  brand_color TEXT DEFAULT '#1a1a1a',
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  phone TEXT,
  address TEXT,
  status TEXT CHECK (status IN ('active', 'paused', 'completed')) DEFAULT 'active',
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workflows table
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  duration_days INT DEFAULT 30,
  status TEXT CHECK (status IN ('draft', 'active', 'archived')) DEFAULT 'draft',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  "order" INT,
  due_days_from_start INT,
  is_required BOOLEAN DEFAULT true,
  assigned_to_role TEXT CHECK (assigned_to_role IN ('client', 'team', 'both')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Client Progress table
CREATE TABLE client_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES workflows(id),
  task_id UUID REFERENCES tasks(id),
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')) DEFAULT 'pending',
  assigned_to_user UUID REFERENCES users(id),
  completed_by_user UUID REFERENCES users(id),
  completed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Team Members table
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  client_id UUID REFERENCES clients(id),
  role TEXT CHECK (role IN ('primary_contact', 'team_member', 'viewer')) DEFAULT 'team_member',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Log table
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT,
  entity_type TEXT,
  entity_id UUID,
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
```

## Architecture

- **Framework:** Next.js 14 (App Router)
- **UI:** React 18 + Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (built-in)
- **Deployment:** Railway
- **Design:** Editorial Luxury (dark, bold typography)

## File Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   ├── globals.css         # Global styles
│   ├── dashboard/
│   │   └── page.tsx        # Dashboard
│   ├── clients/
│   │   └── page.tsx        # Clients list
│   ├── workflows/
│   │   └── page.tsx        # Workflows list
│   ├── team/
│   │   └── page.tsx        # Team management
│   ├── onboard/
│   │   └── [clientId]/
│   │       └── page.tsx    # Client portal
│   └── auth/
│       └── login/
│           └── page.tsx    # Login page
├── components/
│   └── ui.tsx              # Reusable UI components
└── lib/
    └── supabase.ts         # Supabase client
```

## Development

### Install Dependencies

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

Open http://localhost:3000

### Build

```bash
npm run build
npm start
```

## Deployment Checklist

- [ ] GitHub repository created
- [ ] Railway account linked
- [ ] Environment variables set in Railway
- [ ] Supabase database schema applied
- [ ] First deployment completed
- [ ] Custom domain configured (optional)
- [ ] SSL certificate enabled (automatic)
- [ ] Monitor logs in Railway dashboard

## Environment Variables

Required for deployment:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (private) |
| `NODE_ENV` | Set to `production` |
| `PORT` | Port number (Railway sets automatically) |

## Features

- ✅ Multi-tenant client management
- ✅ Workflow automation
- ✅ Progress tracking
- ✅ Team collaboration
- ✅ Admin dashboard
- ✅ Client portal (public-facing)
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Real-time updates
- ✅ Row-level security (RLS)

## Future Enhancements

- [ ] Email notifications (SendGrid)
- [ ] Analytics & reporting
- [ ] Webhook integrations
- [ ] API for external access
- [ ] Advanced scheduling
- [ ] Document upload/storage
- [ ] Video onboarding
- [ ] Mobile app

## Cost

- **Railway:** $5/month (starter)
- **Supabase:** Free tier for 1-10 clients
- **Total:** ~$5/month

Scale to paid tiers as needed.

## Support & Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Railway Docs](https://docs.railway.app)

## Troubleshooting

### Build fails on Railway

```
Check: NODE_VERSION environment variable
Set to: 18+ (Railway default is fine)
```

### Database not connecting

```
Verify: NEXT_PUBLIC_SUPABASE_URL and keys
Check: Supabase project is active
Test: Database tables exist (run schema SQL)
```

### Styles not loading

```
Clear: Browser cache
Restart: npm run dev
Check: tailwind.config.ts paths are correct
```

---

**Built by:** Cora (Berelvant AI Systems)  
**Last Updated:** Feb 19, 2026  
**Status:** Production-Ready for Deployment

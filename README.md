# Poema

A personal interactive poetry platform. Minimalist, cinematic, ink-on-paper aesthetic.

**Stack:** Next.js 14 (App Router) · Tailwind CSS · Supabase (auth + database) · Vercel

---

## Setup

### 1. Supabase project

1. Create a free project at [supabase.com](https://supabase.com)
2. In the SQL editor, run `supabase/schema.sql` to create the tables and RLS policies
3. Optionally run `supabase/seed.sql` to populate 6 sample poems
4. Create an admin user: **Authentication → Users → Invite user** (enter your email)

### 2. Environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in your Supabase project URL and anon key.  
Find both at: **Supabase Dashboard → Settings → API**

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Pages

| Route | Description |
|---|---|
| `/` | Homepage — random floating poem, tag filter, "read me anything" button |
| `/explore` | All poems grid, filterable by mood tag |
| `/poems/[id]` | Individual poem with SEO metadata |
| `/admin` | Admin dashboard (login required) |
| `/admin/new` | Create a new poem |
| `/admin/edit/[id]` | Edit an existing poem |

---

## Admin access

Navigate to `/admin`. Sign in with the email/password you set in Supabase Auth.  
The dashboard lets you create, edit, and delete poems.

---

## Deploy to Vercel

1. Push the repo to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

---

## Future: Poet accounts + custom subdomains

The database schema already includes an `author_id` column on poems and a `profiles` table.  
When the poet accounts feature ships, users will be able to sign up, claim a subdomain  
(e.g. `yourname.poema.app`), and manage their own poems. The middleware already includes  
a subdomain detection stub (`x-poet-slug` header) ready to be wired up.

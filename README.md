# GHORPAD 2026

The official college magazine website of **MILIT - DSTSC 08**.

A full-stack editorial platform built with Next.js 14, featuring a cinematic dark design inspired by broadcast newsrooms, a role-based editorial portal, and Supabase as the backend.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Animation:** Framer Motion
- **Rich Text:** TipTap v2
- **Backend/Auth/Storage:** Supabase
- **Icons:** Lucide React
- **Particles:** tsparticles

## Getting Started

### 1. Install Dependencies

```bash
cd ghorpad-2026
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the schema SQL in Supabase SQL Editor:
   - `supabase/schema.sql` — Creates tables, RLS policies, and triggers
3. Create storage buckets in Supabase Dashboard > Storage:
   - `article-covers` (set to **public**)
   - `media` (set to **public**)
4. (Optional) Run `supabase/seed.sql` for sample data (update UUIDs to match your auth users)

### 3. Configure Environment Variables

Create `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Find these in Supabase Dashboard > Settings > API.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  page.tsx                              Landing page
  articles/[slug]/page.tsx              Article detail
  editorial/
    login/page.tsx                      Editorial login
    dashboard/page.tsx                  Dashboard
    articles/new/page.tsx               New article
    articles/[id]/edit/page.tsx         Edit article
    media/page.tsx                      Media library
    team/page.tsx                       Team management (super_editor only)
    layout.tsx                          Editorial sidebar layout

components/
  public/                               Public-facing components
  editorial/                            Dashboard components
  ui/                                   Shared design system

lib/
  supabase.ts                           Supabase client setup
  auth.ts                               Role-based auth helpers
  utils.ts                              Utility functions
  sample-data.ts                        Static sample data for dev

types/
  index.ts                              TypeScript interfaces

supabase/
  schema.sql                            Database schema + RLS
  seed.sql                              Sample data
```

## Roles

| Role           | Permissions                                        |
| -------------- | -------------------------------------------------- |
| Super Editor   | Full access: manage content, media, team members   |
| Editor         | Create, edit, publish articles; upload/delete media |
| Contributor    | Submit drafts only (no direct publish)              |

## Deployment (Vercel)

1. Push to a Git repository
2. Import in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy

## Color Palette

| Token         | Value                      |
| ------------- | -------------------------- |
| Background    | `#0a0a0a`                  |
| Surface       | `#111111` / `#1a1a1a`      |
| Accent Gold   | `#e8c84a`                  |
| Accent Red    | `#c0392b`                  |
| Text Primary  | `#f0f0f0`                  |
| Text Muted    | `#888888`                  |
| Border        | `rgba(255,255,255,0.08)`   |

## Fonts

- **Headlines:** Playfair Display (serif)
- **Body/UI:** Inter (sans-serif)
- **Labels/Tags:** JetBrains Mono (monospace)
# ghorpad-2026

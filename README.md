# Nova Dashboard

A full-stack e-commerce analytics and store management dashboard built as a frontend engineering hiring assignment.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion v11
- **Database & Auth**: Supabase (PostgreSQL + Row Level Security)
- **Language**: TypeScript
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Charts**: Recharts v3
- **Package Manager**: npm

## Features

- **Authentication** — Email/password login and sign-up via Supabase Auth. Protected routes enforced by Next.js middleware.
- **Dashboard** — KPI cards with animated count-up numbers (revenue, orders, customers, active orders). Three interactive chart types: Revenue (Bar Chart), Order Volume (Area Chart), New Customers (Line Chart) — all sourced from live Supabase data.
- **Orders** — Full data table with server-side search (debounced), column sorting, status filtering, and pagination. Skeleton loading, error states, and empty states.
- **Customers** — Same table architecture as Orders with avatar initials, customer spend, and status filtering.
- **Inventory** — Product table with category filter, status filter, low-stock highlighting, and product icon fallbacks.
- **Sidebar** — Collapsible animated sidebar (Framer Motion). Desktop: icon-only collapsed mode. Mobile: slide-in drawer overlay.
- **Theme** — Dark/light/system toggle via next-themes.
- **Responsive** — Mobile hamburger menu, adaptive layouts.

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd <project-folder>
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/seed.sql` — this creates all 4 tables and seeds them with realistic data
3. In your Supabase dashboard, go to **Project Settings → API** and copy:
   - Project URL
   - `anon` public key

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to `/auth/login`. Create an account, confirm your email, then log in to access the dashboard.

## Project Structure

```
app/
  auth/           # Login, sign-up, forgot password, email confirm
  dashboard/      # Main KPI dashboard with charts
  orders/         # Orders data table
  customers/      # Customers data table
  inventory/      # Products/inventory data table
components/
  sidebar.tsx           # Animated collapsible sidebar
  sidebar-provider.tsx  # Collapse state context
  main-content.tsx      # Animated margin wrapper
  animated-number.tsx   # Count-up animation
  page-transition.tsx   # Page fade-in wrapper
  skeleton-row.tsx      # Table loading skeleton
  ui/                   # shadcn/ui components
lib/
  supabase/       # Supabase client, server, and middleware helpers
  types.ts        # TypeScript interfaces for all DB tables
supabase/
  seed.sql        # Schema + seed data (run this in Supabase SQL editor)
```

## Database Schema

| Table              | Rows   | Key Fields |
|--------------------|--------|------------|
| `customers`        | 260    | name, email, orders_count, total_spent, status |
| `orders`           | 300    | customer_name, order_total, status, order_type |
| `products`         | 200    | name, category, unit_price, in_stock, status |
| `analytics_daily`  | 90     | date, total_sales, orders_count, new_customers |

## Assignment Requirements Coverage

| Requirement | Status |
|-------------|--------|
| Next.js App Router | ✅ |
| Tailwind CSS v4 | ✅ |
| Framer Motion animations | ✅ Sidebar collapse, page transitions, KPI stagger, count-up, row stagger |
| Supabase Auth | ✅ Login, sign-up, protected routes, logout |
| Supabase PostgreSQL | ✅ All data from live DB, server-side queries |
| Data tables with sort/filter/pagination | ✅ Orders, Customers, Inventory |
| Charts | ✅ 3 chart types (Bar, Area, Line) |
| Responsive design | ✅ Mobile sidebar drawer, adaptive grids |
| TypeScript | ✅ |

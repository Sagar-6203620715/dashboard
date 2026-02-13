# Nova Design Dashboard – Supabase Seed

This folder contains the SQL seed script used to provision realistic demo data for the Nova Design Dashboard assignment.

## Files

- `seed.sql` – Creates tables, row‑level security (RLS) policies, and inserts demo data for:
  - `customers` (≈260 rows)
  - `orders` (≈320 rows)
  - `products` (≈220 rows)
  - `analytics_daily` (90 days of metrics)

The script is **idempotent** – it uses `CREATE TABLE IF NOT EXISTS` and `ON CONFLICT DO NOTHING`, and only creates policies if they do not already exist. You can safely re‑run it during development.

## How to Run the Seed

1. Open the Supabase dashboard for your project.
2. Go to **SQL Editor**.
3. Create a new query.
4. Paste the full contents of `seed.sql` into the editor.
5. Click **Run**.

If the script is large, you can also upload it as a **Saved query** and run it from there.

## Tables Created

### `customers`

- `id` UUID PRIMARY KEY DEFAULT `gen_random_uuid()`
- `name` TEXT
- `email` TEXT UNIQUE
- `phone` TEXT
- `orders_count` INTEGER
- `total_spent` DECIMAL(10,2)
- `customer_since` TIMESTAMPTZ
- `status` `'Active' | 'Inactive'`
- `avatar_url` TEXT
- `created_at` TIMESTAMPTZ

Approximate row count: **260**.

### `orders`

- `id` UUID PRIMARY KEY DEFAULT `gen_random_uuid()`
- `order_number` TEXT UNIQUE (`ORD-00001` style)
- `customer_id` UUID REFERENCES `customers(id)`
- `customer_name` TEXT (denormalized for convenience)
- `order_date` TIMESTAMPTZ
- `order_type` `'Home Delivery' | 'Pick Up' | 'Express'`
- `tracking_id` TEXT
- `order_total` DECIMAL(10,2)
- `status` `'Completed' | 'In-Progress' | 'Pending | 'Cancelled'`
- `items_count` INTEGER
- `created_at` TIMESTAMPTZ

Approximate row count: **320**.

### `products`

- `id` UUID PRIMARY KEY DEFAULT `gen_random_uuid()`
- `name` TEXT
- `category` TEXT (`Electronics`, `Fashion`, `Home & Kitchen`, `Sports`, `Books`, `Beauty`, `Toys`, `Automotive`)
- `unit_price` DECIMAL(10,2)
- `in_stock` INTEGER
- `discount_percent` DECIMAL(5,2)
- `total_value` DECIMAL(12,2) generated from `unit_price * in_stock`
- `status` `'Published' | 'Unpublished' | 'Draft'`
- `image_url` TEXT
- `created_at` TIMESTAMPTZ

Approximate row count: **220**.

### `analytics_daily`

- `id` UUID PRIMARY KEY DEFAULT `gen_random_uuid()`
- `date` DATE UNIQUE (last 90 days)
- `total_sales` DECIMAL(12,2)
- `orders_count` INTEGER
- `new_customers` INTEGER
- `page_views` INTEGER
- `created_at` TIMESTAMPTZ

Row count: **90** (one per day).

## Row Level Security (RLS)

The seed script:

- Enables RLS on all four tables: `customers`, `orders`, `products`, `analytics_daily`.
- Creates policies (only if missing) so that the Supabase `authenticated` role can:
  - **SELECT** from all tables.
  - **INSERT**, **UPDATE**, and **DELETE** rows in all tables.

This gives your authenticated dashboard users full CRUD access to the demo data while keeping everything behind Supabase Auth.


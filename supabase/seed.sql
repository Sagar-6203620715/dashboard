-- Nova Design Dashboard seed script
-- Idempotent: safe to re-run

-- Extensions ---------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Schema -------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  orders_count INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  customer_since TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('Active', 'Inactive')) DEFAULT 'Active',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  order_date TIMESTAMPTZ DEFAULT NOW(),
  order_type TEXT CHECK (order_type IN ('Home Delivery', 'Pick Up', 'Express')) DEFAULT 'Home Delivery',
  tracking_id TEXT,
  order_total DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('Completed', 'In-Progress', 'Pending', 'Cancelled')) DEFAULT 'Pending',
  items_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  in_stock INTEGER DEFAULT 0,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  total_value DECIMAL(12,2) GENERATED ALWAYS AS (unit_price * in_stock) STORED,
  status TEXT CHECK (status IN ('Published', 'Unpublished', 'Draft')) DEFAULT 'Published',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  total_sales DECIMAL(12,2) DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  new_customers INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


WITH new_customers AS (
  SELECT
    first_name || ' ' || last_name AS name,
    LOWER(first_name || '.' || last_name || '.' || i || '@example.com') AS email,
    '+1-555-' || LPAD((1000 + (i % 9000))::text, 4, '0') AS phone,
    (FLOOR(random() * 40))::int AS orders_count,
    ROUND((50 + random() * 24950)::numeric, 2) AS total_spent,
    NOW() - (FLOOR(random() * 365)) * INTERVAL '1 day' AS customer_since,
    CASE WHEN random() < 0.8 THEN 'Active' ELSE 'Inactive' END AS status,
    NULL::text AS avatar_url
  FROM generate_series(1, 260) AS i
  JOIN LATERAL (
    SELECT
      (ARRAY[
        'Ava','Olivia','Emma','Sophia','Isabella','Mia','Charlotte','Amelia','Harper','Evelyn',
        'Liam','Noah','Oliver','Elijah','William','James','Benjamin','Lucas','Henry','Alexander',
        'Chloe','Grace','Victoria','Hannah','Natalie','Zoe','Stella','Aurora','Savannah','Penelope'
      ])[(1 + (FLOOR(random() * 30))::int)] AS first_name,
      (ARRAY[
        'Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez',
        'Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee',
        'Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson'
      ])[(1 + (FLOOR(random() * 30))::int)] AS last_name
  ) AS names ON TRUE
)
INSERT INTO customers (name, email, phone, orders_count, total_spent, customer_since, status, avatar_url)
SELECT nc.*
FROM new_customers nc
WHERE NOT EXISTS (
  SELECT 1 FROM customers c WHERE c.email = nc.email
);

-- Ensure at least 250 customers
-- (generate_series(1,260) above already targets 260 rows)


WITH new_products AS (
  SELECT
    CASE category
      WHEN 'Electronics' THEN (ARRAY[
        'Sony WH-1000XM5 Headphones',
        'Apple iPhone 16 Pro',
        'Samsung 4K QLED TV 55"',
        'Dell XPS 15 Laptop',
        'Logitech MX Master 4 Mouse'
      ])[1 + (FLOOR(random() * 5))::int]
      WHEN 'Fashion' THEN (ARRAY[
        'Classic Denim Jacket',
        'Slim Fit Chino Pants',
        'Leather Chelsea Boots',
        'Cotton Crewneck T-Shirt',
        'Wool Blend Overcoat'
      ])[1 + (FLOOR(random() * 5))::int]
      WHEN 'Home & Kitchen' THEN (ARRAY[
        'Non-Stick Cookware Set',
        'Stainless Steel Knife Block',
        'Memory Foam Pillow',
        'Electric Kettle 1.7L',
        'Air Purifier HEPA'
      ])[1 + (FLOOR(random() * 5))::int]
      WHEN 'Sports' THEN (ARRAY[
        'Running Shoes',
        'Adjustable Dumbbell Set',
        'Yoga Mat Pro',
        'Fitness Smartwatch',
        'Cycling Helmet'
      ])[1 + (FLOOR(random() * 5))::int]
      WHEN 'Books' THEN (ARRAY[
        'Modern JavaScript Guide',
        'Design Systems Handbook',
        'Clean Architecture',
        'Product Management Essentials',
        'Data Visualization in Practice'
      ])[1 + (FLOOR(random() * 5))::int]
      WHEN 'Beauty' THEN (ARRAY[
        'Hydrating Face Serum',
        'SPF 50 Sunscreen',
        'Matte Lipstick Set',
        'Vitamin C Cleanser',
        'Hair Repair Mask'
      ])[1 + (FLOOR(random() * 5))::int]
      WHEN 'Toys' THEN (ARRAY[
        'STEM Robotics Kit',
        'Building Blocks Set',
        'Remote Control Car',
        'Art & Craft Box',
        'Plush Animal Friend'
      ])[1 + (FLOOR(random() * 5))::int]
      ELSE (ARRAY[
        'Car Phone Mount',
        'Portable Tire Inflator',
        'Car Vacuum Cleaner',
        'Leather Steering Wheel Cover',
        'Dash Cam Pro'
      ])[1 + (FLOOR(random() * 5))::int]
    END AS name,
    category,
    ROUND((9.99 + random() * 399.99)::numeric, 2) AS unit_price,
    (FLOOR(random() * 250))::int AS in_stock,
    ROUND((CASE WHEN random() < 0.4 THEN random() * 40 ELSE 0 END)::numeric, 2) AS discount_percent,
    CASE
      WHEN random() < 0.75 THEN 'Published'
      WHEN random() < 0.9 THEN 'Unpublished'
      ELSE 'Draft'
    END AS status,
    NULL::text AS image_url
  FROM (
    SELECT (ARRAY[
      'Electronics','Fashion','Home & Kitchen','Sports',
      'Books','Beauty','Toys','Automotive'
    ])[(1 + (FLOOR(random() * 8))::int)] AS category,
           i
    FROM generate_series(1, 220) AS i
  ) AS base
)
INSERT INTO products (name, category, unit_price, in_stock, discount_percent, status, image_url)
SELECT np.*
FROM new_products np
WHERE NOT EXISTS (
  SELECT 1 FROM products p WHERE p.name = np.name AND p.category = np.category
);

-- Seed orders --------------------------------------------------------------

WITH base_orders AS (
  SELECT
    i,
    c.id AS customer_id,
    c.name AS customer_name,
    NOW() - (FLOOR(random() * 90)) * INTERVAL '1 day' AS order_date,
    CASE
      WHEN random() < 0.6 THEN 'Home Delivery'
      WHEN random() < 0.85 THEN 'Pick Up'
      ELSE 'Express'
    END AS order_type,
    ROUND((9.99 + random() * 2490.00)::numeric, 2) AS order_total,
    CASE
      WHEN r < 0.7 THEN 'Completed'
      WHEN r < 0.85 THEN 'In-Progress'
      WHEN r < 0.95 THEN 'Pending'
      ELSE 'Cancelled'
    END AS status,
    (FLOOR(1 + random() * 6))::int AS items_count
  FROM generate_series(1, 320) AS i
  JOIN LATERAL (
    SELECT id, name
    FROM customers
    ORDER BY random()
    LIMIT 1
  ) AS c ON TRUE
  JOIN LATERAL (
    SELECT random() AS r
  ) AS dist ON TRUE
)
INSERT INTO orders (
  order_number,
  customer_id,
  customer_name,
  order_date,
  order_type,
  tracking_id,
  order_total,
  status,
  items_count
)
SELECT
  'ORD-' || LPAD(i::text, 5, '0') AS order_number,
  customer_id,
  customer_name,
  order_date,
  order_type,
  'TRK-' || LPAD((100000 + i)::text, 6, '0') AS tracking_id,
  order_total,
  status,
  items_count
FROM base_orders
WHERE NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.order_number = 'ORD-' || LPAD(base_orders.i::text, 5, '0')
);

-- Seed analytics_daily (last 90 days) -------------------------------------

WITH series AS (
  SELECT
    d::date AS date,
    EXTRACT(DOW FROM d) AS dow -- 0=Sunday, 6=Saturday
  FROM generate_series(
    CURRENT_DATE - INTERVAL '89 days',
    CURRENT_DATE,
    INTERVAL '1 day'
  ) AS d
),
metrics AS (
  SELECT
    date,
    -- base trend: start lower, gradually increase
    ROUND(
      (
        5000
        + (ROW_NUMBER() OVER (ORDER BY date) * 80)
        + (CASE WHEN dow IN (0,6) THEN -1200 ELSE 0 END)
        + (random() * 1500 - 750)
      )::numeric,
      2
    ) AS total_sales,

    GREATEST(
      0,
      (60
       + (ROW_NUMBER() OVER (ORDER BY date) * 0.8)
       + (CASE WHEN dow IN (0,6) THEN -15 ELSE 0 END)
       + (random() * 20 - 10)
      )::int
    ) AS orders_count,
    GREATEST(
      0,
      (8
       + (ROW_NUMBER() OVER (ORDER BY date) * 0.15)
       + (random() * 5 - 2)
      )::int
    ) AS new_customers,
    GREATEST(
      0,
      (800
       + (ROW_NUMBER() OVER (ORDER BY date) * 15)
       + (CASE WHEN dow IN (0,6) THEN -150 ELSE 0 END)
       + (random() * 300 - 150)
      )::int
    ) AS page_views
  FROM series
)
INSERT INTO analytics_daily (date, total_sales, orders_count, new_customers, page_views)
SELECT
  date,
  GREATEST(total_sales, 0)::DECIMAL(12,2),
  orders_count,
  new_customers,
  page_views
FROM metrics
WHERE NOT EXISTS (
  SELECT 1 FROM analytics_daily a WHERE a.date = metrics.date
);

-- Row Level Security -------------------------------------------------------

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;

-- Policies: authenticated users can read all data

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'customers' AND policyname = 'Authenticated users can read customers'
  ) THEN
    CREATE POLICY "Authenticated users can read customers"
      ON customers FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Authenticated users can read orders'
  ) THEN
    CREATE POLICY "Authenticated users can read orders"
      ON orders FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Authenticated users can read products'
  ) THEN
    CREATE POLICY "Authenticated users can read products"
      ON products FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'analytics_daily' AND policyname = 'Authenticated users can read analytics'
  ) THEN
    CREATE POLICY "Authenticated users can read analytics"
      ON analytics_daily FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Policies: authenticated users full CRUD ----------------------------------

DO $$
BEGIN
  -- Customers
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'customers' AND policyname = 'Authenticated users can insert customers'
  ) THEN
    CREATE POLICY "Authenticated users can insert customers"
      ON customers FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'customers' AND policyname = 'Authenticated users can update customers'
  ) THEN
    CREATE POLICY "Authenticated users can update customers"
      ON customers FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'customers' AND policyname = 'Authenticated users can delete customers'
  ) THEN
    CREATE POLICY "Authenticated users can delete customers"
      ON customers FOR DELETE
      TO authenticated
      USING (true);
  END IF;

  -- Orders
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Authenticated users can insert orders'
  ) THEN
    CREATE POLICY "Authenticated users can insert orders"
      ON orders FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Authenticated users can update orders'
  ) THEN
    CREATE POLICY "Authenticated users can update orders"
      ON orders FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Authenticated users can delete orders'
  ) THEN
    CREATE POLICY "Authenticated users can delete orders"
      ON orders FOR DELETE
      TO authenticated
      USING (true);
  END IF;

  -- Products
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Authenticated users can insert products'
  ) THEN
    CREATE POLICY "Authenticated users can insert products"
      ON products FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Authenticated users can update products'
  ) THEN
    CREATE POLICY "Authenticated users can update products"
      ON products FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Authenticated users can delete products'
  ) THEN
    CREATE POLICY "Authenticated users can delete products"
      ON products FOR DELETE
      TO authenticated
      USING (true);
  END IF;

  -- Analytics
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'analytics_daily' AND policyname = 'Authenticated users can insert analytics'
  ) THEN
    CREATE POLICY "Authenticated users can insert analytics"
      ON analytics_daily FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'analytics_daily' AND policyname = 'Authenticated users can update analytics'
  ) THEN
    CREATE POLICY "Authenticated users can update analytics"
      ON analytics_daily FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'analytics_daily' AND policyname = 'Authenticated users can delete analytics'
  ) THEN
    CREATE POLICY "Authenticated users can delete analytics"
      ON analytics_daily FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;


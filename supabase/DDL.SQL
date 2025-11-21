-- Ensure extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 0) Ensure auth schema exists (Supabase provides auth.users)
-- (No-op here; assumes auth.users exists)

-- 1) Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid NOT NULL PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  name text,
  role text NOT NULL CHECK (role IN ('shopper', 'vendor', 'admin')),
  phone_number text,
  phone_verified boolean DEFAULT false NOT NULL,
  id_verified boolean DEFAULT false NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_profiles_role' AND n.nspname = 'public'
  ) THEN
    EXECUTE 'CREATE INDEX idx_profiles_role ON public.profiles (role)';
  END IF;
END$$;

-- 2) Artists
CREATE TABLE IF NOT EXISTS public.artists (
  artist_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  genre text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_artists_name' AND n.nspname = 'public'
  ) THEN
    EXECUTE 'CREATE INDEX idx_artists_name ON public.artists (lower(name))';
  END IF;
END$$;

-- 3) User follows artist
CREATE TABLE IF NOT EXISTS public.user_follows_artist (
  follow_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  artist_id uuid NOT NULL REFERENCES public.artists (artist_id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, artist_id)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_user_follows_artist_user' AND n.nspname = 'public'
  ) THEN
    EXECUTE 'CREATE INDEX idx_user_follows_artist_user ON public.user_follows_artist (user_id)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_user_follows_artist_artist' AND n.nspname = 'public'
  ) THEN
    EXECUTE 'CREATE INDEX idx_user_follows_artist_artist ON public.user_follows_artist (artist_id)';
  END IF;
END$$;

-- 4) Events
CREATE TABLE IF NOT EXISTS public.events (
  event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  artist_id uuid NOT NULL REFERENCES public.artists (artist_id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  venue_name text NOT NULL,
  venue_address text,
  city text NOT NULL,
  state text NOT NULL,
  start_datetime timestamptz NOT NULL,
  min_price numeric(10,2) NOT NULL CHECK (min_price >= 0),
  status text NOT NULL CHECK (status IN ('draft','pending_approval','approved','rejected','cancelled')),
  competitor_lowest_price numeric(10,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_events_vendor' AND n.nspname = 'public'
  ) THEN
    EXECUTE 'CREATE INDEX idx_events_vendor ON public.events (vendor_id)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_events_artist' AND n.nspname = 'public'
  ) THEN
    EXECUTE 'CREATE INDEX idx_events_artist ON public.events (artist_id)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_events_start_datetime' AND n.nspname = 'public'
  ) THEN
    EXECUTE 'CREATE INDEX idx_events_start_datetime ON public.events (start_datetime)';
  END IF;
END$$;

-- 5) Ticket tiers
CREATE TABLE IF NOT EXISTS public.ticket_tiers (
  ticket_tier_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events (event_id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  fee numeric(10,2) NOT NULL DEFAULT 0 CHECK (fee >= 0),
  quantity_total integer NOT NULL DEFAULT 0 CHECK (quantity_total >= 0),
  quantity_sold integer NOT NULL DEFAULT 0 CHECK (quantity_sold >= 0),
  is_lowtix_discount boolean NOT NULL DEFAULT false,
  is_transferable boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_ticket_tiers_event' AND n.nspname = 'public'
  ) THEN
    EXECUTE 'CREATE INDEX idx_ticket_tiers_event ON public.ticket_tiers (event_id)';
  END IF;
END$$;

-- 6) Orders
CREATE TABLE IF NOT EXISTS public.orders (
  order_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  total_price numeric(12,2) NOT NULL CHECK (total_price >= 0),
  payment_method text NOT NULL CHECK (payment_method IN ('apple_pay','afterpay','card')),
  status text NOT NULL CHECK (status IN ('pending','paid','cancelled','refunded','partially_refunded')),
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_orders_user' AND n.nspname = 'public'
  ) THEN
    EXECUTE 'CREATE INDEX idx_orders_user ON public.orders (user_id)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_orders_status' AND n.nspname = 'public'
  ) THEN
    EXECUTE 'CREATE INDEX idx_orders_status ON public.orders (status)';
  END IF;
END$$;

-- 7) Order items
CREATE TABLE IF NOT EXISTS public.order_items (
  order_item_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders (order_id) ON DELETE CASCADE,
  ticket_tier_id uuid NOT NULL REFERENCES public.ticket_tiers (ticket_tier_id),
  -- Add event_id to order_items to make vendor lookup straightforward.
  event_id uuid,
  quantity integer NOT NULL CHECK (quantity >= 1),
  unit_price numeric(10,2) NOT NULL CHECK (unit_price >= 0),
  line_total numeric(12,2) NOT NULL CHECK (line_total >= 0)
);

-- Add foreign key on event_id only if column exists and constraint not present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'order_items' AND column_name = 'event_id'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_schema = 'public' AND tc.table_name = 'order_items' AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'event_id'
    ) THEN
      BEGIN
        -- Add FK referencing events
        ALTER TABLE public.order_items
        ADD CONSTRAINT fk_order_items_event FOREIGN KEY (event_id) REFERENCES public.events (event_id) ON DELETE SET NULL;
      EXCEPTION WHEN duplicate_object THEN
        -- ignore if concurrently created
      END;
    END IF;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_order_items_order' AND n.nspname = 'public'
  ) THEN
    EXECUTE 'CREATE INDEX idx_order_items_order ON public.order_items (order_id)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_order_items_ticket_tier' AND n.nspname = 'public'
  ) THEN
    EXECUTE 'CREATE INDEX idx_order_items_ticket_tier ON public.order_items (ticket_tier_id)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_order_items_eventid_orderid' AND n.nspname = 'public'
  ) THEN
    EXECUTE 'CREATE INDEX idx_order_items_eventid_orderid ON public.order_items (order_id, ticket_tier_id)';
  END IF;
END$$;

-- 8) Queue reservations
CREATE TABLE IF NOT EXISTS public.queue_reservations (
  queue_reservation_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events (event_id) ON DELETE CASCADE,
  queue_position integer NOT NULL CHECK (queue_position >= 1),
  status text NOT NULL CHECK (status IN ('waiting','active','expired')),
  window_start timestamptz NOT NULL,
  window_end timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT queue_window_valid CHECK (window_end > window_start)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_queue_reservations_event' AND n.nspname = 'public'
  ) THEN
    EXECUTE 'CREATE INDEX idx_queue_reservations_event ON public.queue_reservations (event_id)';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_queue_reservations_user' AND n.nspname = 'public'
  ) THEN
    EXECUTE 'CREATE INDEX idx_queue_reservations_user ON public.queue_reservations (user_id)';
  END IF;
END$$;

-- 9) Trigger to keep events.updated_at current
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_updated_at ON public.events;
CREATE TRIGGER trg_set_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 10) Populate or keep event_id on order_items consistent (helper update)
-- If event_id is null for existing order_items, try to set it from ticket_tiers.
DO $$
BEGIN
  -- Only perform if column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'order_items' AND column_name = 'event_id'
  ) THEN
    UPDATE public.order_items oi
    SET event_id = tt.event_id
    FROM public.ticket_tiers tt
    WHERE oi.ticket_tier_id = tt.ticket_tier_id
      AND oi.event_id IS NULL;
  END IF;
END$$;

-- 11) RLS: profiles
-- Enable RLS (no-op if already enabled)
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop policies if exist (safe) and recreate
DROP POLICY IF EXISTS "profiles_is_owner" ON public.profiles;
CREATE POLICY "profiles_is_owner" ON public.profiles
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "profiles_admin_read" ON public.profiles;
CREATE POLICY "profiles_admin_read" ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

-- 12) RLS: orders
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_user_can_crud_own" ON public.orders;
CREATE POLICY "orders_user_can_crud_own" ON public.orders
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Vendor read policy:
-- This policy allows authenticated users to SELECT orders if they are vendor for ANY event referenced by the order's items.
-- We use a safe EXISTS subquery joining order_items -> ticket_tiers -> events.
DROP POLICY IF EXISTS "orders_vendor_read" ON public.orders;
CREATE POLICY "orders_vendor_read" ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    (
      auth.jwt() ->> 'role' = 'admin'
    )
    OR
    EXISTS (
      SELECT 1
      FROM public.order_items oi
      JOIN public.ticket_tiers tt ON tt.ticket_tier_id = oi.ticket_tier_id
      JOIN public.events e ON e.event_id = tt.event_id
      WHERE oi.order_id = public.orders.order_id
        AND e.vendor_id = auth.uid()
    )
  );


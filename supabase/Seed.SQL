-- ============================================
-- RESEED SCRIPT FOR LOWTIX DATABASE
-- Clears data & repopulates only public tables.
-- NEVER touch auth.users!
-- ============================================

-- ============================================
-- 🔥 1) TRUNCATE TABLES IN SAFE ORDER
-- ============================================
TRUNCATE TABLE
  public.queue_reservations,
  public.order_items,
  public.orders,
  public.ticket_tiers,
  public.events,
  public.user_follows_artist,
  public.artists,
  public.profiles
RESTART IDENTITY CASCADE;

-- ============================================
-- 👤 2) PROFILES (USERS EXPECTED TO EXIST IN auth.users)
-- ============================================

INSERT INTO public.profiles (user_id, name, role, phone_number, phone_verified, id_verified)
VALUES
  ('f640df1f-c341-4837-ad7f-a07e9ab774f2',    'Alice Johnson',    'shopper', '555-1234', true, false),
  ('f23227f6-81ca-4480-8d82-a06ee9d6fa5b',    'Vendor Company',   'vendor',  '555-5678', true, true),
  ('2a837498-8c74-4f53-8f60-1ab0fd11214a',    'Chris Lee',        'shopper', '555-9876', false, false)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 🎤 3) ARTISTS
-- ============================================

INSERT INTO public.artists (artist_id, name, genre, image_url)
VALUES
  (gen_random_uuid(), 'The Midnight Owls', 'Indie Rock', 'https://example.com/owl.jpg'),
  (gen_random_uuid(), 'DJ Pulsewave',      'EDM',        'https://example.com/dj.jpg'),
  (gen_random_uuid(), 'Harmony Trio',      'Pop',        'https://example.com/pop.jpg');

-- ============================================
-- ⭐ 4) USER FOLLOWS ARTIST
-- ============================================

INSERT INTO public.user_follows_artist (user_id, artist_id)
SELECT 'f640df1f-c341-4837-ad7f-a07e9ab774f2', artist_id
FROM public.artists LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.user_follows_artist (user_id, artist_id)
SELECT '2a837498-8c74-4f53-8f60-1ab0fd11214a', artist_id
FROM public.artists OFFSET 1 LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================
-- 🎫 5) EVENTS
-- ============================================

-- 🦉 Indie Concert
WITH art AS (
  SELECT artist_id FROM public.artists LIMIT 1
)
INSERT INTO public.events
(event_id, vendor_id, artist_id, name, description, category, venue_name, venue_address,
 city, state, start_datetime, min_price, status, competitor_lowest_price)
SELECT
  gen_random_uuid(),
  'f23227f6-81ca-4480-8d82-a06ee9d6fa5b',
  art.artist_id,
  'Midnight Owls Live',
  'A live indie rock performance.',
  'concert',
  'Sunset Arena',
  '101 Music Way',
  'Los Angeles', 'CA',
  now() + interval '7 days',
  25.00,
  'approved',
  22.00
FROM art;

-- 🎧 EDM Party
WITH art AS (
  SELECT artist_id FROM public.artists OFFSET 1 LIMIT 1
)
INSERT INTO public.events
(event_id, vendor_id, artist_id, name, description, category, venue_name, city, state,
 start_datetime, min_price, status)
SELECT
  gen_random_uuid(),
  'f23227f6-81ca-4480-8d82-a06ee9d6fa5b',
  art.artist_id,
  'DJ Pulsewave EDM Party',
  'High-energy EDM show.',
  'festival',
  'Neon Dome',
  'Las Vegas', 'NV',
  now() + interval '14 days',
  40.00,
  'approved'
FROM art;

-- ============================================
-- 💵 6) TICKET TIERS
-- ============================================

-- Event 1 tiers
INSERT INTO public.ticket_tiers (event_id, name, price, fee, quantity_total, quantity_sold, is_lowtix_discount)
SELECT event_id, 'General Admission', 30.00, 3.00, 200, 15, false
FROM public.events LIMIT 1;

INSERT INTO public.ticket_tiers (event_id, name, price, fee, quantity_total, quantity_sold, is_lowtix_discount)
SELECT event_id, 'VIP', 75.00, 5.00, 50, 5, true
FROM public.events LIMIT 1;

-- Event 2 tier
INSERT INTO public.ticket_tiers (event_id, name, price, fee, quantity_total, quantity_sold)
SELECT event_id, 'Floor Access', 55.00, 4.00, 150, 10
FROM public.events OFFSET 1 LIMIT 1;

-- ============================================
-- 🧾 7) ORDERS
-- ============================================

INSERT INTO public.orders (order_id, user_id, total_price, payment_method, status, paid_at)
VALUES
  (gen_random_uuid(), 'f640df1f-c341-4837-ad7f-a07e9ab774f2', 150.00, 'apple_pay', 'paid', now()),
  (gen_random_uuid(), '2a837498-8c74-4f53-8f60-1ab0fd11214a', 30.00,  'card',      'paid', now());

-- ============================================
-- 🎟 8) ORDER ITEMS
-- ============================================

-- Order 1: VIP x2
INSERT INTO public.order_items (order_id, ticket_tier_id, event_id, quantity, unit_price, line_total)
SELECT o.order_id, t.ticket_tier_id, t.event_id, 2, t.price, t.price * 2
FROM public.orders o
JOIN public.ticket_tiers t ON t.name = 'VIP'
LIMIT 1;

-- Order 2: GA x1
INSERT INTO public.order_items (order_id, ticket_tier_id, event_id, quantity, unit_price, line_total)
SELECT o.order_id, t.ticket_tier_id, t.event_id, 1, t.price, t.price
FROM public.orders o
JOIN public.ticket_tiers t ON t.name = 'General Admission'
OFFSET 1 LIMIT 1;

-- ============================================
-- ⏳ 9) QUEUE RESERVATIONS
-- ============================================

INSERT INTO public.queue_reservations (user_id, event_id, queue_position, status, window_start, window_end)
SELECT
  'f640df1f-c341-4837-ad7f-a07e9ab774f2',
  event_id, 1, 'waiting', now(), now() + interval '10 minutes'
FROM public.events LIMIT 1;

INSERT INTO public.queue_reservations (user_id, event_id, queue_position, status, window_start, window_end)
SELECT
  '2a837498-8c74-4f53-8f60-1ab0fd11214a',
  event_id, 2, 'active', now(), now() + interval '10 minutes'
FROM public.events OFFSET 1 LIMIT 1;

-- ============================================
-- 🎉 DONE!
-- ============================================

INSERT INTO public.profiles (user_id, name, role, phone_number)
VALUES (
  '2a837498-8c74-4f53-8f60-1ab0fd11214a', 
  'Test User',
  'shopper',
  '555-123-4444'
);



SELECT * FROM public.profiles;
SELECT * FROM public.profiles WHERE user_id = '2a837498-8c74-4f53-8f60-1ab0fd11214a';



UPDATE public.profiles
SET phone_verified = TRUE
WHERE user_id = '2a837498-8c74-4f53-8f60-1ab0fd11214a';



DELETE FROM public.profiles
WHERE user_id = '2a837498-8c74-4f53-8f60-1ab0fd11214a';


INSERT INTO public.artists (name, genre, image_url)
VALUES ('The Sample Band', 'Rock', 'https://example.com/img.jpg')
RETURNING artist_id;


SELECT * FROM public.artists;


UPDATE public.artists
SET genre = 'Alternative Rock'
WHERE name = 'The Sample Band';


DELETE FROM public.artists
WHERE name = 'The Sample Band';




INSERT INTO public.user_follows_artist (user_id, artist_id)
VALUES (
  '2a837498-8c74-4f53-8f60-1ab0fd11214a',
  (SELECT artist_id FROM public.artists WHERE name='The Sample Band')
);


SELECT * FROM public.user_follows_artist;


DELETE FROM public.user_follows_artist
WHERE user_id = '2a837498-8c74-4f53-8f60-1ab0fd11214a';



INSERT INTO public.events (
    vendor_id, artist_id, name, description, category,
    venue_name, venue_address, city, state,
    start_datetime, min_price, status
)
VALUES (
    '2a837498-8c74-4f53-8f60-1ab0fd11214a',
    (SELECT artist_id FROM public.artists LIMIT 1),
    'Sample Concert',
    'This is a test event.',
    'Concert',
    'Nanjing Hall',
    '123 Main St',
    'Nanjing',
    'NJ',
    NOW() + INTERVAL '5 days',
    25.00,
    'approved'
)
RETURNING event_id;



SELECT * FROM public.events;


UPDATE public.events
SET min_price = 30.00
WHERE name = 'Sample Concert';

DELETE FROM public.events
WHERE name = 'Sample Concert';


INSERT INTO public.ticket_tiers (
    event_id, name, price, fee, quantity_total
)
VALUES (
    (SELECT event_id FROM public.events WHERE name='Sample Concert'),
    'General Admission',
    40.00,
    5.00,
    100
)
RETURNING ticket_tier_id;


SELECT * FROM public.ticket_tiers;


UPDATE public.ticket_tiers
SET price = 45.00
WHERE name = 'General Admission';


DELETE FROM public.ticket_tiers
WHERE name = 'General Admission';


INSERT INTO public.orders (user_id, total_price, payment_method, status)
VALUES (
  '2a837498-8c74-4f53-8f60-1ab0fd11214a',
  50.00,
  'apple_pay',
  'pending'
)
RETURNING order_id;



SELECT * FROM public.orders;



UPDATE public.orders
SET status = 'paid', paid_at = NOW()
WHERE status = 'pending';


DELETE FROM public.orders
WHERE status = 'paid';


INSERT INTO public.order_items (
    order_id, ticket_tier_id, event_id, quantity, unit_price, line_total
)
VALUES (
    (SELECT order_id FROM public.orders LIMIT 1),
    (SELECT ticket_tier_id FROM public.ticket_tiers LIMIT 1),
    (SELECT event_id FROM public.events LIMIT 1),
    2,
    45.00,
    90.00
);


SELECT * FROM public.order_items;


UPDATE public.order_items
SET quantity = 3,
    line_total = 135.00
WHERE order_id = (SELECT order_id FROM public.orders LIMIT 1);


DELETE FROM public.order_items
WHERE order_id = (SELECT order_id FROM public.orders LIMIT 1);



INSERT INTO public.queue_reservations (
  user_id, event_id, queue_position, status, window_start, window_end
)
VALUES (
  '2a837498-8c74-4f53-8f60-1ab0fd11214a',
  (SELECT event_id FROM public.events LIMIT 1),
  1,
  'waiting',
  NOW(),
  NOW() + INTERVAL '10 minutes'
)
RETURNING queue_reservation_id;


SELECT * FROM public.queue_reservations;


UPDATE public.queue_reservations
SET status = 'active'
WHERE status = 'waiting';


DELETE FROM public.queue_reservations
WHERE status = 'expired';







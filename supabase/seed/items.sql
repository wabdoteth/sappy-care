insert into public.items (id, sku, name, description, category, price_petals, metadata)
values
  (gen_random_uuid(), 'palette_sky', 'Sky Palette', 'Soft blue theme with airy gradients.', 'palette', 0, '{"palette_id":"sky"}'),
  (gen_random_uuid(), 'palette_blush', 'Blush Palette', 'Warm blush tones for gentle focus.', 'palette', 120, '{"palette_id":"blush"}'),
  (gen_random_uuid(), 'palette_mint', 'Mint Palette', 'Fresh mint tones for calm resets.', 'palette', 120, '{"palette_id":"mint"}'),
  (gen_random_uuid(), 'sticker_sparkle', 'Sparkle Sticker', 'A tiny sparkle for small wins.', 'sticker', 40, '{"sticker":true}'),
  (gen_random_uuid(), 'halo_cloud', 'Cloud Halo', 'A soft halo that floats above your companion.', 'accessory', 80, '{"slot":"head"}');

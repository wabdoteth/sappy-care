insert into public.story_cards (
  id,
  title,
  body,
  choice_a_text,
  choice_b_text,
  choice_a_trait_deltas,
  choice_b_trait_deltas,
  rarity
)
values
  (
    gen_random_uuid(),
    'Quiet Morning',
    'A pale sunrise slips through the curtains. The day feels open and quiet.',
    'Step outside and breathe the cool air.',
    'Stay cozy and stretch for a minute.',
    '{"calm": 1, "curiosity": 1}',
    '{"rest": 1, "calm": 1}',
    'common'
  ),
  (
    gen_random_uuid(),
    'Soft Focus',
    'A small task is waiting, but your mind is foggy. You can begin gently.',
    'Start with five slow breaths, then begin.',
    'Make a tiny checklist before you start.',
    '{"focus": 1, "patience": 1}',
    '{"focus": 1, "clarity": 1}',
    'common'
  ),
  (
    gen_random_uuid(),
    'Kind Note',
    'A friend crosses your mind. You can send warmth without needing the perfect words.',
    'Send a short check-in message.',
    'Hold them in a quiet wish for today.',
    '{"connection": 1}',
    '{"empathy": 1}',
    'uncommon'
  );

-- Anjuvi Price Book: run this ONCE in the Neon SQL Editor.
-- Creates the suits table and adds the first 14 suits.

create table if not exists suits (
  id          serial primary key,
  num         integer not null unique,
  name        text not null default '',
  cp          integer not null,
  sp          integer not null,
  online_sp   integer,
  online_cost integer,
  photo_url   text,
  sold        boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

insert into suits (num, name, cp, sp, photo_url) values
  (1,  'Green floral print (XL)',        650, 850,  '/photos/31f4d25f52b9aeec.jpg'),
  (2,  'Brown moti work',                870, 1500, '/photos/c6d66c17cc5b1bd1.jpg'),
  (3,  'Everyday Elegance pure cotton',  650, 1600, '/photos/81730875ddf0e600.jpg'),
  (4,  'D.No 1449 Chanderi (blue/purple)', 845, 1650, '/photos/ce1511152f17556f.jpg'),
  (5,  'Viona D.No 2004 (white)',        695, 1200, '/photos/fdcc0bee87fe90f1.jpg'),
  (6,  'Z-Y-N-A teal (XXL)',             930, 1550, '/photos/16120bfa6b671255.jpg'),
  (7,  'D.No 376 combo',                 775, 1250, '/photos/253eaa0e99c3beea.jpg'),
  (8,  'Black mirror work',              630, 1600, '/photos/2c6815f77a15739a.jpg'),
  (9,  'Lavender floral (XXL)',          1195, 1600, '/photos/1329dc5720456326.jpg'),
  (10, 'D.No 1374 Chanderi green',       845, 1500, '/photos/303bb1f823d06e40.jpg'),
  (11, 'Pink embroidery (M)',            1195, 1750, '/photos/94e135d29bc1ba47.jpg'),
  (12, 'Cream V-neck (XXL)',             895, 1200, '/photos/5d043124c9b64fb8.jpg'),
  (13, 'Light pink (M)',                 1095, 1800, '/photos/92be4ba520931cd3.jpg'),
  (14, 'Kaneeka by Kasturi green (XXL)', 1095, 1950, '/photos/184e3bfa59460717.jpg')
on conflict (num) do nothing;

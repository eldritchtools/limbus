CREATE TYPE target_type_enum AS ENUM (
  'build',
  'collection',
  'md_plan',
  'fixed'
);

CREATE TABLE fixed_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL
);

INSERT INTO fixed_pages (slug) VALUES ('daily-random');
CREATE TYPE target_type_enum AS ENUM (
  'build',
  'collection',
  'md_plan',
  'fixed',
  'encounter'
);

CREATE TABLE fixed_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL
);

INSERT INTO fixed_pages (slug) VALUES ('daily-random');

CREATE TYPE encounter_category_enum AS ENUM (
  'story',
  'md',
  'reflectrial'
);

CREATE TABLE encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category encounter_category_enum NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

INSERT INTO encounters (category, slug) VALUES ('reflectrial'::encounter_category_enum, '9.5-1');
CREATE TABLE page_metadata (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL
);

alter table page_metadata enable row level security;

create policy "allow reads"
on page_metadata
for select
using (true);

CREATE OR REPLACE VIEW target_metadata AS
SELECT
  'build'::target_type_enum AS target_type,
  id AS target_id,
  title
FROM builds
UNION ALL
SELECT
  'collection'::target_type_enum,
  id,
  title
FROM collections
UNION ALL
SELECT
  'md_plan'::target_type_enum,
  id,
  title
FROM md_plans
UNION ALL
SELECT
  'fixed'::target_type_enum,
  id,
  slug AS title
FROM fixed_pages
UNION ALL
SELECT
  'encounter'::target_type_enum,
  id,
  category || '|' || slug AS title
FROM encounters;
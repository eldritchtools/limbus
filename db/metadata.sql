CREATE TABLE page_metadata (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL
);

alter table page_metadata enable row level security;

create policy "allow reads"
on page_metadata
for select
using (true);
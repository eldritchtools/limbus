CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE image_attachments (
  image_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  position INT NOT NULL DEFAULT 0,

  PRIMARY KEY (image_id, target_type, target_id),

  FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE
);

CREATE INDEX idx_image_attachments_target
ON image_attachments(target_type, target_id, position);

CREATE INDEX idx_images_created_at
ON images(created_at);

ALTER TABLE images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert images"
ON images
FOR INSERT
WITH CHECK (true);

CREATE POLICY "read images"
ON images
FOR SELECT
USING (true);

CREATE POLICY "no direct image updates"
ON images
FOR UPDATE
USING (false);

CREATE POLICY "no direct delete images"
ON images
FOR DELETE
USING (false);

ALTER TABLE image_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert attachments"
ON image_attachments
FOR INSERT
WITH CHECK (true);

CREATE POLICY "read attachments"
ON image_attachments
FOR SELECT
USING (true);

CREATE POLICY "no direct update attachments"
ON image_attachments
FOR UPDATE
USING (false);

CREATE POLICY "no direct delete attachments"
ON image_attachments
FOR DELETE
USING (false);
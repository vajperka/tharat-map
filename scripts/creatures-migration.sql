-- V5.6 Creature Spawn system. Run each statement separately in Neon if needed.
CREATE TABLE IF NOT EXISTS creatures (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(80) UNIQUE NOT NULL,
  name VARCHAR(80) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE markers ADD COLUMN IF NOT EXISTS creature_slug VARCHAR(80);

CREATE INDEX IF NOT EXISTS idx_markers_creature_slug ON markers(creature_slug);

INSERT INTO creatures (slug,name) VALUES
('ankylosaurus','Ankylosaurus'),('argentavis','Argentavis'),('carcharodontosaurus','Carcharodontosaurus'),
('doedicurus','Doedicurus'),('giganotosaurus','Giganotosaurus'),('oasisaur','Oasisaur'),('rex','Rex'),
('spinosaurus','Spinosaurus'),('therizinosaurus','Therizinosaurus'),('wyvern','Wyvern'),('yutyrannus','Yutyrannus')
ON CONFLICT (slug) DO NOTHING;

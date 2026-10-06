CREATE TABLE IF NOT EXISTS resources (
 id serial PRIMARY KEY, type_key text UNIQUE NOT NULL, name_cs text NOT NULL, name_en text NOT NULL, icon_url text, color text NOT NULL DEFAULT '#27e1c1', active boolean NOT NULL DEFAULT true, sort_order integer NOT NULL DEFAULT 100, created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE creatures ADD COLUMN IF NOT EXISTS icon_url text;
INSERT INTO resources(type_key,name_cs,name_en,color,sort_order) VALUES
('metal','Kov','Metal','#aeb8c5',10),('crystal','Krystal','Crystal','#70d7ff',20),('obsidian','Obsidián','Obsidian','#a86cff',30),('oil','Olej','Oil','#d8943f',40),('oilvein','Ropná žíla','Oil Vein','#ff9e3d',50),('sulfur','Síra','Sulfur','#f0d84f',60),('silica','Křemičité perly','Silica Pearls','#a7e9ff',70),('blackpearls','Černé perly','Black Pearls','#8c62d8',80),('element','Elementový prach','Element Dust','#27e1c1',90),('redingot','Červený ingot','Red Ingot','#ff4d5d',100),('diamondingot','Diamond ingot','Diamond Ingot','#58e7ff',110),('goldingot','Zlatý ingot','Gold Ingot','#ffc83d',120) ON CONFLICT(type_key) DO NOTHING;

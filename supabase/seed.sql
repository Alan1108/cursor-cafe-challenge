-- Seed: most common Ecuadorian cities + monthly living costs (USD)
-- Data from Numbeo and estimates for cities without direct data (single person, 1-bed outside center)

INSERT INTO cities (name, slug) VALUES
  ('Guayaquil', 'guayaquil'),
  ('Quito', 'quito'),
  ('Cuenca', 'cuenca'),
  ('Santo Domingo de los Colorados', 'santo-domingo'),
  ('Machala', 'machala'),
  ('Manta', 'manta'),
  ('Portoviejo', 'portoviejo'),
  ('Ambato', 'ambato'),
  ('Esmeraldas', 'esmeraldas')
ON CONFLICT (slug) DO NOTHING;

-- Living costs: rent (1-bed outside center), food, transport, utilities, internet (monthly USD)
INSERT INTO living_costs (city_id, rent, food, transport, utilities, internet)
SELECT c.id, v.rent, v.food, v.transport, v.utilities, v.internet
FROM cities c
CROSS JOIN LATERAL (VALUES
  ('guayaquil', 406.40, 400.00, 20.00, 129.38, 25.44),
  ('quito', 336.14, 420.00, 21.00, 32.42, 27.15),
  ('cuenca', 356.62, 380.00, 27.50, 37.75, 28.33),
  ('santo-domingo', 380.00, 390.00, 22.00, 65.00, 27.00),
  ('machala', 320.00, 370.00, 20.00, 55.00, 26.00),
  ('manta', 350.00, 385.00, 21.00, 70.00, 27.00),
  ('portoviejo', 340.00, 375.00, 20.00, 60.00, 26.00),
  ('ambato', 330.00, 378.00, 22.00, 58.00, 26.50),
  ('esmeraldas', 360.00, 382.00, 23.00, 68.00, 27.00)
) AS v(slug, rent, food, transport, utilities, internet)
WHERE c.slug = v.slug
ON CONFLICT (city_id) DO NOTHING;

-- Cities (most common in Ecuador)
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Monthly living costs per city (1-bedroom outside center, single person estimates)
-- Editable via API
CREATE TABLE living_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  rent DECIMAL(10, 2) NOT NULL CHECK (rent >= 0),
  food DECIMAL(10, 2) NOT NULL CHECK (food >= 0),
  transport DECIMAL(10, 2) NOT NULL CHECK (transport >= 0),
  utilities DECIMAL(10, 2) NOT NULL CHECK (utilities >= 0),
  internet DECIMAL(10, 2) NOT NULL CHECK (internet >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(city_id)
);

CREATE INDEX idx_living_costs_city_id ON living_costs(city_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cities_updated_at
  BEFORE UPDATE ON cities
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER living_costs_updated_at
  BEFORE UPDATE ON living_costs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

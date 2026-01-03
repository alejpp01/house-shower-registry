-- Crear tabla gifts
CREATE TABLE IF NOT EXISTS gifts (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  image_url TEXT,
  buy_url TEXT,
  priority INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla reservations
CREATE TABLE IF NOT EXISTS reservations (
  id BIGSERIAL PRIMARY KEY,
  gift_id BIGINT NOT NULL UNIQUE REFERENCES gifts(id) ON DELETE CASCADE,
  guest_name VARCHAR(255) NOT NULL,
  guest_token VARCHAR(100) NOT NULL UNIQUE,
  reserved_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices
CREATE INDEX idx_reservations_gift_id ON reservations(gift_id);
CREATE INDEX idx_reservations_guest_token ON reservations(guest_token);
CREATE INDEX idx_gifts_active ON gifts(active);

-- Habilitar RLS
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Guests can read active gifts"
  ON gifts FOR SELECT
  USING (active = true);

CREATE POLICY "Guests can create reservations"
  ON reservations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Guests can view own reservations"
  ON reservations FOR SELECT
  USING (true);

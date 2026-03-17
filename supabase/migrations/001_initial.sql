-- ZAPD: P2P EV Charging Marketplace - Initial Schema
-- Run with: supabase db push

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'driver' CHECK (role IN ('driver', 'host', 'admin')),
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_year INT,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stations
CREATE TABLE stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  latitude FLOAT8 NOT NULL,
  longitude FLOAT8 NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  connector_types TEXT[] NOT NULL DEFAULT '{}',
  power_kw FLOAT8 NOT NULL,
  price_per_kwh NUMERIC(6,4) NOT NULL,
  amenities TEXT[] NOT NULL DEFAULT '{}',
  photos TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  avg_rating FLOAT4 DEFAULT 0,
  total_reviews INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stations_host ON stations(host_id);
CREATE INDEX idx_stations_status ON stations(status);
CREATE INDEX idx_stations_location ON stations(latitude, longitude);

-- Slots
CREATE TABLE slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'booked', 'charging', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_slots_station ON slots(station_id);
CREATE INDEX idx_slots_time ON slots(start_time, end_time);
CREATE INDEX idx_slots_status ON slots(status);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slot_id UUID NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  amount_cents INT NOT NULL DEFAULT 0,
  kwh_delivered FLOAT4,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled', 'refunded')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_driver ON bookings(driver_id);
CREATE INDEX idx_bookings_slot ON bookings(slot_id);
CREATE INDEX idx_bookings_station ON bookings(station_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_station ON reviews(station_id);
CREATE INDEX idx_reviews_booking ON reviews(booking_id);

-- Charging sessions (realtime)
CREATE TABLE charging_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
  current_kw FLOAT4 NOT NULL DEFAULT 0,
  kwh_delivered FLOAT4 NOT NULL DEFAULT 0,
  battery_percent INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'initializing' CHECK (status IN ('initializing', 'charging', 'paused', 'completed', 'error')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_charging_sessions_booking ON charging_sessions(booking_id);

-- Enable Realtime for charging_sessions
ALTER PUBLICATION supabase_realtime ADD TABLE charging_sessions;

-- RLS Policies

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE charging_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Stations: public read, host CRUD own
CREATE POLICY "Stations are viewable by everyone" ON stations
  FOR SELECT USING (true);

CREATE POLICY "Hosts can insert own stations" ON stations
  FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update own stations" ON stations
  FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete own stations" ON stations
  FOR DELETE USING (auth.uid() = host_id);

-- Slots: public read, host manage own
CREATE POLICY "Slots are viewable by everyone" ON slots
  FOR SELECT USING (true);

CREATE POLICY "Hosts can manage slots for own stations" ON slots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM stations
      WHERE stations.id = slots.station_id AND stations.host_id = auth.uid()
    )
  );

-- Bookings: drivers see own, hosts see for their stations
CREATE POLICY "Drivers can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY "Hosts can view bookings for their stations" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stations
      WHERE stations.id = bookings.station_id AND stations.host_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "System can update booking status" ON bookings
  FOR UPDATE USING (
    auth.uid() = driver_id OR
    EXISTS (SELECT 1 FROM stations WHERE stations.id = bookings.station_id AND stations.host_id = auth.uid())
  );

-- Reviews: public read, drivers create for own completed bookings
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Drivers can create reviews for own bookings" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = driver_id AND
    EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_id AND bookings.driver_id = auth.uid() AND bookings.status = 'completed')
  );

-- Charging sessions: drivers and hosts can read
CREATE POLICY "Charging sessions viewable by booking parties" ON charging_sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM bookings b WHERE b.id = charging_sessions.booking_id AND b.driver_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM bookings b JOIN stations s ON s.id = b.station_id WHERE b.id = charging_sessions.booking_id AND s.host_id = auth.uid())
  );

CREATE POLICY "Hosts can manage charging sessions" ON charging_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM bookings b JOIN stations s ON s.id = b.station_id
      WHERE b.id = charging_sessions.booking_id AND s.host_id = auth.uid()
    )
  );

-- Trigger: create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed data
-- Test host user (create via Supabase Auth first, then run this with actual UUIDs)
-- For demo, we'll insert placeholder UUIDs - replace with real auth.users IDs in production

-- Insert test host profile (UUID from auth.users - use Supabase dashboard to create)
-- These seeds assume you've created users. We use fixed UUIDs for migration demo.
INSERT INTO profiles (id, full_name, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Alex Chen', 'host'),
  ('22222222-2222-2222-2222-222222222222', 'Jordan Smith', 'driver')
ON CONFLICT (id) DO NOTHING;

-- Insert host's stations in Manhattan and Brooklyn
INSERT INTO stations (id, host_id, name, description, latitude, longitude, address, city, state, zip, connector_types, power_kw, price_per_kwh, amenities, photos, status) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', '11111111-1111-1111-1111-111111111111', 'Midtown Fast Charge', 'Premium DC fast charging in the heart of Manhattan. Covered parking available.', 40.758896, -73.985130, '350 W 42nd St', 'New York', 'NY', '10036', ARRAY['CCS2', 'CHAdeMO'], 150, 0.45, ARRAY['wifi', 'restroom', 'coffee'], '{}', 'active'),
  ('a1b2c3d4-0002-4000-8000-000000000002', '11111111-1111-1111-1111-111111111111', 'Chelsea EV Hub', 'Level 2 charging with Tesla adapter. Street parking.', 40.746500, -74.001374, '225 10th Ave', 'New York', 'NY', '10011', ARRAY['J1772', 'CCS2'], 11, 0.35, ARRAY['wifi'], '{}', 'active'),
  ('a1b2c3d4-0003-4000-8000-000000000003', '11111111-1111-1111-1111-111111111111', 'SoHo Supercharger Alternative', '350 kW ultra-fast charging. Indoor garage.', 40.723301, -74.002988, '100 Greene St', 'New York', 'NY', '10012', ARRAY['CCS2'], 350, 0.52, ARRAY['wifi', 'restroom', 'coffee'], '{}', 'active'),
  ('a1b2c3d4-0004-4000-8000-000000000004', '11111111-1111-1111-1111-111111111111', 'Williamsburg Green Garage', 'Solar-powered Level 2. Brooklyn vibe.', 40.708116, -73.957070, '149 N 6th St', 'Brooklyn', 'NY', '11249', ARRAY['J1772'], 7.2, 0.28, ARRAY['wifi', 'restroom'], '{}', 'active'),
  ('a1b2c3d4-0005-4000-8000-000000000005', '11111111-1111-1111-1111-111111111111', 'Park Slope EV Station', 'Family-friendly charging near Prospect Park.', 40.678178, -73.944158, '200 5th Ave', 'Brooklyn', 'NY', '11215', ARRAY['CCS2', 'J1772'], 50, 0.42, ARRAY['wifi', 'coffee'], '{}', 'active')
ON CONFLICT DO NOTHING;

-- Generate slots for the next 7 days for each station
-- Using a simpler approach: one slot per station per day
DO $$
DECLARE
  s RECORD;
  i INT;
  slot_start TIMESTAMPTZ;
  slot_end TIMESTAMPTZ;
BEGIN
  FOR s IN SELECT id FROM stations LOOP
    FOR i IN 0..6 LOOP
      slot_start := date_trunc('day', NOW() + (i || ' days')::INTERVAL) + INTERVAL '8 hours';
      slot_end := slot_start + INTERVAL '2 hours';
      INSERT INTO slots (station_id, start_time, end_time) VALUES (s.id, slot_start, slot_end);
      slot_start := slot_start + INTERVAL '3 hours';
      slot_end := slot_start + INTERVAL '2 hours';
      INSERT INTO slots (station_id, start_time, end_time) VALUES (s.id, slot_start, slot_end);
    END LOOP;
  END LOOP;
END $$;

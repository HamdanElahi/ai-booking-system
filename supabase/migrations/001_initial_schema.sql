-- AI Appointment Booking System - Initial Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('owner', 'customer', 'admin');
CREATE TYPE appointment_status AS ENUM (
  'pending', 'confirmed', 'cancelled', 'completed', 'no_show'
);

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  industry TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  slug TEXT UNIQUE,
  ai_tone TEXT DEFAULT 'friendly',
  ai_custom_prompt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE business_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TIME NOT NULL DEFAULT '09:00',
  close_time TIME NOT NULL DEFAULT '17:00',
  is_closed BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (business_id, day_of_week)
);

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 30,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status appointment_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, appointment_date, appointment_time)
);

CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL
);

CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  summary TEXT,
  last_intent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_businesses_owner ON businesses(owner_id);
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_services_business ON services(business_id);
CREATE INDEX idx_appointments_business ON appointments(business_id);
CREATE INDEX idx_appointments_date ON appointments(business_id, appointment_date);
CREATE INDEX idx_faqs_business ON faqs(business_id);
CREATE INDEX idx_ai_conversations_session ON ai_conversations(session_id);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Businesses policies
CREATE POLICY "Owners manage own businesses" ON businesses
  FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Public can view businesses by slug" ON businesses
  FOR SELECT USING (true);

-- Business hours
CREATE POLICY "Owners manage business hours" ON business_hours
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = business_hours.business_id AND b.owner_id = auth.uid()
    )
  );
CREATE POLICY "Public read business hours" ON business_hours
  FOR SELECT USING (true);

-- Services policies
CREATE POLICY "Owners manage services" ON services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = services.business_id AND b.owner_id = auth.uid()
    )
  );
CREATE POLICY "Public read services" ON services
  FOR SELECT USING (true);

-- Appointments policies
CREATE POLICY "Owners manage appointments" ON appointments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = appointments.business_id AND b.owner_id = auth.uid()
    )
  );
CREATE POLICY "Customers view own appointments" ON appointments
  FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Anyone can create appointments" ON appointments
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read appointments for availability" ON appointments
  FOR SELECT USING (true);

-- FAQs policies
CREATE POLICY "Owners manage faqs" ON faqs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = faqs.business_id AND b.owner_id = auth.uid()
    )
  );
CREATE POLICY "Public read faqs" ON faqs
  FOR SELECT USING (true);

-- AI conversations
CREATE POLICY "Owners view business conversations" ON ai_conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = ai_conversations.business_id AND b.owner_id = auth.uid()
    )
  );
CREATE POLICY "Anyone can create conversations" ON ai_conversations
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update conversations" ON ai_conversations
  FOR UPDATE USING (true);

-- Chat messages
CREATE POLICY "Anyone can manage chat messages" ON chat_messages
  FOR ALL USING (true);

-- Service role can manage profiles (signup API creates profiles server-side)
CREATE POLICY "Service role manages profiles" ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

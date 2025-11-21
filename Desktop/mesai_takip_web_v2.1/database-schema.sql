-- MESA Takip Sistemi - Database Schema

-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  employee_type TEXT DEFAULT 'normal' CHECK (employee_type IN ('normal', 'admin')),
  start_date TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Salaries table
CREATE TABLE salaries (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  base_salary REAL NOT NULL,
  overtime_pay REAL DEFAULT 0,
  payment_date TEXT NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Overtimes table
CREATE TABLE overtimes (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  hours REAL NOT NULL CHECK (hours > 0),
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Leaves table
CREATE TABLE leaves (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('annual', 'sick', 'unpaid')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Holidays table
CREATE TABLE holidays (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  name TEXT NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_salaries_user_id ON salaries(user_id);
CREATE INDEX idx_salaries_payment_date ON salaries(payment_date);
CREATE INDEX idx_overtimes_user_id ON overtimes(user_id);
CREATE INDEX idx_overtimes_date ON overtimes(date);
CREATE INDEX idx_leaves_user_id ON leaves(user_id);
CREATE INDEX idx_leaves_start_date ON leaves(start_date);
CREATE INDEX idx_holidays_date ON holidays(date);

-- Row Level Security (RLS) - Enable for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE overtimes ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid()::text = id);

-- Salary policies
CREATE POLICY "Users can view own salaries" ON salaries FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own salaries" ON salaries FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Overtime policies
CREATE POLICY "Users can view own overtimes" ON overtimes FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own overtimes" ON overtimes FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own overtimes" ON overtimes FOR UPDATE USING (auth.uid()::text = user_id);

-- Leave policies
CREATE POLICY "Users can view own leaves" ON leaves FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own leaves" ON leaves FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own leaves" ON leaves FOR UPDATE USING (auth.uid()::text = user_id);

-- Holiday policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view holidays" ON holidays FOR SELECT USING (auth.role() = 'authenticated');

-- Demo data insert (optional)
INSERT INTO holidays (id, date, name, is_recurring) VALUES
  ('holiday-1', '2024-01-01', 'Yılbaşı', true),
  ('holiday-2', '2024-04-23', 'Ulusal Egemenlik ve Çocuk Bayramı', true),
  ('holiday-3', '2024-05-01', 'Emek ve Dayanışma Günü', true),
  ('holiday-4', '2024-07-15', 'Demokrasi ve Milli Birlik Günü', true),
  ('holiday-5', '2024-08-30', 'Zafer Bayramı', true),
  ('holiday-6', '2024-10-29', 'Cumhuriyet Bayramı', true);

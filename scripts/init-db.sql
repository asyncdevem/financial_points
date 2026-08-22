-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  income_bracket VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pakistani Banks Table
CREATE TABLE IF NOT EXISTS pakistani_banks (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  card_types JSONB NOT NULL DEFAULT '["Credit Card", "Debit Card"]',
  base_reward_rate DECIMAL(5, 2) NOT NULL DEFAULT 1.0,
  category_multipliers JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Cards Table
CREATE TABLE IF NOT EXISTS user_cards (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bank_id INTEGER NOT NULL REFERENCES pakistani_banks(id) ON DELETE CASCADE,
  card_type VARCHAR(50) NOT NULL,
  encrypted_card_number TEXT NOT NULL,
  last_four VARCHAR(4) NOT NULL,
  expiry_date VARCHAR(7) NOT NULL,
  cvv_hash VARCHAR(64) NOT NULL,
  card_nickname VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mock Transactions Table
CREATE TABLE IF NOT EXISTS mock_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id INTEGER NOT NULL REFERENCES user_cards(id) ON DELETE CASCADE,
  merchant_name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  points_earned DECIMAL(10, 2) NOT NULL,
  transaction_date TIMESTAMP NOT NULL,
  is_user_added BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Redemption Catalog Table
CREATE TABLE IF NOT EXISTS redemption_catalog (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  points_cost INTEGER NOT NULL,
  image_url TEXT,
  stock_quantity INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  provider VARCHAR(100),
  estimated_delivery_days INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Redemptions Table
CREATE TABLE IF NOT EXISTS redemptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  catalog_item_id INTEGER NOT NULL REFERENCES redemption_catalog(id) ON DELETE CASCADE,
  points_spent INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  approval_notes TEXT,
  redemption_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  completed_at TIMESTAMP,
  delivery_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT redemptions_status_check CHECK (status IN ('instant', 'pending', 'approved', 'rejected', 'completed'))
);

-- Onboarding Progress Table
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  profile_completed BOOLEAN DEFAULT FALSE,
  card_added BOOLEAN DEFAULT FALSE,
  preferences_set BOOLEAN DEFAULT FALSE,
  tutorial_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  current_step INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_cards_user_id ON user_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cards_bank_id ON user_cards(bank_id);
CREATE INDEX IF NOT EXISTS idx_mock_transactions_user_id ON mock_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_transactions_card_id ON mock_transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_mock_transactions_date ON mock_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_redemptions_user_id ON redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_status ON redemptions(status);
CREATE INDEX IF NOT EXISTS idx_redemption_catalog_category ON redemption_catalog(category);
CREATE INDEX IF NOT EXISTS idx_redemption_catalog_active ON redemption_catalog(is_active);

-- Seed Pakistani Banks Data
INSERT INTO pakistani_banks (slug, name, card_types, base_reward_rate, category_multipliers, is_active) VALUES
  ('hbl', 'Habib Bank Limited (HBL)', '["Credit Card", "Debit Card", "Visa Signature", "World Mastercard"]', 1.0, '{"dining": 5, "fuel": 3, "groceries": 2, "travel": 4}', TRUE),
  ('ubl', 'United Bank Limited (UBL)', '["Credit Card", "Debit Card", "Premium Visa"]', 1.0, '{"dining": 3, "fuel": 2, "groceries": 2, "shopping": 3}', TRUE),
  ('meezan', 'Meezan Bank', '["Credit Card", "Debit Card", "Platinum Card", "Islamic Card"]', 1.0, '{"dining": 4, "fuel": 2, "groceries": 5, "charity": 10}', TRUE),
  ('mcb', 'MCB Bank Limited', '["Credit Card", "Debit Card", "Gold Card"]', 1.0, '{"dining": 3, "fuel": 3, "shopping": 4, "entertainment": 3}', TRUE),
  ('allied', 'Allied Bank Limited', '["Credit Card", "Debit Card"]', 1.0, '{"dining": 2, "fuel": 2, "bills": 3, "shopping": 2}', TRUE),
  ('askari', 'Askari Bank', '["Credit Card", "Debit Card", "Premium Card"]', 1.0, '{"dining": 3, "fuel": 4, "travel": 3, "shopping": 2}', TRUE),
  ('alfalah', 'Bank Alfalah', '["Credit Card", "Debit Card", "Titanium Card"]', 1.0, '{"dining": 4, "fuel": 2, "shopping": 3, "entertainment": 4}', TRUE),
  ('habibmetro', 'Habib Metropolitan Bank', '["Credit Card", "Debit Card"]', 1.0, '{"dining": 2, "fuel": 2, "groceries": 2, "travel": 2}', TRUE),
  ('standard-chartered', 'Standard Chartered Pakistan', '["Credit Card", "Debit Card", "Priority Banking Card"]', 1.0, '{"dining": 5, "travel": 5, "shopping": 4, "entertainment": 4}', TRUE),
  ('faysal', 'Faysal Bank', '["Credit Card", "Debit Card", "Islamic Card"]', 1.0, '{"dining": 3, "fuel": 3, "groceries": 3, "bills": 2}', TRUE),
  ('jsbank', 'JS Bank', '["Credit Card", "Debit Card"]', 1.0, '{"dining": 2, "fuel": 2, "shopping": 3, "entertainment": 2}', TRUE),
  ('soneri', 'Soneri Bank', '["Credit Card", "Debit Card"]', 1.0, '{"dining": 2, "fuel": 3, "groceries": 2, "shopping": 2}', TRUE),
  ('alhabib', 'Bank Al-Habib', '["Credit Card", "Debit Card", "Premium Card"]', 1.0, '{"dining": 3, "fuel": 2, "shopping": 3, "travel": 3}', TRUE),
  ('silkbank', 'Silk Bank', '["Credit Card", "Debit Card"]', 1.0, '{"dining": 2, "fuel": 2, "shopping": 2, "entertainment": 3}', TRUE),
  ('dib', 'Dubai Islamic Bank', '["Credit Card", "Debit Card", "Islamic Card"]', 1.0, '{"dining": 3, "fuel": 2, "groceries": 4, "charity": 8}', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Seed Redemption Catalog
INSERT INTO redemption_catalog (title, description, category, points_cost, provider, estimated_delivery_days, is_active) VALUES
  -- Vouchers
  ('Daraz PKR 1,000 Voucher', 'Shop anything on Daraz with this voucher', 'voucher', 2000, 'Daraz', 1, TRUE),
  ('Daraz PKR 2,500 Voucher', 'Shop anything on Daraz with this voucher', 'voucher', 5000, 'Daraz', 1, TRUE),
  ('Daraz PKR 5,000 Voucher', 'Shop anything on Daraz with this voucher', 'voucher', 10000, 'Daraz', 1, TRUE),
  ('Foodpanda PKR 500 Voucher', 'Order your favorite meals', 'voucher', 1000, 'Foodpanda', 1, TRUE),
  ('Foodpanda PKR 1,000 Voucher', 'Order your favorite meals', 'voucher', 2000, 'Foodpanda', 1, TRUE),
  ('Careem Ride Credit PKR 500', 'Get rides anywhere in Pakistan', 'voucher', 1000, 'Careem', 1, TRUE),
  ('Careem Ride Credit PKR 1,000', 'Get rides anywhere in Pakistan', 'voucher', 2000, 'Careem', 1, TRUE),
  ('Amazon.com $25 Gift Card', 'Shop globally on Amazon', 'voucher', 6000, 'Amazon', 3, TRUE),
  ('Amazon.com $50 Gift Card', 'Shop globally on Amazon', 'voucher', 12000, 'Amazon', 3, TRUE),
  
  -- Bill Payments
  ('K-Electric Bill Payment PKR 1,000', 'Pay your electricity bill', 'bill_payment', 2000, 'K-Electric', 1, TRUE),
  ('K-Electric Bill Payment PKR 2,500', 'Pay your electricity bill', 'bill_payment', 5000, 'K-Electric', 1, TRUE),
  ('SSGC Bill Payment PKR 1,000', 'Pay your gas bill', 'bill_payment', 2000, 'SSGC', 1, TRUE),
  ('SSGC Bill Payment PKR 2,500', 'Pay your gas bill', 'bill_payment', 5000, 'SSGC', 1, TRUE),
  ('PTCL Bill Payment PKR 1,000', 'Pay your internet/phone bill', 'bill_payment', 2000, 'PTCL', 1, TRUE),
  ('Jazz Mobile Recharge PKR 500', 'Top up your mobile balance', 'bill_payment', 1000, 'Jazz', 1, TRUE),
  ('Jazz Mobile Recharge PKR 1,000', 'Top up your mobile balance', 'bill_payment', 2000, 'Jazz', 1, TRUE),
  ('Telenor Mobile Recharge PKR 500', 'Top up your mobile balance', 'bill_payment', 1000, 'Telenor', 1, TRUE),
  ('Telenor Mobile Recharge PKR 1,000', 'Top up your mobile balance', 'bill_payment', 2000, 'Telenor', 1, TRUE),
  
  -- Cash Conversion
  ('Bank Transfer PKR 1,000', 'Direct transfer to your bank account', 'cash', 2000, 'Bank Transfer', 3, TRUE),
  ('Bank Transfer PKR 2,500', 'Direct transfer to your bank account', 'cash', 5000, 'Bank Transfer', 3, TRUE),
  ('Bank Transfer PKR 5,000', 'Direct transfer to your bank account', 'cash', 10000, 'Bank Transfer', 3, TRUE),
  ('Bank Transfer PKR 10,000', 'Direct transfer to your bank account', 'cash', 20000, 'Bank Transfer', 5, TRUE),
  
  -- Physical Products
  ('Apple AirPods Pro (2nd Gen)', 'Latest Apple wireless earbuds', 'product', 60000, 'Apple', 7, TRUE),
  ('Samsung Galaxy Buds2 Pro', 'Premium wireless earbuds', 'product', 45000, 'Samsung', 7, TRUE),
  ('JBL Flip 6 Bluetooth Speaker', 'Portable waterproof speaker', 'product', 30000, 'JBL', 5, TRUE),
  ('Anker PowerBank 20,000mAh', 'High-capacity portable charger', 'product', 15000, 'Anker', 5, TRUE),
  ('Xiaomi Smart Band 7', 'Fitness tracker with heart rate monitor', 'product', 18000, 'Xiaomi', 7, TRUE),
  ('Sony WH-1000XM5 Headphones', 'Premium noise-cancelling headphones', 'product', 85000, 'Sony', 10, TRUE),
  ('Philips Air Fryer HD9252', 'Healthy cooking appliance', 'product', 50000, 'Philips', 10, TRUE),
  ('Kenwood Hand Mixer', 'Kitchen appliance for baking', 'product', 12000, 'Kenwood', 7, TRUE),
  ('Braun Electric Kettle 1.7L', 'Fast boiling kettle', 'product', 10000, 'Braun', 5, TRUE),
  ('Nespresso Coffee Machine', 'Espresso and coffee maker', 'product', 75000, 'Nespresso', 14, TRUE),
  
  -- Charity Donations
  ('Edhi Foundation Donation PKR 1,000', 'Support humanitarian work', 'charity', 2000, 'Edhi Foundation', 1, TRUE),
  ('Edhi Foundation Donation PKR 2,500', 'Support humanitarian work', 'charity', 5000, 'Edhi Foundation', 1, TRUE),
  ('Edhi Foundation Donation PKR 5,000', 'Support humanitarian work', 'charity', 10000, 'Edhi Foundation', 1, TRUE),
  ('Shaukat Khanum Cancer Hospital PKR 1,000', 'Support cancer treatment', 'charity', 2000, 'SKMCH', 1, TRUE),
  ('Shaukat Khanum Cancer Hospital PKR 2,500', 'Support cancer treatment', 'charity', 5000, 'SKMCH', 1, TRUE),
  ('Shaukat Khanum Cancer Hospital PKR 5,000', 'Support cancer treatment', 'charity', 10000, 'SKMCH', 1, TRUE),
  ('TCF School Sponsorship PKR 1,000', 'Support education for underprivileged', 'charity', 2000, 'TCF', 1, TRUE),
  ('TCF School Sponsorship PKR 2,500', 'Support education for underprivileged', 'charity', 5000, 'TCF', 1, TRUE),
  ('TCF School Sponsorship PKR 5,000', 'Support education for underprivileged', 'charity', 10000, 'TCF', 1, TRUE),
  ('Akhuwat Interest-Free Loan Fund PKR 1,000', 'Support microfinance for poor', 'charity', 2000, 'Akhuwat', 1, TRUE),
  ('Akhuwat Interest-Free Loan Fund PKR 2,500', 'Support microfinance for poor', 'charity', 5000, 'Akhuwat', 1, TRUE),
  ('Akhuwat Interest-Free Loan Fund PKR 5,000', 'Support microfinance for poor', 'charity', 10000, 'Akhuwat', 1, TRUE)
ON CONFLICT DO NOTHING;

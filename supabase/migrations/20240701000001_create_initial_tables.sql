-- Create cakes table
CREATE TABLE IF NOT EXISTS cakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  weight TEXT,
  servings INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cake_categories junction table
CREATE TABLE IF NOT EXISTS cake_categories (
  cake_id UUID REFERENCES cakes(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (cake_id, category_id)
);

-- Create cake_ingredients table
CREATE TABLE IF NOT EXISTS cake_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cake_id UUID REFERENCES cakes(id) ON DELETE CASCADE,
  name TEXT NOT NULL
);

-- Create cake_images table
CREATE TABLE IF NOT EXISTS cake_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cake_id UUID REFERENCES cakes(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
);

-- Create shop_profile table
CREATE TABLE IF NOT EXISTS shop_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  about_us TEXT,
  logo_url TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  twitter_url TEXT,
  github_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for all tables
alter publication supabase_realtime add table cakes;
alter publication supabase_realtime add table categories;
alter publication supabase_realtime add table cake_categories;
alter publication supabase_realtime add table cake_ingredients;
alter publication supabase_realtime add table cake_images;
alter publication supabase_realtime add table shop_profile;

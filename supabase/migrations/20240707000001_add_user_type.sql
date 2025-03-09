-- Add user_type column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS user_type VARCHAR(20) DEFAULT 'customer';

-- Update existing admin user
UPDATE public.users SET user_type = 'admin' WHERE email = 'admin@sweetdelights.com';

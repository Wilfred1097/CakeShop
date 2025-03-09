-- Add email column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Update existing users with their email from auth.users
UPDATE public.users
SET email = auth.users.email
FROM auth.users
WHERE public.users.id = auth.users.id;

-- Set the admin user
UPDATE public.users SET user_type = 'admin' WHERE email = 'catalanwilfredo97@gmail.com';

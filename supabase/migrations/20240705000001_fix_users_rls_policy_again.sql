-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

-- Allow anyone to insert into users table (needed for registration)
CREATE POLICY "Anyone can insert users" ON public.users
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);

-- Allow users to read their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

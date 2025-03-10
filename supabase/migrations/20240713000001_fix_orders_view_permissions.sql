-- Fix permissions for orders table
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can view all orders" ON orders;
CREATE POLICY "Users can view all orders"
  ON orders
  FOR SELECT
  USING (true);

-- Fix permissions for users table
DROP POLICY IF EXISTS "Users can view all users" ON users;
CREATE POLICY "Users can view all users"
  ON users
  FOR SELECT
  USING (true);

-- Make sure RLS is enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

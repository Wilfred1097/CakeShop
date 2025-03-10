-- Fix RLS policy for order_items table
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own order items" ON order_items;
CREATE POLICY "Users can insert their own order items"
  ON order_items
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
CREATE POLICY "Users can view their own order items"
  ON order_items
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update their own order items" ON order_items;
CREATE POLICY "Users can update their own order items"
  ON order_items
  FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Users can delete their own order items" ON order_items;
CREATE POLICY "Users can delete their own order items"
  ON order_items
  FOR DELETE
  USING (true);

alter publication supabase_realtime add table order_items;

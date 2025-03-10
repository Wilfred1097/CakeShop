-- Create a function to get all orders bypassing RLS
CREATE OR REPLACE FUNCTION get_all_orders()
RETURNS SETOF orders
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM orders ORDER BY created_at DESC;
END;
$$;

-- Create a function to get order details by ID
CREATE OR REPLACE FUNCTION get_order_by_id(order_id UUID)
RETURNS SETOF orders
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM orders WHERE id = order_id;
END;
$$;

-- Create a function to get user details for orders
CREATE OR REPLACE FUNCTION get_user_for_order(user_id UUID)
RETURNS TABLE (email TEXT, full_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT users.email, users.full_name FROM users WHERE users.id = user_id;
END;
$$;

-- Create a trigger to automatically create a user profile when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, address, phone_number, gender, created_at)
  VALUES (
    NEW.id,
    NEW.email, -- Email from auth.users
    '', -- Default empty full_name
    '', -- Default empty address
    '', -- Default empty phone_number
    'other', -- Default gender
    NOW() -- Current timestamp
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

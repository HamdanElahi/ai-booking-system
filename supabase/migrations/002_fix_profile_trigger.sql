-- Fix: "Database error saving new user" on signup
-- Run this in Supabase Dashboard → SQL Editor

-- Remove the broken trigger (profile will be created by the app instead)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Allow service role to manage profiles (used by signup API)
DROP POLICY IF EXISTS "Service role manages profiles" ON profiles;
CREATE POLICY "Service role manages profiles" ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

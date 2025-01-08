/*
  # Fix email submissions permissions

  1. Changes
    - Drop existing policies
    - Create new simplified policies that allow public inserts and selects
    - Disable RLS temporarily for debugging
*/

-- First drop existing policies
DROP POLICY IF EXISTS "enable_public_insert" ON email_submissions;
DROP POLICY IF EXISTS "enable_public_select" ON email_submissions;

-- Temporarily disable RLS for debugging
ALTER TABLE email_submissions DISABLE ROW LEVEL SECURITY;

-- Create new simplified policies
CREATE POLICY "allow_public_insert"
  ON email_submissions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "allow_public_select"
  ON email_submissions
  FOR SELECT
  TO public
  USING (true);
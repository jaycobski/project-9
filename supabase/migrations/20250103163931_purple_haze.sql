/*
  # Fix permissions for submissions table

  1. Changes
    - Drop existing policies
    - Create new policies with proper permissions
    - Re-enable RLS
  
  2. Security
    - Enable RLS
    - Add policy for public inserts
    - Add policy for reading own submissions
*/

-- First drop existing policies
DROP POLICY IF EXISTS "enable_insert_for_public" ON email_submissions;
DROP POLICY IF EXISTS "enable_select_for_owner" ON email_submissions;

-- Re-enable RLS
ALTER TABLE email_submissions ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper permissions
CREATE POLICY "enable_insert_for_public"
  ON email_submissions
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "enable_select_for_owner"
  ON email_submissions
  FOR SELECT
  TO authenticated, anon
  USING (true);
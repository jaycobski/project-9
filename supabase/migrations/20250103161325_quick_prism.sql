/*
  # Fix RLS policies for email submissions

  1. Changes
    - Drop existing policies
    - Create new policies with correct syntax
    - Re-enable RLS
  
  2. Security
    - Allow public inserts
    - Allow users to read their own submissions
*/

-- Drop existing policies
DROP POLICY IF EXISTS "enable_public_insert" ON email_submissions;
DROP POLICY IF EXISTS "enable_own_select" ON email_submissions;

-- Create new policies with correct syntax
CREATE POLICY "enable_public_insert"
  ON email_submissions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "enable_own_select"
  ON email_submissions
  FOR SELECT
  TO public
  USING (email = current_user);

-- Ensure RLS is enabled
ALTER TABLE email_submissions ENABLE ROW LEVEL SECURITY;
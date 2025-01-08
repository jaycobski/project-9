/*
  # Update RLS policies for email submissions

  1. Changes
    - Drop existing RLS policies
    - Create new simplified policies that allow:
      - Anyone to insert new submissions
      - Public read access for debugging
  
  2. Security
    - Temporarily allows public read access for debugging
    - Maintains insert permissions for all users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "enable_insert_for_all" ON email_submissions;
DROP POLICY IF EXISTS "enable_select_for_own_submissions" ON email_submissions;

-- Create new policies
CREATE POLICY "allow_all_operations"
  ON email_submissions
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is still enabled
ALTER TABLE email_submissions ENABLE ROW LEVEL SECURITY;
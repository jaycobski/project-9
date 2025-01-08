-- Drop existing policies
DROP POLICY IF EXISTS "enable_public_insert" ON email_submissions;
DROP POLICY IF EXISTS "enable_own_select" ON email_submissions;

-- Create simplified policies with proper access control
CREATE POLICY "allow_insert_for_all"
  ON email_submissions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "allow_select_for_all"
  ON email_submissions
  FOR SELECT
  TO public
  USING (true);

-- Ensure RLS is enabled
ALTER TABLE email_submissions ENABLE ROW LEVEL SECURITY;
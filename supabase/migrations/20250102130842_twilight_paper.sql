/*
  # CRM Facts Table

  1. New Tables
    - `crm_facts`: Stores interesting CRM facts
      - `id` (uuid, primary key)
      - `fact` (text): The fun fact text
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `crm_facts` table
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS crm_facts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fact text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE crm_facts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to CRM facts"
  ON crm_facts
  FOR SELECT
  TO public
  USING (true);
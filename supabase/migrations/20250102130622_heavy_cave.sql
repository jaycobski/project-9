/*
  # CRM Database Schema

  1. New Tables
    - `crm_tools`: Stores CRM product information
      - `id` (uuid, primary key)
      - `name` (text): CRM product name
      - `logo` (text): URL to logo image
      - `price` (numeric): Price per user per month
      - `rating` (numeric): Average rating (0-5)
      - `review_count` (integer): Number of reviews
      - `features` (text[]): Array of features
      - `summary` (text): Brief product description
      - `sentiment` (jsonb): Review sentiment analysis
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `crm_tools` table
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS crm_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo text,
  price numeric NOT NULL DEFAULT 0,
  rating numeric NOT NULL DEFAULT 0,
  review_count integer NOT NULL DEFAULT 0,
  features text[] NOT NULL DEFAULT '{}',
  summary text,
  sentiment jsonb NOT NULL DEFAULT '{"positive": 0, "negative": 0, "neutral": 0}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE crm_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to CRM tools"
  ON crm_tools
  FOR SELECT
  TO public
  USING (true);
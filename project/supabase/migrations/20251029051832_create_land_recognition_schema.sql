/*
  # Land Recognition System Schema

  1. New Tables
    - `land_analyses`
      - `id` (uuid, primary key) - Unique identifier for each analysis
      - `user_id` (uuid) - Reference to authenticated user
      - `latitude` (decimal) - GPS latitude coordinate
      - `longitude` (decimal) - GPS longitude coordinate
      - `altitude` (decimal, nullable) - GPS altitude in meters
      - `accuracy` (decimal, nullable) - GPS accuracy in meters
      - `image_url` (text) - URL to the stored land image
      - `analysis_result` (jsonb) - Structured analysis data (soil type, vegetation, terrain, etc.)
      - `notes` (text, nullable) - User notes about the location
      - `created_at` (timestamptz) - Timestamp of analysis
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `land_analyses` table
    - Add policy for authenticated users to insert their own records
    - Add policy for authenticated users to view their own records
    - Add policy for authenticated users to update their own records
    - Add policy for authenticated users to delete their own records

  3. Indexes
    - Index on user_id for efficient user queries
    - Index on created_at for chronological sorting
    - Spatial index on coordinates for location-based queries
*/

CREATE TABLE IF NOT EXISTS land_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  latitude decimal(10, 8) NOT NULL,
  longitude decimal(11, 8) NOT NULL,
  altitude decimal(10, 2),
  accuracy decimal(10, 2),
  image_url text NOT NULL,
  analysis_result jsonb DEFAULT '{}'::jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE land_analyses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can insert own land analyses"
  ON land_analyses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own land analyses"
  ON land_analyses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own land analyses"
  ON land_analyses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own land analyses"
  ON land_analyses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_land_analyses_user_id ON land_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_land_analyses_created_at ON land_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_land_analyses_location ON land_analyses(latitude, longitude);
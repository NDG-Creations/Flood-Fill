-- Run this in Supabase SQL Editor to create the player_profiles table

-- Create table
CREATE TABLE IF NOT EXISTS public.player_profiles (
  user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  player_name TEXT,
  provider TEXT DEFAULT 'google',
  completed_levels JSONB DEFAULT '{}',
  selected_level INTEGER DEFAULT 0,
  last_seen_at BIGINT,
  updated_at BIGINT,
  unlocked_maps TEXT[] DEFAULT ARRAY['ladder']
);

-- Enable RLS
ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to update their own profile
CREATE POLICY "Users can update own profile" ON public.player_profiles
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Create policy for authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.player_profiles
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Create policy for authenticated users to read their own profile
CREATE POLICY "Users can read own profile" ON public.player_profiles
  FOR SELECT USING (auth.uid()::text = user_id);

-- Create policy for anonymous users to insert (for guest accounts)
CREATE POLICY "Anyone can insert" ON public.player_profiles
  FOR INSERT WITH CHECK (true);

-- Create policy for anyone to read
CREATE POLICY "Anyone can read" ON public.player_profiles
  FOR SELECT USING (true);
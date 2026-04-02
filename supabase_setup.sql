-- Create the cards table
CREATE TABLE cards (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  found BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT FALSE,
  images TEXT[] DEFAULT '{}',
  characteristics TEXT DEFAULT '',
  pathologies TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own cards
CREATE POLICY "Users can view their own cards" ON cards
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own cards
CREATE POLICY "Users can insert their own cards" ON cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own cards
CREATE POLICY "Users can update their own cards" ON cards
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own cards
CREATE POLICY "Users can delete their own cards" ON cards
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for card images (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('card-images', 'card-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to card images (remove RLS for viewing images)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS but with proper policies
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy for storage bucket - allow anyone to view images
CREATE POLICY "Anyone can view card images" ON storage.objects
  FOR SELECT USING (bucket_id = 'card-images');

-- Create policy for users to upload their own card images
CREATE POLICY "Users can upload card images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'card-images');

-- Create policy for users to update their own card images
CREATE POLICY "Users can update card images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'card-images');

-- Create policy for users to delete their own card images
CREATE POLICY "Users can delete card images" ON storage.objects
  FOR DELETE USING (bucket_id = 'card-images');
-- Create the cards table in Supabase
CREATE TABLE cards (
  id INTEGER PRIMARY KEY,
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

-- Create policy to allow users to only access their own cards
CREATE POLICY "Users can only access their own cards" ON cards
  FOR ALL USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_cards_user_id ON cards(user_id);
-- Add music-related columns to products table
ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS has_music BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS music_url TEXT,
    ADD COLUMN IF NOT EXISTS music_audio_url TEXT,
    ADD COLUMN IF NOT EXISTS music_title TEXT,
    ADD COLUMN IF NOT EXISTS music_artist TEXT;

-- BuyWise DB Migration - Relational Schema Update
-- Run this in your Supabase SQL Editor

-- Note: In this schema, we use text for user ID so it can support Firebase UUIDs or custom IDs.
-- Since Supabase auth.users only supports UUIDs natively, we unlink it from auth.users 
-- and manage authentication ourselves using Firebase/Google Auth as requested.

-- 1. Modify or Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id text primary key,
  email text unique not null,
  full_name text,
  phone text,
  country text,
  avatar_url text,
  buywise_coins integer default 0,
  premium boolean default false,
  premium_expiry timestamp with time zone,
  active_plan_id text,
  active_plan_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_login timestamp with time zone,
  referral_code text unique,
  google_provider_id text
);

-- Enable RLS for profiles (optional, if you want client side access)
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id text primary key,
  user_id text references public.profiles(id),
  amount integer,
  type text,
  source text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id text primary key,
  user_id text references public.profiles(id),
  plan_id text,
  payment_id text,
  subscription_id text,
  status text,
  provider text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add index on email for quick auth lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Create enum for request categories
CREATE TYPE public.request_category AS ENUM (
  'medical',
  'food',
  'shelter',
  'transport',
  'water',
  'supplies',
  'other'
);

-- Create enum for request urgency
CREATE TYPE public.request_urgency AS ENUM (
  'critical',
  'high',
  'medium',
  'low'
);

-- Create enum for request status
CREATE TYPE public.request_status AS ENUM (
  'pending',
  'in_progress',
  'fulfilled',
  'cancelled'
);

-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM (
  'victim',
  'volunteer',
  'donor',
  'ngo'
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'volunteer',
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create help requests table
CREATE TABLE public.help_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category request_category NOT NULL,
  urgency request_urgency NOT NULL,
  status request_status NOT NULL DEFAULT 'pending',
  location_lat DOUBLE PRECISION NOT NULL,
  location_lng DOUBLE PRECISION NOT NULL,
  location_address TEXT NOT NULL,
  ai_classification JSONB,
  responder_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create responses table
CREATE TABLE public.responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.help_requests(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Help requests policies
CREATE POLICY "Help requests are viewable by everyone"
  ON public.help_requests FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create help requests"
  ON public.help_requests FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own help requests"
  ON public.help_requests FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Responses policies
CREATE POLICY "Responses are viewable by request owner and responder"
  ON public.responses FOR SELECT
  USING (
    auth.uid()::text = responder_id::text OR
    auth.uid()::text IN (
      SELECT user_id::text FROM public.help_requests WHERE id = request_id
    )
  );

CREATE POLICY "Authenticated users can create responses"
  ON public.responses FOR INSERT
  WITH CHECK (auth.uid()::text = responder_id::text);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_help_requests_updated_at
  BEFORE UPDATE ON public.help_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for help_requests and responses
ALTER PUBLICATION supabase_realtime ADD TABLE public.help_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.responses;
-- Create rate limits table for tracking API usage
CREATE TABLE public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  function_name TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, function_name)
);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only allow service role to access this table (edge functions use service role)
CREATE POLICY "Service role only" ON public.rate_limits
  FOR ALL USING (false);

-- Create function to check and increment rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID,
  p_function_name TEXT,
  p_max_requests INTEGER DEFAULT 60,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record rate_limits%ROWTYPE;
  v_window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  v_window_start := now() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Try to get existing record
  SELECT * INTO v_record
  FROM rate_limits
  WHERE user_id = p_user_id AND function_name = p_function_name;
  
  IF NOT FOUND THEN
    -- Create new record
    INSERT INTO rate_limits (user_id, function_name, request_count, window_start)
    VALUES (p_user_id, p_function_name, 1, now());
    RETURN TRUE;
  ELSIF v_record.window_start < v_window_start THEN
    -- Window expired, reset counter
    UPDATE rate_limits
    SET request_count = 1, window_start = now()
    WHERE id = v_record.id;
    RETURN TRUE;
  ELSIF v_record.request_count < p_max_requests THEN
    -- Increment counter
    UPDATE rate_limits
    SET request_count = request_count + 1
    WHERE id = v_record.id;
    RETURN TRUE;
  ELSE
    -- Rate limit exceeded
    RETURN FALSE;
  END IF;
END;
$$;
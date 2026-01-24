-- Add explicit DENY policies for rate_limits table to prevent non-service-role access
-- This ensures authenticated users and anonymous users cannot read or manipulate rate limit data

-- Block all authenticated user access to rate_limits
CREATE POLICY "Block authenticated user access to rate limits"
ON public.rate_limits
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- Block all anonymous access to rate_limits
CREATE POLICY "Block anonymous access to rate limits"
ON public.rate_limits
FOR ALL
TO anon
USING (false)
WITH CHECK (false);